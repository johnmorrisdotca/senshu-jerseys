// CFL jerseys by era, and a few national-team looks (`IFAF`). Colours, sleeve stripes, number colours, pants and helmet colours only: no helmet logos, chest wordmarks or sleeve marks.
// Wikipedia's club articles give the colours and years but almost no stripe layouts, so the layouts below are the usual ones and every guess says `unsure:`.
import { defineLeague } from "./core.ts";

export const CFL = defineLeague("cfl", "football", {
  argonauts: ["Toronto Argonauts", "トロント・アルゴノーツ"],
  tigercats: ["Hamilton Tiger-Cats", "ハミルトン・タイガーキャッツ"],
  bluebombers: ["Winnipeg Blue Bombers", "ウィニペグ・ブルーボンバーズ"],
  roughriders: ["Saskatchewan Roughriders", "サスカチュワン・ラフライダーズ"],
  stampeders: ["Calgary Stampeders", "カルガリー・スタンピーダーズ"],
  elks: ["Edmonton Elks", "エドモントン・エルクス"],
  eskimos: ["Edmonton Eskimos", "エドモントン・エスキモーズ"],
  lions: ["BC Lions", "BCライオンズ"],
  ottawa: ["Ottawa Rough Riders", "オタワ・ラフライダーズ"],
  redblacks: ["Ottawa Redblacks", "オタワ・レッドブラックス"],
  alouettes: ["Montreal Alouettes", "モントリオール・アルエッツ"],
  concordes: ["Montreal Concordes", "モントリオール・コンコルド"],
  stallions: ["Baltimore Stallions", "ボルチモア・スタリオンズ"],
  pirates: ["Shreveport Pirates", "シュリーブポート・パイレーツ"],
}, [
  // https://en.wikipedia.org/wiki/Toronto_Argonauts#History (double blue: Cambridge blue and Oxford blue)
  ["argonauts", "1950s", "home", "0b2d62 5cb3e0 fff fff 5cb3e0 ss=3 he=0b2d62 pt=fff"],  // unsure: double blue layout
  ["argonauts", "1950s", "away", "fff 0b2d62 5cb3e0 0b2d62 - ss=3 he=0b2d62 pt=fff"],  // unsure: double blue layout
  ["argonauts", "1970s", "home", "5cb3e0 0b2d62 fff fff 0b2d62 ss=2 sn=1 he=0b2d62 pt=fff"],  // unsure: which blue is the body
  ["argonauts", "1970s", "away", "fff 0b2d62 5cb3e0 0b2d62 5cb3e0 ss=2 sn=1 he=0b2d62 pt=fff"],  // unsure
  ["argonauts", "1996-2015", "home", "0b2d62 5cb3e0 fff fff 5cb3e0 ss=2 he=5cb3e0 pt=0b2d62"],  // unsure: details
  ["argonauts", "1996-2015", "away", "fff 0b2d62 5cb3e0 0b2d62 5cb3e0 ss=2 he=5cb3e0 pt=fff"],  // unsure: details
  ["argonauts", "2016-", "home", "5cb3e0 0b2d62 fff fff 0b2d62 ss=0 he=5cb3e0 pt=0b2d62"],  // unsure: details
  ["argonauts", "2016-", "away", "fff 0b2d62 5cb3e0 0b2d62 5cb3e0 ss=0 he=5cb3e0 pt=fff"],  // unsure: details

  // https://en.wikipedia.org/wiki/Hamilton_Tiger-Cats#Logos_and_uniforms (black and gold)
  ["tigercats", "1960s", "home", "fdb913 000 fff 000 - ss=2 sn=1 he=000 pt=000"],  // unsure: gold home jersey
  ["tigercats", "1960s", "away", "fff 000 fdb913 000 - ss=2 sn=1 he=000 pt=000"],  // unsure
  ["tigercats", "1980s", "home", "000 fdb913 fff fdb913 - ss=2 he=000 pt=fdb913"],  // unsure: black home jersey
  ["tigercats", "1980s", "away", "fff 000 fdb913 000 fdb913 ss=2 he=000 pt=fdb913"],  // unsure
  ["tigercats", "2010-", "home", "000 fdb913 - fdb913 - ss=0 he=000 pt=000"],  // unsure: details
  ["tigercats", "2010-", "away", "fff 000 fdb913 000 fdb913 ss=0 he=000 pt=000"],  // unsure: details

  // https://en.wikipedia.org/wiki/Winnipeg_Blue_Bombers#Logos_and_uniforms (blue and gold)
  ["bluebombers", "1960s", "home", "0033a0 ffb81c fff fff ffb81c ss=2 sn=1 he=ffb81c pt=fff"],  // unsure: helmet colour
  ["bluebombers", "1960s", "away", "fff 0033a0 ffb81c 0033a0 ffb81c ss=2 sn=1 he=ffb81c pt=fff"],
  ["bluebombers", "1980s", "home", "0033a0 ffb81c fff ffb81c fff ss=3 sn=1 he=0033a0 pt=ffb81c"],  // unsure: stripe layout
  ["bluebombers", "1980s", "away", "fff 0033a0 ffb81c 0033a0 ffb81c ss=3 sn=1 he=0033a0 pt=ffb81c"],  // unsure: stripe layout
  ["bluebombers", "2000-", "home", "003594 ffb81c - ffb81c fff ss=0 he=003594 pt=003594"],  // unsure: details
  ["bluebombers", "2000-", "away", "fff 003594 ffb81c 003594 ffb81c ss=0 he=003594 pt=fff"],  // unsure: details

  // https://en.wikipedia.org/wiki/Saskatchewan_Roughriders#Logos_and_uniforms (green and white since 1948, red and black before)
  ["roughriders", "1924-1947", "home", "c8102e 000 - fff - ss=2 he=000 pt=000"],  // unsure: red and black Regina Roughriders
  ["roughriders", "1924-1947", "away", "fff c8102e 000 c8102e - ss=2 he=000 pt=000"],  // unsure
  ["roughriders", "1948-1984", "home", "00693c fff - fff - ss=3 sn=1 he=00693c pt=fff"],  // unsure: sleeve layout
  ["roughriders", "1948-1984", "away", "fff 00693c - 00693c - ss=3 sn=1 he=00693c pt=fff"],  // unsure: sleeve layout
  ["roughriders", "1985-2004", "home", "00693c fff 000 fff c0c0c0 ss=2 he=00693c pt=c0c0c0"],  // unsure: silver and black added in 1985
  ["roughriders", "1985-2004", "away", "fff 00693c 000 00693c c0c0c0 ss=2 he=00693c pt=c0c0c0"],  // unsure
  ["roughriders", "2005-", "home", "00693c fff - fff - ss=0 he=00693c pt=00693c"],  // unsure: details
  ["roughriders", "2005-", "away", "fff 00693c - 00693c - ss=0 he=00693c pt=fff"],  // unsure: details

  // https://en.wikipedia.org/wiki/Calgary_Stampeders#Logos_and_uniforms (red and white)
  ["stampeders", "1960s", "home", "c8102e fff - fff - ss=2 sn=1 he=c8102e pt=fff"],  // unsure: details
  ["stampeders", "1960s", "away", "fff c8102e - c8102e - ss=2 sn=1 he=c8102e pt=fff"],  // unsure: details
  ["stampeders", "1990s", "home", "c8102e 000 fff fff 000 ss=3 he=fff pt=c8102e"],  // unsure: helmet and pants
  ["stampeders", "1990s", "away", "fff c8102e 000 c8102e 000 ss=3 he=fff pt=fff"],  // unsure
  ["stampeders", "2010-", "home", "c8102e fff - fff - ss=0 he=fff pt=c8102e"],  // unsure: details
  ["stampeders", "2010-", "away", "fff c8102e - c8102e - ss=0 he=fff pt=fff"],  // unsure: details

  // https://en.wikipedia.org/wiki/Edmonton_Elks#Logos_and_uniforms (green, gold and white)
  ["eskimos", "1970s", "home", "00573c ffb81c fff ffb81c - ss=3 sn=1 he=00573c pt=fff"],  // unsure: sleeve layout
  ["eskimos", "1970s", "away", "fff 00573c ffb81c 00573c ffb81c ss=3 sn=1 he=00573c pt=fff"],  // unsure: sleeve layout
  ["eskimos", "1990s", "home", "00573c ffb81c fff ffb81c fff ss=2 he=00573c pt=ffb81c"],  // unsure: details
  ["eskimos", "1990s", "away", "fff 00573c ffb81c 00573c ffb81c ss=2 he=00573c pt=ffb81c"],  // unsure: details
  ["eskimos", "2012-2020", "home", "00573c ffb81c fff ffb81c fff ss=0 he=00573c pt=00573c"],  // unsure: details
  ["elks", "2021-", "home", "00573c ffb81c fff ffb81c - ss=0 he=00573c pt=00573c"],  // unsure: details
  ["elks", "2021-", "away", "fff 00573c ffb81c 00573c ffb81c ss=0 he=00573c pt=fff"],  // unsure: details

  // https://en.wikipedia.org/wiki/BC_Lions#Logos_and_uniforms (black and orange from the Meralomas, orange and white before 1990)
  ["lions", "1954-1989", "home", "f58220 000 fff 000 - ss=3 sn=1 he=f58220 pt=fff"],  // unsure: black-white-black stripes
  ["lions", "1954-1989", "away", "fff f58220 000 f58220 000 ss=3 sn=1 he=f58220 pt=fff"],  // unsure
  ["lions", "1990-1994", "home", "000 c0c0c0 f58220 fff - ss=2 he=c0c0c0 pt=c0c0c0"],  // unsure: black, silver helmets and pants
  ["lions", "1990-1994", "away", "fff 000 c0c0c0 000 - ss=2 he=c0c0c0 pt=c0c0c0"],  // unsure
  ["lions", "2005-2024", "home", "f58220 000 fff fff 000 ss=0 he=f58220 pt=000"],  // unsure: details
  ["lions", "2005-2024", "away", "fff f58220 000 000 f58220 ss=0 he=f58220 pt=fff"],  // unsure: details

  // https://en.wikipedia.org/wiki/Ottawa_Rough_Riders#Logos_and_uniforms (red and black, black helmet)
  ["ottawa", "1950s", "home", "c8102e 000 fff fff 000 ss=2 he=000 pt=fff"],  // unsure: stripes
  ["ottawa", "1950s", "away", "fff c8102e 000 c8102e 000 ss=2 he=000 pt=fff"],  // unsure: stripes
  ["ottawa", "1975-1991", "home", "c8102e 000 fff fff 000 ss=3 sn=1 he=000 pt=fff"],  // unsure: sleeve layout
  ["ottawa", "1975-1991", "away", "fff c8102e 000 c8102e 000 ss=3 sn=1 he=000 pt=fff"],  // unsure: sleeve layout
  ["ottawa", "1992-1993", "home", "c8102e c0c0c0 000 fff 000 ss=2 he=000 pt=c0c0c0"],  // unsure: red, black and silver
  ["ottawa", "1994-1995", "home", "0b1f4f c8102e d4af37 fff d4af37 ss=2 he=0b1f4f pt=0b1f4f"],  // unsure: dark navy, red and gold
  ["redblacks", "2014-", "home", "c8102e 000 fff fff 000 ss=0 he=000 pt=000"],  // unsure: details
  ["redblacks", "2014-", "away", "fff c8102e 000 c8102e 000 ss=0 he=000 pt=fff"],  // unsure: details

  // https://en.wikipedia.org/wiki/Montreal_Alouettes#Logos_and_uniforms (first club 1946-1981; second club 1996-)
  ["alouettes", "1946-1981", "home", "1c3f94 c8102e fff fff c8102e ss=3 sn=1 he=1c3f94 pt=fff"],  // unsure: colours and layout of the first club
  ["alouettes", "1946-1981", "away", "fff 1c3f94 c8102e 1c3f94 c8102e ss=3 sn=1 he=1c3f94 pt=fff"],  // unsure
  ["alouettes", "1996-2011", "home", "c8102e 0c2340 fff fff 0c2340 ss=2 he=0c2340 pt=fff"],  // unsure: details
  ["alouettes", "1996-2011", "away", "fff c8102e 0c2340 c8102e 0c2340 ss=2 he=0c2340 pt=fff"],  // unsure: details
  ["alouettes", "2012-", "home", "c8102e 0c2340 c0c0c0 fff 0c2340 ss=0 he=0c2340 pt=c8102e"],  // unsure: details
  ["alouettes", "2012-", "away", "fff c8102e 0c2340 c8102e 0c2340 ss=0 he=0c2340 pt=fff"],  // unsure: details

  // https://en.wikipedia.org/wiki/Montreal_Concordes (renamed Alouettes, 1982-1986)
  ["concordes", "1982-1985", "home", "1d4fa0 fff c8102e fff - ss=2 he=fff pt=fff"],  // unsure: colours
  ["concordes", "1982-1985", "away", "fff 1d4fa0 c8102e 1d4fa0 - ss=2 he=fff pt=fff"],  // unsure

  // https://en.wikipedia.org/wiki/Baltimore_Stallions (1994-1995) and https://en.wikipedia.org/wiki/Shreveport_Pirates (1994-1995)
  ["stallions", "1994-1995", "home", "00a79d 000 c0c0c0 fff 000 ss=0 he=000 pt=c0c0c0"],  // unsure: teal, black and silver
  ["stallions", "1994-1995", "away", "fff 00a79d 000 000 00a79d ss=0 he=000 pt=c0c0c0"],  // unsure
  ["pirates", "1994-1995", "home", "000 d4af37 c0c0c0 fff d4af37 ss=0 he=000 pt=000"],  // unsure: colours
]);

