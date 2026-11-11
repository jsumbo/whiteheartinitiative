import type { IconName } from "@/components/admin/AdminIcon";
import { docPaths } from "./links";
import { docs, getCollectionDef, type CollectionName } from "./schema";

// The admin side menu. List labels come from the schema, so renaming a list there renames it here too.

export type MenuItem = {
  label: string;
  href: string;
  icon: IconName;
  // Paths that belong to this item, so it stays highlighted on its sub-pages (like editing a post).
  match: (path: string) => boolean;
  // Shows a count next to the label.
  badge?: "messages";
};

const under = (prefix: string) => (path: string) => path === prefix || path.startsWith(prefix + "/");
const pageKeys = docs.filter((d) => d.key !== "settings").map((d) => d.key);

const list = (name: CollectionName, icon: IconName, label = getCollectionDef(name)!.label): MenuItem => ({
  label,
  href: `/admin/${name}`,
  icon,
  match: under(`/admin/${name}`),
});

export const menu: MenuItem[] = [
  { label: "Overview", href: "/admin", icon: "dashboard", match: (p) => p === "/admin" },
  list("posts", "news", "News"),
  {
    label: "Pages",
    href: "/admin/pages",
    icon: "pages",
    match: (p) => p === "/admin/pages" || pageKeys.some((k) => p === `/admin/pages/${k}`),
  },
  list("projects", "projects"),
  list("focus", "programs"),
  list("team", "team"),
  list("gallery", "gallery", "Gallery"),
  list("media", "links"),
  { label: "Messages", href: "/admin/inbox/messages", icon: "messages", match: under("/admin/inbox"), badge: "messages" },
  { label: "Settings", href: "/admin/pages/settings", icon: "settings", match: (p) => p === "/admin/pages/settings" },
];

// The site address each page appears at, for the Pages table.
export const pagePath = (key: string) => docPaths[key] ?? "/";
