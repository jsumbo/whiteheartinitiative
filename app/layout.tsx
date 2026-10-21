import type { Metadata, Viewport } from "next";
import { Archivo, Lora } from "next/font/google";
import { ogImage, openGraph, siteName, siteUrl } from "@/lib/site";
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
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: `${siteName} | leading the future`,
    template: `%s | ${siteName}`,
  },
  description:
    "A mentorship platform helping children discover, develop and nurture their individual uniqueness and passions.",
  openGraph,
  twitter: { card: "summary_large_image", images: [ogImage] },
};

export const viewport: Viewport = { themeColor: "#0b3d0b" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${lora.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
