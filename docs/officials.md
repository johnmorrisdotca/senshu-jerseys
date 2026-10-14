# Officials

<p align="center">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/senshu-jerseys/main/docs/images/officials-desk-dark.webp">
<img alt="Eight officials' shirts under floodlights, front above and back below: the NHL referee with orange armbands and the linesman without, a basketball referee, an NFL referee, yellow and cyan soccer referees with a chest pocket and a plain badge, a baseball umpire in navy with a chest protector and a yellow rugby referee." src="https://raw.githubusercontent.com/johnmorrisdotca/senshu-jerseys/main/docs/images/officials-desk-light.webp" width="760">
</picture>
</p>

Referees, linesmen, umpires and judges, drawn from the same cuts as the players: the black-and-white stripes of hockey, basketball and football, the bright solid colours of soccer, the umpire's navy polo, and a few historic looks. `OFFICIALS` is a league of presets like any other (`@johnmorrisdotca/senshu-jerseys/presets/officials`, ids that start with `ref:`), and it is also in `PRESETS` and in the demo's Officials section and Jersey wall filter.

**Colours and shapes only.** No league crest (no NHL shield), no federation badge (no FIFA badge), no maker's or sponsor's mark and no real official's name. The badge spot on a soccer referee's chest is a plain, empty shape; a page may put its own `crest` there.

```js
import { renderJersey, usePresets, presetOptions } from "@johnmorrisdotca/senshu-jerseys";
import { OFFICIALS } from "@johnmorrisdotca/senshu-jerseys/presets/officials";

usePresets(OFFICIALS);
const referee = presetOptions("ref:nhl-modern-referee");
const linesman = presetOptions("ref:nhl-modern-linesman");
// A made-up name and the number, on the back, as an official wears them: the name straight, not arched.
const back = renderJersey({ ...referee, number: 14, name: "Beaumont", view: "back" });

console.log(referee.armbands.length); // 3
console.log(linesman.armbands === undefined); // true
console.log(back.startsWith("<svg")); // true
```

## The new parts

| Option | Spec word | What it draws |
| --- | --- | --- |
| `armbands` | `ab=2.12.30` | A band round each upper arm, square to the sleeve: a colour (`1` the trim, `2` the second trim, `3` the number's fill), a width in drawing units (3 to 30, 12 by default) and how far down the sleeve its middle lies in percent (10 to 80, 30 by default). `ab=2` alone takes the defaults. Over the sleeve's stripes, in every look. The referee has them and the linesman does not: that is the whole difference between `ref:nhl-modern-referee` and `ref:nhl-modern-linesman`. |
| `pocket` | `pk=1` | A patch pocket on the wearer's left chest, with a stitched top. |
| `badge` | `bd=r`, `bd=s`, `bd=q` | A badge spot on the left chest, on the pocket if there is one: a round, shield or square patch a shade off the cloth, plain and empty. A `crest` takes its place when there is one. |
| `protector` | `pr=1` | An umpire's outside chest protector over the front of a shirt: a padded shape with its ridges and straps. |
| `collar: "zip"` | `co=z` | A stand collar over a zipper, with its teeth and slider (hockey officials, the 1950s half-zip). |
| `collar: "point"` | `co=t` | A dress collar with long points and a placket with three buttons (an umpire's light blue shirt). |
| `collarColor: 3` | `cc=3` | The collar in the number's fill colour, so a shirt can have grey, white and black and a red collar (the NBA's). |
| `plate` | `bp=1`, `bp=101010` | A solid plate behind the back's name and number, so that stripes cannot reach a letter: `true` takes the lighter of the body and the trim, or give a colour (and `numberFill` for the ink on it). |
| `nameArch: "straight"` | `na=s` | The name straight across the shoulders, as officials wear it (the presets set it). |

`zip` and `point` are collars of the hockey, baseball, football, soccer and rugby cuts; the basketball tank has neither. The basketball referee's shirt has sleeves, so the basketball presets use the soccer cut, a short-sleeved shirt. Lacrosse has no cut of its own and uses it too.

## Lettering on stripes

A black number printed straight on black-and-white stripes is lost: a stripe the colour of the ink touches the edge of every letter. Two things keep it readable, and every striped official's back is held to them by `test/legible.test.ts`, which paints the drawing, looks at the ring a third of a stroke wide round each letter of the number and of the name, and wants nothing in it that is within a contrast of 4.5 of the ink:

- **A wide outline** (every shirt whose lettering lies on the stripes): when the fill is lost on one of the stripe colours the outline is `0.45` of a stroke wide on each side, rounded at the corners, so a black number sits in a white edge between the stripes. A thin one stays on a plain shirt.
- **A plate** (`plate`, `bp=`): a solid patch behind the name and number.

| Shirt | Lettering | Read from |
| --- | --- | --- |
| NFL (`ref:nfl`) | A plate: the position letter and the number black on a white field, from 2006 (the red numbers of 1947 to 1959 and the white-on-black box of 1960 to 1978 are not drawn) | The Gridiron Uniform Database, "The Zebras Are Coming" (text); footballzebras.com, "Before they were zebras they were candy canes" |
| NCAA football (`ref:ncaa-football`) | A white plate, as the 'R' placket a college referee wears on the back; the size and colour of the plate are a reading | Wikipedia, "Official (American football)", a photo caption |
| NBA, striped (`ref:nba-classic`) | A black plate with a white number, about 1966 | An auction listing of a shirt (Lelands), through a search result: the page itself could not be opened |
| NHL, Hockey Canada, PWHL (`ref:nhl-modern-referee` and the rest of hockey) | The number alone on the stripes, black with a wide white outline; names were worn from 1977 to 1994 and numbers alone since | Wikipedia, "Official (ice hockey)" (the years); the outline is a reading |
| CFL, high school football, NCAA men's basketball, lacrosse | The number alone, black with a wide white outline: the CFL has numbers and no letters | Wikipedia, "Official (American football)" for the CFL; the outline is a reading |

The sources are texts, not pictures, and none of them describes an outline, so which league prints on the stripes and which on a patch is partly a reading, marked `unsure` in `src/presets/officials.ts`. Numbers on the sleeves are not drawn.

## Stripe widths

One drawing unit is about a fifth of an inch: the chest is about a hundred units across. A stripe repeat is body, trim, body, with the trim stripe centred on the shirt, in whole units (`5.0.10.1.5.0` is a 2 inch black stripe between 2 inch white ones). The widths follow what the sources give:

| Shirt | Stripes | Source |
| --- | --- | --- |
| NCAA football, NCAA men's basketball | 2 inch black and white (`5.0.10.1.5.0`) | Wikipedia, "Official (American football)": college stripes are two inches |
| High school football, girls' lacrosse | 1 inch (`3.0.5.1.3.0`) | Wikipedia (one inch); the Illinois High School Association handbook (girls' lacrosse one-inch stripes) |
| NFL, CFL | Uneven: a black stripe of 5 units between white ones of 9 (`4.0.5.1.5.0`) | Wikipedia says the NFL's and the CFL's patterns are uneven; the proportions are read, not published |
| NHL, PWHL, Hockey Canada, NBA's old stripes, boys' lacrosse | About 2 inch (`5.0.10.1.5.0`) | No width is published: read from photographs |
| NBA, WNBA, NCAA women's basketball | Pin-stripes on grey (`pinstripes`, a line every 5 units) | Wikipedia: light grey with thin white stripes; the spacing is read |

