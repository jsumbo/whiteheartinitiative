// Describes every editable field: its label, hint text and type.
// The admin forms are built from this, and saved data is checked against it.

export type Field =
  | { type: "text" | "textarea" | "email" | "url" | "tel" | "date"; name: string; label: string; hint?: string; required?: boolean }
  | { type: "image"; name: string; label: string; hint?: string; required?: boolean }
  | { type: "list"; name: string; label: string; hint?: string; itemLabel: string }
  | { type: "program"; name: string; label: string; hint?: string }
  | { type: "group"; name: string; label: string; hint?: string; fields: Field[] }
  | { type: "groupList"; name: string; label: string; hint?: string; itemLabel: string; fields: Field[] };

export type DocDef = { key: string; label: string; description: string; fields: Field[] };

export type CollectionDef = {
  name: "programs" | "team" | "gallery";
  label: string;
  singular: string;
  description: string;
  titleField: string;
  imageField: string;
  // "manual": editors set the order with arrows. "date": newest first.
  sort: "manual" | "date";
  fields: Field[];
};

const photoAlt = (name: string, example: string): Field => ({
  type: "text",
  name,
  label: "Photo description",
  required: true,
  hint: `Not shown on the page. Screen readers read it out to people who cannot see the photo. Describe what is in it. Example: ${example}`,
});

export const docs: DocDef[] = [
  {
    key: "settings",
    label: "Contact details and social links",
    description: "Your email, phone, location and social media links.",
    fields: [
      { type: "email", name: "email", label: "Email address", hint: "Shown on the Contact page. Example: hello@whiteheart.org" },
      { type: "tel", name: "phone", label: "Phone or WhatsApp number", hint: "Include the country code. Example: +231 77 000 0000" },
      { type: "text", name: "location", label: "Location", hint: "Town and county, or a street address. Example: Monrovia, Montserrado County" },
      { type: "text", name: "handle", label: "Social media handle", required: true, hint: "The name people search for on social media, starting with @." },
      {
        type: "group",
        name: "social",
        label: "Social media links",
        hint: "Paste the full web address of each page, starting with https://. Leave a box empty to hide that link.",
        fields: [
          { type: "url", name: "instagram", label: "Instagram" },
          { type: "url", name: "facebook", label: "Facebook" },
          { type: "url", name: "x", label: "X (Twitter)" },
          { type: "url", name: "linkedin", label: "LinkedIn" },
          { type: "url", name: "tiktok", label: "TikTok" },
          { type: "url", name: "youtube", label: "YouTube" },
        ],
      },
    ],
  },
  {
    key: "home",
    label: "Home page",
    description: "The heading, intro and the closing section that asks people to help.",
    fields: [
      { type: "text", name: "headline", label: "Main heading", required: true, hint: "The big heading at the top of the home page." },
      { type: "text", name: "tagline", label: "Tagline", hint: "Short line under the heading, shown in italics." },
      { type: "textarea", name: "intro", label: "Intro line", hint: "One or two sentences that say what White Heart Initiative does." },
      { type: "image", name: "heroImage", label: "Top photo", hint: "Large photo behind the heading. Pick a wide (landscape) photo.." },
      photoAlt("heroImageAlt", "Children in school uniform sitting on benches outdoors."),
      { type: "text", name: "primaryButton", label: "First button text", hint: "Takes people to the 'How you can help' section." },
      { type: "text", name: "secondaryButton", label: "Second button text", hint: "Takes people to the About page." },
      { type: "text", name: "ctaTitle", label: "Closing section heading", hint: "Heading near the bottom that asks people to volunteer or donate. Keep it lowercase to match the style." },
      { type: "textarea", name: "ctaText", label: "Closing section text", hint: "One or two sentences asking people to help." },
      { type: "image", name: "ctaImage", label: "Closing section photo", hint: "Photo behind the closing section. Pick a wide photo." },
      photoAlt("ctaImageAlt", "Children standing with a mentor beside a creek."),
      { type: "text", name: "ctaVolunteerButton", label: "Volunteer button text", hint: "Opens the contact form with this text already filled in." },
      { type: "text", name: "ctaDonateButton", label: "Donate button text", hint: "Opens the contact form with this text already filled in." },
    ],
  },
  {
    key: "about",
    label: "About page",
    description: "About text, founder quote, vision, mission and goal. Team members are under Team.",
    fields: [
      { type: "image", name: "heroImage", label: "Top photo", hint: "Photo behind the 'about us.' heading. Pick a wide photo." },
      photoAlt("heroImageAlt", "A mentor sitting with a group of children under trees."),
      { type: "text", name: "heading", label: "Greeting", hint: "Optional. Short heading above the about text, for example: Nice to meet you!" },
      { type: "textarea", name: "body", label: "About text", required: true, hint: "Who you are and what you do. Also shown on the home page." },
      { type: "textarea", name: "quote", label: "Founder quote", hint: "Type the quote without quotation marks. They are added for you." },
      { type: "text", name: "quoteBy", label: "Quote by", hint: "Name of the person who said it." },
      { type: "textarea", name: "vision", label: "Vision", hint: "One sentence. Also shown on the home page." },
      { type: "list", name: "mission", label: "Mission points", itemLabel: "Point", hint: "Each point shows as its own item. Use the arrows to change the order." },
      { type: "textarea", name: "goal", label: "Goal", hint: "The full goal statement." },
    ],
  },
  {
    key: "contact",
    label: "Contact page",
    description: "Heading, intro and the 'How you can help' list.",
    fields: [
      { type: "text", name: "heading", label: "Heading", required: true, hint: "Big heading at the top of the page. It is shown in lowercase." },
      { type: "textarea", name: "intro", label: "Intro text", hint: "Shown under the heading. Your social media handle is added at the end for you." },
      { type: "textarea", name: "helpIntro", label: "'How you can help' intro", hint: "One or two sentences above the list of things you need." },
      {
        type: "groupList",
        name: "helpGroups",
        label: "'How you can help' list",
        itemLabel: "Group",
        hint: "Each group is a heading with a list of items or a short sentence.",
        fields: [
          { type: "text", name: "title", label: "Group heading", required: true, hint: "Example: Technology for Learning" },
          { type: "list", name: "items", label: "Items needed", itemLabel: "Item", hint: "One item per box. Leave empty if you use the sentence below instead." },
          { type: "textarea", name: "text", label: "Short sentence", hint: "Optional. Use this for needs that are not a list of items." },
        ],
      },
      { type: "list", name: "helpButtons", label: "Buttons under the list", itemLabel: "Button text", hint: "Each button opens the contact form with its text already filled in." },
    ],
  },
  {
    key: "programsPage",
    label: "Programs page intro",
    description: "The text at the top of the Programs page. The programs themselves are under Programs.",
    fields: [{ type: "textarea", name: "intro", label: "Intro text", hint: "Also shown on the home page above the programs." }],
  },
  {
    key: "galleryPage",
    label: "Gallery page intro",
    description: "The text at the top of the Gallery page. Photos are under Gallery.",
    fields: [{ type: "textarea", name: "intro", label: "Intro text" }],
  },
];

