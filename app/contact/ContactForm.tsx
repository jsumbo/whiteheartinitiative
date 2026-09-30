"use client";

import { useEffect, useRef, useState } from "react";

type Status = { kind: "idle" | "sending" | "sent" | "error"; message?: string };

export function ContactForm({ topics }: { topics: { id: string; label: string }[] }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const messageRef = useRef<HTMLTextAreaElement>(null);

  // Buttons like "Donate Items" link to #form-donate-items. Prefill the message and move focus to the form.
  useEffect(() => {
    function applyHash() {
      const topic = topics.find((t) => `#${t.id}` === window.location.hash);
      const box = messageRef.current;
      if (!topic || !box) return;
      if (!box.value.trim()) box.value = `${topic.label}: `;
      document.getElementById("contact-form")?.scrollIntoView();
      document.getElementById("cf-name")?.focus({ preventScroll: true });
    }
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [topics]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "The message could not be sent. Please try again later.");
      form.reset();
      setStatus({ kind: "sent", message: "Thank you. Your message has been sent." });
    } catch (err) {
      setStatus({ kind: "error", message: (err as Error).message });
    }
  }

  const field = "mt-1 block w-full border-2 border-forest/40 bg-white px-3 py-3 text-lg focus:border-forest";

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-5" noValidate={false}>
      <div>
        <label htmlFor="cf-name" className="font-bold">Name</label>
        <input id="cf-name" name="name" required maxLength={100} autoComplete="name" className={field} />
      </div>
      <div>
        <label htmlFor="cf-email" className="font-bold">Email</label>
        <input id="cf-email" name="email" type="email" required maxLength={200} autoComplete="email" className={field} />
      </div>
      <div>
        <label htmlFor="cf-message" className="font-bold">Message</label>
        <textarea id="cf-message" ref={messageRef} name="message" required maxLength={5000} rows={6} className={field} />
      </div>
      {/* Spam trap: people never see or fill this field. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="cf-website">Leave this empty</label>
        <input id="cf-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div>
        <button
          type="submit"
          disabled={status.kind === "sending"}
          className="w-full bg-gold px-6 py-3 text-lg font-bold text-ink hover:bg-gold-light disabled:opacity-60 sm:w-auto"
        >
          {status.kind === "sending" ? "Sending..." : "Send message"}
        </button>
      </div>
      <p role="status" aria-live="polite" className={status.kind === "error" ? "font-bold text-red-800" : "font-bold text-forest"}>
        {status.message}
      </p>
    </form>
  );
}
