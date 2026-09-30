import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

const logo =
  "data:image/png;base64," + fs.readFileSync(path.join(process.cwd(), "public/logo.png")).toString("base64");

export function ogImage(title: string) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0b3d0b", color: "#fff", padding: 72 }}>
        <div style={{ display: "flex", alignSelf: "flex-start", background: "#fff", padding: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={408} height={140} alt="" />
        </div>
        <div style={{ fontSize: 132, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>{title}</div>
        <div style={{ display: "flex", height: 16, width: 240, background: "#b89b2e" }} />
      </div>
    ),
    ogSize,
  );
}
