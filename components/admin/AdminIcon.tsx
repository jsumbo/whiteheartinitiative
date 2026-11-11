// Line icons for the admin menu and top bar. Decorative: the text next to each icon says what it is.

const paths = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </>
  ),
  news: (
    <>
      <path d="M4 4h13v15a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2V4Z" />
      <path d="M17 8h3v11a2 2 0 0 1-2 2M8 8h5M8 12h5M8 16h3" />
    </>
  ),
  pages: (
    <>
      <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5Z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </>
  ),
  projects: (
    <>
      <path d="M12 3 2 8l10 5 10-5-10-5Z" />
      <path d="m2 13 10 5 10-5M2 18l10 5 10-5" />
    </>
  ),
  programs: (
    <>
      <path d="M12 21s-7-4.4-9-9.2C1.6 8.3 3.7 5 7 5c2 0 3.5 1.2 5 3 1.5-1.8 3-3 5-3 3.3 0 5.4 3.3 4 6.8-2 4.8-9 9.2-9 9.2Z" />
    </>
  ),
  team: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16.5 14.6c2.6.2 4.4 1.9 5 4.9" />
    </>
  ),
  gallery: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="1" />
      <circle cx="9" cy="10" r="2" />
      <path d="m3 18 5-5 4 4 3-3 6 6" />
    </>
  ),
  links: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2" />
    </>
  ),
  messages: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  settings: (
    <>
      <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="18" cy="18" r="2" />
    </>
  ),
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  signout: <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 16l-4-4 4-4M6 12h10" />,
} as const;

export type IconName = keyof typeof paths;

export function AdminIcon({ name, className = "size-5" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 ${className}`}
    >
      {paths[name]}
    </svg>
  );
}
