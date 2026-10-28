// A grade of a belt system (`BELT_SYSTEMS`, data) as what the belt drawing takes: the belt and its `beltStyle`. A grade is a body of one colour or two
// (split lengthwise, or in panels that take turns), a stripe along its length, a tip block with bars across it, and tags near an end; the drawing
// has all of these, so any grade of any system can be drawn: `renderJudogi({ mode: "belt", ...gradeBelt(grade) })`.

import type { BeltColour, BeltGrade } from "./beltSystems.ts";
import type { JudogiBelt } from "./judogi.ts";
import type { BeltBars, BeltTipStyle, JudogiBeltStyle } from "./judogiStripes.ts";

const NAMED: readonly string[] = ["white", "yellow", "orange", "green", "blue", "brown", "black", "red"];

/** The `belt` and `beltStyle` that draw a grade. */
export function gradeBelt(grade: BeltGrade): { belt: JudogiBelt; beltStyle: JudogiBeltStyle } {
  const style: JudogiBeltStyle = {};
  const [first, second] = grade.body as readonly BeltColour[];
  let belt: JudogiBelt = "white";
  const own = (c: BeltColour): void => {
    if (NAMED.includes(c)) belt = c as JudogiBelt;
    else style.base = c;
  };
  if (grade.body.length === 2 && grade.split === "alternating") {
    if (first === "red" && second === "white") belt = "red-white";
    else {
      own(first as BeltColour);
      style.alternate = second as string;
    }
  } else {
    own(first as BeltColour);
    if (second !== undefined) style.split = second;
  }
  if (grade.centreStripe !== undefined) style.along = [{ colour: grade.centreStripe }];
  if (grade.tip !== undefined) {
    const tip: BeltTipStyle = { colour: grade.tip.colour, lengthCm: grade.tip.lengthCm, fromEndCm: grade.tip.fromEndCm };
    if (grade.tip.bars !== undefined) tip.bars = { colour: grade.tip.bars.colour, count: grade.tip.bars.max, widthCm: grade.tip.bars.widthCm };
    style.tip = tip;
  }
  if (grade.tags !== undefined) {
    if (grade.tags.form === "tip") style.tip = { colour: grade.tags.colour, lengthCm: 5 };
    else style.bars = [{ colour: grade.tags.colour, count: grade.tags.count } satisfies BeltBars];
  }
  return { belt, beltStyle: style };
}
