// The picture the folded belt and the boxes are wrapped in: the belt's own strips (judogiStrap.ts) at the top, and below them one region for each kind of surface
// the boxes have (beltBox.ts lays them out): pale kiri wood with its grain and the lid's engraving, the silver cardboard with its sparkle and white label strip and a
// neutral round red seal, plain white board, and the shop's paper band. Original drawing; no maker's mark: the seal is a generic round stamp and the band carries the
// package's own S.

import type { BeltPaint, Face } from "./judogiCloth.ts";
import { esc } from "./colour.ts";
import { strapFace } from "./judogiStrap.ts";
import { regionsOf, type KiriWood, type Rect, type SolidDesc } from "./beltBox.ts";
import { n2 } from "./path.ts";

/** How the boxes and the band look: the wood's tone, the words on the lid, and the size the band shows. */
export interface BoxLook {
  wood: KiriWood;
  text: string;
  sizeLabel: string;
}

/** The wood's colours: the ground, its grain lines and the engraving's burn (gold-brown, as on the photographed box). */
const WOODS: Record<KiriWood, { ground: string; grain: string; deep: string }> = {
  light: { ground: "#f2e2c4", grain: "#e2c999", deep: "#d1b07c" },
  natural: { ground: "#ecd3a8", grain: "#dcbb88", deep: "#c99d63" },
  honey: { ground: "#e0b983", grain: "#cb9d68", deep: "#b3834d" },
};
const BURN = { fill: "#b8782c", edge: "#7a4716", lip: "#f3dcae" };

/** The font the lid's words are set in: a brush-like Japanese face where the system has one. */
const BRUSH = "'Klee One','Yu Kyokasho','Kaisei Decol','HGSKyokashotai','Hiragino Mincho ProN','Yu Mincho','Noto Serif JP','Noto Serif CJK JP',serif";

/** A small deterministic random sequence (mulberry32): the grain is the same every time. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Where the lid's words go on the lid's top, in the top's own units (x along the lid from its top end, y across): the characters stacked down the lid, each upright
 * toward the lid's top end, the block centred across the width and a little above the middle of the length. Pure: the same numbers the test checks.
 */
export function lidTextLayout(length: number, width: number, text: string, near = 0.4): { size: number; y: number; chars: { c: string; x: number }[] } {
  // `x` is measured on the picture from its left edge; the lid's top end is its right edge (the far end when it lies at its base angle), so the words read from there.
  const chars = [...text.trim()].slice(0, 6);
  const n = Math.max(1, chars.length);
  const pitch = 1.18;
  const size = Math.max(1, Math.min(width * 0.46, (length * 0.62) / (n * pitch)));
  const block = n * size * pitch;
  const start = Math.max(0, Math.min(length - block, length * near - block / 2));
  return { size, y: width / 2, chars: chars.map((c, i) => ({ c, x: length - (start + size * pitch * (i + 0.5)) })) };
}

const group = (r: Rect, body: string, id?: string): string => `<g${id === undefined ? "" : ` id="${id}"`}><svg x="${n2(r.x)}" y="${n2(r.y)}" width="${n2(r.w)}" height="${n2(r.h)}" viewBox="0 0 ${n2(r.w)} ${n2(r.h)}" overflow="hidden">${body}</svg></g>`;

