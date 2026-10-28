// The inside of a jacket, for the turning view. The body is a shell of outer cells only (volume.ts, culled where they face away), so looking into
// the neck from above or through the lapels' opening would show the page through it. Here the upper body gets a second shell a cloth's
// thickness inside the first, facing inward, a rim of that thickness round the neck's edge, and a narrow wall down each inner side: the inner
// face of the back panel (with the neck label sewn just below the collar), of the front, and between them. Their drawing is one more picture
// in each face's own picture, below the jacket's (`INNER_DY`), so it has its own cloth, shade and marks; the flat views never show it.
import { normalOf, split, texHalf, wallOf, zAt, type Cell, type VolumeDesc } from "./volume.ts";

/** How far below its own drawing a face carries the drawing of its inside: past the hem and the vents, and inside the face's picture (`FACE_BOX`, to 300). */
export const INNER_DY = 220;
/** The cloth's thickness at the neck's edge, in drawing units (about 3 mm). */
export const INNER_T = 0.9;
/** The rim's strip on the picture, as heights above the inner drawing's own top. */
export const RIM_FROM = -9;
export const RIM_TO = -2;
/** Where the walls sample the inner drawing, across: plain cloth, clear of the label at the middle. */
const WALL_X = 150;

/**
 * Where a row of the body samples the inner drawing, below its top: as itself down to the neck's own region (the label, the collar's shadow), and then squeezed, so the plain cloth
 * below it, as far as the waist, fits the room the face's picture has under the jacket.
 */
export const innerY = (y: number): number => INNER_DY + (y <= INNER_PLAIN ? y : INNER_PLAIN + (y - INNER_PLAIN) * 0.2);
const INNER_PLAIN = 60;

/** The inner faces are plain cloth with a label on it, so they are cut in far fewer, larger cells than the outer shell (and below the neck's own region, in rows `ROW_SKIP` of the body's at a time). */
const INNER_NT = 6;
/** Every row of the body is a line of cells: the inner faces run to the hem now, and a skipped row at the waist would carry the inner face outside the narrower outer one. */
const ROW_SKIP = 1;
/** The hem's rim, as heights below the inner drawing's own top: the plain cloth at the foot of the drawing, where the hem's own row samples it. */
const HEM_RIM_FROM = 90;
const HEM_RIM_TO = 95;

const tAt = (i: number, n: number): number => ((-90 + (180 * i) / n) * Math.PI) / 180;

/** The inner cells of a jacket: nothing unless `VolumeDesc.inner` names how far down the drawing they go. */
export function innerCells(d: VolumeDesc): Cell[] {
  if (d.inner === undefined) return [];
  // The rows of the body the inner faces run along: every one down to the plain cloth, then every `ROW_SKIP`th. A cell runs from one to the next.
  const lines: number[] = [];
  let skipped = 0;
  for (let j = 0; j < d.y.length && (d.y[j] as number) <= d.inner + 8; j++) {
    const plain = (d.y[j] as number) > INNER_PLAIN;
    if (plain && skipped++ % ROW_SKIP !== 0 && j !== d.y.length - 1) continue;
    lines.push(j);
  }
  const rows = lines.slice(0, -1);
  if (rows.length === 0) return [];
  const next = (j: number): number => lines[lines.indexOf(j) + 1] as number;
  const cells: Cell[] = [];
  const at = (j: number, t: number, sg: number): number[] => [sg * ((d.a[j] as number) - INNER_T) * Math.sin(t), d.y[j] as number, sg * Math.max(0.4, zAt(d, j, t) - INNER_T)];
  const out = (j: number, t: number, sg: number): number[] => [sg * (d.a[j] as number) * Math.sin(t), d.y[j] as number, sg * zAt(d, j, t)];
  // The inner faces of each half, seen from inside: their drawing is turned over (its x runs the other way) so that it reads from the inside.
  for (const back of [false, true]) {
    const sg = back ? -1 : 1;
    for (const j of rows) {
      const jn = next(j);
      for (let i = 0; i < INNER_NT; i++) {
        const tex: number[] = [];
        const p: number[] = [];
        for (const [jj, ii] of [[j, i], [j, i + 1], [jn, i], [jn, i + 1]] as const) {
          const t = tAt(ii, INNER_NT);
          tex.push(100 - texHalf(d, jj) * Math.sin(t), innerY(d.y[jj] as number));
          p.push(...at(jj, t, sg));
        }
        const n = normalOf(p, 0, ((d.y[j] as number) + (d.y[jn] as number)) / 2, 0);
        cells.push(...split(back ? 3 : 0, back, tex, p, [-n[0], -n[1], -n[2]]));
      }
    }
  }
  // The rim: the top edge of the neck from the outer cloth to the inner, all the way round each half.
  const top = rows[0] as number;
  for (const back of [false, true]) {
    const sg = back ? -1 : 1;
    for (let i = 0; i < INNER_NT; i++) {
      const tex: number[] = [];
      const p: number[] = [];
      for (const [k, ii] of [[0, i], [0, i + 1], [1, i], [1, i + 1]] as const) {
        const t = tAt(ii, INNER_NT);
        tex.push(100 - texHalf(d, top) * Math.sin(t), INNER_DY + (k === 0 ? RIM_FROM : RIM_TO));
        p.push(...(k === 0 ? out(top, t, sg) : at(top, t, sg)));
      }
      cells.push(...split(back ? 3 : 0, back, tex, p, [0, -1, 0]));
    }
  }
  // The hem's rim: the bottom edge of the open jacket, from the outer cloth to the inner, all the way round each half, so that looking up into the opening
  // shows a cloth's thickness and then the inside, not a bare shell.
  const bottom = lines[lines.length - 1] as number;
  if (bottom === d.y.length - 1) {
    for (const back of [false, true]) {
      const sg = back ? -1 : 1;
      for (let i = 0; i < INNER_NT; i++) {
        const tex: number[] = [];
        const p: number[] = [];
        for (const [k, ii] of [[0, i], [0, i + 1], [1, i], [1, i + 1]] as const) {
          const t = tAt(ii, INNER_NT);
          tex.push(100 - texHalf(d, bottom) * Math.sin(t), INNER_DY + (k === 0 ? HEM_RIM_FROM : HEM_RIM_TO));
          p.push(...(k === 0 ? out(bottom, t, sg) : at(bottom, t, sg)));
        }
        cells.push(...split(back ? 3 : 0, back, tex, p, [0, 1, 0]));
      }
    }
  }
  // The walls between the two inner faces, down each side.
  for (const j of rows) {
    const jn = next(j);
    const y0 = d.y[j] as number;
    const y1 = d.y[jn] as number;
    for (const s of [-1, 1]) {
      const x0 = s * ((d.a[j] as number) - INNER_T);
      const x1 = s * ((d.a[jn] as number) - INNER_T);
      const z0 = Math.max(0.4, wallOf(d, j) - INNER_T);
      const z1 = Math.max(0.4, wallOf(d, jn) - INNER_T);
      const p = [x0, y0, z0, x0, y0, -z0, x1, y1, z1, x1, y1, -z1];
      const tex = [WALL_X, innerY(y0), WALL_X + 4, innerY(y0), WALL_X, innerY(y1), WALL_X + 4, innerY(y1)];
      cells.push(...split(0, false, tex, p, [-s, 0, 0]));
    }
  }
  return cells;
}
