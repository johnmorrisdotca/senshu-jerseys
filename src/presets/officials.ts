// Officials' shirts: referees, linesmen, umpires and judges of the sports, as colours, stripes, collars, armbands and pockets only. No league crest (no NHL shield), no federation badge
// (no FIFA badge: the badge spot is empty and plain), no maker's or sponsor's mark, no official's name. A made-up name and number go on the back in the demo.
//
// An id is `ref:` and a key (`ref:nhl-modern-referee`); the team is the kind of official, the years the era, the way the role or the variant. Spec words beyond the teams' (see docs/presets.md):
//   ab=colour.width.at   armbands: 2 is the second trim; ab=2.12.30 is a band 12 wide, 30 percent down the sleeve
//   pk=1                 a chest pocket        bd=r|s|q    a badge spot, plain: round, shield or square
//   pr=1                 an umpire's chest protector         na=s    the name set straight, as officials wear it
//   co=z                 a zip collar          co=t        a long-point dress collar
//
// Stripe widths: one drawing unit is about a fifth of an inch (the chest is about 100 units across), so a repeat of `5.0.10.1.5.0` is a 2 inch black stripe between 2 inch white ones.
// A repeat is body, trim, body (the trim stripe is centred on the shirt) and its numbers are whole units.
//
// Pages (English Wikipedia unless a host is named): Official (ice hockey) and Referee (ice hockey); Official (basketball); Official (American football); Referee (association football);
// Umpire (baseball); Referee (rugby union); Referee (rugby league). Also: Alberta Sports Hall of Fame, "December Artifact of the Month" (albertasportshall.ca); the Illinois High School
// Association Sports Officials Handbook (ihsa.org); FootyHeadlines on the 2019 Macron UEFA Champions League, the 2022 adidas World Cup and the 2025-26 Puma Premier League referee kits.
// A colour here is this package's reading of a colour name, not a published code: where a page gave only a name the hex is the plainest one that fits.
import type { Preset } from "./core.ts";
import { decode } from "./core.ts";

/** `[key, name, name in Japanese, years, way, spec]`. */
type Row = readonly [key: string, en: string, ja: string, years: string, way: string, spec: string];

function defineOfficials(rows: readonly Row[]): Preset[] {
  return rows.map(([key, team, ja, years, way, spec]) => ({ id: `ref:${key}`, league: "ref", team, ja, years, way, options: decode(spec, { nameArch: "straight" }) }));
}

// Common words. The black-and-white shirt: white body, black stripes, a black collar.
const BW = "fff 101010 f58220"; // body, trim (black), second trim (the armband)
const NHL_STRIPES = "p=s r=5.0.10.1.5.0"; // unsure: the NHL's stripe width is not published; about 2 inches is read from photographs
const ARM = "ab=2.12.30";

