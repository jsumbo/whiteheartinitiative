"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      router.replace("/admin");
      router.refresh();
    } else {
      setError(data.error || "Could not sign in.");
      setBusy(false);
    }
  }

  const input = "mt-1 block w-full border-2 border-stone-300 px-3 py-3 text-lg focus:border-forest focus:outline-none";
  return (
    <form onSubmit={submit} className="grid gap-4">
      {error && (
        <p role="alert" className="bg-red-50 p-3 font-bold text-red-800">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="username" className="font-bold">Username</label>
        <input id="username" name="username" autoComplete="username" required autoFocus className={input} />
      </div>
      <div>
        <label htmlFor="password" className="font-bold">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={input} />
      </div>
      <button type="submit" disabled={busy} className="mt-2 bg-forest py-3.5 text-lg font-bold text-white hover:bg-olive disabled:opacity-60">
        {busy ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
