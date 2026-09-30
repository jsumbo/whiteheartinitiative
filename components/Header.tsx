import Link from "next/link";
import { Logo } from "./Logo";
import { MainNav } from "./MainNav";

export function Header() {
  return (
    <header className="relative z-30 border-b-4 border-forest bg-white">
      <div className="wrap flex items-center justify-between gap-4 py-2">
        <Link href="/" className="block shrink-0 py-1">
          <Logo />
        </Link>
        <MainNav />
      </div>
    </header>
  );
}
