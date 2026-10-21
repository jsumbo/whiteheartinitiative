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
  stats: Stat[];
  ctaTitle: string;
  ctaText: string;
  ctaImage: string;
  ctaImageAlt: string;
  ctaVolunteerButton: string;
  ctaSupportButton: string;
};

export type Stat = { value: string; label: string; icon?: string };

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
  contactHeading: string;
  contactIntro: string;
};

export type HelpGroup = { title: string; items?: string[]; text?: string };
export type TitleText = { title: string; text?: string };

export type Support = {
  intro: string;
  volunteerIntro: string;
  volunteerUrl: string;
  volunteerButton: string;
  needsIntro: string;
  needs: HelpGroup[];
  partnerIntro: string;
  partnerOptions: TitleText[];
};

export type Project = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  schedule: string;
  next: string;
  image: string;
  imageAlt: string;
  description: string;
  highlights: { value: string; label: string }[];
};
export type FocusArea = { id: string; slug: string; title: string; image: string; imageAlt: string; description: string };
export type TeamMember = { id: string; name: string; position: string; photo?: string; photoAlt?: string };
export type Photo = { id: string; image: string; alt: string; project?: string; date: string };
export type MediaLink = { id: string; title: string; url: string; kind: "news" | "social" | "video"; source: string; date: string; image: string; imageAlt: string };

const doc = async <T,>(key: string) => ((await store.getDoc(key)) ?? {}) as T;

export const getSettings = () => doc<Settings>("settings").then((s) => ({ ...s, social: s.social ?? ({} as Settings["social"]) }));
export const getHome = () => doc<Home>("home").then((h) => ({ ...h, stats: h.stats ?? [] }));
export const getAbout = () => doc<About>("about").then((a) => ({ ...a, mission: a.mission ?? [] }));
export const getSupport = () =>
  doc<Support>("support").then((s) => ({
    ...s,
    needs: s.needs ?? [],
    partnerOptions: s.partnerOptions ?? [],
  }));
export const getProjectsPage = () => doc<{ intro: string; focusIntro: string; projectsIntro: string }>("projectsPage");
export const getMediaPage = () => doc<{ intro: string }>("mediaPage");

const str = (d: Data, k: string) => (typeof d[k] === "string" ? (d[k] as string) : "");

export const slugify = (s: string) =>
  s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const pairs = (v: unknown) =>
  Array.isArray(v) ? (v as Data[]).map((x) => ({ value: str(x, "value"), label: str(x, "label") })).filter((x) => x.value) : [];

export async function getProjects(): Promise<Project[]> {
  return (await store.listItems("projects")).map(({ id, data }) => ({
    id,
    slug: slugify(str(data, "name")) || id,
    name: str(data, "name"),
    tagline: str(data, "tagline"),
    schedule: str(data, "schedule"),
    next: str(data, "next"),
    image: str(data, "image"),
    imageAlt: str(data, "imageAlt"),
    description: str(data, "description"),
    highlights: pairs(data.highlights),
  }));
}

export async function getFocusAreas(): Promise<FocusArea[]> {
  return (await store.listItems("focus")).map(({ id, data }) => ({
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
    .map(({ id, data }) => ({ id, image: str(data, "image"), alt: str(data, "alt"), project: str(data, "project"), date: str(data, "date") }))
    .filter((p) => p.image)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getMediaLinks(): Promise<MediaLink[]> {
  return (await store.listItems("media"))
    .map(({ id, data }) => ({
      id,
      title: str(data, "title"),
      url: str(data, "url"),
      kind: (["news", "social", "video"].includes(str(data, "kind")) ? str(data, "kind") : "news") as MediaLink["kind"],
      source: str(data, "source"),
      date: str(data, "date"),
      image: str(data, "image"),
      imageAlt: str(data, "imageAlt"),
    }))
    .filter((m) => m.url && m.title)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export const formatDate = (iso: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(iso)
    ? new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    : iso;

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

export type Post = {
  id: string;
  slug: string;
  title: string;
  date: string;
  cover: string;
  coverAlt: string;
  summary: string;
  body: string;
  project: string;
};

// Published news posts, newest first. Each gets a unique web address made from its title (or the slug field).
export async function getPosts(): Promise<Post[]> {
  const { sanitizeRichText, richTextToPlain, responsiveImages } = await import("@/lib/sanitize");
  const posts = (await store.listItems("posts"))
    .filter(({ data }) => str(data, "status") === "published" && str(data, "title"))
    .map(({ id, data }) => {
      const body = sanitizeRichText(str(data, "body"));
      const plain = richTextToPlain(body);
      const summary = str(data, "summary") || (plain.length > 180 ? plain.slice(0, plain.lastIndexOf(" ", 177)) + "…" : plain);
      return {
        id,
        slug: slugify(str(data, "slug") || str(data, "title")) || id,
        title: str(data, "title"),
        date: str(data, "date"),
        cover: str(data, "cover"),
        coverAlt: str(data, "coverAlt"),
        summary,
        body: responsiveImages(body),
        project: str(data, "project"),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  // Two posts with the same title get -2, -3... so their addresses never clash.
  const seen = new Map<string, number>();
  for (const p of [...posts].reverse()) {
    const n = (seen.get(p.slug) ?? 0) + 1;
    seen.set(p.slug, n);
    if (n > 1) p.slug = `${p.slug}-${n}`;
  }
  return posts;
}

export const getPost = async (slug: string) => (await getPosts()).find((p) => p.slug === slug) ?? null;
