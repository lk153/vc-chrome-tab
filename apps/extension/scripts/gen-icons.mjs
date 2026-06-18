/**
 * Generates the extension's PNG icons with zero dependencies, so the build is
 * self-contained. Draws a rounded indigo square with three white "list" bars
 * (a tab/collection glyph). Replace icons/* with real artwork anytime.
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(HERE, "../public/icons");

const BRAND = [79, 70, 229];
const WHITE = [255, 255, 255];

const CRC_TABLE = buildCrcTable();

function buildCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

/** Build an RGBA pixel buffer for the icon at a given size. */
function renderPixels(size) {
  const radius = size * 0.22;
  const min = size * 0.26;
  const max = size * 0.74;
  const bars = [0.32, 0.5, 0.68].map((c) => c * size);
  const barHalf = size * 0.058;

  const px = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      if (outsideRoundedRect(x, y, size, radius)) {
        px[i + 3] = 0; // transparent corner
        continue;
      }
      const onBar = x >= min && x <= max && bars.some((cy) => Math.abs(y - cy) <= barHalf);
      const [r, g, b] = onBar ? WHITE : BRAND;
      px[i] = r;
      px[i + 1] = g;
      px[i + 2] = b;
      px[i + 3] = 255;
    }
  }
  return px;
}

function outsideRoundedRect(x, y, size, r) {
  const lo = r;
  const hi = size - 1 - r;
  const cx = Math.min(Math.max(x, lo), hi);
  const cy = Math.min(Math.max(y, lo), hi);
  return Math.hypot(x - cx, y - cy) > r;
}

function encodePng(size) {
  const px = renderPixels(size);
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter type 0 (none)
    px.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync(OUT_DIR, { recursive: true });
for (const size of [16, 32, 48, 128]) {
  writeFileSync(resolve(OUT_DIR, `icon${size}.png`), encodePng(size));
}
console.log(`Generated icons in ${OUT_DIR}`);
