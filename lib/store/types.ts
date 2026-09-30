export type Data = Record<string, unknown>;

// An entry in a collection (a program, team member or gallery photo).
export type Item = { id: string; order: number; data: Data };

// Where site content is kept. Only local files for now; a database store can be added later.
export interface Store {
  kind: "files";
  getDoc(key: string): Promise<Data | null>;
  setDoc(key: string, data: Data): Promise<void>;
  listItems(collection: string): Promise<Item[]>;
  getItem(collection: string, id: string): Promise<Item | null>;
  createItem(collection: string, data: Data): Promise<Item>;
  updateItem(collection: string, id: string, data: Data): Promise<void>;
  deleteItem(collection: string, id: string): Promise<void>;
  reorder(collection: string, ids: string[]): Promise<void>;
  // Saves an uploaded image and returns the URL to use in content.
  upload(name: string, type: string, bytes: ArrayBuffer): Promise<string>;
}
