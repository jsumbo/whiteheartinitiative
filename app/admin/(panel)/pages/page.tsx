import type { Metadata } from "next";
import Link from "next/link";
import { pagePath } from "@/lib/admin/menu";
import { docs } from "@/lib/admin/schema";

export const metadata: Metadata = { title: "Pages" };

// Every page of the website with its own editable text. Lists (projects, team, photos...) have their own menu items.
export default function PagesIndex() {
  const pages = docs.filter((d) => d.key !== "settings");

  return (
    <>
      <h1 className="text-3xl font-black text-forest">Pages</h1>
      <p className="mt-1 mb-6 text-stone-700">
        The text on each page of the website. Projects, team members, photos and news have their own sections in the menu.
      </p>

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="hidden border-b border-stone-200 bg-stone-50 text-sm text-stone-600 md:table-header-group">
            <tr>
              <th scope="col" className="px-5 py-3 font-bold">Page</th>
              <th scope="col" className="px-5 py-3 font-bold">What you can change</th>
              <th scope="col" className="px-5 py-3 font-bold">Address</th>
              <th scope="col" className="px-5 py-3 font-bold"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {pages.map((d) => (
              <tr key={d.key} className="block p-5 md:table-row md:p-0">
                <th scope="row" className="block font-semibold md:table-cell md:px-5 md:py-4">
                  <Link href={`/admin/pages/${d.key}`} className="text-lg font-black text-forest hover:underline md:text-base">
                    {d.label.replace(/ page$/, "")}
                  </Link>
                </th>
                <td className="mt-1 block text-sm text-stone-700 md:table-cell md:px-5 md:py-4">{d.description}</td>
                <td className="mt-1 block font-mono text-sm text-stone-600 md:table-cell md:px-5 md:py-4">{pagePath(d.key)}</td>
                <td className="mt-3 block md:table-cell md:px-5 md:py-4 md:text-right">
                  <span className="inline-flex gap-4 text-sm font-bold whitespace-nowrap">
                    <Link href={`/admin/pages/${d.key}`} className="text-forest underline underline-offset-4">
                      Edit<span className="sr-only"> {d.label}</span>
                    </Link>
                    <a href={pagePath(d.key)} target="_blank" rel="noopener" className="text-stone-600 underline underline-offset-4 hover:text-forest">
                      View<span className="sr-only"> {d.label} (opens in a new tab)</span>
                    </a>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-stone-600">
        Your email, phone and social media links are under{" "}
        <Link href="/admin/pages/settings" className="font-bold text-forest underline underline-offset-4">Settings</Link>.
      </p>
    </>
  );
}
