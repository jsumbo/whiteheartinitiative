// Form submissions from the public site, saved by lib/forms.ts. Read-only in the admin.
// The volunteer sign-up form is hosted elsewhere, so only contact messages land here.

export type InboxDef = {
  name: "messages";
  label: string;
  singular: string;
  plural: string;
  description: string;
  // Shown under the sender's name, in this order.
  fields: { name: string; label: string }[];
};

export const inboxes: InboxDef[] = [
  {
    name: "messages",
    label: "Messages",
    singular: "message",
    plural: "messages",
    description: "Sent with the contact form. Newest first.",
    fields: [
      { name: "email", label: "Email" },
      { name: "message", label: "Message" },
    ],
  },
];

export const getInboxDef = (name: string) => inboxes.find((b) => b.name === name);
