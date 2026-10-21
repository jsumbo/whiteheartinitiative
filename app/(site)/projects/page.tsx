import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/ButtonLink";
import { ProjectFeature } from "@/components/ProjectFeature";
import { getFocusAreas, getProjects, getProjectsPage, paragraphs } from "@/lib/content";
import { pageMetadata } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/projects", "Projects", (await getProjectsPage()).intro);
}

export default async function ProjectsPage() {
  const [page, projects, focusAreas] = await Promise.all([getProjectsPage(), getProjects(), getFocusAreas()]);
  return (
    <>
      <div className="bg-forest text-white">
        <div className="wrap py-14 md:py-20">
          <h1 className="display">projects.</h1>
          <p className="prose-lg mt-6">{page.intro}</p>
          {projects.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-3" aria-label="Jump to a project">
              {projects.map((p) => (
                <li key={p.id}>
                  <a href={`#${p.slug}`} className="block border-2 border-white px-4 py-2 font-bold hover:bg-white hover:text-forest">
                    {p.name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <section aria-labelledby="focus-title" className="bg-paper">
        <div className="wrap py-14 md:py-20">
          <h2 id="focus-title" className="display text-forest">three focus areas.</h2>
          {page.focusIntro && <p className="prose-lg mt-6">{page.focusIntro}</p>}
          <ul className="mt-10 grid gap-6 md:grid-cols-3 lg:gap-8">
            {focusAreas.map((f, i) => (
              <li key={f.id} id={f.slug} className="flex min-w-0 scroll-mt-4 flex-col border-t-4 border-gold bg-white">
                <div className="relative aspect-[4/3] w-full bg-olive">
                  <Image src={f.image} alt={f.imageAlt} fill sizes="(min-width: 768px) 33vw, 100vw" preload={i === 0} className="object-cover" />
                </div>
                <div className="@container p-5 lg:p-7">
                  {/* Sized to the card, not the screen, so long names like "empowerment" stay on one line. */}
                  <h3 className="text-[clamp(1.25rem,12cqi,3rem)] leading-none font-black tracking-tight text-forest lowercase">
                    {f.title}
                  </h3>
                  {paragraphs(f.description).map((text, j) => (
                    <p key={j} className="mt-4 text-lg leading-relaxed">{text}</p>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {projects.length > 0 && (
        <section aria-labelledby="projects-title">
          <div className="wrap py-14 md:py-20">
            <h2 id="projects-title" className="display text-forest">our projects.</h2>
            {page.projectsIntro && <p className="prose-lg mt-6">{page.projectsIntro}</p>}
          </div>
          {projects.map((p, i) => (
            <ProjectFeature key={p.id} project={p} flip={i % 2 === 1} />
          ))}
        </section>
      )}

      <div className="bg-gold">
        <div className="wrap flex flex-wrap items-center justify-between gap-4 py-10">
          <p className="text-2xl font-black text-ink">Want to support a project?</p>
          <ButtonLink href="/support" variant="green">Support Us</ButtonLink>
        </div>
      </div>
    </>
  );
}
