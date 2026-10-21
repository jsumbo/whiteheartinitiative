// Describes every editable field: its label, hint text and type.
// The admin forms are built from this, and saved data is checked against it.

export type Field =
  | { type: "text" | "textarea" | "email" | "url" | "tel" | "date"; name: string; label: string; hint?: string; required?: boolean }
  | { type: "image"; name: string; label: string; hint?: string; required?: boolean }
  | { type: "select"; name: string; label: string; hint?: string; required?: boolean; options: { value: string; label: string }[] }
  // Picks an entry from another list, e.g. which project a photo belongs to.
  | { type: "ref"; name: string; label: string; hint?: string; collection: CollectionName; emptyLabel: string }
  | { type: "list"; name: string; label: string; hint?: string; itemLabel: string }
  | { type: "group"; name: string; label: string; hint?: string; fields: Field[] }
  | { type: "groupList"; name: string; label: string; hint?: string; itemLabel: string; fields: Field[] };

export type CollectionName = "projects" | "focus" | "team" | "gallery" | "media";

export type DocDef = { key: string; label: string; description: string; fields: Field[] };

export type CollectionDef = {
  name: CollectionName;
  label: string;
  singular: string;
  plural: string;
  description: string;
  titleField: string;
  imageField?: string;
  // "manual": editors set the order with arrows. "date": newest first.
  sort: "manual" | "date";
  fields: Field[];
};

const photoAlt = (name: string, example: string, required = true): Field => ({
  type: "text",
  name,
  label: "Photo description",
  required,
  hint: `Not shown on the page. Screen readers read it out to people who cannot see the photo. Describe what is in it. Example: ${example}`,
});

const titleText = (itemLabel: string, example: string): Field[] => [
  { type: "text", name: "title", label: "Heading", required: true, hint: `Example: ${example}` },
  { type: "textarea", name: "text", label: "Text", hint: `A sentence or two about this ${itemLabel.toLowerCase()}.` },
];

export const statIcons = [
  { value: "projects", label: "Projects (stack)" },
  { value: "events", label: "Events (calendar)" },
  { value: "children", label: "Children (people)" },
  { value: "homes", label: "Orphanages and churches (house)" },
  { value: "towns", label: "Towns (map pin)" },
  { value: "heart", label: "Other (heart)" },
];

