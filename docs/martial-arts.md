# Martial arts belts

The belt systems the package knows, as data (`BELT_SYSTEMS` in `src/beltSystems.ts`) and as this page, which is written from it by `node scripts/make-martial-arts-doc.mjs`. Each system lists its grades, what the belt looks like in a plain declarative form (a body of one or two colours, a stripe along it, a block at one end with bars across it, tags), the usual width and the ends' hang, and the pages it was read from with the day. **Sourced** means a governing body's own text was read; **lead** means a retailer's chart or a picture only, to be confirmed before it is drawn. Pictures of each belt are not here yet: they are made once the belt drawing takes these fields.

```js
import { BELT_SYSTEMS, beltSystem } from "@johnmorrisdotca/senshu-jerseys";

beltSystem("bjj-ibjjf-kids")?.grades.map((grade) => grade.name);
```

## Judo: IJF and Kodokan colours, with Judo Canada's half grades

Status: sourced. Worn at the waist; width 4 to 5 cm (usually 4.5); ends hang 20 to 30 cm from the knot (usually 25).

| Grade | Colours | Marks | Ages |
|---|---|---|---|
| 6th kyu | white | plain |  |
| 6+ kyu (half grade) | white and yellow (split lengthwise) | plain. Judo Canada's intermediate grade: two colours split lengthwise, one on each face edge. |  |
| 5th kyu | yellow | plain |  |
| 5+ kyu (half grade) | yellow and orange (split lengthwise) | plain. Judo Canada's intermediate grade: two colours split lengthwise, one on each face edge. |  |
| 4th kyu | orange | plain |  |
| 4+ kyu (half grade) | orange and green (split lengthwise) | plain. Judo Canada's intermediate grade: two colours split lengthwise, one on each face edge. |  |
| 3rd kyu | green | plain |  |
| 3+ kyu (half grade) | green and blue (split lengthwise) | plain. Judo Canada's intermediate grade: two colours split lengthwise, one on each face edge. |  |
| 2nd kyu | blue | plain |  |
| 2+ kyu (half grade) | blue and brown (split lengthwise) | plain. Judo Canada's intermediate grade: two colours split lengthwise, one on each face edge. |  |
| 1st kyu | brown | plain |  |
| 1st dan to 5th dan | black | plain. Black for 1st to 5th dan; the IJF page says 1st to 9th at first. |  |
| 6th dan to 8th dan | red and white (alternating panels) | plain. Wide alternating red and white panels (kohaku obi); Judo Canada marks the 6-7-8 dan belt as its own. |  |
| 9th dan and 10th dan | red | plain. Red belt; the IJF page says 9th and 10th dan are symbolised by a red belt (authorised for 9th dan from 1943). |  |

Customary text on the belt end:

- kanji script, kaisho lettering: judo, 'the gentle way' (a lead)
- latin script, block lettering: the wearer's surname, on one end only (IJF: one side of the belt) (from a governing body)

Notes:

- The IJF belt is 4 to 5 mm thick with ends 20 to 30 cm from the knot, worn at the waist above the hip bone.
- Half grades (two colours split lengthwise, a woven maker tag near one end) are Judo Canada's list; the IJF page dates two-tone belts for young judoka to France, 1990.
- Black is 1st to 5th dan; red and white 6th to 8th dan; red 9th and 10th dan (the IJF page and Judo Canada).

Sources:

