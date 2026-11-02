// How much the graphics card may be asked for. A canvas is width x height x ratio squared pixels, and a box as wide as a 5K screen at a ratio of 4 would be 59 million, every frame; a face's picture at 8 pixels a unit is 23 megabytes, two for each piece. Pure.

/** The most a canvas may hold, in pixels. */
export const MAX_PIXELS = 6_000_000;
/** The longest side a canvas may have, in pixels. */
export const MAX_SIDE = 4096;
/** The sharpest ratio ever used, however dense the screen. */
export const MAX_RATIO = 2;
/** The most all the pictures of a drawing's faces may hold on the graphics card together, in pixels (about 100 megabytes). */
export const MAX_TEXTURE_PIXELS = 24_000_000;
/** The longest side a piece's picture may have, in pixels. */
export const MAX_TEXTURE_SIDE = 4096;

/** A face's width and height in units, as pieceVolume's FACE_BOX has them; a piece's picture is both faces side by side. */
const FACE_W = 280;
const FACE_H = 320;

/** The canvas pixels per CSS pixel for a `width` x `height` box: the one asked for (the screen's own by default), held to 2, to 4096 pixels a side and to 6 million in all. 1 for a nonsense ask. */
export function pixelRatioFor(width: number, height: number, deviceRatio: number): number {
  const w = Math.max(1, width);
  const h = Math.max(1, height);
  const wanted = Number.isFinite(deviceRatio) && deviceRatio > 0 ? Math.min(deviceRatio, MAX_RATIO) : 1;
  return Math.max(0.001, Math.min(wanted, MAX_SIDE / Math.max(w, h), Math.sqrt(MAX_PIXELS / (w * h))));
}

/** The canvas's size in pixels for a box and a ratio: whole pixels, never more than the budget. */
export function canvasPixels(width: number, height: number, ratio: number): { width: number; height: number } {
  return { width: Math.max(1, Math.floor(width * ratio)), height: Math.max(1, Math.floor(height * ratio)) };
}

/** The pixels a unit of a face's picture may get when `pieces` pieces are on the card: `wanted`, held so that no picture passes 4096 pixels across and all of them together stay inside 24 million. */
export function faceScaleFor(wanted: number, pieces: number): number {
  const across = MAX_TEXTURE_SIDE / (2 * FACE_W);
  const together = Math.sqrt(MAX_TEXTURE_PIXELS / (Math.max(1, pieces) * 2 * FACE_W * FACE_H));
  return Math.max(1, Math.min(wanted, across, together));
}
