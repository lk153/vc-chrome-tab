/**
 * Turns 2560×1600 Retina captures into Web-Store-ready 1280×800 PNGs, with
 * zero dependencies (only Node's zlib). For each input it:
 *   1) decodes the PNG (8-bit RGBA, non-interlaced),
 *   2) flattens transparency onto the page's own background colour — captures
 *      taller than the page leave a transparent strip that viewers (and the
 *      Web Store) render as white; flattening fills it to match the theme,
 *   3) downscales 2× with a box filter to exactly 1280×800.
 *
 * Usage: node process-screenshots.mjs <out-dir> <in1.png> [in2.png ...]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { inflateSync, deflateSync } from "node:zlib";

function main() {
  const [outDir, ...inputs] = process.argv.slice(2);
  if (!outDir || inputs.length === 0) {
    console.error("Usage: node process-screenshots.mjs <out-dir> <in.png> ...");
    process.exit(1);
  }
  for (const input of inputs) {
    const img = decodePng(readFileSync(input));
    const { px, bg } = flatten(img);
    const final = downscale2x({ width: img.width, height: img.height, px });
    const name = basename(input).replace(/\.png$/i, "") + "-1280x800.png";
    writeFileSync(join(outDir, name), encodePng(final));
    console.log(
      `${basename(input)} ${img.width}x${img.height} -> ${final.width}x${final.height}  bg=rgb(${bg.join(",")})  (${name})`,
    );
  }
}

// --- PNG decode ----------------------------------------------------------

function decodePng(buf) {
  let pos = 8; // skip signature
  let width = 0, height = 0, bitDepth = 0, colorType = 0, interlace = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    pos += 12 + len;
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
  }
  if (bitDepth !== 8 || colorType !== 6 || interlace !== 0) {
    throw new Error(`Unsupported PNG (bitDepth=${bitDepth} colorType=${colorType} interlace=${interlace})`);
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  const px = Buffer.alloc(width * height * 4);
  const prev = Buffer.alloc(stride);
  let rp = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[rp++];
    const row = px.subarray(y * stride, y * stride + stride);
    raw.copy(row, 0, rp, rp + stride);
    rp += stride;
    unfilter(filter, row, prev, 4);
    row.copy(prev);
  }
  return { width, height, px };
}

function unfilter(filter, row, prev, bpp) {
  for (let i = 0; i < row.length; i++) {
    const a = i >= bpp ? row[i - bpp] : 0;
    const b = prev[i];
    const c = i >= bpp ? prev[i - bpp] : 0;
    let v = row[i];
    if (filter === 1) v += a;
    else if (filter === 2) v += b;
    else if (filter === 3) v += (a + b) >> 1;
    else if (filter === 4) v += paeth(a, b, c);
    row[i] = v & 0xff;
  }
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

// --- transforms ----------------------------------------------------------

/**
 * Composite every pixel over an opaque background, removing transparency. The
 * background colour is sampled from the centre of the lowest opaque row — i.e.
 * the page's own canvas colour — so a transparent capture strip fills to match.
 */
function flatten({ width, height, px }) {
  const bg = detectBackground({ width, height, px });
  for (let p = 0; p < width * height; p++) {
    const i = p * 4;
    const a = px[i + 3];
    if (a === 255) continue;
    const t = a / 255;
    px[i] = Math.round(px[i] * t + bg[0] * (1 - t));
    px[i + 1] = Math.round(px[i + 1] * t + bg[1] * (1 - t));
    px[i + 2] = Math.round(px[i + 2] * t + bg[2] * (1 - t));
    px[i + 3] = 255;
  }
  return { px, bg };
}

function detectBackground({ width, height, px }) {
  const mid = width >> 1;
  for (let y = height - 1; y >= 0; y--) {
    const i = (y * width + mid) * 4;
    if (px[i + 3] >= 250) return [px[i], px[i + 1], px[i + 2]];
  }
  return [255, 255, 255];
}

/** 2× box-filter downscale (averages each 2×2 block). */
function downscale2x({ width, height, px }) {
  const ow = width >> 1;
  const oh = height >> 1;
  const out = Buffer.alloc(ow * oh * 4);
  for (let y = 0; y < oh; y++) {
    for (let x = 0; x < ow; x++) {
      const di = (y * ow + x) * 4;
      const sx = x * 2;
      const sy = y * 2;
      for (let c = 0; c < 4; c++) {
        const p00 = px[(sy * width + sx) * 4 + c];
        const p10 = px[(sy * width + sx + 1) * 4 + c];
        const p01 = px[((sy + 1) * width + sx) * 4 + c];
        const p11 = px[((sy + 1) * width + sx + 1) * 4 + c];
        out[di + c] = (p00 + p10 + p01 + p11 + 2) >> 2;
      }
    }
  }
  return { width: ow, height: oh, px: out };
}

// --- PNG encode (shared with apps/extension/scripts/gen-icons.mjs) --------

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng({ width, height, px }) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    px.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

main();
