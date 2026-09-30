import type { Metadata } from "next";
import { SocialLinks } from "@/components/SocialLinks";
import { getContact, getSettings, isPlaceholder, topicId } from "@/lib/content";
import { ContactForm } from "./ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  const [contact, settings] = await Promise.all([getContact(), getSettings()]);
  return { title: "Contact", description: `${contact.intro} ${settings.handle}` };
}

function Detail({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <dt className="text-sm font-bold tracking-[0.15em] text-olive uppercase">{label}</dt>
      <dd className="mt-1 text-lg">
        {isPlaceholder(value) ? (
          <span className="placeholder">[PLACEHOLDER: add {label.toLowerCase()} in the site editor]</span>
        ) : href ? (
          <a href={href} className="underline decoration-gold decoration-2 underline-offset-4">{value}</a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

export default async function ContactPage() {
  const [contact, settings] = await Promise.all([getContact(), getSettings()]);
  const topics = contact.helpButtons.map((label) => ({ id: topicId(label), label }));

  return (
    <>
      <div className="bg-forest text-white">
        <div className="wrap py-14 md:py-20">
          <h1 className="display">{contact.heading.toLowerCase().replace(/[.!]?$/, ".")}</h1>
          <p className="prose-lg mt-6">
            {contact.intro} <strong>{settings.handle}</strong>
          </p>
        </div>
      </div>

      <section aria-labelledby="details-title" className="wrap grid gap-12 py-14 md:grid-cols-[1fr_1.3fr] md:py-20">
        <div>
          <h2 id="details-title" className="text-3xl font-black text-forest">Contact details</h2>
          <dl className="mt-6 grid gap-5">
            <Detail label="Email" value={settings.email} href={`mailto:${settings.email}`} />
            <Detail label="Phone / WhatsApp" value={settings.phone} href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`} />
            <Detail label="Location" value={settings.location} />
          </dl>
          <h3 className="mt-10 text-sm font-bold tracking-[0.15em] text-olive uppercase">Social media</h3>
          <SocialLinks className="mt-2 text-lg" />
        </div>

        <div id="contact-form" className="scroll-mt-4">
          <h2 className="text-3xl font-black text-forest">Send us a message</h2>
          <ContactForm topics={topics} />
        </div>
      </section>

      <section id="help" aria-labelledby="help-title" className="scroll-mt-4 bg-paper">
        <div className="wrap py-14 md:py-20">
          <h2 id="help-title" className="display text-forest">how you can help.</h2>
          <p className="prose-lg mt-6">{contact.helpIntro}</p>
          <div className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {contact.helpGroups.map((g) => (
              <section key={g.title} aria-label={g.title} className="border-t-4 border-forest pt-4">
                <h3 className="text-2xl font-black text-forest">{g.title}</h3>
                {g.text && <p className="mt-2 text-lg">{g.text}</p>}
                {g.items && g.items.length > 0 && (
                  <ul className="mt-3 list-disc pl-5 text-lg marker:text-gold">
                    {g.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                )}
              </section>
            ))}
          </div>
          <div className="mt-12 grid gap-3 sm:flex sm:flex-wrap">
            {topics.map((t) => (
              <a key={t.id} href={`#${t.id}`} className="block bg-forest px-5 py-3 text-center font-bold text-white hover:bg-olive sm:inline-block">
                {t.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
