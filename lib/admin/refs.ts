import { store } from "@/lib/store";
import { getCollectionDef, type CollectionName, type Field } from "./schema";

export type RefOption = { id: string; title: string };
export type Refs = Partial<Record<CollectionName, RefOption[]>>;

function refCollections(fields: Field[]): CollectionName[] {
  return fields.flatMap((f) =>
    f.type === "ref" ? [f.collection] : f.type === "group" || f.type === "groupList" ? refCollections(f.fields) : [],
  );
}

// The entries that "ref" fields can pick from, e.g. the project list for a gallery photo.
export async function loadRefs(fields: Field[]): Promise<Refs> {
  const names = [...new Set(refCollections(fields))];
  const lists = await Promise.all(
    names.map(async (name) => {
      const titleField = getCollectionDef(name)?.titleField ?? "title";
      const items = await store.listItems(name);
      return [name, items.map(({ id, data }) => ({ id, title: String(data[titleField] ?? "") || id }))] as const;
    }),
  );
  return Object.fromEntries(lists);
}