## The presets

Each preset says where it comes from in the comments of `src/presets/officials.ts`, and every colour, era or layout that is a reading and not a published fact is marked `// unsure:` there. A colour is this package's reading of a colour name, not a published code. In short:

| Ids | What | Sources |
| --- | --- | --- |
| `ref:nhl-modern-referee`, `-referee-zip`, `-linesman`, `-linesman-zip` | The black-and-white striped sweater of 1955 on, a black collar polo or zip; the referee has orange armbands, the linesman none | Wikipedia, "Official (ice hockey)" and "Referee (ice hockey)"; Alberta Sports Hall of Fame, "December Artifact of the Month" (the striped sweater on 29 December 1955, orange armbands by 1970) |
| `ref:hockey-canada-referee`, `ref:pwhl-referee` | The same shirt with red (Hockey Canada) or purple (PWHL) armbands | Wikipedia, "Official (ice hockey)" |
| `ref:nhl-1950s-orange`, `ref:nhl-1930s-cream` | The orange half-zip sweater of the early 1950s; the cream sweater of the 1930s to the early 1950s | Wikipedia, "Official (ice hockey)"; Alberta Sports Hall of Fame |
| `ref:nhl-1950s-candy` | Red-and-white vertical stripes with a dark collar | A photograph from the maintainer; no page that documents an NHL red-and-white sweater was found, so it is marked `unsure` |
| `ref:nba-classic`, `ref:nba-modern`, `ref:nba-summer-league`, `ref:wnba`, `ref:fiba`, `ref:euroleague`, `ref:nbl-australia`, `ref:ncaa-basketball-men`, `ref:ncaa-basketball-women` | Striped and grey basketball shirts: the NBA's grey with white pin-stripes, black sleeves and a red collar; the Summer League's black collar; the WNBA's orange; FIBA's grey and black; EuroLeague's orange; the NBL's green with black shoulders; the NCAA's stripes with black raglan sleeves (men) and grey with a light blue collar (women) | Wikipedia, "Official (basketball)"; Highsnobiety and Slate for the striped early 1950s |
| `ref:nfl`, `ref:cfl`, `ref:ncaa-football`, `ref:highschool-football`, `ref:football-1910s-white` | Gridiron officials' stripes; the CFL's solid black sleeves; the plain white shirt before the 1920s | Wikipedia, "Official (American football)" |
| `ref:soccer-black-classic`, `-red-classic`, `-green-1994`, `-burgundy-1994`, `-yellow`, `-lime`, `-coral`, `-cyan`, `-turquoise`, `-purple` | Soccer referees in their colours, with a polo collar, a chest pocket and a plain badge spot | Wikipedia, "Referee (association football)"; FootyHeadlines on the 2019 Macron UEFA Champions League kits (black, neon yellow, neon sky, neon pink), the 2022 adidas World Cup kits and the 2025-26 Puma Premier League kits (yellow, turquoise, purple, black) |
| `ref:mlb-umpire-navy`, `-navy-protector`, `-lightblue`, `-black-2000` | The navy polo of 1996 with red collar and cuffs; a plate umpire's chest protector; the light blue shirt of 1980 to 1995 with a dress collar; the black polo of the 2000 postseason | Wikipedia, "Umpire (baseball)" |
| `ref:rugby-union-yellow` | A yellow referee's shirt | Wikipedia, "Referee (rugby union)" |
| `ref:lacrosse-boys`, `ref:lacrosse-girls` | A black-and-white striped shirt with a black collar and cuffs; one-inch stripes | Illinois High School Association, Sports Officials Handbook |

Not drawn: the white cap of a gridiron referee, the side stripe and the blue half of the NBA's collar, the black trousers, and the numbers some officials wear on the sleeve.