/** Wood in a region `w` by `h` units: the ground, long wavy grain lines and the odd darker streak. */
function wood(w: number, h: number, tone: KiriWood, seed: number, darker = 0, lift = 0): string {
  const c = WOODS[tone];
  const rand = rng(seed);
  let s = `<rect width="${n2(w)}" height="${n2(h)}" fill="${c.ground}"/>`;
  if (darker > 0) s += `<rect width="${n2(w)}" height="${n2(h)}" fill="#6a4318" fill-opacity="${darker}"/>`;
  const lines = Math.max(5, Math.round(h * 0.9));
  for (let i = 0; i < lines; i++) {
    const y = ((i + rand() * 0.8) / lines) * h;
    const a = (rand() - 0.5) * 0.9;
    const bold = rand() < 0.12;
    s += `<path d="M0 ${n2(y)}C${n2(w * 0.3)} ${n2(y + a)} ${n2(w * 0.65)} ${n2(y - a)} ${n2(w)} ${n2(y + a * 0.4)}" fill="none" stroke="${bold ? c.deep : c.grain}" stroke-opacity="${n2(bold ? 0.3 : 0.2 + rand() * 0.25)}" stroke-width="${n2(bold ? 0.26 : 0.12 + rand() * 0.1)}"/>`;
  }
  for (let i = 0; i < 5; i++) {
    const y = rand() * h;
    const x = rand() * w * 0.8;
    s += `<path d="M${n2(x)} ${n2(y)}h${n2(w * (0.08 + rand() * 0.14))}" stroke="${c.deep}" stroke-opacity="0.1" stroke-width="${n2(0.4 + rand() * 0.5)}" stroke-linecap="round"/>`;
  }
  // The sides stand turned from the light and darken more than a top does: they are painted a little paler to read as the same wood.
  if (lift > 0) s += `<rect width="${n2(w)}" height="${n2(h)}" fill="#fff" fill-opacity="${lift}"/>`;
  return s;
}

/** End grain: the ring pattern, off-centre, on wood. */
function endGrain(w: number, h: number, tone: KiriWood): string {
  const c = WOODS[tone];
  let s = `<rect width="${n2(w)}" height="${n2(h)}" fill="${c.ground}"/><rect width="${n2(w)}" height="${n2(h)}" fill="#fff" fill-opacity="0.12"/>`;
  const cx = w * 0.7;
  const cy = h * 1.3;
  for (let r = 3; r < w * 2; r += 2.2) s += `<ellipse cx="${n2(cx)}" cy="${n2(cy)}" rx="${n2(r * 1.6)}" ry="${n2(r)}" fill="none" stroke="${c.deep}" stroke-opacity="${n2(0.14 + (r % 4.4) / 20)}" stroke-width="0.22"/>`;
  return s;
}

/** The engraving: the characters down the lid, a shallow cut with a gold-brown burn, a pale lip on the lit side and a dark edge. */
function engraving(length: number, width: number, text: string): string {
  const lay = lidTextLayout(length, width, text);
  let s = "";
  for (const ch of lay.chars) {
    const at = (dx: number, dy: number): string => `transform="translate(${n2(ch.x + dx)} ${n2(lay.y + dy)}) rotate(90)" font-size="${n2(lay.size)}" text-anchor="middle" dominant-baseline="central" font-family="${BRUSH}" font-weight="400"`;
    s += `<text ${at(0.18, -0.18)} fill="${BURN.lip}" fill-opacity="0.55" stroke="${BURN.lip}" stroke-opacity="0.5" stroke-width="0.35">${esc(ch.c)}</text>`;
    s += `<text ${at(-0.12, 0.15)} fill="${BURN.edge}" fill-opacity="0.75" stroke="${BURN.edge}" stroke-opacity="0.6" stroke-width="0.3">${esc(ch.c)}</text>`;
    s += `<text ${at(0, 0)} fill="${BURN.fill}" stroke="${BURN.fill}" stroke-width="0.18">${esc(ch.c)}</text>`;
  }
  return s;
}

/** Silver cardboard in a region: aluminium paper with a fine sparkle and a faint embossed pattern of small scallops. */
function silver(w: number, h: number, id: string): string {
  const rand = rng(7);
  let s = `<defs><pattern id="${id}" width="3.2" height="2.4" patternUnits="userSpaceOnUse"><path d="M0 2.4Q0.8 0.4 1.6 1.4Q2.4 0.4 3.2 2.4" fill="none" stroke="#9aa0a8" stroke-opacity="0.22" stroke-width="0.22"/></pattern>` +
    `<linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset="0.5" stop-color="#e2e6ea"/><stop offset="1" stop-color="#f0f2f5"/></linearGradient></defs>`;
  s += `<rect width="${n2(w)}" height="${n2(h)}" fill="url(#${id}g)"/><rect width="${n2(w)}" height="${n2(h)}" fill="url(#${id})"/>`;
  // A small tile of specks, repeated: thousands of separate rectangles are slow to draw.
  let tile = "";
  for (let i = 0; i < 26; i++) {
    const bright = rand() < 0.55;
    tile += `<rect x="${n2(rand() * 12)}" y="${n2(rand() * 12)}" width="0.22" height="0.22" fill="${bright ? "#ffffff" : "#8b9199"}" fill-opacity="${n2(bright ? 0.45 + rand() * 0.4 : 0.12 + rand() * 0.14)}"/>`;
  }
  s += `<defs><pattern id="${id}p" width="12" height="12" patternUnits="userSpaceOnUse">${tile}</pattern></defs><rect width="${n2(w)}" height="${n2(h)}" fill="url(#${id}p)"/>`;
  return s;
}

