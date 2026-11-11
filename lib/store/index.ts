import { appwriteConfigured, appwriteStore } from "./appwrite";
import { fileStore } from "./files";

// Content is saved to Appwrite when APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID and APPWRITE_API_KEY are set,
// and to local files (content/*.json and content/uploads/) otherwise.
export const store = appwriteConfigured() ? appwriteStore : fileStore;

export type { Data, Item, Store } from "./types";
