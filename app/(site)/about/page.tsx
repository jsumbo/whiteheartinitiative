import type { Metadata } from "next";
import Image from "next/image";
import { PhotoBanner } from "@/components/PhotoBanner";
import { getAbout, getTeam } from "@/lib/content";

export const metadata: Metadata = {
  title: "About us",
  description: getAbout().body,
};

export default function AboutPage() {
  const about = getAbout();
  const team = getTeam();
  return (
    <>
      <PhotoBanner image={about.heroImage} alt={about.heroImageAlt} preload>
        <h1 className="display">about us.</h1>
      </PhotoBanner>

      <section aria-label="Who we are" className="wrap grid gap-10 py-16 md:grid-cols-2 md:py-24">
        <div>
          {about.heading && <h2 className="mb-5 text-3xl font-black text-forest md:text-4xl">{about.heading}</h2>}
          <p className="prose-lg">{about.body}</p>
        </div>
        <figure className="border-l-4 border-gold pl-6 self-start">
          <blockquote className="font-serif text-xl leading-relaxed italic text-forest md:text-2xl">
            <p>&ldquo;{about.quote}&rdquo;</p>
          </blockquote>
          <figcaption className="mt-4 font-bold">{about.quoteBy}</figcaption>
        </figure>
      </section>

      <section aria-labelledby="vision-title" className="bg-gold text-ink">
        <div className="wrap py-14 md:py-20">
          <h2 id="vision-title" className="display">vision</h2>
          <p className="mt-6 max-w-3xl text-[clamp(1.5rem,5vw,2.5rem)] leading-tight font-bold">{about.vision}</p>
        </div>
      </section>

      <section aria-labelledby="mission-title" className="bg-forest text-white">
        <div className="wrap py-14 md:py-20">
          <h2 id="mission-title" className="display">mission</h2>
          <ul className="mt-10 grid gap-8 md:grid-cols-3">
            {about.mission.map((item, i) => (
              <li key={i} className="border-t-2 border-gold pt-4">
                <p className="text-lg">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="goal-title" className="wrap py-14 md:py-20">
        <h2 id="goal-title" className="display text-forest">goal</h2>
        <p className="mt-8 max-w-3xl text-xl leading-relaxed md:text-2xl">{about.goal}</p>
      </section>

      {team.length > 0 && (
        <section aria-labelledby="team-title" className="bg-paper">
          <div className="wrap py-14 md:py-20">
            <h2 id="team-title" className="display text-forest">team</h2>
            <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:gap-x-8 lg:grid-cols-4">
              {team.map((m) => (
                <li key={m.slug}>
                  <div className="relative mb-4 aspect-[4/5] w-full overflow-hidden bg-forest">
                    {m.photo ? (
                      <Image src={m.photo} alt={m.photoAlt || m.name} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" className="object-cover" />
                    ) : (
                      <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-5xl font-black text-gold-light md:text-7xl">
                        {m.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </span>
                    )}
                  </div>
                  <p className="text-lg leading-tight font-black text-forest md:text-2xl">{m.name}</p>
                  <p className="font-semibold text-olive">{m.position}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
