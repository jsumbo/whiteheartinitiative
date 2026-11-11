// Shared setup for the Appwrite scripts. Reads the same .env.local variables as the site.
import { AppwriteException, Client, Storage, TablesDB } from "node-appwrite";

// Keep in sync with APPWRITE_IDS in lib/store/appwrite.ts.
export const IDS = { database: "website", docs: "docs", items: "items", uploads: process.env.APPWRITE_BUCKET_ID || "uploads" };

const missing = ["APPWRITE_ENDPOINT", "APPWRITE_PROJECT_ID", "APPWRITE_API_KEY"].filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing in .env.local: ${missing.join(", ")}`);
  process.exit(1);
}

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

export const db = new TablesDB(client);
export const storage = new Storage(client);

export const notFound = (err) => err instanceof AppwriteException && err.code === 404;

// Prints a readable message for the errors people are most likely to hit, then exits.
export function fail(err) {
  if (err instanceof AppwriteException && err.code === 401) {
    console.error(
      "\nAppwrite rejected the API key (401).\n" +
        "Check that APPWRITE_API_KEY was created in the same project as APPWRITE_PROJECT_ID, that it hasn't expired,\n" +
        "and that it has the Database and Storage scopes (read and write).",
    );
    console.error(`Appwrite said: ${err.message}`);
  } else if (err instanceof AppwriteException && err.type === "additional_resource_not_allowed" && /bucket/i.test(err.message)) {
    console.error(
      "\nYour Appwrite plan doesn't allow another storage bucket.\n" +
        "Copy the ID of the existing bucket (Storage in the Appwrite console) into APPWRITE_BUCKET_ID in .env.local and run this again.",
    );
  } else {
    console.error(err);
  }
  process.exit(1);
}
