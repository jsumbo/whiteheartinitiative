import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Data, Item, Store } from "./types";

// Local JSON files in /content and uploaded photos in /content/uploads.
// Needs a host with a writable disk (a VPS, Docker, Railway or Render with a disk). Vercel and Netlify cannot save files.

const root = path.join(process.cwd(), "content");
const uploads = path.join(root, "uploads");

const docFile = (key: string) => path.join(root, `${key.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())}.json`);
const itemDir = (collection: string) => path.join(root, collection);
const safeId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, "");

async function readJson(file: string): Promise<Data | null> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return null;
  }
}

const writeJson = (file: string, data: unknown) => fs.writeFile(file, JSON.stringify(data, null, 2) + "\n");

function toItem(id: string, raw: Data): Item {
  const { order, ...data } = raw;
  return { id, order: typeof order === "number" ? order : 999, data };
}

export const fileStore: Store = {
  kind: "files",

  getDoc: (key) => readJson(docFile(key)),

  setDoc: (key, data) => writeJson(docFile(key), data),

  async listItems(collection) {
    const dir = itemDir(collection);
    const files = await fs.readdir(dir).catch(() => [] as string[]);
    const items = await Promise.all(
      files
        .filter((f) => f.endsWith(".json"))
        .map(async (f) => toItem(f.slice(0, -5), (await readJson(path.join(dir, f))) ?? {})),
    );
    return items.sort((a, b) => a.order - b.order);
  },

  async getItem(collection, id) {
    const raw = await readJson(path.join(itemDir(collection), `${safeId(id)}.json`));
    return raw ? toItem(safeId(id), raw) : null;
  },

  async createItem(collection, data) {
    await fs.mkdir(itemDir(collection), { recursive: true });
    const existing = await this.listItems(collection);
    const order = existing.reduce((max, i) => Math.max(max, i.order === 999 ? 0 : i.order), 0) + 1;
    const id = randomUUID();
    await writeJson(path.join(itemDir(collection), `${id}.json`), { ...data, order });
    return { id, order, data };
  },

  async updateItem(collection, id, data) {
    const current = await this.getItem(collection, id);
    if (!current) throw new Error("Not found");
    await writeJson(path.join(itemDir(collection), `${safeId(id)}.json`), { ...data, order: current.order });
  },

  async deleteItem(collection, id) {
    await fs.rm(path.join(itemDir(collection), `${safeId(id)}.json`), { force: true });
  },

  async reorder(collection, ids) {
    await Promise.all(
      ids.map(async (id, i) => {
        const item = await this.getItem(collection, id);
        if (item) await writeJson(path.join(itemDir(collection), `${safeId(id)}.json`), { ...item.data, order: i + 1 });
      }),
    );
  },

  async upload(name, _type, bytes) {
    await fs.mkdir(uploads, { recursive: true });
    await fs.writeFile(path.join(uploads, name), Buffer.from(bytes));
    return `/uploads/${name}`;
  },
};
