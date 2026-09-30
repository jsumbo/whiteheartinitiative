import type { Metadata, Viewport } from "next";
import { Archivo, Lora } from "next/font/google";
import "./globals.css";

const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], display: "swap" });
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://whiteheart.org"),
  title: {
    default: "White Heart Initiative | leading the future",
    template: "%s | White Heart Initiative",
  },
  description:
    "A mentorship platform helping children discover, develop and nurture their individual uniqueness and passions.",
  openGraph: { siteName: "White Heart Initiative", type: "website", locale: "en" },
};

export const viewport: Viewport = { themeColor: "#0b3d0b" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${lora.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
