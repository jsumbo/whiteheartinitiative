import type { CollectionName } from "./schema";

// Where each admin section shows on the public site, for the "View on site" links.

export const docPaths: Record<string, string> = {
  settings: "/about",
  home: "/",
  about: "/about",
  projectsPage: "/projects",
  support: "/support",
  mediaPage: "/media",
};

export const collectionPaths: Record<CollectionName, string> = {
  projects: "/projects",
  focus: "/",
  team: "/about#team-title",
  gallery: "/media",
  media: "/media",
  posts: "/news",
};