// National teams of the IFAF. Only the team colours are sourced (the Wikipedia infoboxes); the layouts are plain.
export const IFAF = defineLeague("ifaf", "football", {
  canada: ["Canada", "カナダ代表"],
  usa: ["United States", "アメリカ代表"],
  japan: ["Japan", "日本代表"],
  mexico: ["Mexico", "メキシコ代表"],
  germany: ["Germany", "ドイツ代表"],
}, [
  // https://en.wikipedia.org/wiki/Canada_national_American_football_team
  ["canada", "2000s", "home", "d52b1e fff - fff - ss=2 he=d52b1e pt=fff"],  // unsure: layout, only the colours red and white are sourced
  ["canada", "2000s", "away", "fff d52b1e - d52b1e - ss=2 he=d52b1e pt=fff"],  // unsure: layout
  // https://en.wikipedia.org/wiki/United_States_national_American_football_team
  ["usa", "2000s", "home", "0a2a66 fff b22234 fff b22234 ss=2 he=0a2a66 pt=fff"],  // unsure: layout, only the colours red, white and blue are sourced
  ["usa", "2000s", "away", "fff 0a2a66 b22234 0a2a66 b22234 ss=2 he=0a2a66 pt=fff"],  // unsure: layout
  // https://en.wikipedia.org/wiki/Japan_national_American_football_team
  ["japan", "2000s", "home", "c8102e fff - fff - ss=2 he=c8102e pt=fff"],  // unsure: layout, only red and white are sourced
  ["japan", "2000s", "away", "fff c8102e - c8102e - ss=2 he=c8102e pt=fff"],  // unsure: layout
  // https://en.wikipedia.org/wiki/Mexico_national_American_football_team
  ["mexico", "2000s", "home", "006847 fff ce1126 fff - ss=2 he=006847 pt=fff"],  // unsure: layout, only green, white and red are sourced
  ["mexico", "2000s", "away", "fff 006847 ce1126 006847 - ss=2 he=006847 pt=fff"],  // unsure: layout
  // https://en.wikipedia.org/wiki/Germany_national_American_football_team
  ["germany", "2000s", "home", "000 dd0000 ffce00 fff - ss=2 he=000 pt=000"],  // unsure: layout, only black, red and yellow are sourced
  ["germany", "2000s", "away", "fff 000 dd0000 000 - ss=2 he=000 pt=000"],  // unsure: layout
]);
