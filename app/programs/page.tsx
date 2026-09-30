import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/ButtonLink";
import { getPrograms, getProgramsPage, paragraphs } from "@/lib/content";

export const metadata: Metadata = {
  title: "Programs",
  description: getProgramsPage().intro,
};

export default function ProgramsPage() {
  const programs = getPrograms();
  const { intro } = getProgramsPage();
  return (
    <>
      <div className="bg-forest text-white">
        <div className="wrap py-14 md:py-20">
          <h1 className="display">programs.</h1>
          <p className="prose-lg mt-6">{intro}</p>
        </div>
      </div>

      <div className="bg-paper">
        <ul className="wrap grid gap-6 py-14 md:grid-cols-3 md:py-20 lg:gap-8">
          {programs.map((p, i) => (
            <li key={p.slug} id={p.slug} className="flex min-w-0 scroll-mt-4 flex-col border-t-4 border-gold bg-white">
              <div className="relative aspect-[4/3] w-full bg-olive">
                <Image src={p.image} alt={p.imageAlt} fill sizes="(min-width: 768px) 33vw, 100vw" preload={i === 0} className="object-cover" />
              </div>
              <div className="p-5 lg:p-7">
                <h2 className="text-[clamp(1.75rem,10vw,2.5rem)] leading-none font-black tracking-tight break-words text-forest lowercase md:text-3xl lg:text-5xl">{p.title}</h2>
                {paragraphs(p.description).map((text, j) => (
                  <p key={j} className="mt-4 text-lg leading-relaxed">{text}</p>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-gold">
        <div className="wrap flex flex-wrap items-center justify-between gap-4 py-10">
          <p className="text-2xl font-black text-ink">Want to help with a program?</p>
          <ButtonLink href="/contact#help" variant="green">Get Involved</ButtonLink>
        </div>
      </div>
    </>
  );
}
