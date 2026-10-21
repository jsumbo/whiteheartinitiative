import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { getSupport, topicId } from "@/lib/content";
import { pageMetadata } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/support", "Support us", (await getSupport()).intro);
}

export default async function SupportPage() {
  const s = await getSupport();

  return (
    <>
      <div className="bg-forest text-white">
        <div className="wrap py-14 md:py-20">
          <h1 className="display">support us.</h1>
          <p className="prose-lg mt-6">{s.intro}</p>
        </div>
      </div>

      <section id="volunteer" aria-labelledby="volunteer-title" className="scroll-mt-4 bg-gold text-ink">
        <div className="wrap flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between md:py-16">
          <div>
            <h2 id="volunteer-title" className="display-sm">volunteer.</h2>
            <p className="prose-lg mt-4">{s.volunteerIntro}</p>
          </div>
          {/* Opens the external sign-up form once its link is set in the admin; until then, the contact form. */}
          <a
            href={s.volunteerUrl || `/about#${topicId("Volunteer")}`}
            {...(s.volunteerUrl ? { target: "_blank", rel: "noopener" } : {})}
            className="block shrink-0 bg-forest px-6 py-4 text-center text-lg font-bold text-white hover:bg-olive sm:inline-block"
          >
            {s.volunteerButton || "Sign up to volunteer"}
            {s.volunteerUrl && <span className="sr-only"> (opens in a new tab)</span>}
          </a>
        </div>
      </section>

      {s.needs.length > 0 && (
        <section aria-labelledby="needs-title" className="wrap py-14 md:py-20">
          <h2 id="needs-title" className="display-sm text-forest">what we need.</h2>
          {s.needsIntro && <p className="prose-lg mt-4">{s.needsIntro}</p>}
          <div className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {s.needs.map((g) => (
              <section key={g.title} aria-label={g.title} className="border-t-4 border-forest pt-3">
                <h3 className="text-xl font-black text-forest">{g.title}</h3>
                {g.text && <p className="mt-2">{g.text}</p>}
                {g.items && g.items.length > 0 && <p className="mt-2">{g.items.join(", ")}</p>}
              </section>
            ))}
          </div>
        </section>
      )}

      <section id="partner" aria-labelledby="partner-title" className="scroll-mt-4 bg-paper">
        <div className="wrap py-14 md:py-20">
          <h2 id="partner-title" className="display-sm text-forest">partner with us.</h2>
          {s.partnerIntro && <p className="prose-lg mt-4">{s.partnerIntro}</p>}
          {s.partnerOptions.length > 0 && (
            <dl className="mt-8 grid gap-x-10 gap-y-5 sm:grid-cols-2">
              {s.partnerOptions.map((o) => (
                <div key={o.title} className="border-l-4 border-gold pl-4">
                  <dt className="text-lg font-black text-forest">{o.title}</dt>
                  {o.text && <dd className="mt-1">{o.text}</dd>}
                </div>
              ))}
            </dl>
          )}
          <div className="mt-10">
            <ButtonLink href={`/about#${topicId("Partner With Us")}`} variant="green">Talk to us about partnering</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
