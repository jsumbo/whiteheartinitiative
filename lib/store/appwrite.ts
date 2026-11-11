import { createHash, randomUUID } from "node:crypto";
import { AppwriteException, Client, Query, Storage, TablesDB, type Models } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import type { Data, Item, Store } from "./types";

// Site content in Appwrite Cloud. Run `pnpm appwrite:setup` once to create the database, tables and photo bucket,
// then `pnpm appwrite:import` to copy the content/ folder in.
//
// - "docs" table: one row per page (home, about, settings...). Row ID = page key, `data` = the page as JSON.
// - "items" table: one row per collection entry (posts, projects, team...). `collection` + `position` + `data` (JSON).
// - "uploads" bucket (or APPWRITE_BUCKET_ID): photos. Content keeps pointing at /uploads/<name>; app/uploads/[file] fetches the file from here.
//
// Everything is private: no read or write permissions are granted, so only the server (with the API key) can access it.

// APPWRITE_BUCKET_ID lets the site use an existing bucket (the free plan allows only one per project).
export const APPWRITE_IDS = {
  database: "website",
  docs: "docs",
  items: "items",
  uploads: process.env.APPWRITE_BUCKET_ID || "uploads",
} as const;
const { database: databaseId, docs, items, uploads } = APPWRITE_IDS;

export const appwriteConfigured = () =>
  Boolean(process.env.APPWRITE_ENDPOINT && process.env.APPWRITE_PROJECT_ID && process.env.APPWRITE_API_KEY);

let services: { db: TablesDB; storage: Storage } | null = null;
function api() {
  if (!services) {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT!)
      .setProject(process.env.APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);
    services = { db: new TablesDB(client), storage: new Storage(client) };
  }
  return services;
}

// Appwrite file IDs are limited to 36 characters, so each photo's ID is a hash of its file name.
export const uploadFileId = (name: string) => createHash("sha256").update(name).digest("hex").slice(0, 32);

const notFound = (err: unknown) => err instanceof AppwriteException && err.code === 404;

type ItemRow = Models.Row & { collection: string; position: number; data: string };
type DocRow = Models.Row & { data: string };

const parse = (json: string): Data => {
  try {
    return JSON.parse(json) as Data;
  } catch {
    return {};
  }
};

const toItem = (row: ItemRow): Item => ({ id: row.$id, order: row.position, data: parse(row.data) });

async function getItemRow(collection: string, id: string) {
  try {
    const row = await api().db.getRow<ItemRow>({ databaseId, tableId: items, rowId: id });
    return row.collection === collection ? row : null;
  } catch (err) {
    if (notFound(err)) return null;
    throw err;
  }
}

export const appwriteStore: Store = {
  kind: "appwrite",

  async getDoc(key) {
    try {
      const row = await api().db.getRow<DocRow>({ databaseId, tableId: docs, rowId: key });
      return parse(row.data);
    } catch (err) {
      if (notFound(err)) return null;
      throw err;
    }
  },

  async setDoc(key, data) {
    await api().db.upsertRow({ databaseId, tableId: docs, rowId: key, data: { data: JSON.stringify(data) } });
  },

  async listItems(collection) {
    // Read in pages of 100 so large collections (like the photo gallery) are never cut off.
    const rows: ItemRow[] = [];
    let cursor: string | undefined;
    for (;;) {
      const queries = [Query.equal("collection", collection), Query.orderAsc("position"), Query.orderAsc("$id"), Query.limit(100)];
      if (cursor) queries.push(Query.cursorAfter(cursor));
      const page = await api().db.listRows<ItemRow>({ databaseId, tableId: items, queries, total: false });
      rows.push(...page.rows);
      if (page.rows.length < 100) break;
      cursor = page.rows[page.rows.length - 1].$id;
    }
    return rows.map(toItem);
  },

  async getItem(collection, id) {
    const row = await getItemRow(collection, id);
    return row ? toItem(row) : null;
  },

  async createItem(collection, data) {
    const last = await api().db.listRows<ItemRow>({
      databaseId,
      tableId: items,
      queries: [Query.equal("collection", collection), Query.lessThan("position", 999), Query.orderDesc("position"), Query.limit(1)],
      total: false,
    });
    const order = (last.rows[0]?.position ?? 0) + 1;
    const id = randomUUID();
    await api().db.createRow({ databaseId, tableId: items, rowId: id, data: { collection, position: order, data: JSON.stringify(data) } });
    return { id, order, data };
  },

  async updateItem(collection, id, data) {
    if (!(await getItemRow(collection, id))) throw new Error("Not found");
    await api().db.updateRow({ databaseId, tableId: items, rowId: id, data: { data: JSON.stringify(data) } });
  },

  async deleteItem(collection, id) {
    if (!(await getItemRow(collection, id))) return;
    await api().db.deleteRow({ databaseId, tableId: items, rowId: id });
  },

  async reorder(collection, ids) {
    await Promise.all(
      ids.map(async (id, i) => {
        if (await getItemRow(collection, id))
          await api().db.updateRow({ databaseId, tableId: items, rowId: id, data: { position: i + 1 } });
      }),
    );
  },

  async upload(name, _type, bytes) {
    await api().storage.createFile({
      bucketId: uploads,
      fileId: uploadFileId(name),
      file: InputFile.fromBuffer(Buffer.from(bytes), name),
    });
    return `/uploads/${name}`;
  },

  async getUpload(name) {
    try {
      const bytes = await api().storage.getFileView({ bucketId: uploads, fileId: uploadFileId(name) });
      return new Uint8Array(bytes);
    } catch (err) {
      if (notFound(err)) return null;
      throw err;
    }
  },
};