- [IJF Judogi Rules (09 03 2022)](https://78884ca60822a34fb0e6-082b8fd5551e97bc65e327988b444396.ssl.cf3.rackcdn.com/up/2022/04/IJF_Judogi_rules_-_09_03_2022_-1649423105.pdf), read 2026-10-27 (primary): Belt thickness 4 to 5 mm; ends 20 to 30 cm from the central knot; worn on the waist above the hip bone, tied tightly; name on one side of a belt only; maker logo at one of the two edges.
- [IJF, Judo culture: the belts](https://www.ijf.org/history/judo-culture/2250), read 2026-10-27 (primary): Coloured belts from England in the mid-1920s; kyu split into white and brown in 1913 (purple for the young); red and white for 6th to 9th dan from 1931, red for 9th dan from 1943; two-tone belts introduced in France in 1990 for young judoka's intermediate grades.
- [Judo Canada, Grading](https://judocanada.org/grading/), read 2026-10-27 (primary): Kyu sequence with half grades: white, white-yellow, yellow, yellow-orange, orange, orange-green, green, green-blue, blue, blue-brown, brown; dan from black, ten degrees; 6-7-8 dan and 9-10 dan belts differ from black.
- [John's reference: 'Martial arts belt ranks' chart (picture, Dropbox belt-stripes)](dropbox:/Projects/Resources/senshu-jerseys/belt-stripes/2026-10-28-martial-arts-belt-ranks-by-art.png), read 2026-10-27 (lead): Aikido, BJJ, capoeira, ju-jutsu, ITF taekwondo, shotokan karate, krav maga and judo belt orders as an infographic; a lead, unsourced.

## Judo: British Judo Association mon grades (juniors, 8 to 17)

Status: sourced. Worn at the waist; width 3.5 to 5 cm (usually 4); ends hang 20 to 30 cm from the knot (usually 25).

| Grade | Colours | Marks | Ages |
|---|---|---|---|
| 1st mon | red | 1 yellow tag round the belt near one end | 8 to 17 |
| 2nd mon | red | 2 yellow tags round the belt near one end | 8 to 17 |
| 3rd mon | red | 3 yellow tags round the belt near one end | 8 to 17 |
| 4th mon | yellow | 1 red tag round the belt near one end | 8 to 17 |
| 5th mon | yellow | 2 red tags round the belt near one end | 8 to 17 |
| 6th mon | yellow | 3 red tags round the belt near one end | 8 to 17 |
| 7th mon | orange | 1 red tag round the belt near one end | 8 to 17 |
| 8th mon | orange | 2 red tags round the belt near one end | 8 to 17 |
| 9th mon | orange | 3 red tags round the belt near one end | 8 to 17 |
| 10th mon | green | 1 red tag round the belt near one end | 8 to 17 |
| 11th mon | green | 2 red tags round the belt near one end | 8 to 17 |
| 12th mon | green | 3 red tags round the belt near one end | 8 to 17 |
| 13th mon | blue | 1 red tag round the belt near one end | 8 to 17 |
| 14th mon | blue | 2 red tags round the belt near one end | 8 to 17 |
| 15th mon | blue | 3 red tags round the belt near one end | 8 to 17 |
| 16th mon | brown | 1 red tag round the belt near one end | 8 to 17 |
| 17th mon | brown | 2 red tags round the belt near one end | 8 to 17 |
| 18th mon | brown | 3 red tags round the belt near one end | 8 to 17 |

Customary text on the belt end:

- latin script, block lettering (a lead)

Notes:

- Each tag is a small band sewn round the belt near one end; mon 1 to 3 carry yellow tags on a red belt, every later colour red tags.
- Widths and hang are the IJF's, which the BJA's mon belt is not stated to differ from.

Sources:

- [British Judo Association, Mon Grade Promotion Syllabus (Dec 2024)](https://britishjudo.org.uk/wp-content/uploads/2024/12/Mon-Grade-Promotion-Syllabus-Dec-2024.pdf), read 2026-10-27 (primary): The 18 mon grades: red belt with 1 to 3 yellow tags, yellow, orange, green, blue and brown belts each with 1 to 3 red tags; ages 8 to 17 (page on the BJA site).
- [British Judo Association, Mon Grade Scheme](https://www.britishjudo.org.uk/get-started/grading/mon-grade-scheme/), read 2026-10-27 (primary): Aimed at 8 to 17 year olds; 18 grades, each a different coloured belt and/or belt tag(s).

## Brazilian jiu-jitsu: IBJJF belts for ages 4 to 15

Status: sourced. Worn at the waist; width 2.5 to 3.5 cm (usually 3); ends hang 20 to 30 cm from the knot (usually 25).

| Grade | Colours | Marks | Ages |
|---|---|---|---|
| White | white | black block 10 cm long, 2.5 cm from the end, up to 4 white bars across it | any |
| Grey and white | grey | white stripe along the whole belt; black block 10 cm long, 2.5 cm from the end, up to 3 white bars across it | 4 to 15 |
| Grey | grey | black block 10 cm long, 2.5 cm from the end, up to 3 white bars across it | 4 to 15 |
| Grey and black | grey | black stripe along the whole belt; black block 10 cm long, 2.5 cm from the end, up to 3 white bars across it | 4 to 15 |
| Yellow and white | yellow | white stripe along the whole belt; black block 10 cm long, 2.5 cm from the end, up to 3 white bars across it | 7 to 15 |
| Yellow | yellow | black block 10 cm long, 2.5 cm from the end, up to 3 white bars across it | 7 to 15 |
| Yellow and black | yellow | black stripe along the whole belt; black block 10 cm long, 2.5 cm from the end, up to 3 white bars across it | 7 to 15 |
| Orange and white | orange | white stripe along the whole belt; black block 10 cm long, 2.5 cm from the end, up to 3 white bars across it | 10 to 15 |
| Orange | orange | black block 10 cm long, 2.5 cm from the end, up to 3 white bars across it | 10 to 15 |
| Orange and black | orange | black stripe along the whole belt; black block 10 cm long, 2.5 cm from the end, up to 3 white bars across it | 10 to 15 |
| Green and white | green | white stripe along the whole belt; black block 10 cm long, 2.5 cm from the end, up to 3 white bars across it | 13 to 15 |
| Green | green | black block 10 cm long, 2.5 cm from the end, up to 3 white bars across it | 13 to 15 |
| Green and black | green | black stripe along the whole belt; black block 10 cm long, 2.5 cm from the end, up to 3 white bars across it | 13 to 15 |

Customary text on the belt end:

- latin script, block lettering (a lead)

Notes:

- Each colour has three belts: all of it, with a white stripe down the whole length, or with a black one (grey and white, grey, grey and black; likewise yellow, orange, green).
- A black bar of about 10 cm sits 2 to 3 cm from one end; degrees are bars across it (the IBJJF suggests three or four a belt for the kids; the bar colour on the kids' belts is white, from the references).
- Hang is not given by the IBJJF text read; 20 to 30 cm is the usual and the IJF's figure for a judo belt.

Sources:

- [IBJJF General System of Graduation, v2.0 (2015), French edition hosted by the CFJJB](https://cfjjb.com/images/rules2022/general-graduation-system-french.pdf), read 2026-10-27 (primary): Belt lists for 4 to 15 and 16 and over; belt widths; the black bar of about 10 cm 2 to 3 cm from an end; the red bar of the black belt, white bars at its ends, up to 6 degrees; coral belts' white bar of about 15 cm with silver bars, the red belt's with gold bars of 2 cm; minimum ages; the kids' degree suggestions.
- [IBJJF, Graduation system](https://ibjjf.com/graduation-system), read 2026-10-27 (primary): Says the system unifies the teaching and competition of jiu-jitsu from white to red, with three suggested kids' degree systems (monthly, triannual, quarterly).
- [John's references: black belt with tip bars (pictures)](dropbox:/Projects/Resources/senshu-jerseys/belt-stripes/2026-10-28-black-tip-red-bars-degrees.png), read 2026-10-27 (lead): Black belts sold with red or white bars across them (martial-arts supplier); a lead.

## Brazilian jiu-jitsu: IBJJF belts for 16 and over

Status: sourced. Worn at the waist; width 3.5 to 4.5 cm (usually 4); ends hang 20 to 30 cm from the knot (usually 25).

| Grade | Colours | Marks | Ages |
|---|---|---|---|
| White | white | black block 10 cm long, 2.5 cm from the end, up to 4 white bars across it | any |
| Blue | blue | black block 10 cm long, 2.5 cm from the end, up to 4 white bars across it | 16 and over |
| Purple | purple | black block 10 cm long, 2.5 cm from the end, up to 4 white bars across it | 16 and over |
| Brown | brown | black block 10 cm long, 2.5 cm from the end, up to 4 white bars across it | 18 and over |
| Black | black | red block 10 cm long, 2.5 cm from the end, up to 6 white bars across it. Red bar with a white bar at each of its ends; up to 6 degrees as white bars on the red. | 19 and over |
| Red and black (7th degree) | red and black (alternating panels) | white block 15 cm long, 2.5 cm from the end, up to 2 red bars across it. Panels of 20 cm in turn; a white bar of about 15 cm bounded by two silver bars; degrees marked in red. | 50 and over |
| Red and white (8th degree) | red and white (alternating panels) | white block 15 cm long, 2.5 cm from the end, up to 2 red bars across it. Panels of 20 cm in turn; the same white bar bounded by silver bars; degrees in red. | 57 and over |
| Red (9th and 10th degree) | red | white block 15 cm long, 2.5 cm from the end, up to 2 red bars across it. A white bar of about 15 cm bounded by two gold bars of 2 cm; degrees in red. | 67 and over |

Customary text on the belt end:

- latin script, block lettering (a lead)

Notes:

- White to brown carry a black bar of about 10 cm; up to four degrees as white bars across it (the system text divides each into 4 degrees).
- The black belt has a red bar of about 10 cm with a white bar at each end, up to 6 degrees; 7th and 8th degrees are coral belts (red and black, red and white panels of 20 cm) with a white bar of about 15 cm; 9th and 10th degrees are red with gold bars of 2 cm.

Sources:

- [IBJJF General System of Graduation, v2.0 (2015), French edition hosted by the CFJJB](https://cfjjb.com/images/rules2022/general-graduation-system-french.pdf), read 2026-10-27 (primary): Belt lists for 4 to 15 and 16 and over; belt widths; the black bar of about 10 cm 2 to 3 cm from an end; the red bar of the black belt, white bars at its ends, up to 6 degrees; coral belts' white bar of about 15 cm with silver bars, the red belt's with gold bars of 2 cm; minimum ages; the kids' degree suggestions.
- [John's references: black belt with tip bars (pictures)](dropbox:/Projects/Resources/senshu-jerseys/belt-stripes/2026-10-28-black-tip-red-bars-degrees.png), read 2026-10-27 (lead): Black belts sold with red or white bars across them (martial-arts supplier); a lead.

## Taekwon-do: ITF colour belts with tips

Status: partly. Worn at the hips; width 4 to 5 cm (usually 4.5); ends hang 20 to 40 cm from the knot (usually 30).

| Grade | Colours | Marks | Ages |
|---|---|---|---|
| White (10th gup) | white | plain |  |
| White, yellow tip (9th gup) | white | 1 yellow tip at the end |  |
| Yellow (8th gup) | yellow | plain |  |
| Yellow, green tip (7th gup) | yellow | 1 green tip at the end |  |
| Green (6th gup) | green | plain |  |
| Green, blue tip (5th gup) | green | 1 blue tip at the end |  |
| Blue (4th gup) | blue | plain |  |
| Blue, red tip (3rd gup) | blue | 1 red tip at the end |  |
| Red (2nd gup) | red | plain |  |
| Red, black tip (1st gup) | red | 1 black tip at the end |  |
| Black (1st to 9th degree) | black | plain. The ITF page lists black for 1st to 9th degree and says nothing of marks on it; a black belt with gold dan bars is common (lead, from the references). |  |

Customary text on the belt end:

- hangul script, gothic lettering: taekwondo (the way of the foot and fist) (a lead)
- latin script, block lettering (a lead)

Notes:

- Ten gup belts (the odd ones carry a tip of the next colour) and black for 1st to 9th degree; the ITF page gives colours only, with no length or width.
- Taekwondo belts are usually longer than a judo belt and worn at the hips over a v-neck dobok (lead: retailer practice); the hang range is an estimate to confirm.
- World Taekwondo and Kukkiwon set dan and poom, not colour belts (schools choose): see the notes in docs/martial-arts.md.

Sources:

- [ITF Taekwon-Do, Belt colour meanings](https://www.itftaekwondo.com/belt-colour-meanings/), read 2026-10-27 (primary): The tip system: white, white with yellow tip (9th gup), yellow, yellow with green tip, green, green with blue tip, blue, blue with red tip, red, red with black tip (1st gup), black 1st to 9th degree.
- [John's reference: 'Martial arts belt ranks' chart (picture, Dropbox belt-stripes)](dropbox:/Projects/Resources/senshu-jerseys/belt-stripes/2026-10-28-martial-arts-belt-ranks-by-art.png), read 2026-10-27 (lead): Aikido, BJJ, capoeira, ju-jutsu, ITF taekwondo, shotokan karate, krav maga and judo belt orders as an infographic; a lead, unsourced.

## Karate: WKF competition belts (aka red, ao blue)

Status: sourced. Worn at the waist; width 4.5 to 5.5 cm (usually 5); ends hang 15 to 40 cm from the knot (usually 15).

| Grade | Colours | Marks | Ages |
|---|---|---|---|
| Aka (red) | red | plain |  |
| Ao (blue) | blue | plain |  |

Customary text on the belt end:

- kanji script, kaisho lettering: karate, 'empty hand' (a lead)

Notes:

- Belts of grade are not worn in a WKF bout; the red and blue belts are plain, about 5 cm wide, with 15 cm free each side of the knot and no longer than three-quarters thigh length.
- The JKA states 10 kyu and 10 dan; its page gave no colour chart (and was unavailable when read).

Sources:

- [WKF Kumite Competition Rules 2024 (as hosted by the Finnish Karate Federation)](https://karateliitto.fi/app/uploads/2024/02/WKF_Kumite_Competition_Rules_2024.pdf), read 2026-10-27 (primary): A contestant wears one red belt (aka) or blue belt (ao), plain, with no embroidery or marks beyond the maker's label; belts of grade are not worn in the bout; about 5 cm wide, 15 cm free each side of the knot, no longer than three-quarters thigh length.
- [JKA, DAN Ranking](https://jka.or.jp/en/about-jka/dan-ranking/), read 2026-10-27 (primary): 10 kyu and 10 dan; the page was unavailable when read (HTTP 503): the figures are from a search result's summary of it, to confirm.

## Karate: common kyu and dan belts with bars (a lead, style by style)

Status: lead. Worn at the waist; width 4 to 5 cm (usually 4.5); ends hang 20 to 45 cm from the knot (usually 30).

| Grade | Colours | Marks | Ages |
|---|---|---|---|
| 9th kyu | white | plain |  |
| 8th kyu | yellow | plain |  |
| 7th kyu | orange | plain |  |
| 6th kyu | green | plain |  |
| 5th kyu | blue | plain |  |
| 4th kyu | purple | plain |  |
| 3rd kyu | brown | plain |  |
| 2nd kyu | brown | plain |  |
| 1st kyu | brown | plain |  |
| 1st dan | black | black block 8 cm long, 1 cm from the end, up to 1 gold bars across it |  |
| 2nd dan | black | black block 8 cm long, 1 cm from the end, up to 2 gold bars across it |  |
| 3rd dan | black | black block 8 cm long, 1 cm from the end, up to 3 gold bars across it |  |
| 4th dan | black | black block 8 cm long, 1 cm from the end, up to 4 gold bars across it |  |
| 5th dan | black | black block 8 cm long, 1 cm from the end, up to 5 gold bars across it |  |
| 6th dan | black | black block 8 cm long, 1 cm from the end, up to 6 gold bars across it |  |
| 7th dan | black | black block 8 cm long, 1 cm from the end, up to 7 gold bars across it |  |

Customary text on the belt end:

- kanji script, kaisho lettering: karate-do, 'the way of the empty hand' (a lead)

Notes:

- Colours differ by style and by dojo: the chart in the references is shotokan-like (white to brown), with brown carrying 1 to 3 bars and black 1 to 7 bars across one end. None of it is read from a style body yet.
- Karate belts are usually longer than a judo belt's ends (references: kyokushin gi), hence the larger hang.

Sources:

- [John's reference: karate belt ranking (picture, social media)](dropbox:/Projects/Resources/senshu-jerseys/belt-stripes/2026-10-28-karate-kyu-dan-bars.png), read 2026-10-27 (lead): Nine kyu from white to brown (brown with 1 to 3 bars), dan belts black with 1 to 7 bars across one end; a lead, unsourced.
- [John's reference: 'Martial arts belt ranks' chart (picture, Dropbox belt-stripes)](dropbox:/Projects/Resources/senshu-jerseys/belt-stripes/2026-10-28-martial-arts-belt-ranks-by-art.png), read 2026-10-27 (lead): Aikido, BJJ, capoeira, ju-jutsu, ITF taekwondo, shotokan karate, krav maga and judo belt orders as an infographic; a lead, unsourced.
- [JKA, DAN Ranking](https://jka.or.jp/en/about-jka/dan-ranking/), read 2026-10-27 (primary): 10 kyu and 10 dan; the page was unavailable when read (HTTP 503): the figures are from a search result's summary of it, to confirm.

## Aikido, ju-jutsu, capoeira, krav maga (leads only)

Status: lead. Worn at the waist; width 4 to 5 cm (usually 4.5); ends hang 20 to 30 cm from the knot (usually 25).

| Grade | Colours | Marks | Ages |
|---|---|---|---|
| 6th kyu | white | plain |  |
| 5th kyu | yellow | plain |  |
| 4th kyu | orange | plain |  |
| 3rd kyu | green | plain |  |
| 2nd kyu | blue | plain |  |
| 1st kyu | brown | plain |  |
| 1st dan and up | black | plain |  |

Notes:

- The chart in the references shows aikido and ju-jutsu on the six-kyu colours (white, yellow, orange, green, blue, brown) with black for dan, ju-jutsu's 6th to 8th dan red and white, 9th and 10th red; capoeira's cordas (white, yellow, orange, blue, green, purple, brown, black) and krav maga's levels (white, yellow, orange, green, blue, brown, black).
- Nothing here is read from a governing body: aikido's main bodies use white and black only with a hakama, and a cord belt (capoeira) is a different object. Not drawn until sourced.

Sources:

- [John's reference: 'Martial arts belt ranks' chart (picture, Dropbox belt-stripes)](dropbox:/Projects/Resources/senshu-jerseys/belt-stripes/2026-10-28-martial-arts-belt-ranks-by-art.png), read 2026-10-27 (lead): Aikido, BJJ, capoeira, ju-jutsu, ITF taekwondo, shotokan karate, krav maga and judo belt orders as an infographic; a lead, unsourced.
