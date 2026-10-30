// The measures in which a jacket's cut differs between the judogi and the karate gi, as numbers the jacket's drawing takes: how far down the arm the sleeve goes,
// where the hem is, how wide the lapel is, and how plain and soft the cloth is drawn. The judogi's are `JUDO_CUT`; karategi.ts makes the others.

export interface GiCut {
  /** How much of the full sleeve is drawn: 1 to the wrist, less to mid-forearm or the elbow. */
  sleeve: number;
  /** The jacket's hem, in the drawing's units down from the collar (205 is the judogi's, 78 cm at 2.63 units to the centimetre). */
  hem: number;
  /** The lapel band's width in the drawing, and the collar's thickness in the turning view. */
  lapel: number;
  collar: number;
  /** A lighter cloth: a fine plain weave, no quilted skirt, no waist seam, a single hem, softer folds (1 is the judogi's). */
  plain: boolean;
  soft: number;
  /** The neck: the judogi's lapels wrapped left over right down to the hem (`wrap`, the default), or a pullover's V-neck, its two bands meeting at the V (`v`, the dobok of dobok.ts). */
  neck?: "wrap" | "v";
  /** How far up from the hem the side slits run, in the drawing's units (23 by default, about 9 cm). */
  vent?: number;
  /** The cuff's width as a share of the judogi's straight sleeve: less than 1 is a sleeve that narrows from the armpit to the wrist. */
  cuff?: number;
  /** The collar band's own colours where it is not the cloth's (a dobok's black or black-and-red V-neck): its fill, edge and stitch, and colours laid along it as parts of its width from the neck's edge. */
  band?: CollarBand;
  /** A band of another colour along the jacket's lower edge, front and back (an ITF black belt's dobok): its colours and its height in the drawing's units. */
  hemBand?: CollarBand & { h: number };
}

export interface CollarBand {
  fill: string;
  edge: string;
  stitch: string;
  bands?: { from: number; to: number; fill: string }[];
}

export const JUDO_CUT: GiCut = { sleeve: 1, hem: 205, lapel: 12.6, collar: 2.4, plain: false, soft: 1 };
