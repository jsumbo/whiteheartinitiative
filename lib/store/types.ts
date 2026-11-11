export type Data = Record<string, unknown>;

// An entry in a collection (a program, team member or gallery photo).
export type Item = { id: string; order: number; data: Data };

// Where site content is kept: local files (./files.ts) or Appwrite (./appwrite.ts).
export interface Store {
  kind: "files" | "appwrite";
  getDoc(key: string): Promise<Data | null>;
  setDoc(key: string, data: Data): Promise<void>;
  listItems(collection: string): Promise<Item[]>;
  getItem(collection: string, id: string): Promise<Item | null>;
  createItem(collection: string, data: Data): Promise<Item>;
  updateItem(collection: string, id: string, data: Data): Promise<void>;
  deleteItem(collection: string, id: string): Promise<void>;
  reorder(collection: string, ids: string[]): Promise<void>;
  // Saves an uploaded image and returns the URL to use in content (always /uploads/<name>).
  upload(name: string, type: string, bytes: ArrayBuffer): Promise<string>;
  // Returns the bytes of an uploaded image, or null if there is no such file.
  getUpload(name: string): Promise<Uint8Array<ArrayBuffer> | null>;
}
