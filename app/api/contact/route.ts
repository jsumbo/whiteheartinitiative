import { NextResponse } from "next/server";
import { field, rateLimited, saveSubmission, sendEmail, validEmail } from "@/lib/forms";

// Contact form on the About page. Saved to the admin inbox and emailed if email is set up.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  // Spam trap filled in: pretend it worked.
  if (field(body.website, 200)) return NextResponse.json({ ok: true });

  const name = field(body.name, 100);
  const email = field(body.email, 200);
  const message = field(body.message, 5000);

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Please fill in your name, email and message." }, { status: 400 });
  }
  if (!validEmail(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (rateLimited(request)) return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });

  const [saved, emailed] = await Promise.all([
    saveSubmission("messages", { name, email, message }),
    sendEmail(`Website message from ${name}`, `Name: ${name}\nEmail: ${email}\n\n${message}`, email),
  ]);

  if (!saved && !emailed) {
    return NextResponse.json({ error: "The message could not be sent. Please reach us on social media." }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
