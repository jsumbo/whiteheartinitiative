import { getSettings, socialLabels } from "@/lib/content";

export function SocialLinks({ className = "" }: { className?: string }) {
  const { social } = getSettings();
  const entries = (Object.keys(socialLabels) as (keyof typeof socialLabels)[]).filter((k) => social[k]);
  return (
    <ul className={`flex flex-wrap gap-x-4 gap-y-2 ${className}`}>
      {entries.map((k) => (
        <li key={k}>
          <a href={social[k]} className="underline decoration-gold underline-offset-4 hover:decoration-2" rel="me noopener">
            {socialLabels[k]}
          </a>
        </li>
      ))}
    </ul>
  );
}
