import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { AdminNav } from "@/components/admin/AdminNav";
import { isSignedIn } from "@/lib/admin/auth";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  if (!(await isSignedIn())) redirect("/admin/login");

  return (
    <div className="lg:flex">
      <a href="#admin-main" className="skip-link">Skip to content</a>
      <header className="bg-forest text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col">
        <div className="flex items-center justify-between gap-3 px-4 py-3 lg:block lg:py-5">
          <Link href="/admin" className="block text-lg font-black">
            White Heart <span className="font-normal text-gold-light">Admin</span>
          </Link>
          <div className="flex items-center gap-4 lg:mt-3">
            <a href="/" target="_blank" rel="noopener" className="text-sm font-bold underline underline-offset-4">
              View site
            </a>
            <SignOutButton />
          </div>
        </div>
        <AdminNav />
      </header>
      <main id="admin-main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
