import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { isSignedIn } from "@/lib/admin/auth";
import { store } from "@/lib/store";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  if (!(await isSignedIn())) redirect("/admin/login");
  // For the count next to Messages. A storage hiccup shouldn't take the whole admin down.
  const messageCount = await store.listItems("messages").then((m) => m.length, () => 0);

  return (
    <>
      <a href="#admin-main" className="skip-link">Skip to content</a>
      <AdminNav messageCount={messageCount} />
      <main id="admin-main" className="min-w-0 px-4 py-6 sm:px-6 lg:ml-64 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </>
  );
}
