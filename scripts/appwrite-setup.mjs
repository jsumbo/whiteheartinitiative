// Creates the Appwrite database, tables and photo bucket the site uses. Safe to run more than once:
// anything that already exists is left alone.
//
//   pnpm appwrite:setup

import { Compression, TablesDBIndexType } from "node-appwrite";
import { IDS, db, fail, notFound, storage } from "./appwrite-client.mjs";

const { database: databaseId } = IDS;

async function exists(get) {
  try {
    await get();
    return true;
  } catch (err) {
    if (notFound(err)) return false;
    throw err;
  }
}

async function ensure(label, get, create) {
  if (await exists(get)) return console.log(`✓ ${label} already exists`);
  await create();
  console.log(`+ created ${label}`);
}

// New columns are processed in the background; an index can only be added once they are ready.
async function waitForColumns(tableId) {
  for (let i = 0; i < 60; i++) {
    const { columns } = await db.listColumns({ databaseId, tableId });
    if (columns.every((c) => c.status === "available")) return;
    const failed = columns.find((c) => c.status === "failed");
    if (failed) throw new Error(`Column "${failed.key}" in "${tableId}" failed to create: ${failed.error}`);
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Columns in "${tableId}" were not ready after a minute. Run the setup again.`);
}

async function main() {
  await ensure(
    `database "${databaseId}"`,
    () => db.get({ databaseId }),
    () => db.create({ databaseId, name: "Website" }),
  );

  // No permissions: only the server, using the API key, can read or write.
  const table = (tableId, name) =>
    ensure(
      `table "${tableId}"`,
      () => db.getTable({ databaseId, tableId }),
      () => db.createTable({ databaseId, tableId, name, permissions: [], rowSecurity: false }),
    );
  const column = (tableId, key, create) =>
    ensure(`column "${tableId}.${key}"`, () => db.getColumn({ databaseId, tableId, key }), () => create({ databaseId, tableId, key, required: true }));

  await table(IDS.docs, "Pages");
  await column(IDS.docs, "data", (p) => db.createLongtextColumn(p));

  await table(IDS.items, "Collection entries");
  await column(IDS.items, "collection", (p) => db.createVarcharColumn({ ...p, size: 64 }));
  await column(IDS.items, "position", (p) => db.createIntegerColumn(p));
  await column(IDS.items, "data", (p) => db.createLongtextColumn(p));

  await waitForColumns(IDS.items);
  await ensure(
    `index "items.collection_position"`,
    () => db.getIndex({ databaseId, tableId: IDS.items, key: "collection_position" }),
    () =>
      db.createIndex({
        databaseId,
        tableId: IDS.items,
        key: "collection_position",
        type: TablesDBIndexType.Key,
        columns: ["collection", "position"],
      }),
  );

  // An existing bucket named in APPWRITE_BUCKET_ID is used as it is.
  if (process.env.APPWRITE_BUCKET_ID) {
    const bucket = await storage.getBucket({ bucketId: IDS.uploads });
    if (bucket.$permissions.length || bucket.fileSecurity)
      console.warn(`! bucket "${bucket.name}" has permissions set; remove them in the console so only the server can access photos`);
    console.log(`✓ using existing photo bucket "${bucket.name}" (${bucket.$id})`);
    return console.log("\nAppwrite is ready. Next: pnpm appwrite:import");
  }

  await ensure(
    `photo bucket "${IDS.uploads}"`,
    () => storage.getBucket({ bucketId: IDS.uploads }),
    () =>
      storage.createBucket({
        bucketId: IDS.uploads,
        name: "Uploads",
        permissions: [],
        fileSecurity: false,
        maximumFileSize: 15 * 1024 * 1024,
        allowedFileExtensions: ["jpg", "jpeg", "png", "webp"],
        compression: Compression.None,
        encryption: true,
        antivirus: true,
      }),
  );

  console.log("\nAppwrite is ready. Next: pnpm appwrite:import");
}

main().catch(fail);
