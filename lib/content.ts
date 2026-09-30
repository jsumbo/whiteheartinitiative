import { store, type Data } from "@/lib/store";

// Reads site content for the public pages. Everything here is edited in the admin at /admin.

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

export type Program = { id: string; slug: string; title: string; image: string; imageAlt: string; description: string };
export type TeamMember = { id: string; name: string; position: string; photo?: string; photoAlt?: string };
export type Photo = { id: string; image: string; alt: string; program?: string; date: string };

const doc = async <T,>(key: string) => ((await store.getDoc(key)) ?? {}) as T;

export const getSettings = () => doc<Settings>("settings").then((s) => ({ ...s, social: s.social ?? ({} as Settings["social"]) }));
export const getHome = () => doc<Home>("home");
export const getAbout = () => doc<About>("about").then((a) => ({ ...a, mission: a.mission ?? [] }));
export const getContact = () =>
  doc<Contact>("contact").then((c) => ({ ...c, helpGroups: c.helpGroups ?? [], helpButtons: c.helpButtons ?? [] }));
export const getProgramsPage = () => doc<{ intro: string }>("programsPage");
export const getGalleryPage = () => doc<{ intro: string }>("galleryPage");

const str = (d: Data, k: string) => (typeof d[k] === "string" ? (d[k] as string) : "");

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function getPrograms(): Promise<Program[]> {
  return (await store.listItems("programs")).map(({ id, data }) => ({
    id,
    slug: slugify(str(data, "title")) || id,
    title: str(data, "title"),
    image: str(data, "image"),
    imageAlt: str(data, "imageAlt"),
    description: str(data, "description"),
  }));
}

export async function getTeam(): Promise<TeamMember[]> {
  return (await store.listItems("team")).map(({ id, data }) => ({
    id,
    name: str(data, "name"),
    position: str(data, "position"),
    photo: str(data, "photo"),
    photoAlt: str(data, "photoAlt"),
  }));
}

export async function getPhotos(): Promise<Photo[]> {
  return (await store.listItems("gallery"))
    .map(({ id, data }) => ({ id, image: str(data, "image"), alt: str(data, "alt"), program: str(data, "program"), date: str(data, "date") }))
    .filter((p) => p.image)
    .sort((a, b) => b.date.localeCompare(a.date));
}

// Splits text from a multi-line field into paragraphs.
export const paragraphs = (text = "") => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

export const isPlaceholder = (value?: string) => !value || value.includes("PLACEHOLDER");

export const socialLabels = {
  instagram: "Instagram",
  facebook: "Facebook",
  x: "X",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
} as const;

// Maps a help button label to the anchor used to prefill the contact form.
export const topicId = (label: string) => "form-" + slugify(label);