export const OFFICIALS: Preset[] = defineOfficials([
  // ----- Ice hockey. Wikipedia "Official (ice hockey)": a black-and-white vertically striped shirt, black trousers; armbands orange (NHL, USA Hockey), purple (PWHL), red (Hockey Canada) for
  // the referee, none on the linesman. NHL history: cream sweaters over a shirt and tie from the 1930s to the early 1950s; then orange sweaters with half-zip fronts; the striped sweater on
  // 29 December 1955 (Alberta Sports Hall of Fame); numbers on the back from 1955, surnames from 1977, numbers again from 1994. Orange armbands by 1970 (same Hall page).
  ["nhl-modern-referee", "NHL referee", "NHLのレフェリー", "1955-", "referee", `${BW} c=h ss=0 hs=0 ${NHL_STRIPES} co=p ${ARM} nf=101010 no=fff`],
  ["nhl-modern-referee-zip", "NHL referee, zip collar", "NHLのレフェリー（ジップ襟）", "1955-", "referee zip", `${BW} c=h ss=0 hs=0 ${NHL_STRIPES} co=z ${ARM} nf=101010 no=fff`],
  ["nhl-modern-linesman", "NHL linesman", "NHLのラインズマン", "1955-", "linesman", `${BW} c=h ss=0 hs=0 ${NHL_STRIPES} co=p nf=101010 no=fff`],
  ["nhl-modern-linesman-zip", "NHL linesman, zip collar", "NHLのラインズマン（ジップ襟）", "1955-", "linesman zip", `${BW} c=h ss=0 hs=0 ${NHL_STRIPES} co=z nf=101010 no=fff`],
  ["hockey-canada-referee", "Hockey Canada referee", "ホッケー・カナダのレフェリー", "2000s", "referee", `fff 101010 d52b1e c=h ss=0 hs=0 ${NHL_STRIPES} co=p ${ARM} nf=101010 no=fff`], // unsure: the era; red armbands per Wikipedia, with no year given
  ["pwhl-referee", "PWHL referee", "PWHLのレフェリー", "2024-", "referee", `fff 101010 5a2d82 c=h ss=0 hs=0 ${NHL_STRIPES} co=p ${ARM} nf=101010 no=fff`], // purple armbands per Wikipedia; the league began play in 2024
  ["nhl-1950s-candy", "NHL referee, candy stripes", "NHLのレフェリー（赤白の縞）", "1950s", "referee", "fff c8102e 1d1d1d c=h ss=0 hs=0 p=s r=5.0.10.1.5.0 co=p cc=2 nf=101010 no=fff"], // unsure: red-and-white stripes with a dark collar are from a photograph from the maintainer; no Wikipedia page or museum page found for an NHL red-and-white sweater (the WHA's 1970s referees did wear red, white and blue)
  ["nhl-1950s-orange", "NHL referee, orange half-zip", "NHLのレフェリー（オレンジのハーフジップ）", "1950-1955", "referee", "f26b21 101010 c=h ss=0 hs=0 co=z"], // unsure: the collar colour; Wikipedia says orange sweaters with half-zip fronts and no neckties
  ["nhl-1930s-cream", "NHL referee, cream sweater", "NHLのレフェリー（クリーム色のセーター）", "1930-1950", "referee", "efe6c8 101010 c=h ss=0 hs=0 co=c cc=0"], // unsure: the exact cream; a sweater over a shirt and tie, no stripes

  // ----- Basketball. Wikipedia "Official (basketball)": the NBA shirt is light grey with thin white stripes, black sleeves and a black stripe on each side, a red and blue collar; Summer League
  // the same with a black collar; the WNBA's collar is orange; FIBA a grey torso with black sleeves; EuroLeague orange; the Australian NBL green with black shoulders and a V-neck with no
  // collar; NCAA men from 2019-20 black-and-white stripes with black raglan sleeves, NCAA women grey with white pin-stripes, black sleeves and light blue collar trim. The basketball cut is
  // a tank, so these use the soccer cut, a short-sleeved shirt.
  ["nba-classic", "NBA referee, striped", "NBAのレフェリー（縞柄）", "1950s", "classic", "fff 101010 c=s p=s r=5.0.10.1.5.0 sl=s co=v nf=101010 no=fff"], // unsure: Highsnobiety says the NBA wore black-and-white stripes in the early 1950s; Slate says grey by 1971
  ["nba-modern", "NBA referee", "NBAのレフェリー", "1971-", "modern", "b9bec3 fff 111 c8102e c=s p=p r=5.1 ps=0 sc=2 sl=s co=p cc=3"], // unsure: the pin-stripe spacing; the side stripe and the blue half of the collar are not drawn
  ["nba-summer-league", "NBA Summer League referee", "NBAサマーリーグのレフェリー", "2010s", "summer league", "b9bec3 fff 111 c=s p=p r=5.1 ps=0 sc=2 sl=s co=p cc=2"], // unsure: the era
  ["wnba", "WNBA referee", "WNBAのレフェリー", "1997-", "modern", "b9bec3 fff 111 f26b21 c=s p=p r=5.1 ps=0 sc=2 sl=s co=p cc=3"], // unsure: the pin-stripe spacing
  ["fiba", "FIBA referee", "FIBAのレフェリー", "2010s", "modern", "9ea3a8 111 c=s ps=0 sc=1 sl=s co=p"], // unsure: the era
  ["euroleague", "EuroLeague referee", "ユーロリーグのレフェリー", "2010s", "modern", "f26b21 111 c=s sl=s co=p"], // unsure: the era and the orange
  ["nbl-australia", "Australian NBL referee", "オーストラリアNBLのレフェリー", "2010s", "modern", "2f9e44 111 c=s y=c sl=s co=v"], // unsure: the era; black shoulders drawn as a curved yoke, side stripes not drawn
  ["ncaa-basketball-men", "NCAA men's basketball referee", "NCAA男子バスケのレフェリー", "2019-", "men", "fff 101010 c=s p=s r=5.0.10.1.5.0 ps=1 rg=1 sc=1 sl=s co=v nf=101010 no=fff"],
  ["ncaa-basketball-women", "NCAA women's basketball referee", "NCAA女子バスケのレフェリー", "2019-", "women", "b9bec3 fff 111 7fb8e6 c=s p=p r=5.1 ps=0 sc=2 rg=1 sl=s co=p cc=3"],

  // ----- Football (gridiron). Wikipedia "Official (American football)": black-and-white stripes from the 1920s in place of plain white shirts; black trousers; college stripes two inches, high school
  // one, the NFL's and the CFL's uneven; CFL shirts have solid black sleeves and only a number on the back; an NFL back has a number with a small letter above it. The white cap is not drawn.
  ["football-1910s-white", "Football official, plain white", "アメフトの審判（白無地）", "1900-1920", "classic", "fff 101010 c=f ss=0 hs=0 co=p"], // unsure: the collar; Wikipedia says plain white shirts before the stripes of the 1920s
  ["nfl", "NFL official", "NFLの審判", "1945-", "modern", "fff 101010 c=f ss=0 hs=0 p=s r=4.0.5.1.5.0 sl=s co=p nf=101010 no=fff"], // unsure: the 'uneven' pattern read as a 5 unit black stripe between 9 unit white ones; Highsnobiety says the standard design by 1945
  ["cfl", "CFL official", "CFLの審判", "2000s", "modern", "fff 101010 c=f ss=0 hs=0 p=s r=4.0.5.1.5.0 ps=0 sc=1 sl=s co=v nf=101010 no=fff"], // unsure: the era; solid black sleeves per Wikipedia, the collar is not documented
  ["ncaa-football", "NCAA football official", "NCAAアメフトの審判", "1950-", "college", "fff 101010 c=f ss=0 hs=0 p=s r=5.0.10.1.5.0 sl=s co=v nf=101010 no=fff"], // unsure: the era; two-inch stripes per Wikipedia
  ["highschool-football", "High school football official", "高校アメフトの審判", "1950-", "high school", "fff 101010 c=f ss=0 hs=0 p=s r=3.0.5.1.3.0 sl=s co=v nf=101010 no=fff"], // unsure: the era; one-inch stripes per Wikipedia

  // ----- Soccer. Wikipedia "Referee (association football)": traditionally all black (red if a side wore very dark); at the 1994 World Cup officials could choose burgundy, yellow or white and the
  // Premier League's referees wore green; since then mostly yellow or black. FootyHeadlines: the 2019 Macron UEFA Champions League range in black, neon yellow, neon sky and neon pink, with
  // front pockets and black collar and sleeve edges; the 2025-26 Puma Premier League range in yellow, turquoise, purple and black. The badge spot is a plain shape, never the FIFA badge.
  ["soccer-black-classic", "Soccer referee, black", "サッカーのレフェリー（黒）", "1900-1994", "black", "111 4a4a4a c=s co=p pk=1 bd=r"], // unsure: the collar, which was often white; Wikipedia says all black
  ["soccer-red-classic", "Soccer referee, red", "サッカーのレフェリー（赤）", "1900-1994", "red", "c8102e 111 c=s co=p pk=1 bd=r"], // unsure: the years; worn when a side wore very dark shirts
  ["soccer-green-1994", "Soccer referee, green", "サッカーのレフェリー（緑）", "1994-1999", "green", "2e8b3d 111 c=s co=p pk=1 bd=r"], // unsure: the end year; Premier League 1994 per Wikipedia
  ["soccer-burgundy-1994", "Soccer referee, burgundy", "サッカーのレフェリー（えんじ）", "1994", "burgundy", "6d1f2f 111 c=s co=p pk=1 bd=r"], // 1994 World Cup per Wikipedia
  ["soccer-yellow", "Soccer referee, yellow", "サッカーのレフェリー（黄）", "1994-", "yellow", "f7e017 111 c=s co=p pk=1 bd=s cf=7.1"],
  ["soccer-lime", "Soccer referee, lime", "サッカーのレフェリー（ライム）", "2010s", "lime", "a6e22e 111 c=s co=p pk=1 bd=s cf=7.1"], // unsure: lime green is named by the task; the nearest documented greens are the Premier League's 1994 green and adidas's 2022 'Mint Rush'
  ["soccer-coral", "Soccer referee, coral", "サッカーのレフェリー（コーラル）", "2019-", "coral", "ff7a70 111 c=s co=p pk=1 bd=s cf=7.1"], // unsure: the hex; Macron's 'neon pink' of 2019
  ["soccer-cyan", "Soccer referee, cyan", "サッカーのレフェリー（シアン）", "2019-", "cyan", "19c9e6 111 c=s co=p pk=1 bd=s cf=7.1"], // unsure: the hex; Macron's 'neon sky' of 2019
  ["soccer-turquoise", "Soccer referee, turquoise", "サッカーのレフェリー（ターコイズ）", "2025-", "turquoise", "20c5b5 111 c=s co=p pk=1 bd=s cf=7.1"], // Puma 2025-26 per FootyHeadlines
  ["soccer-purple", "Soccer referee, purple", "サッカーのレフェリー（紫）", "2025-", "purple", "7b3fa0 eee c=s co=p pk=1 bd=s cf=7.1"], // Puma 2025-26 per FootyHeadlines

  // ----- Baseball. Wikipedia "Umpire (baseball)": from 1980 a short-sleeved light blue shirt with a blazer and tie; in 1996 a navy blue polo with red and white collar and cuff trim; in 2000 black
  // polos with grey slacks for the postseason. A plate umpire's outside chest protector is the `pr=1` look (the American League's balloon protector was outlawed for new umpires in 1977).
  ["mlb-umpire-navy", "MLB umpire", "MLBの審判", "1996-", "navy polo", "14213d c8102e fff c=b sl=s co=p cf=7.1"],
  ["mlb-umpire-navy-protector", "MLB plate umpire, protector", "MLBの球審（プロテクター）", "1996-", "plate", "14213d c8102e fff c=b sl=s co=p cf=7.1 pr=1"], // unsure: the protector's shape and colour
  ["mlb-umpire-lightblue", "MLB umpire, light blue", "MLBの審判（水色）", "1980-1995", "light blue", "9ec5e3 14213d c=b sl=s co=t cc=0"],
  ["mlb-umpire-black-2000", "MLB umpire, black polo", "MLBの審判（黒のポロ）", "2000", "postseason", "111 888 c=b sl=s co=p"],

  // ----- Rugby and lacrosse. Wikipedia "Referee (rugby union)": officials stand out in yellow; "Referee (rugby league)": a colour distinguishable from the sides. IHSA Sports Officials Handbook:
  // boys' lacrosse a black-and-white striped shirt with a black collar and cuffs; girls' lacrosse one-inch vertical stripes. Lacrosse has no cut of its own, so it is drawn on the soccer cut.
  ["rugby-union-yellow", "Rugby union referee, yellow", "ラグビーユニオンのレフェリー（黄）", "2020s", "yellow", "f7e017 111 c=r sl=s co=p"], // unsure: the era; Wikipedia's photo caption gives only 'yellow'
  ["lacrosse-boys", "Lacrosse official, boys' game", "ラクロスの審判（男子）", "2020s", "boys", "fff 101010 c=s p=s r=5.0.10.1.5.0 sl=s co=p cf=9.1 nf=101010 no=fff"], // unsure: the era and the stripe width, not given for boys
  ["lacrosse-girls", "Lacrosse official, girls' game", "ラクロスの審判（女子）", "2020s", "girls", "fff 101010 c=s p=s r=3.0.5.1.3.0 sl=s co=p nf=101010 no=fff"], // unsure: the era; one-inch stripes per the IHSA handbook
]);
