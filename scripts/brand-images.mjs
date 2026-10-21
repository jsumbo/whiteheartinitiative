// Regenerates the favicon, app icons and social preview image from the logo files in public/.
// Run with: node scripts/brand-images.mjs
import fs from "node:fs";
import sharp from "sharp";

const mark = "public/logo-mark.png";
const logo = "public/logo.png";
const white = { r: 255, g: 255, b: 255, alpha: 1 };
const clear = { r: 0, g: 0, b: 0, alpha: 0 };

// The heart mark centred on a square canvas.
async function icon(size, background, padding) {
  const inner = Math.round(size * (1 - padding * 2));
  const art = await sharp(mark)
    .resize(inner, inner, { fit: "contain", background: clear, kernel: "lanczos3" })
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: art }])
    .png()
    .toBuffer();
}

// An .ico file holding PNG images, which every current browser accepts.
function ico(pngs) {
  const header = Buffer.alloc(6 + pngs.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = header.length;
  pngs.forEach(({ size, data }, i) => {
    const e = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...pngs.map((p) => p.data)]);
}

const favicon = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await icon(size, clear, 0) })));
fs.writeFileSync("app/favicon.ico", ico(favicon));
fs.writeFileSync("app/icon.png", await icon(192, clear, 0.04));
// iOS fills transparency with black, so the home screen icon gets a white tile.
fs.writeFileSync("app/apple-icon.png", await icon(180, white, 0.14));

// Social preview: the full logo centred on white, 1200x630.
const og = await sharp(logo)
  .resize({ width: 920, kernel: "lanczos3" })
  .toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: white } })
  .composite([
    { input: og, gravity: "center" },
    {
      input: await sharp({ create: { width: 1200, height: 16, channels: 4, background: "#b89b2e" } }).png().toBuffer(),
      top: 614,
      left: 0,
    },
  ])
  .flatten({ background: white })
  .png({ compressionLevel: 9 })
  .toFile("public/og-image.png");
