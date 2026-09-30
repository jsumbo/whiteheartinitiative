import { fileStore } from "./files";

// Content is saved to local files for now (content/*.json and public/uploads/).
// To move to a database later, write another Store (see ./types.ts) and export it here.
export const store = fileStore;

export type { Data, Item, Store } from "./types";
