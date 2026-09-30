# Build Prompt: White Heart Initiative Website

Build a website for White Heart Initiative, a children's mentorship organization. All the copy, brand colors and logo notes are in the attached file `content.md`. Use that copy as written. Don't add new marketing text beyond short, plain labels and page intros. Use nextjs 16, app router and API routes

## What I want

A simple, fast site with five pages and a CMS at `/admin` so the team can update text, programs and photos without touching code. The people editing it are not technical, so the admin has to be easy.

## Stack

- **Nextjs 16** 

## Pages

**Home.** Hero with the name, tagline ("leading the future") and one intro line. Then a short About blurb linking to the About page, the vision line, a preview of the three programs, four to six recent gallery photos, and a closing call to volunteer or donate.

**About.** The About text, then Vision, Mission, goal and team.

**Programs.** The three focus areas (Education, Empowerment, Health), each with its photo and the points listed under it. Each program is its own CMS entry so they can add, remove or reorder programs later.

**Gallery.** A photo grid from programme activities. Each photo has a caption and an optional program tag, with a filter by program. Clicking opens a simple lightbox (write it in vanilla JS, no library). Photos must be resized and lazy-loaded, because many visitors will be on mobile data.

**Contact.** A contact form (name, email, message), the social links, and a "How you can help" section with the needed items (learning materials, technology, food and drinks, volunteer mentors, programme space). Leave clearly marked placeholders for email, phone and location.

Header with the logo and nav on every page. Footer with socials, the @whiteheartinitiative handle and copyright.

## CMS setup

Editors should be able to change:

- Site settings: contact email, phone, location, social links
- Home: hero text, intro line, call-to-action text
- About: about text, founder quote, vision, mission points, goal
- Programs: a collection (title, photo, short description, list of points, display order)
- Gallery: a collection (image, caption, program tag, date)
- Contact: intro text and the "How you can help" list

Use clear field labels and short hint text on each field, written for someone who has never used a CMS. Set media uploads to go into one folder.

## Design

Use the brand notes in the content file: deep forest green, mustard gold accent, white, and very large bold lowercase section titles like the brochure ("about us.", "vision", "mission"). Photos with a dark green overlay behind headings, as in the brochure. It should feel like a warm community organization in Liberia, not a tech startup.

Mobile first. It has to look right and load quickly on a cheap Android phone.

## Avoid the obvious AI look

The site must not look or read like it was generated. Specifically, do not use:

- Purple, blue or rainbow gradients, glassmorphism, glowing blobs or floating shapes
- A row of three identical cards with round icons for everything
- Emoji or sparkle icons as decoration
- Made-up statistics, counters ("500+ children reached"), testimonials or partner logos
- Fade-in-on-scroll animations on every section
- Pill-shaped badges above headings ("✨ Our Mission")
- Inter as the only font with everything in rounded boxes and soft shadows

For any text you have to write yourself (buttons, labels, page intros, form messages, alt text):

- Keep it short and plain. "Send message", not "Let's start the conversation".
- Don't use words like empower, transform, journey, unlock, elevate, foster, vibrant, thriving, seamless, holistic or impactful.
- No em dashes.
- No filler like "Together, we can build a brighter future."
- Write alt text that describes what's actually in the photo.

## Other requirements

- Semantic HTML, proper headings, keyboard navigation, good color contrast
- Page titles, meta descriptions and Open Graph images for each page
- A favicon from the heart mark
- Lighthouse scores of 90+ on mobile