import { ButtonLink } from "@/components/ButtonLink";

export default function NotFound() {
  return (
    <div className="wrap py-20">
      <h1 className="display text-forest">not found.</h1>
      <p className="prose-lg mt-6">This page does not exist or has moved.</p>
      <div className="mt-8">
        <ButtonLink href="/" variant="green">Go to the home page</ButtonLink>
      </div>
    </div>
  );
}
