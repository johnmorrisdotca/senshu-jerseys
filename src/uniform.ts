// `renderKit`: the whole uniform of a cut laid out as a set: the jersey, below it the pants or the shorts and the socks, and the helmet or the cap beside them, from one set of options
// (`pants`, `pantsTrim`, `pantsBands`, `socks`, `socksTrim`, `socksBands`, `helmet`). Bands are read as in the jersey's: a width and a colour index, 0 the garment's own colour, 1 its trim,
// 2 the jersey's trim. A hockey or soccer pair of pants takes its bands up from the hem; a long pair (football, baseball) takes them as stripes down each outer side.
import { capParts } from "./cap.ts";
import { hashOf, hexOf, lum, shade, type Rgb } from "./colour.ts";
import type { EmblemRenderer } from "./emblems.ts";
import { helmetParts } from "./helmet.ts";
import { JERSEY_HEIGHT, jerseyBox, jerseyView, uidOf } from "./jersey.ts";
import { resolve, type Bands, type JerseyOptions, type Resolved } from "./options.ts";
import { n2 } from "./path.ts";
import { wrapSvg } from "./svg.ts";
import { titleOf } from "./title.ts";

const LONG = new Set(["football", "baseball"]);
const SHORTS = new Set(["soccer", "basketball", "rugby", "handball"]);

/** The garment's outline in a column 200 wide, its height, and the sock's height for the cut. */
function shapes(cut: string): { pants: string; ph: number; sock: number } {
  if (LONG.has(cut)) return { pants: "M48 0L152 0L158 22L150 150L106 150L100 52L94 150L50 150L42 22Z", ph: 150, sock: cut === "baseball" ? 78 : 70 };
  if (SHORTS.has(cut)) return { pants: "M50 0L150 0L158 40L164 84L106 84L100 36L94 84L36 84L42 40Z", ph: 84, sock: cut === "basketball" ? 70 : 96 };
  return { pants: "M44 0L156 0L162 24L160 112L106 112L100 46L94 112L40 112L38 24Z", ph: 112, sock: 100 };
}

const SOCK = "M0 0H36V68C36 80 42 86 40 94H-4C-6 86 0 80 0 68Z";
/** How tall the sock's shape is: the column is made at least this long under the pants, or the foot of a short sock's drawing is cut off. */
const SOCK_HEIGHT = 94;

/** The bands of a garment up from its bottom edge at `bottom`, as rectangles over `x0` to `x1`. */
function hemBands(b: Bands, bottom: number, x0: number, x1: number, colour: (i: number) => string): string {
  let out = "";
  let at = 0;
  for (let i = 0; i + 1 < b.length; i += 2) {
    const w = b[i] as number;
    const c = b[i + 1] as number;
    if (c !== 0) out += `<path d="M${n2(x0)} ${n2(bottom - at - w)}H${n2(x1)}V${n2(bottom - at)}H${n2(x0)}Z" fill="${colour(c)}"/>`;
    at += w;
  }
  return out;
}

