import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { isSignedIn } from "@/lib/admin/auth";
import logo from "@/public/logo.png";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await isSignedIn()) redirect("/admin");
  return (
    <main className="flex min-h-screen items-center justify-center bg-forest p-4">
      <div className="w-full max-w-sm border-t-8 border-gold bg-white p-6 sm:p-8">
        <Image src={logo} alt="White Heart Initiative" className="mb-6 h-16 w-auto" preload sizes="190px" />
        <h1 className="text-2xl font-black text-forest">Admin</h1>
        <p className="mb-6 text-stone-600">Sign in to edit the website.</p>
        <LoginForm />
      </div>
    </main>
  );
}
