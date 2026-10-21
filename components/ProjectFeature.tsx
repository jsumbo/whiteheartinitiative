import Image from "next/image";
import type { Project } from "@/lib/content";
import { paragraphs } from "@/lib/content";

// Each project gets its own look so it reads as a brand of its own.
// Freedom's Future uses the dark and gold of its sponsorship material; other projects use the site green.
export const projectTheme = (slug: string) =>
  slug === "freedoms-future"
    ? { bg: "bg-[#1b1b1b]", accent: "text-[#d4b23a]", rule: "border-[#d4b23a]", bar: "bg-[#d4b23a]" }
    : { bg: "bg-forest", accent: "text-gold-light", rule: "border-gold", bar: "bg-gold" };

const amount = (v: string) => parseFloat(v.replace(/[^\d.]/g, "")) || 0;

export function ProjectFeature({ project, flip = false, preload = false }: { project: Project; flip?: boolean; preload?: boolean }) {
  const t = projectTheme(project.slug);
  // Three or more numbers (e.g. children per year) read better as bars.
  const asBars = project.highlights.length >= 3;
  const max = Math.max(...project.highlights.map((h) => amount(h.value)), 1);

  return (
    <section id={project.slug} aria-labelledby={`${project.slug}-title`} className={`scroll-mt-4 ${t.bg} text-white`}>
      <div className="wrap grid gap-8 py-14 md:grid-cols-2 md:items-start md:gap-12 md:py-20">
        <div className={`relative aspect-[4/3] w-full overflow-hidden bg-olive ${flip ? "md:order-2" : ""}`}>
          <Image src={project.image} alt={project.imageAlt} fill sizes="(min-width: 768px) 50vw, 100vw" preload={preload} className="object-cover" />
        </div>
        <div className="@container min-w-0">
          {project.schedule && <p className={`text-sm font-bold tracking-[0.18em] uppercase ${t.accent}`}>{project.schedule}</p>}
          <h3 id={`${project.slug}-title`} className="mt-2 text-[clamp(2.25rem,13cqi,4.75rem)] leading-[0.95] font-black tracking-tight">
            {project.name}
          </h3>
          <p className={`mt-3 text-xl font-bold ${t.accent}`}>{project.tagline}</p>
          <div className={`mt-6 border-t-4 ${t.rule} pt-5`}>
            {paragraphs(project.description).map((text, i) => (
              <p key={i} className="mt-4 text-lg leading-relaxed text-white/90 first:mt-0">
                {text}
              </p>
            ))}
          </div>

          {project.highlights.length > 0 &&
            (asBars ? (
              <dl className="mt-8 grid gap-3">
                {project.highlights.map((h) => (
                  <div key={h.label} className="grid grid-cols-[minmax(0,9rem)_1fr] items-center gap-3 sm:grid-cols-[minmax(0,11rem)_1fr]">
                    <dt className="text-sm font-semibold text-white/80">{h.label}</dt>
                    <dd className="flex items-center gap-3">
                      <span className={`block h-3 ${t.bar}`} style={{ width: `${Math.max(8, (amount(h.value) / max) * 100)}%` }} aria-hidden="true" />
                      <span className="text-lg font-black whitespace-nowrap">{h.value}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
                {project.highlights.map((h) => (
                  <div key={h.label} className="flex flex-col-reverse">
                    <dt className="text-sm font-semibold text-white/80">{h.label}</dt>
                    <dd className="text-4xl font-black">{h.value}</dd>
                  </div>
                ))}
              </dl>
            ))}

          {project.next && (
            <p className="mt-8 text-lg">
              <span className="font-bold">Next:</span> {project.next}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
