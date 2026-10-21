import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BulkPhotos } from "@/components/admin/BulkPhotos";
import { loadRefs } from "@/lib/admin/refs";

export const metadata: Metadata = { title: "Upload photos" };

export default async function UploadPhotos(props: PageProps<"/admin/[collection]/upload">) {
  if ((await props.params).collection !== "gallery") notFound();
  const { projects = [] } = await loadRefs([{ type: "ref", name: "project", label: "Project", collection: "projects", emptyLabel: "No project" }]);

  return (
    <>
      <Link href="/admin/gallery" className="text-sm font-bold text-forest underline underline-offset-4">← Gallery photos</Link>
      <h1 className="mt-3 text-3xl font-black text-forest">Upload many photos</h1>
      <p className="mt-1 mb-6 text-stone-700">Pick several photos at once. Set the date and project once, then describe each photo for people who use screen readers.</p>
      <BulkPhotos projects={projects} />
    </>
  );
}
