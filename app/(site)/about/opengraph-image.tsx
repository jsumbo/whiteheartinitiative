import { ogImage } from "@/lib/og";

export const alt = "White Heart Initiative: about us.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return ogImage("about us.");
}
