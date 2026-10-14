// `kitMatchup`: two kits face to face, away then home, each with a name under it. `jerseyLineup`: players' shirts in rows, a formation on a field. kyogijo-stadiums places
// players on the field; this package draws the shirts, and the two can be put together the same way dougu-sports is.
import { clean, contrast, hashOf } from "./colour.ts";
import { JERSEY_HEIGHT, JERSEY_WIDTH, jerseyView, uidOf } from "./jersey.ts";
import { resolve, type JerseyOptions, type Resolved } from "./options.ts";
import type { EmblemRenderer } from "./emblems.ts";
import { n2 } from "./path.ts";
import { wrapSvg } from "./svg.ts";
import { drawRun, layout } from "./text.ts";

/** A side in a matchup: the shirt's options, and the name under it. */
export interface KitSide extends JerseyOptions {
  label?: string;
}

export interface MatchupOptions {
  away?: KitSide;
  home?: KitSide;
  /** Each side's shirt from the front, the back, or both. */
  view?: "front" | "back" | "both";
  /** The word between the two, drawn as letters (`"vs"` by default; `""` for none). */
  versus?: string;
  size?: number;
  emblems?: EmblemRenderer;
  title?: string;
}

/** True when two shirts are too alike to tell apart: their body colours read at under `limit` to 1 of each other and neither is clearly lighter. */
export function kitClash(a: JerseyOptions, b: JerseyOptions, limit = 1.6): boolean {
  const ra = resolve(a);
  const rb = resolve(b);
  return contrast(ra.body, rb.body) < limit;
}

function place(r: Resolved, uid: string, x: number, y: number, scale: number, emblems: EmblemRenderer | undefined): { defs: string; body: string } {
  const v = jerseyView(r, r.view === "back" ? "back" : "front", uid, emblems);
  return { defs: v.defs, body: `<g transform="translate(${n2(x)} ${n2(y)}) scale(${n2(scale)})">${v.body}</g>` };
}

/** A caption under a shirt: letters at `(cx, cy)`. */
function caption(text: string, cx: number, cy: number, h: number, w: number): string {
  const run = layout(text.toUpperCase(), cx, cy, { height: h, maxWidth: w, weight: "bold", tracking: 0.5 });
  return drawRun(run, "currentColor", undefined, undefined);
}

export function kitMatchup(options?: MatchupOptions): string {
  const o: MatchupOptions = options !== null && typeof options === "object" ? options : {};
  const view = o.view === "back" || o.view === "both" ? o.view : "front";
  const sides: KitSide[] = [o.away ?? { colors: ["#1f3a8a", "#f4f0e4"] }, o.home ?? { colors: ["#c8102e", "#f4f0e4"] }];
  const size = typeof o.size === "number" && Number.isFinite(o.size) ? Math.max(8, Math.min(4000, o.size)) : 360;
  const cols = view === "both" ? 2 : 1;
  const cell = JERSEY_WIDTH + 16;
  const mid = 64;
  const groupW = cols * cell;
  const W = groupW * 2 + mid;
  const H = JERSEY_HEIGHT + 44;
  let defs = "";
  let body = "";
  sides.forEach((side, s) => {
    const x0 = s * (groupW + mid);
    const views: ("front" | "back")[] = view === "both" ? ["front", "back"] : [view];
    views.forEach((v, i) => {
      const r = resolve({ ...side, view: v, language: undefined });
      const p = place(r, uidOf(r, `m${s}${i}`), x0 + i * cell + 8, 0, 1, o.emblems);
      defs += p.defs;
      body += p.body;
    });
    const label = clean(side.label, 24);
    if (label !== undefined) body += caption(label, x0 + groupW / 2, JERSEY_HEIGHT + 24, 16, groupW - 16);
  });
  const versus = o.versus === undefined ? "vs" : (clean(o.versus, 6) ?? "");
  if (versus !== "") body += caption(versus, groupW + mid / 2, JERSEY_HEIGHT / 2, 16, mid - 12);
  const names = sides.map((s) => clean(s.label, 24) ?? "").filter((n) => n !== "");
  const title = clean(o.title, 120) ?? (names.length === 2 ? `${names[0]} vs ${names[1]}` : "Kit matchup");
  return wrapSvg({ id: `sk${hashOf(JSON.stringify([sides, view, versus]))}`, w: W, h: H, width: size, title, defs, body });
}

export interface LineupPlayer extends JerseyOptions {
  number?: string | number;
  name?: string;
  /** A short role under the shirt (`"GK"`); the name is used when there is none. */
  role?: string;
}

