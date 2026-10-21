import Script from "next/script";
import type { Stat } from "@/lib/content";
import { StatIcon } from "./StatIcon";

// The numbers band. The real numbers are in the HTML; public/js/count.js only animates them.
export function Stats({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null;
  return (
    <section aria-label="Our work in numbers" className="bg-forest-deep text-white">
      <ul className="wrap grid grid-cols-2 gap-x-4 gap-y-8 py-10 md:py-14 lg:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label} className="flex flex-col gap-2 border-l-2 border-gold pl-4 md:flex-row md:items-center md:gap-4">
            <StatIcon name={s.icon} className="h-9 w-9 shrink-0 text-gold-light md:h-12 md:w-12" />
            <div className="min-w-0">
              <p className="text-[clamp(2rem,8vw,3.25rem)] leading-none font-black tracking-tight" data-count={s.value}>
                {s.value}
              </p>
              <p className="mt-1 text-sm font-semibold text-white/85 md:text-base">{s.label}</p>
            </div>
          </li>
        ))}
      </ul>
      <Script src="/js/count.js" strategy="afterInteractive" />
    </section>
  );
}