export const docs: DocDef[] = [
  {
    key: "settings",
    label: "Contact details and social links",
    description: "Your email, phone, location and social media links.",
    fields: [
      { type: "email", name: "email", label: "Email address", hint: "Shown in the Contact section of the About page. Example: hello@whiteheartinitiative.org" },
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
    description: "The heading, the numbers band, the intro and the closing section that asks people to help.",
    fields: [
      { type: "text", name: "headline", label: "Main heading", required: true, hint: "The big heading at the top of the home page." },
      { type: "text", name: "tagline", label: "Tagline", hint: "Short line under the heading, shown in italics." },
      { type: "textarea", name: "intro", label: "Intro line", hint: "One or two sentences that say what White Heart Initiative does." },
      { type: "image", name: "heroImage", label: "Top photo", hint: "Large photo behind the heading. Pick a wide (landscape) photo." },
      photoAlt("heroImageAlt", "Children in school uniform sitting on benches outdoors."),
      { type: "text", name: "primaryButton", label: "First button text", hint: "Takes people to the Support Us page." },
      { type: "text", name: "secondaryButton", label: "Second button text", hint: "Takes people to the About page." },
      {
        type: "groupList",
        name: "stats",
        label: "Numbers band",
        itemLabel: "Number",
        hint: "The numbers under the top photo. They count up when someone scrolls to them. Four works best.",
        fields: [
          { type: "text", name: "value", label: "Number", required: true, hint: "Digits, with + at the end if it is 'more than'. Example: 1,700+" },
          { type: "text", name: "label", label: "What it counts", required: true, hint: "Example: Children reached" },
          { type: "select", name: "icon", label: "Icon", options: statIcons },
        ],
      },
      { type: "text", name: "ctaTitle", label: "Closing section heading", hint: "Heading near the bottom that asks people to volunteer or donate. Keep it lowercase to match the style." },
      { type: "textarea", name: "ctaText", label: "Closing section text", hint: "One or two sentences asking people to help." },
      { type: "image", name: "ctaImage", label: "Closing section photo", hint: "Photo behind the closing section. Pick a wide photo." },
      photoAlt("ctaImageAlt", "Children standing with a mentor beside a creek."),
      { type: "text", name: "ctaVolunteerButton", label: "Volunteer button text", hint: "Opens your volunteer form (the link set on the Support Us page)." },
      { type: "text", name: "ctaSupportButton", label: "Second button text", hint: "Opens the Support Us page." },
    ],
  },
  {
    key: "about",
    label: "About page",
    description: "About text, founder quote, vision, mission, goal and the Contact section. Team members are under Team.",
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
      { type: "text", name: "contactHeading", label: "Contact section heading", hint: "Shown in lowercase. Example: let's connect" },
      { type: "textarea", name: "contactIntro", label: "Contact section intro", hint: "Your social media handle is added at the end for you. Email, phone and location are under 'Contact details and social links'." },
    ],
  },
  {
    key: "projectsPage",
    label: "Projects page",
    description: "The intro and focus areas text on the Projects page. The projects and focus areas themselves are under Lists.",
    fields: [
      { type: "textarea", name: "intro", label: "Intro text", hint: "Shown at the top of the Projects page and on the home page." },
      { type: "textarea", name: "focusIntro", label: "Focus areas intro", hint: "Shown above the three focus area cards." },
      { type: "textarea", name: "projectsIntro", label: "Projects intro", hint: "Shown above Jumpstart, Freedom's Future and any other projects." },
    ],
  },
  {
    key: "support",
    label: "Support Us page",
    description: "Volunteer link, what you need and partnership options.",
    fields: [
      { type: "textarea", name: "intro", label: "Intro text", hint: "Shown at the top of the page." },
      { type: "textarea", name: "volunteerIntro", label: "Volunteer section text", hint: "One or two sentences inviting people to volunteer." },
      { type: "url", name: "volunteerUrl", label: "Volunteer form link", hint: "The web address of your sign-up form, for example a Google Form. Until this is filled in, the button opens the contact form on the About page." },
      { type: "text", name: "volunteerButton", label: "Volunteer button text", hint: "Example: Sign up to volunteer" },
      { type: "textarea", name: "needsIntro", label: "'What we need' intro", hint: "One or two sentences above the list of things you need." },
      {
        type: "groupList",
        name: "needs",
        label: "'What we need' list",
        itemLabel: "Group",
        hint: "Each group is a heading with a list of items or a short sentence.",
        fields: [
          { type: "text", name: "title", label: "Group heading", required: true, hint: "Example: Technology for Learning" },
          { type: "list", name: "items", label: "Items needed", itemLabel: "Item", hint: "One item per box. Leave empty if you use the sentence below instead." },
          { type: "textarea", name: "text", label: "Short sentence", hint: "Optional. Use this for needs that are not a list of items." },
        ],
      },
      { type: "textarea", name: "partnerIntro", label: "Partnership intro", hint: "Shown above the partnership options." },
      { type: "groupList", name: "partnerOptions", label: "Partnership options", itemLabel: "Option", fields: titleText("Option", "Venue") },
    ],
  },
  {
    key: "mediaPage",
    label: "Media page",
    description: "The intro on the Media page. News links and social posts are under Media links, photos under Gallery.",
    fields: [{ type: "textarea", name: "intro", label: "Intro text" }],
  },
];

