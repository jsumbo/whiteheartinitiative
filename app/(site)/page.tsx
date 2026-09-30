import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { PhotoBanner } from "@/components/PhotoBanner";
import { getAbout, getHome, getPhotos, getPrograms, getProgramsPage, paragraphs, topicId } from "@/lib/content";

export default async function HomePage() {
  const [home, about, programs, programsPage, allPhotos] = await Promise.all([
    getHome(),
    getAbout(),
    getPrograms(),
    getProgramsPage(),
    getPhotos(),
  ]);
  const programsIntro = programsPage.intro;
  const photos = allPhotos.slice(0, 6);

  return (
    <>
      <PhotoBanner image={home.heroImage} alt={home.heroImageAlt} preload className="min-h-[82vh] md:min-h-[78vh]">
        <h1 className="max-w-4xl text-[clamp(2.75rem,12vw,6.5rem)] leading-[0.95] font-black tracking-tight">
          {home.headline}
        </h1>
        <p className="tagline mt-4 text-xl text-gold-light md:text-2xl">{home.tagline}</p>
        <p className="mt-6 max-w-xl text-lg md:text-xl">{home.intro}</p>
        <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
          <ButtonLink href="/contact#help">{home.primaryButton}</ButtonLink>
          <ButtonLink href="/about" variant="outline">
            {home.secondaryButton}
            <span className="sr-only"> about us</span>
          </ButtonLink>
        </div>
      </PhotoBanner>

      <section aria-labelledby="about-title" className="wrap py-14 md:py-20">
        <h2 id="about-title" className="display text-forest">about us.</h2>
        <div className="mt-8">
          {about.heading && <p className="mb-4 text-2xl font-bold text-forest">{about.heading}</p>}
          <p className="prose-lg">{about.body}</p>
          <Link href="/about" className="mt-6 inline-block font-bold text-forest underline decoration-gold decoration-2 underline-offset-4">
            More about us
          </Link>
        </div>
      </section>

      <section aria-labelledby="vision-title" className="bg-gold text-ink">
        <div className="wrap py-14 md:py-20">
          <h2 id="vision-title" className="display-sm">vision</h2>
          <p className="mt-6 max-w-3xl text-[clamp(1.5rem,5vw,2.5rem)] leading-tight font-bold">{about.vision}</p>
        </div>
      </section>

      <section aria-labelledby="programs-title" className="bg-paper">
        <div className="wrap py-14 md:py-20">
          <h2 id="programs-title" className="display text-forest">what we do.</h2>
          <p className="prose-lg mt-6">{programsIntro}</p>
          <ul className="mt-10 grid gap-6 md:grid-cols-3 lg:gap-8">
            {programs.map((p) => (
              <li key={p.id} className="flex min-w-0 flex-col border-t-4 border-gold bg-white">
                <div className="relative aspect-[4/3] w-full bg-olive">
                  <Image src={p.image} alt={p.imageAlt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col p-5 lg:p-6">
                  <h3 className="text-[clamp(1.75rem,9vw,2.25rem)] leading-none font-black tracking-tight break-words text-forest lowercase md:text-2xl lg:text-4xl">{p.title}</h3>
                  <p className="mt-3 flex-1">{paragraphs(p.description)[0]}</p>
                  <Link href={`/programs#${p.slug}`} className="mt-4 self-start font-bold text-forest underline decoration-gold decoration-2 underline-offset-4">
                    More<span className="sr-only"> about {p.title}</span>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {photos.length > 0 && (
        <section aria-labelledby="gallery-title" className="wrap py-14 md:py-20">
          <h2 id="gallery-title" className="display text-forest">gallery.</h2>
          <ul className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
            {photos.map((photo, i) => (
              <li key={photo.id} className={i === 0 ? "col-span-2 md:row-span-2" : i === 5 ? "hidden md:block" : ""}>
                <div className={`relative w-full bg-olive ${i === 0 ? "aspect-[4/3] md:aspect-auto md:h-full md:min-h-[26rem]" : "aspect-square"}`}>
                  <Image
                    src={photo.image}
                    alt={photo.alt}
                    fill
                    sizes={i === 0 ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 50vw"}
                    className="object-cover"
                  />
                </div>
              </li>
            ))}
          </ul>
          <Link href="/gallery" className="mt-8 inline-block font-bold text-forest underline decoration-gold decoration-2 underline-offset-4">
            See all photos
          </Link>
        </section>
      )}

      <PhotoBanner image={home.ctaImage} alt={home.ctaImageAlt} className="min-h-[60vh]">
        <h2 className="display">{home.ctaTitle}</h2>
        <p className="mt-6 max-w-2xl text-lg md:text-xl">{home.ctaText}</p>
        <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
          <ButtonLink href={`/contact#${topicId(home.ctaVolunteerButton)}`}>{home.ctaVolunteerButton}</ButtonLink>
          <ButtonLink href={`/contact#${topicId(home.ctaDonateButton)}`} variant="outline">{home.ctaDonateButton}</ButtonLink>
        </div>
      </PhotoBanner>
    </>
  );
}
