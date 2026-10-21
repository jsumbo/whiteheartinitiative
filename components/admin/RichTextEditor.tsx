"use client";

import Image from "@tiptap/extension-image";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRef, useState } from "react";
import { uploadPhoto } from "./fields";

// Rich text editor for news posts. Saves HTML, which the server cleans (lib/sanitize.ts) before storing.

type Props = {
  id: string;
  labelId: string;
  value: string;
  onChange: (html: string) => void;
  describedBy?: string;
  invalid?: boolean;
  path: string;
};

const btn =
  "min-w-9 border-2 border-transparent px-2 py-1.5 text-sm font-bold text-forest hover:border-stone-300 aria-pressed:border-forest aria-pressed:bg-forest aria-pressed:text-white disabled:opacity-40";

export function RichTextEditor({ id, labelId, value, onChange, describedBy, invalid, path }: Props) {
  const editor = useEditor({
    // Rendered only in the browser, so the server and browser HTML always match.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        id,
        role: "textbox",
        "aria-multiline": "true",
        "aria-labelledby": labelId,
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
        ...(invalid ? { "aria-invalid": "true" } : {}),
        "data-path": path,
        class: "post-body min-h-[18rem] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  return (
    <div className={`mt-1 border-2 bg-white focus-within:border-forest ${invalid ? "border-red-700" : "border-stone-300"}`}>
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const [panel, setPanel] = useState<null | "link" | "photo">(null);
  const run = (fn: (c: ReturnType<Editor["chain"]>) => ReturnType<Editor["chain"]>) => fn(editor.chain().focus()).run();

  const tools: { label: string; text: string; active?: boolean; disabled?: boolean; onClick: () => void }[] = [
    { label: "Heading", text: "H2", active: s.h2, onClick: () => run((c) => c.toggleHeading({ level: 2 })) },
    { label: "Subheading", text: "H3", active: s.h3, onClick: () => run((c) => c.toggleHeading({ level: 3 })) },
    { label: "Bold", text: "B", active: s.bold, onClick: () => run((c) => c.toggleBold()) },
    { label: "Italic", text: "I", active: s.italic, onClick: () => run((c) => c.toggleItalic()) },
    { label: "Underline", text: "U", active: s.underline, onClick: () => run((c) => c.toggleUnderline()) },
    { label: "Bulleted list", text: "• List", active: s.bullet, onClick: () => run((c) => c.toggleBulletList()) },
    { label: "Numbered list", text: "1. List", active: s.ordered, onClick: () => run((c) => c.toggleOrderedList()) },
    { label: "Quote", text: "“ Quote", active: s.quote, onClick: () => run((c) => c.toggleBlockquote()) },
    { label: "Link", text: "Link", active: s.link || panel === "link", onClick: () => setPanel(panel === "link" ? null : "link") },
    { label: "Photo", text: "Photo", active: panel === "photo", onClick: () => setPanel(panel === "photo" ? null : "photo") },
    { label: "Undo", text: "Undo", disabled: !s.canUndo, onClick: () => run((c) => c.undo()) },
    { label: "Redo", text: "Redo", disabled: !s.canRedo, onClick: () => run((c) => c.redo()) },
  ];

  return (
    <div className="sticky top-0 z-10 border-b-2 border-stone-200 bg-stone-50">
      <div role="toolbar" aria-label="Formatting" className="flex flex-wrap gap-1 p-1.5">
        {tools.map((t) => (
          <button
            key={t.label}
            type="button"
            className={`${btn} ${t.text === "B" ? "font-black" : ""} ${t.text === "I" ? "italic" : ""} ${t.text === "U" ? "underline" : ""}`}
            aria-label={t.label}
            title={t.label}
            aria-pressed={t.active === undefined ? undefined : t.active}
            disabled={t.disabled}
            onClick={t.onClick}
          >
            {t.text}
          </button>
        ))}
      </div>
      {panel === "link" && <LinkPanel editor={editor} close={() => setPanel(null)} />}
      {panel === "photo" && <PhotoPanel editor={editor} close={() => setPanel(null)} />}
    </div>
  );
}

// Enter in a panel's text box applies the panel rather than submitting the whole post.
const onEnter = (fn: () => void) => (e: React.KeyboardEvent) => {
  if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
    e.preventDefault();
    fn();
  }
};

const panelInput = "block w-full border-2 border-stone-300 bg-white px-3 py-2 text-base focus:border-forest focus:outline-none";

function LinkPanel({ editor, close }: { editor: Editor; close: () => void }) {
  const [url, setUrl] = useState<string>(editor.getAttributes("link").href ?? "");
  const [error, setError] = useState("");

  function apply() {
    const href = url.trim();
    if (!/^(https?:\/\/|mailto:|tel:|\/)/i.test(href)) {
      setError("Start the link with https://");
      return;
    }
    if (editor.state.selection.empty && !editor.isActive("link")) {
      // Nothing selected: insert the address itself as the link text.
      editor.chain().focus().insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] }).run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
    close();
  }

  return (
    <div onKeyDown={onEnter(apply)} className="grid gap-2 border-t-2 border-stone-200 p-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
      <div>
        <label htmlFor="rte-link" className="text-sm font-bold">Link address</label>
        <p className="text-xs text-stone-600">Select some text first to turn it into a link.</p>
        <input id="rte-link" autoFocus className={panelInput} value={url} placeholder="https://" onChange={(e) => setUrl(e.target.value)} />
        {error && <p role="alert" className="mt-1 text-sm font-bold text-red-800">{error}</p>}
      </div>
      <button type="button" onClick={apply} className="bg-forest px-4 py-2 font-bold text-white hover:bg-olive">Add link</button>
      {editor.isActive("link") ? (
        <button
          type="button"
          className="border-2 border-stone-300 px-4 py-1.5 font-bold text-forest"
          onClick={() => {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            close();
          }}
        >
          Remove link
        </button>
      ) : (
        <button type="button" className="border-2 border-stone-300 px-4 py-1.5 font-bold text-forest" onClick={close}>Cancel</button>
      )}
    </div>
  );
}