export interface LineupOptions {
  /** How many players in each row, from the top row down: `[2, 4, 4, 1]`. */
  rows?: readonly number[];
  /** A soccer formation written as its numbers from the back, `"4-4-2"`: the first player is the goalkeeper; forwards are the top row. */
  formation?: string;
  /** The options every shirt shares (colours, cut and so on). */
  jersey?: JerseyOptions;
  /** What is written under each shirt. */
  labels?: "name" | "number" | "none";
  view?: "front" | "back";
  /** Draw the field's halfway line and goal area faintly behind the shirts. */
  field?: boolean;
  size?: number;
  emblems?: EmblemRenderer;
  title?: string;
}

/** The row lengths a formation string means, top row first: `"4-4-2"` is `[2, 4, 4, 1]`. */
export function formationRows(formation: string): number[] | undefined {
  const parts = formation.split("-").map((p) => Number(p));
  if (parts.length < 2 || parts.length > 6 || parts.some((n) => !Number.isInteger(n) || n < 1 || n > 6)) return undefined;
  return [...parts].reverse().concat([1]);
}

export function jerseyLineup(players: readonly LineupPlayer[], options?: LineupOptions): string {
  const o: LineupOptions = options !== null && typeof options === "object" ? options : {};
  const list = Array.isArray(players) ? players.filter((p) => typeof p === "object" && p !== null).slice(0, 40) : [];
  let rows: number[] = [];
  if (typeof o.formation === "string") rows = formationRows(o.formation) ?? [];
  else if (Array.isArray(o.rows)) rows = o.rows.filter((n) => Number.isInteger(n) && n >= 1 && n <= 12).slice(0, 12);
  if (rows.length === 0 || rows.reduce((a, b) => a + b, 0) !== list.length) {
    // Rows that do not add up to the players are replaced by rows of at most five.
    rows = [];
    for (let left = list.length; left > 0; left -= 5) rows.push(Math.min(5, left));
  }
  // With a formation the players are written goalkeeper first, then the back line, the midfield and the forwards: the top row is the forwards and the last is the goalkeeper.
  const parts = typeof o.formation === "string" ? formationRows(o.formation)?.slice(0, -1).reverse() : undefined;
  let seq: LineupPlayer[] = list;
  if (parts !== undefined && rows.join() === [...parts].reverse().concat([1]).join()) {
    const groups: LineupPlayer[][] = [];
    let at = 1;
    for (const n of parts) {
      groups.push(list.slice(at, at + n));
      at += n;
    }
    seq = groups.reverse().flat().concat(list.slice(0, 1));
  }
  const labels = o.labels === "number" || o.labels === "none" ? o.labels : "name";
  const widest = Math.max(1, ...rows);
  const cellW = 84;
  const cellH = labels === "none" ? 98 : 118;
  const W = widest * cellW + 20;
  const H = rows.length * cellH + 20;
  const scale = 0.34;
  let defs = "";
  let body = "";
  if (o.field === true) body += `<g fill="none" stroke="currentColor" stroke-opacity=".18" stroke-width="2"><rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="6"/><path d="M6 ${H / 2}H${W - 6}"/><circle cx="${W / 2}" cy="${H / 2}" r="30"/></g>`;
  let k = 0;
  rows.forEach((n, ri) => {
    for (let i = 0; i < n; i++) {
      const p = seq[k++];
      if (p === undefined) continue;
      const { name, role, ...own } = p;
      const r = resolve({ ...o.jersey, ...own, name: undefined, view: o.view === "back" ? "back" : "front", language: undefined, size: undefined });
      const cx = 10 + (W - 20) / 2 + (i - (n - 1) / 2) * cellW;
      const x = cx - (JERSEY_WIDTH * scale) / 2;
      const y = 10 + ri * cellH;
      const v = place(r, uidOf(r, `l${ri}-${i}`), x, y, scale, o.emblems);
      defs += v.defs;
      body += v.body;
      const text = labels === "none" ? undefined : labels === "number" ? (r.number ?? "") : (clean(role ?? name, 14) ?? r.number ?? "");
      if (text !== undefined && text !== "") body += caption(String(text), cx, y + JERSEY_HEIGHT * scale + 14, 10, cellW - 8);
    }
  });
  const size = typeof o.size === "number" && Number.isFinite(o.size) ? Math.max(8, Math.min(4000, o.size)) : 360;
  const title = clean(o.title, 120) ?? (typeof o.formation === "string" ? `Lineup, ${o.formation}` : "Lineup");
  return wrapSvg({ id: `sl${hashOf(JSON.stringify([list, rows, o.jersey, labels]))}`, w: W, h: H, width: size, title, defs, body });
}
