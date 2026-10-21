import sanitizeHtml from "sanitize-html";

// Rich text from the admin editor is stored as HTML. Only these tags and attributes are kept,
// so a pasted script, style or tracking pixel can never reach the public site.
const options: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "h2", "h3", "strong", "em", "s", "u", "a", "ul", "ol", "li", "blockquote", "hr", "img", "figure", "figcaption"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
  },
  allowedSchemes: ["https", "http", "mailto", "tel"],
  allowedSchemesByTag: { img: ["https"] },
  // Images may also come from the site's own uploads folder.
  allowedSchemesAppliedToAttributes: ["href", "src"],
  allowProtocolRelative: false,
  transformTags: {
    // Links to other sites open in a new tab without giving that site access to this page.
    a: (tagName, attribs) => {
      const href = attribs.href ?? "";
      const external = /^https?:\/\//i.test(href);
      const out: Record<string, string> = external ? { href, target: "_blank", rel: "noopener noreferrer" } : { href };
      return { tagName, attribs: out };
    },
  },
  exclusiveFilter: (frame) =>
    (frame.tag === "img" && !/^(https:\/\/|\/uploads\/)/.test(frame.attribs.src ?? "")) ||
    // Empty paragraphs the editor leaves at the end of a post.
    (frame.tag === "p" && !frame.text.trim() && !frame.mediaChildren.length),
};

export const sanitizeRichText = (html: string) => sanitizeHtml(html, options).trim();

// Points photos from the uploads folder at the image resizer, so phones download a small version.
const widths = [640, 828, 1080, 1600];
export function responsiveImages(html: string) {
  return html.replace(/<img src="(\/uploads\/[^"]+)"([^>]*)>/g, (_m, src: string, rest: string) => {
    const url = (w: number) => `/_next/image?url=${encodeURIComponent(src)}&amp;w=${w}&amp;q=75`;
    const srcset = widths.map((w) => `${url(w)} ${w}w`).join(", ");
    return `<img src="${url(1080)}" srcset="${srcset}" sizes="(min-width: 896px) 832px, 100vw" loading="lazy" decoding="async"${rest}>`;
  });
}

// Plain text version, for excerpts and page descriptions.
export const richTextToPlain = (html: string) =>
  sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