/** A neutral round red stamp: a double ring and a small flower, not any maker's mark. */
function seal(cx: number, cy: number, r: number): string {
  const red = "#c63a24";
  let s = `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(r)}" fill="#fbf3ee" stroke="${red}" stroke-width="${n2(r * 0.1)}"/><circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(r * 0.8)}" fill="none" stroke="${red}" stroke-width="${n2(r * 0.04)}"/>`;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    s += `<ellipse cx="${n2(cx + Math.cos(a) * r * 0.36)}" cy="${n2(cy + Math.sin(a) * r * 0.36)}" rx="${n2(r * 0.2)}" ry="${n2(r * 0.1)}" transform="rotate(${n2((a * 180) / Math.PI)} ${n2(cx + Math.cos(a) * r * 0.36)} ${n2(cy + Math.sin(a) * r * 0.36)})" fill="${red}" fill-opacity="0.85"/>`;
  }
  return s + `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(r * 0.12)}" fill="${red}"/>`;
}

/** The silver lid's top: the aluminium paper, a white label strip down most of its length, the seal at its top end and the words below it in black brush script. */
function silverLid(length: number, width: number, text: string, id: string): string {
  const lw = width * 0.62;
  const x0 = length * 0.07;
  const x1 = length * 0.93;
  // The lid's top end is the right edge of the picture: the seal sits there, the words below it.
  const y0 = (width - lw) / 2;
  let s = silver(length, width, id);
  s += `<rect x="${n2(x0)}" y="${n2(y0)}" width="${n2(x1 - x0)}" height="${n2(lw)}" fill="#fbfaf6" stroke="#c9ccd0" stroke-width="0.25"/>`;
  s += seal(x1 - lw * 0.52, width / 2, lw * 0.3);
  const chars = [...text.trim()].slice(0, 6);
  const size = Math.min(lw * 0.8, (x1 - x0 - lw * 1.1) / Math.max(1, chars.length) / 1.1);
  chars.forEach((c, i) => {
    const x = x1 - lw * 1.15 - size * 1.1 * (i + 0.5);
    s += `<text transform="translate(${n2(x)} ${n2(width / 2)}) rotate(90)" font-size="${n2(size)}" text-anchor="middle" dominant-baseline="central" font-family="${BRUSH}" font-weight="400" fill="#2b2b2b" stroke="#2b2b2b" stroke-width="0.22">${esc(c)}</text>`;
  });
  return s;
}

/** White board with a faint fibre. */
function board(w: number, h: number): string {
  const rand = rng(3);
  let s = `<rect width="${n2(w)}" height="${n2(h)}" fill="#f6f5f0"/>`;
  for (let i = 0; i < Math.max(4, Math.round(h)); i++) s += `<path d="M0 ${n2(rand() * h)}h${n2(w)}" stroke="#d9d7cf" stroke-opacity="0.35" stroke-width="0.12"/>`;
  return s;
}

/** The product sticker on the silver base's end: a small white label with a few lines. */
function sticker(w: number, h: number): string {
  let s = board(w, h);
  const x = w * 0.14;
  const y = h * 0.62;
  s += `<rect x="${n2(x)}" y="${n2(y)}" width="${n2(w * 0.72)}" height="${n2(h * 0.24)}" fill="#ffffff" stroke="#c4c2ba" stroke-width="0.2"/>`;
  for (let i = 0; i < 3; i++) s += `<path d="M${n2(x + 0.8)} ${n2(y + 1 + i * (h * 0.06))}h${n2(w * (0.5 - i * 0.1))}" stroke="#8d8b84" stroke-opacity="0.7" stroke-width="0.25"/>`;
  return s;
}