export const collections: CollectionDef[] = [
  {
    name: "projects",
    label: "Projects",
    singular: "project",
    plural: "projects",
    description: "Your named projects, like Jumpstart and Freedom's Future. Shown on the Projects page and the home page.",
    titleField: "name",
    imageField: "image",
    sort: "manual",
    fields: [
      { type: "text", name: "name", label: "Project name", required: true, hint: "Use the same name everywhere so people remember it. Example: Freedom's Future" },
      { type: "text", name: "tagline", label: "One-line description", required: true, hint: "Example: Our annual Independence Day celebration for children" },
      { type: "text", name: "schedule", label: "When it runs", hint: "Example: Every year on July 26" },
      { type: "text", name: "next", label: "Next date", hint: "Optional. Example: July 26, 2027" },
      { type: "image", name: "image", label: "Photo", required: true, hint: "A photo from this project. Pick a wide photo." },
      photoAlt("imageAlt", "Children at a Freedom's Future celebration."),
      { type: "textarea", name: "description", label: "Write-up", required: true, hint: "What the project is and what happens. Leave an empty line between paragraphs." },
      {
        type: "groupList",
        name: "highlights",
        label: "Numbers",
        itemLabel: "Number",
        hint: "Real numbers from this project, for example children per year. Example: Number '600+', Label '2025'.",
        fields: [
          { type: "text", name: "value", label: "Number", required: true, hint: "Example: 600+" },
          { type: "text", name: "label", label: "Label", required: true, hint: "Example: children in 2025" },
        ],
      },
    ],
  },
  {
    name: "focus",
    label: "Focus areas",
    singular: "focus area",
    plural: "focus areas",
    description: "Education, Empowerment and Health. Shown as cards on the Projects page and the home page.",
    titleField: "title",
    imageField: "image",
    sort: "manual",
    fields: [
      { type: "text", name: "title", label: "Name", required: true, hint: "Short name, for example Education." },
      { type: "image", name: "image", label: "Photo", required: true, hint: "Pick a wide photo." },
      photoAlt("imageAlt", "A mentor helping two girls with a reading exercise."),
      { type: "textarea", name: "description", label: "Write-up", required: true, hint: "What you do in this area, and which projects do it. Leave an empty line between paragraphs. The first paragraph is also shown on the home page." },
    ],
  },
  {
    name: "team",
    label: "Team",
    singular: "team member",
    plural: "people",
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
    label: "Gallery photos",
    singular: "photo",
    plural: "photos",
    description: "Photos from your activities, shown on the Media page. The newest date shows first. The six newest also appear on the home page.",
    titleField: "alt",
    imageField: "image",
    sort: "date",
    fields: [
      { type: "image", name: "image", label: "Photo", required: true, hint: "Upload the photo." },
      photoAlt("alt", "Children lining up for a health check outside a school."),
      { type: "ref", name: "project", label: "Project", collection: "projects", emptyLabel: "No project", hint: "Optional. Pick the project this photo is from so visitors can filter by it." },
      { type: "date", name: "date", label: "Date taken", required: true, hint: "Roughly when the photo was taken. Used to sort the gallery." },
    ],
  },
  {
    name: "media",
    label: "Media links",
    singular: "link",
    plural: "links",
    description: "News articles and social media posts about your work, shown on the Media page. The newest date shows first.",
    titleField: "title",
    imageField: "image",
    sort: "date",
    fields: [
      { type: "text", name: "title", label: "Headline or title", required: true, hint: "Copy the article headline or describe the post. Example: Children celebrate Independence Day at Freedom's Future" },
      { type: "url", name: "url", label: "Link", required: true, hint: "Paste the full web address, starting with https://" },
      {
        type: "select",
        name: "kind",
        label: "Type",
        required: true,
        options: [
          { value: "news", label: "News article" },
          { value: "social", label: "Social media post" },
          { value: "video", label: "Video" },
        ],
      },
      { type: "text", name: "source", label: "Where it was published", required: true, hint: "Example: FrontPage Africa, Facebook, YouTube" },
      { type: "date", name: "date", label: "Date published", required: true },
      { type: "image", name: "image", label: "Picture", hint: "Optional. A photo or screenshot to show with the link." },
      photoAlt("imageAlt", "Children holding Liberian flags at an Independence Day event.", false),
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
        if (f.type === "select" && s && !f.options.some((o) => o.value === s)) return { data, error: `${f.label}: pick one of the options.` };
        data[f.name] = s;
      }
    }
    if ("required" in f && f.required && !data[f.name]) return { data, error: `Please fill in "${f.label}".` };
  }
  return { data };
}