/** The set's drawing as one SVG; `view` picks front, back, or (both) a column each. */
export function renderKit(options?: JerseyOptions & { emblems?: EmblemRenderer }): string {
  const r: Resolved = resolve({ ...options, kit: true });
  const cols: ("front" | "back")[] = r.view === "both" ? ["front", "back"] : [r.view];
  const sh = shapes(r.cut);
  const pantsC = r.pants ?? r.body;
  const pantsT = r.pantsTrim ?? r.trim;
  const socksC = r.socks ?? r.body;
  const socksT = r.socksTrim ?? r.trim;
  const line = r.look === "line";
  const cloth = r.look === "cloth";
  const hx = hexOf;
  const edgeOf = (c: Rgb): string => (line ? "currentColor" : hx(lum(c) > 0.1 ? shade(c, -0.42) : shade(c, 0.3)));
  const uid = `su${hashOf(JSON.stringify(r))}`;
  // A column is the shirt with 10 units of room on each side, or what its cut's sleeves need if that is more.
  const pad = Math.max(10, Math.ceil(-jerseyBox(r.cut).x));
  const colW = 200 + 2 * pad;
  const hasHelmet = r.helmet !== undefined && (r.cut === "hockey" || r.cut === "football" || r.cut === "baseball");
  const side = hasHelmet ? 110 : 0;
  const W = cols.length * colW + side;
  const yPants = JERSEY_HEIGHT - 8;
  const ySock = yPants + sh.ph - 4;
  const H = ySock + Math.max(sh.sock, SOCK_HEIGHT) + 8;
  let defs = "";
  let body = "";
  if (cloth) defs += `<linearGradient id="${uid}g" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".3" stop-color="#fff" stop-opacity=".06"/><stop offset=".7" stop-color="#000" stop-opacity=".02"/><stop offset="1" stop-color="#000" stop-opacity=".24"/></linearGradient>`;
  cols.forEach((v, ci) => {
    const x0 = ci * colW + pad;
    const view = jerseyView(r, v, uidOf(r, `k${ci}`), options?.emblems);
    defs += view.defs;
    // Socks first (behind the pants), then the pants, then the jersey over the waist.
    const garmentColour = (base: Rgb, trim: Rgb) => (i: number): string => hx(i === 1 ? trim : i === 2 ? r.trim : base);
    for (const sx of [76, 124]) {
      const cid = `${uid}s${ci}${sx}`;
      defs += `<clipPath id="${cid}"><path d="${SOCK}" transform="translate(${sx - 18} ${ySock})"/></clipPath>`;
      body += `<g transform="translate(${x0} 0)">`;
      body += line ? "" : `<path d="${SOCK}" transform="translate(${sx - 18} ${ySock})" fill="${hx(socksC)}"/>`;
      if (!line) body += `<g clip-path="url(#${cid})">${hemBands(r.socksBands, ySock + sh.sock, 0, 200, garmentColour(socksC, socksT))}</g>`;
      if (cloth) body += `<path d="${SOCK}" transform="translate(${sx - 18} ${ySock})" fill="url(#${uid}g)"/>`;
      body += `<path d="${SOCK}" transform="translate(${sx - 18} ${ySock})" fill="none" stroke="${edgeOf(socksC)}" stroke-width="${line ? 6 : 1.4}" stroke-linejoin="round"/>`;
      body += "</g>";
    }
    body += `<g transform="translate(${x0} 0)">`;
    const pid = `${uid}p${ci}`;
    defs += `<clipPath id="${pid}"><path d="${sh.pants}" transform="translate(0 ${yPants})"/></clipPath>`;
    if (!line) {
      body += `<path d="${sh.pants}" transform="translate(0 ${yPants})" fill="${hx(pantsC)}"/>`;
      const colour = garmentColour(pantsC, pantsT);
      if (LONG.has(r.cut)) {
        // Side stripes down each outer side, from the outer edge inward.
        let at = 0;
        let stripes = "";
        for (let i = 0; i + 1 < r.pantsBands.length; i += 2) {
          const w = r.pantsBands[i] as number;
          const c = r.pantsBands[i + 1] as number;
          if (c !== 0) stripes += `<path d="M${n2(40 + at)} 0H${n2(40 + at + w)}V160H${n2(40 + at)}Z" fill="${colour(c)}"/><path d="M${n2(160 - at - w)} 0H${n2(160 - at)}V160H${n2(160 - at - w)}Z" fill="${colour(c)}"/>`;
          at += w;
        }
        body += `<g clip-path="url(#${pid})" transform="translate(0 ${yPants})">${stripes}</g>`;
      } else {
        body += `<g clip-path="url(#${pid})">${hemBands(r.pantsBands, yPants + sh.ph, 0, 200, colour)}</g>`;
      }
      body += `<path d="M${r.cut === "hockey" ? 46 : 48} ${yPants + 6}H${r.cut === "hockey" ? 154 : 152}" stroke="${hx(shade(pantsC, -0.3))}" stroke-width="1.2" fill="none" stroke-opacity=".6"/>`;
    }
    if (cloth) body += `<path d="${sh.pants}" transform="translate(0 ${yPants})" fill="url(#${uid}g)"/>`;
    body += `<path d="${sh.pants}" transform="translate(0 ${yPants})" fill="none" stroke="${edgeOf(pantsC)}" stroke-width="${line ? 6 : 1.4}" stroke-linejoin="round"/>`;
    body += `<g>${view.body}</g></g>`;
  });
  if (hasHelmet) {
    const he = hx(r.helmet as Rgb);
    const parts =
      r.cut === "baseball"
        ? capParts({ colors: [he, he], look: r.look, view: "side" })
        : helmetParts({ kind: r.cut === "hockey" ? "hockey" : "football", colors: [he, hx(r.trim), r.cut === "football" ? hx([226, 226, 226]) : "#282c32"], look: r.look, facing: "left" });
    defs += parts.defs;
    body += `<g transform="translate(${cols.length * colW + 6} ${JERSEY_HEIGHT * 0.45}) scale(.5)">${parts.body}</g>`;
  }
  return wrapSvg({ id: uid, w: W, h: H, width: r.size * (W / 200), title: r.language === "ja" ? `${titleOf(r)}、パンツ・ソックス${hasHelmet ? "・ヘルメット" : ""}付き` : `${titleOf(r)}, with pants, socks${hasHelmet ? " and helmet" : ""}`, description: r.description, defs, body });
}
