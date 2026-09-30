import Image from "next/image";
import logo from "@/public/logo.png";
import logoLight from "@/public/logo-light.png";

// logo.png has a white background, for light areas like the header.
// logo-light.png is the same logo in white on a transparent background, for dark areas.
export function Logo({ className = "h-14 w-auto md:h-16" }: { className?: string }) {
  return <Image src={logo} alt="White Heart Initiative, leading the future" className={className} preload sizes="190px" />;
}

export function LogoLight({ className = "h-16 w-auto" }: { className?: string }) {
  return <Image src={logoLight} alt="White Heart Initiative, leading the future" className={className} sizes="240px" />;
}
