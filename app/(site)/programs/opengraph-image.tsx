import { ogImage } from "@/lib/og";

export const alt = "White Heart Initiative: programs.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return ogImage("programs.");
}
