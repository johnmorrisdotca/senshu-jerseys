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
}

export const JUDO_CUT: GiCut = { sleeve: 1, hem: 205, lapel: 12.6, collar: 2.4, plain: false, soft: 1 };
