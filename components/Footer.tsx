import { getSettings } from "@/lib/content";
import { LogoLight } from "./Logo";
import { SocialLinks } from "./SocialLinks";

export async function Footer() {
  const { handle } = await getSettings();
  return (
    <footer className="bg-forest-deep text-white">
      <div className="wrap grid gap-8 py-12 md:grid-cols-[1fr_auto]">
        <div>
          <LogoLight className="h-16 w-auto md:h-20" />
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold tracking-[0.2em] text-white/70">FOLLOW US</h2>
          <SocialLinks />
          <p className="mt-3 font-bold">{handle}</p>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="wrap flex flex-wrap justify-between gap-2 py-4 text-sm text-white/75">
          <p>&copy; {new Date().getFullYear()} White Heart Initiative. All rights reserved.</p>
          <p>
            Developed and Designed by{" "}
            <a href="https://heyjay.netlify.app/" className="underline underline-offset-4 hover:text-gold-light">
              Oudeis
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
