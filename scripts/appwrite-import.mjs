// Copies the content/ folder (pages, collections and photos) into Appwrite.
// Entries already in Appwrite are skipped, so edits made in the admin are never overwritten.
// Pass --overwrite to replace them with the local files.
//
//   pnpm appwrite:import
//   pnpm appwrite:import --overwrite

import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { InputFile } from "node-appwrite/file";
import { IDS, db, fail, notFound, storage } from "./appwrite-client.mjs";

const overwrite = process.argv.includes("--overwrite");
const root = path.join(process.cwd(), "content");
const { database: databaseId } = IDS;

// Same as uploadFileId in lib/store/appwrite.ts.
const uploadFileId = (name) => createHash("sha256").update(name).digest("hex").slice(0, 32);
// "projects-page.json" → "projectsPage" (the reverse of docFile in lib/store/files.ts).
const docKey = (file) => file.slice(0, -5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const readJson = async (file) => JSON.parse(await fs.readFile(file, "utf8"));

async function rowExists(tableId, rowId) {
  try {
    await db.getRow({ databaseId, tableId, rowId });
    return true;
  } catch (err) {
    if (notFound(err)) return false;
    throw err;
  }
}

const counts = { added: 0, replaced: 0, skipped: 0 };

async function save(tableId, rowId, data, label) {
  const existed = await rowExists(tableId, rowId);
  if (existed && !overwrite) {
    counts.skipped++;
    return console.log(`  skip     ${label} (already in Appwrite)`);
  }
  await db.upsertRow({ databaseId, tableId, rowId, data });
  counts[existed ? "replaced" : "added"]++;
  console.log(`  ${existed ? "replace" : "add"}      ${label}`);
}

async function main() {
  const entries = await fs.readdir(root, { withFileTypes: true });

  console.log("Pages");
  for (const e of entries.filter((e) => e.isFile() && e.name.endsWith(".json"))) {
    await save(IDS.docs, docKey(e.name), { data: JSON.stringify(await readJson(path.join(root, e.name))) }, e.name);
  }

  for (const dir of entries.filter((e) => e.isDirectory() && e.name !== "uploads")) {
    console.log(`Collection: ${dir.name}`);
    const files = (await fs.readdir(path.join(root, dir.name))).filter((f) => f.endsWith(".json"));
    for (const f of files) {
      const { order, ...data } = await readJson(path.join(root, dir.name, f));
      const id = f.slice(0, -5);
      if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,35}$/.test(id)) {
        console.warn(`  WARNING  ${dir.name}/${f}: the file name can't be used as an Appwrite ID, so it was not imported`);
        continue;
      }
      await save(
        IDS.items,
        id,
        { collection: dir.name, position: typeof order === "number" ? order : 999, data: JSON.stringify(data) },
        `${dir.name}/${f}`,
      );
    }
  }

  console.log("Photos");
  const photos = await fs.readdir(path.join(root, "uploads")).catch(() => []);
  for (const name of photos.filter((n) => /\.(jpe?g|png|webp)$/i.test(n))) {
    const fileId = uploadFileId(name);
    let existed = true;
    try {
      await storage.getFile({ bucketId: IDS.uploads, fileId });
    } catch (err) {
      if (!notFound(err)) throw err;
      existed = false;
    }
    if (existed && !overwrite) {
      counts.skipped++;
      console.log(`  skip     ${name} (already in Appwrite)`);
      continue;
    }
    if (existed) await storage.deleteFile({ bucketId: IDS.uploads, fileId });
    const bytes = await fs.readFile(path.join(root, "uploads", name));
    await storage.createFile({ bucketId: IDS.uploads, fileId, file: InputFile.fromBuffer(bytes, name) });
    counts[existed ? "replaced" : "added"]++;
    console.log(`  ${existed ? "replace" : "add"}      ${name}`);
  }

  console.log(`\nDone: ${counts.added} added, ${counts.replaced} replaced, ${counts.skipped} skipped.`);
}

main().catch(fail);
