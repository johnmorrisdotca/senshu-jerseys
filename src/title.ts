import { CUT_NAMES, TITLE_WORDS } from "./names.ts";
import type { Resolved } from "./options.ts";

/** The accessible title of a jersey: the cut, the number and the view, in the language asked for. */
export function titleOf(r: Resolved): string {
  if (r.title !== undefined) return r.title;
  const w = TITLE_WORDS[r.language];
  const cut = CUT_NAMES[r.cut][r.language];
  const number = r.number === undefined ? "" : r.language === "ja" ? `、${w.number}${r.number}` : `, ${w.number} ${r.number}`;
  const view = r.view === "both" ? w.both : r.view === "back" ? w.back : w.front;
  return r.language === "ja" ? `${cut}${number}（${view}）` : `${cut}${number}, ${view}`;
}