function PhotoPanel({ editor, close }: { editor: Editor; close: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pick(file: File) {
    setBusy(true);
    setError("");
    try {
      setSrc(await uploadPhoto(file));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function insert() {
    if (!src) return;
    if (!alt.trim()) {
      setError("Please describe the photo.");
      return;
    }
    editor.chain().focus().setImage({ src, alt: alt.trim() }).run();
    close();
  }

  return (
    <div onKeyDown={onEnter(insert)} className="grid gap-3 border-t-2 border-stone-200 p-3">
      <input
        ref={fileRef}
        id="rte-photo"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])}
      />
      <div className="flex flex-wrap items-center gap-3">
        {src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="h-20 w-28 object-cover" />
        )}
        <button type="button" disabled={busy} className="border-2 border-stone-300 bg-white px-4 py-1.5 font-bold text-forest hover:border-forest" onClick={() => fileRef.current?.click()}>
          {busy ? "Uploading..." : src ? "Choose a different photo" : "Choose photo"}
        </button>
      </div>
      {src && (
        <div>
          <label htmlFor="rte-alt" className="text-sm font-bold">Photo description</label>
          <p className="text-xs text-stone-600">Not shown on the page. Screen readers read it out. Example: Children singing at Freedom&rsquo;s Future 2025.</p>
          <input id="rte-alt" autoFocus className={panelInput} value={alt} onChange={(e) => setAlt(e.target.value)} />
        </div>
      )}
      {error && <p role="alert" className="text-sm font-bold text-red-800">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={insert} disabled={!src || busy} className="bg-forest px-4 py-2 font-bold text-white hover:bg-olive disabled:opacity-50">Add photo</button>
        <button type="button" className="border-2 border-stone-300 px-4 py-1.5 font-bold text-forest" onClick={close}>Cancel</button>
      </div>
    </div>
  );
}