export const collections: CollectionDef[] = [
  {
    name: "programs",
    label: "Programs",
    singular: "program",
    description: "Shown as cards on the Programs page and the home page.",
    titleField: "title",
    imageField: "image",
    sort: "manual",
    fields: [
      { type: "text", name: "title", label: "Program name", required: true, hint: "Short name, for example Education." },
      { type: "image", name: "image", label: "Photo", required: true, hint: "A photo from this program. Pick a wide photo." },
      photoAlt("imageAlt", "A mentor helping two girls with a reading exercise."),
      { type: "textarea", name: "description", label: "Write-up", required: true, hint: "A few sentences about what this program does. Leave an empty line between paragraphs. The first paragraph is also shown on the home page." },
    ],
  },
  {
    name: "team",
    label: "Team",
    singular: "team member",
    description: "People shown in the Team section of the About page.",
    titleField: "name",
    imageField: "photo",
    sort: "manual",
    fields: [
      { type: "text", name: "name", label: "Full name", required: true },
      { type: "text", name: "position", label: "Position", required: true, hint: "Their role. Example: Founder, Programme Coordinator." },
      { type: "image", name: "photo", label: "Photo", hint: "A portrait photo (taller than wide) works best. If empty, their initials are shown instead." },
      { type: "text", name: "photoAlt", label: "Photo description", hint: "Example: Rashell Scott smiling, wearing a green dress." },
    ],
  },
  {
    name: "gallery",
    label: "Gallery",
    singular: "photo",
    description: "Photos from programme activities. The newest date shows first. The six newest also appear on the home page.",
    titleField: "alt",
    imageField: "image",
    sort: "date",
    fields: [
      { type: "image", name: "image", label: "Photo", required: true, hint: "Upload the photo." },
      photoAlt("alt", "Children lining up for a health check outside a school."),
      { type: "program", name: "program", label: "Program", hint: "Optional. Pick the program this photo belongs to so visitors can filter by it." },
      { type: "date", name: "date", label: "Date taken", required: true, hint: "Roughly when the photo was taken. Used to sort the gallery." },
    ],
  },
];

export const getDocDef = (key: string) => docs.find((d) => d.key === key);
export const getCollectionDef = (name: string) => collections.find((c) => c.name === name);

// Keeps only known fields, trims text and checks required ones. Returns an error message if something is missing.
export function clean(fields: Field[], input: unknown): { data: Record<string, unknown>; error?: string } {
  const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  for (const f of fields) {
    const v = src[f.name];
    switch (f.type) {
      case "list":
        data[f.name] = Array.isArray(v) ? v.map((x) => String(x ?? "").trim().slice(0, 1000)).filter(Boolean) : [];
        break;
      case "group":
        data[f.name] = clean(f.fields, v).data;
        break;
      case "groupList":
        data[f.name] = Array.isArray(v) ? v.map((x) => clean(f.fields, x).data) : [];
        break;
      default: {
        const s = typeof v === "string" ? v.trim().slice(0, 10000) : "";
        if (f.type === "url" && s && !/^https?:\/\//i.test(s)) return { data, error: `${f.label}: the link must start with https://` };
        if (f.type === "date" && s && !/^\d{4}-\d{2}-\d{2}$/.test(s)) return { data, error: `${f.label}: use the date picker.` };
        if (f.type === "image" && s && !/^(https:\/\/|\/uploads\/)/.test(s)) return { data, error: `${f.label}: please upload the photo again.` };
        data[f.name] = s;
      }
    }
    if ("required" in f && f.required && !data[f.name]) return { data, error: `Please fill in "${f.label}".` };
  }
  return { data };
}
