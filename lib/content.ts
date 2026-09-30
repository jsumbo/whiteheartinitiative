import fs from "node:fs";
import path from "node:path";

// All site text lives in /content as JSON, edited through the CMS at /admin.
const root = path.join(process.cwd(), "content");

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8")) as T;
}

function readFolder<T>(dir: string): (T & { slug: string })[] {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({ ...readJson<T>(path.join(dir, f)), slug: f.replace(/\.json$/, "") }));
}

export type Settings = {
  email: string;
  phone: string;
  location: string;
  handle: string;
  social: Record<"instagram" | "facebook" | "x" | "linkedin" | "tiktok" | "youtube", string>;
};

export type Home = {
  headline: string;
  tagline: string;
  intro: string;
  heroImage: string;
  heroImageAlt: string;
  primaryButton: string;
  secondaryButton: string;
  ctaTitle: string;
  ctaText: string;
  ctaImage: string;
  ctaImageAlt: string;
  ctaVolunteerButton: string;
  ctaDonateButton: string;
};

export type TeamMember = { slug: string; name: string; position: string; order?: number; photo?: string; photoAlt?: string };

export type About = {
  heroImage: string;
  heroImageAlt: string;
  heading?: string;
  body: string;
  quote: string;
  quoteBy: string;
  vision: string;
  mission: string[];
  goal: string;
};

export type HelpGroup = { title: string; items?: string[]; text?: string };

export type Contact = {
  heading: string;
  intro: string;
  helpIntro: string;
  helpGroups: HelpGroup[];
  helpButtons: string[];
};

export type Program = {
  slug: string;
  title: string;
  order: number;
  image: string;
  imageAlt: string;
  description: string;
};

export type Photo = {
  slug: string;
  image: string;
  alt: string;
  program?: string;
  date: string;
};

export const getSettings = () => readJson<Settings>("settings.json");
export const getHome = () => readJson<Home>("home.json");
export const getAbout = () => readJson<About>("about.json");
export const getContact = () => readJson<Contact>("contact.json");
export const getProgramsPage = () => readJson<{ intro: string }>("programs-page.json");
export const getGalleryPage = () => readJson<{ intro: string }>("gallery-page.json");

export function getPrograms(): Program[] {
  return readFolder<Omit<Program, "slug">>("programs").sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99) || a.title.localeCompare(b.title),
  );
}

export function getTeam(): TeamMember[] {
  return readFolder<Omit<TeamMember, "slug">>("team").sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99) || a.name.localeCompare(b.name),
  );
}

// Splits text from a multi-line CMS field into paragraphs.
export const paragraphs = (text = "") => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

export function getPhotos(): Photo[] {
  return readFolder<Omit<Photo, "slug">>("gallery").sort((a, b) =>
    String(b.date).localeCompare(String(a.date)),
  );
}

export const isPlaceholder = (value: string) => !value || value.includes("PLACEHOLDER");

export const socialLabels = {
  instagram: "Instagram",
  facebook: "Facebook",
  x: "X",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
} as const;

// Maps a help button label to the anchor used to prefill the contact form.
export const topicId = (label: string) =>
  "form-" + label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