/** The paper band's picture: the package's own red S and the size under it (a placeholder, never a maker's mark). */
function bandPicture(w: number, h: number, size: string): string {
  const s = `<rect width="${n2(w)}" height="${n2(h)}" fill="#f8f7f2"/>`;
  return s + `<text x="${n2(w / 2)}" y="${n2(h * 0.46)}" font-size="${n2(Math.min(w, h) * 0.62)}" font-weight="900" font-style="italic" font-family="'Arial Black','Helvetica Neue',Arial,sans-serif" text-anchor="middle" dominant-baseline="central" fill="#d4222e">S</text>` +
    `<text x="${n2(w / 2)}" y="${n2(h * 0.84)}" font-size="${n2(Math.min(w, h) * 0.28)}" font-weight="700" font-family="Arial,sans-serif" text-anchor="middle" dominant-baseline="central" fill="#1d1d1f">${esc(size)}</text>`;
}

/** The whole picture: the belt's strips (when a belt is in the scene), then the regions the scene uses. `rows` is the belt's stitch-row count. */
export function solidFace(desc: SolidDesc, paint: BeltPaint | undefined, look: BoxLook, uid: string, rows?: number): Face {
  const r = regionsOf(desc);
  const belt = paint !== undefined && desc.belt !== undefined ? strapFace(paint, desc.belt.w * 2.63, rows) : undefined;
  let body = belt?.body ?? "";
  const clip = [...(belt?.clip ?? [])];
  const put = (rect: Rect, inner: string): void => {
    body += group(rect, inner);
    clip.push(`M${n2(rect.x)} ${n2(rect.y)}h${n2(rect.w)}v${n2(rect.h)}h${n2(-rect.w)}Z`);
  };
  const b = desc.box;
  if (b !== undefined) {
    if (b.type === "kiri") {
      put(r.lidTop, wood(r.lidTop.w, r.lidTop.h, look.wood, 11) + engraving(r.lidTop.w, r.lidTop.h, look.text));
      put(r.lidLong, wood(r.lidLong.w, r.lidLong.h, look.wood, 14, 0, 0.2));
      put(r.lidEnd, endGrain(r.lidEnd.w, r.lidEnd.h, look.wood));
      put(r.baseLong, wood(r.baseLong.w, r.baseLong.h, look.wood, 12, 0, 0.22));
      put(r.baseEnd, endGrain(r.baseEnd.w, r.baseEnd.h, look.wood));
      put(r.baseEnd2, endGrain(r.baseEnd2.w, r.baseEnd2.h, look.wood));
      put(r.rimLong, wood(r.rimLong.w, r.rimLong.h, look.wood, 15, 0.04));
      put(r.rimEnd, endGrain(r.rimEnd.w, r.rimEnd.h, look.wood));
      put(r.inside, wood(r.inside.w, r.inside.h, look.wood, 13, 0.07));
    } else {
      put(r.lidTop, silverLid(r.lidTop.w, r.lidTop.h, look.text, `${uid}sv`));
      put(r.lidLong, silver(r.lidLong.w, r.lidLong.h, `${uid}sl`));
      put(r.lidEnd, board(r.lidEnd.w, r.lidEnd.h));
      put(r.baseLong, board(r.baseLong.w, r.baseLong.h));
      put(r.baseEnd, sticker(r.baseEnd.w, r.baseEnd.h));
      put(r.baseEnd2, board(r.baseEnd2.w, r.baseEnd2.h));
      put(r.rimLong, board(r.rimLong.w, r.rimLong.h));
      put(r.rimEnd, board(r.rimEnd.w, r.rimEnd.h));
      put(r.inside, board(r.inside.w, r.inside.h));
    }
  }
  if (desc.belt !== undefined && desc.belt.band > 0) {
    const half = r.band.w * 0.5;
    put({ x: r.band.x, y: r.band.y, w: half, h: r.band.h }, bandPicture(half, r.band.h, look.sizeLabel));
    put({ x: r.band.x + r.band.w * 0.52, y: r.band.y, w: r.band.w * 0.4, h: r.band.h }, board(r.band.w * 0.4, r.band.h));
  }
  return { defs: belt?.defs ?? "", body, clip };
}
