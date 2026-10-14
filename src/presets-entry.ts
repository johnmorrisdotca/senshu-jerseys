// Every league's presets at once: `PRESETS` is all of them and `LEAGUES` is them by module. A page that wants one league imports `./presets/<league>` instead and takes only that
// league's rows. A preset is colours and stripes only; no crest, logo, monogram, wordmark or sponsor's mark is drawn by any of them.
import { CFL, IFAF } from "./presets/cfl.ts";
import { HOCKEY_NATIONS } from "./presets/hockey-nations.ts";
import { MLB } from "./presets/mlb.ts";
import { NHL } from "./presets/nhl.ts";
import { OFFICIALS } from "./presets/officials.ts";
import { NHL_CLASSIC } from "./presets/nhl-classic.ts";
import { NBA } from "./presets/nba.ts";
import { NFL } from "./presets/nfl.ts";
import { RUGBY } from "./presets/rugby.ts";
import { SOCCER } from "./presets/soccer.ts";
import { SOCCER_NATIONS } from "./presets/soccer-nations.ts";
import type { Preset } from "./presets/core.ts";

export { decode, defineLeague } from "./presets/core.ts";
export type { Preset, Row, Teams } from "./presets/core.ts";

/** The leagues in the order a page lists them: `id` is the module's name. */
export const LEAGUES: readonly { id: string; presets: readonly Preset[] }[] = [
  { id: "nhl-classic", presets: NHL_CLASSIC },
  { id: "nhl", presets: NHL },
  { id: "hockey-nations", presets: HOCKEY_NATIONS },
  { id: "mlb", presets: MLB },
  { id: "nba", presets: NBA },
  { id: "nfl", presets: NFL },
  { id: "cfl", presets: CFL },
  { id: "ifaf", presets: IFAF },
  { id: "soccer", presets: SOCCER },
  { id: "soccer-nations", presets: SOCCER_NATIONS },
  { id: "rugby", presets: RUGBY },
  { id: "officials", presets: OFFICIALS },
];

/** Every preset of every league. */
export const PRESETS: readonly Preset[] = LEAGUES.flatMap((l) => l.presets);
