// NFL jerseys by era: colours, sleeve stripes, number colours, pants and helmet colours only. No helmet logos, chest wordmarks or sleeve marks.
// Colours are the usual named values of each club's colours (their brand pages and the colour boxes of their Wikipedia articles). Stripe layouts and number colours
// of the older eras are read from the "Logos and uniforms" sections of the team articles; `unsure:` marks a row where the layout or a colour could not be confirmed.
import { defineLeague } from "./core.ts";

export const NFL = defineLeague("nfl", "football", {
  cowboys: ["Dallas Cowboys", "ダラス・カウボーイズ"],
  giants: ["New York Giants", "ニューヨーク・ジャイアンツ"],
  eagles: ["Philadelphia Eagles", "フィラデルフィア・イーグルス"],
  redskins: ["Washington Redskins", "ワシントン・レッドスキンズ"],
  bostonredskins: ["Boston Redskins", "ボストン・レッドスキンズ"],
  commanders: ["Washington Commanders", "ワシントン・コマンダース"],
  bears: ["Chicago Bears", "シカゴ・ベアーズ"],
  packers: ["Green Bay Packers", "グリーンベイ・パッカーズ"],
  lions: ["Detroit Lions", "デトロイト・ライオンズ"],
  vikings: ["Minnesota Vikings", "ミネソタ・バイキングス"],
  falcons: ["Atlanta Falcons", "アトランタ・ファルコンズ"],
  panthers: ["Carolina Panthers", "カロライナ・パンサーズ"],
  saints: ["New Orleans Saints", "ニューオーリンズ・セインツ"],
  buccaneers: ["Tampa Bay Buccaneers", "タンパベイ・バッカニアーズ"],
  cardinals: ["Arizona Cardinals", "アリゾナ・カーディナルス"],
  stlcardinals: ["St. Louis Cardinals", "セントルイス・カージナルス"],
  chicagocardinals: ["Chicago Cardinals", "シカゴ・カージナルス"],
  fortyniners: ["San Francisco 49ers", "サンフランシスコ・フォーティナイナーズ"],
  rams: ["Los Angeles Rams", "ロサンゼルス・ラムズ"],
  stlrams: ["St. Louis Rams", "セントルイス・ラムズ"],
  clerams: ["Cleveland Rams", "クリーブランド・ラムズ"],
  seahawks: ["Seattle Seahawks", "シアトル・シーホークス"],
  bills: ["Buffalo Bills", "バッファロー・ビルズ"],
  dolphins: ["Miami Dolphins", "マイアミ・ドルフィンズ"],
  patriots: ["New England Patriots", "ニューイングランド・ペイトリオッツ"],
  bospatriots: ["Boston Patriots", "ボストン・ペイトリオッツ"],
  jets: ["New York Jets", "ニューヨーク・ジェッツ"],
  nytitans: ["New York Titans", "ニューヨーク・タイタンズ"],
  ravens: ["Baltimore Ravens", "ボルチモア・レイブンズ"],
  bengals: ["Cincinnati Bengals", "シンシナティ・ベンガルズ"],
  browns: ["Cleveland Browns", "クリーブランド・ブラウンズ"],
  steelers: ["Pittsburgh Steelers", "ピッツバーグ・スティーラーズ"],
  texans: ["Houston Texans", "ヒューストン・テキサンズ"],
  baltcolts: ["Baltimore Colts", "ボルチモア・コルツ"],
  colts: ["Indianapolis Colts", "インディアナポリス・コルツ"],
  jaguars: ["Jacksonville Jaguars", "ジャクソンビル・ジャガーズ"],
  oilers: ["Houston Oilers", "ヒューストン・オイラーズ"],
  titans: ["Tennessee Titans", "テネシー・タイタンズ"],
  broncos: ["Denver Broncos", "デンバー・ブロンコス"],
  chiefs: ["Kansas City Chiefs", "カンザスシティ・チーフス"],
  oakraiders: ["Oakland Raiders", "オークランド・レイダース"],
  laraiders: ["Los Angeles Raiders", "ロサンゼルス・レイダース"],
  raiders: ["Las Vegas Raiders", "ラスベガス・レイダース"],
  sdchargers: ["San Diego Chargers", "サンディエゴ・チャージャーズ"],
  chargers: ["Los Angeles Chargers", "ロサンゼルス・チャージャーズ"],
}, [
  // https://en.wikipedia.org/wiki/Dallas_Cowboys#Logos_and_uniforms
  ["cowboys", "1964-1994", "white", "fff 003594 - 003594 - ss=3 sn=1 pt=a5acaf ptt=003594 pb=3.1.2.0.3.1 he=a5acaf"],
  ["cowboys", "1964-1994", "blue", "003594 fff - fff - ss=3 sn=1 pt=a5acaf ptt=003594 pb=3.1.2.0.3.1 he=a5acaf"],
  ["cowboys", "1995-", "white", "fff 002244 869397 002244 869397 ss=3 sn=1 pt=869397 he=869397"],  // unsure: stripe colours
  ["cowboys", "1995-", "navy", "002244 869397 fff fff 869397 ss=3 pt=869397 he=869397"],  // unsure: stripe colours

  // https://en.wikipedia.org/wiki/New_York_Giants#Logos_and_uniforms
  ["giants", "1961-1974", "home", "0b2265 fff - fff - ss=2 he=0b2265"],
  ["giants", "1961-1974", "away", "fff 0b2265 - 0b2265 - ss=2 he=0b2265"],
  ["giants", "1975-1999", "home", "0b2265 fff a71930 fff - ss=4.0.3.1.3.2.3.1 sn=1 he=0b2265"],  // unsure: sleeve stripe order
  ["giants", "1975-1999", "away", "fff 0b2265 a71930 0b2265 - ss=4.0.3.1.3.2.3.1 sn=1 he=0b2265"],  // unsure: sleeve stripe order
  ["giants", "2000-", "home", "0b2265 fff a71930 fff a71930 ss=4.0.3.1.3.2.3.1 he=0b2265"],  // unsure: outline colour
  ["giants", "2000-", "away", "fff 0b2265 a71930 0b2265 a71930 ss=4.0.3.1.3.2.3.1 he=0b2265"],  // unsure: outline colour

  // https://en.wikipedia.org/wiki/Philadelphia_Eagles#Logos_and_uniforms
  ["eagles", "1960-1969", "home", "00693c fff - fff - ss=2 he=c0c0c0 pt=c0c0c0"],  // unsure: pants
  ["eagles", "1960-1969", "away", "fff 00693c - 00693c - ss=2 he=c0c0c0 pt=c0c0c0"],  // unsure: pants
  ["eagles", "1974-1995", "home", "00693c fff c0c0c0 fff - ss=3 he=00693c pt=c0c0c0"],
  ["eagles", "1974-1995", "away", "fff 00693c c0c0c0 00693c - ss=3 he=00693c pt=c0c0c0"],
  ["eagles", "1996-", "home", "004c54 a5acaf 000 fff a5acaf ss=0 he=004c54 pt=a5acaf"],
  ["eagles", "1996-", "away", "fff 004c54 a5acaf 004c54 a5acaf ss=0 he=004c54 pt=a5acaf"],

  // https://en.wikipedia.org/wiki/Washington_Commanders#Logos_and_uniforms
  ["bostonredskins", "1937-1959", "home", "5a1414 ffb612 - ffb612 - he=ffb612 pt=ffb612"],  // unsure: stripes
  ["redskins", "1972-1999", "home", "5a1414 ffb612 - ffb612 - ss=2 sn=1 he=ffb612 pt=ffb612"],
  ["redskins", "1972-1999", "away", "fff 5a1414 ffb612 5a1414 - ss=2 sn=1 he=ffb612 pt=ffb612"],
  ["redskins", "2000-2019", "home", "5a1414 ffb612 - ffb612 fff ss=2 he=5a1414 pt=ffb612"],  // unsure: outline
  ["redskins", "2000-2019", "away", "fff 5a1414 ffb612 5a1414 ffb612 ss=2 he=5a1414 pt=ffb612"],  // unsure: outline
  ["commanders", "2022-", "home", "5a1414 ffb612 - ffb612 fff ss=0 he=5a1414 pt=ffb612"],
  ["commanders", "2022-", "away", "fff 5a1414 ffb612 5a1414 ffb612 ss=0 he=5a1414 pt=fff"],

  // https://en.wikipedia.org/wiki/Chicago_Bears#Logos_and_uniforms
  ["bears", "1962-1982", "home", "0b162a c83803 fff fff - ss=3 sn=1 he=0b162a"],  // unsure: sleeve layout
  ["bears", "1962-1982", "away", "fff 0b162a c83803 0b162a - ss=3 sn=1 he=0b162a"],  // unsure: sleeve layout
  ["bears", "1983-2024", "home", "0b162a c83803 fff fff c83803 ss=3 he=0b162a"],
  ["bears", "1983-2024", "away", "fff 0b162a c83803 0b162a c83803 ss=3 he=0b162a"],

  // https://en.wikipedia.org/wiki/Green_Bay_Packers#Logos_and_uniforms
  ["packers", "1937-1949", "home", "1b2b5c ffb612 - ffb612 - ss=2 he=ffb612"],  // unsure: navy and gold years, stripes
  ["packers", "1959-1979", "home", "203731 ffb612 - fff - ss=2 sn=1 he=ffb612 pt=ffb612"],
  ["packers", "1959-1979", "away", "fff 203731 ffb612 203731 - ss=2 sn=1 he=ffb612 pt=ffb612"],
  ["packers", "1980-2019", "home", "203731 ffb612 - fff ffb612 ss=2 he=ffb612 pt=ffb612"],  // unsure: outline
  ["packers", "1980-2019", "away", "fff 203731 ffb612 203731 ffb612 ss=2 he=ffb612 pt=ffb612"],  // unsure: outline

  // https://en.wikipedia.org/wiki/Detroit_Lions#Logos_and_uniforms
  ["lions", "1960-1969", "home", "0076b6 b0b7bc fff fff - ss=2 he=b0b7bc pt=b0b7bc"],  // unsure: sleeve layout
  ["lions", "1960-1969", "away", "fff 0076b6 b0b7bc 0076b6 - ss=2 he=b0b7bc pt=b0b7bc"],  // unsure: sleeve layout
  ["lions", "1970-2002", "home", "0076b6 b0b7bc fff fff - ss=2 sn=1 he=b0b7bc pt=b0b7bc"],
  ["lions", "1970-2002", "away", "fff 0076b6 b0b7bc 0076b6 - ss=2 sn=1 he=b0b7bc pt=b0b7bc"],
  ["lions", "2003-2016", "home", "0076b6 b0b7bc 000 fff 000 ss=0 he=b0b7bc pt=b0b7bc"],
  ["lions", "2003-2016", "away", "fff 0076b6 b0b7bc 0076b6 b0b7bc ss=0 he=b0b7bc pt=b0b7bc"],

  // https://en.wikipedia.org/wiki/Minnesota_Vikings#Logos_and_uniforms
  ["vikings", "1961-1999", "home", "4f2683 ffc62f fff fff - ss=2 sn=1 he=4f2683"],  // unsure: sleeve layout
  ["vikings", "1961-1999", "away", "fff 4f2683 ffc62f 4f2683 - ss=2 sn=1 he=4f2683"],  // unsure: sleeve layout
  ["vikings", "2013-", "home", "4f2683 ffc62f fff fff ffc62f ss=0 he=4f2683"],  // unsure: outline
  ["vikings", "2013-", "away", "fff 4f2683 ffc62f 4f2683 ffc62f ss=0 he=4f2683"],  // unsure: outline

  // https://en.wikipedia.org/wiki/Atlanta_Falcons#Logos_and_uniforms
  ["falcons", "1966-1989", "red", "a71930 000 fff fff 000 ss=2 sn=1 he=000 pt=a5acaf"],  // unsure: stripes and pants
  ["falcons", "1966-1989", "white", "fff a71930 000 a71930 000 ss=2 sn=1 he=000 pt=a5acaf"],  // unsure: stripes and pants
  ["falcons", "1990-2002", "black", "000 a71930 a5acaf a71930 fff ss=0 he=000 pt=a5acaf"],  // unsure: number colours
  ["falcons", "1990-2002", "white", "fff 000 a71930 000 a71930 ss=0 he=000 pt=a5acaf"],  // unsure: number colours
  ["falcons", "2003-2019", "red", "a71930 000 fff fff 000 ss=0 he=000 pt=000"],
  ["falcons", "2003-2019", "white", "fff a71930 000 a71930 000 ss=0 he=000 pt=fff"],

  // https://en.wikipedia.org/wiki/Carolina_Panthers#Logos_and_uniforms
  ["panthers", "1995-2011", "home", "0085ca 000 bfc0bf fff 000 ss=0 he=000 pt=000"],
  ["panthers", "1995-2011", "away", "fff 000 0085ca 000 0085ca ss=0 he=000 pt=bfc0bf"],  // unsure: away pants colour
  ["panthers", "2012-", "black", "101820 0085ca bfc0bf fff 0085ca ss=0 he=000 pt=101820"],

  // https://en.wikipedia.org/wiki/New_Orleans_Saints#Logos_and_uniforms
  ["saints", "1967-1999", "home", "000 d3bc8d - d3bc8d - ss=2 sn=1 he=d3bc8d pt=d3bc8d"],  // unsure: stripes
  ["saints", "1967-1999", "away", "fff 000 d3bc8d 000 d3bc8d ss=2 sn=1 he=d3bc8d pt=d3bc8d"],  // unsure: stripes
  ["saints", "2000-", "home", "000 d3bc8d - d3bc8d - ss=0 he=d3bc8d pt=d3bc8d"],
  ["saints", "2000-", "away", "fff 000 d3bc8d 000 d3bc8d ss=0 he=d3bc8d pt=d3bc8d"],

  // https://en.wikipedia.org/wiki/Tampa_Bay_Buccaneers#Logos_and_uniforms
  ["buccaneers", "1976-1996", "white", "fff ff7900 d50a0a ff7900 d50a0a ss=2 sn=1 he=ff7900 pt=fff"],  // unsure: pants
  ["buccaneers", "1976-1996", "orange", "ff7900 fff d50a0a fff d50a0a ss=2 sn=1 he=ff7900 pt=fff"],  // unsure: pants
  ["buccaneers", "1997-2013", "home", "d50a0a 34302b 000 34302b 000 ss=0 he=34302b pt=34302b"],
  ["buccaneers", "1997-2013", "away", "fff d50a0a 34302b d50a0a 34302b ss=0 he=34302b pt=34302b"],
  ["buccaneers", "2020-", "home", "d50a0a 34302b ff7900 fff 34302b ss=0 he=34302b pt=34302b"],  // unsure: number outline

  // https://en.wikipedia.org/wiki/Arizona_Cardinals#Logos_and_uniforms
  ["chicagocardinals", "1947-1959", "home", "b2122e fff - fff - ss=3 he=fff pt=fff"],  // unsure: sleeve layout
  ["stlcardinals", "1960-1987", "home", "b2122e fff - fff - ss=2 sn=1 he=fff pt=fff"],
  ["stlcardinals", "1960-1987", "away", "fff b2122e - b2122e - ss=2 sn=1 he=fff pt=fff"],
  ["cardinals", "2005-", "home", "97233f 000 ffb612 fff 000 ss=0 he=97233f pt=fff"],  // unsure: outline
  ["cardinals", "2005-", "away", "fff 97233f 000 000 97233f ss=0 he=97233f pt=fff"],  // unsure: number colours

  // https://en.wikipedia.org/wiki/San_Francisco_49ers#Logos_and_uniforms
  ["fortyniners", "1980-1995", "home", "aa0000 b3995d fff fff - ss=2 sn=1 he=b3995d pt=b3995d"],  // unsure: sleeve layout
  ["fortyniners", "1980-1995", "away", "fff aa0000 b3995d aa0000 - ss=2 sn=1 he=b3995d pt=b3995d"],  // unsure: sleeve layout
  ["fortyniners", "2009-", "home", "aa0000 b3995d 000 fff b3995d ss=0 he=b3995d pt=b3995d"],  // unsure: number outline
  ["fortyniners", "2009-", "away", "fff aa0000 b3995d aa0000 b3995d ss=0 he=b3995d pt=b3995d"],  // unsure: number outline

  // https://en.wikipedia.org/wiki/Los_Angeles_Rams#Logos_and_uniforms
  ["clerams", "1937-1945", "home", "0b4aa5 ffd100 - ffd100 - he=ffd100"],  // unsure: blue shade and stripes
  ["rams", "1950-1972", "home", "003594 ffd100 fff fff - ss=2 sn=1 he=ffd100 pt=ffd100"],  // unsure: pants
  ["rams", "1950-1972", "away", "fff 003594 ffd100 003594 - ss=2 sn=1 he=ffd100 pt=ffd100"],
  ["rams", "1973-1999", "home", "003594 ffd100 fff fff ffd100 ss=4.0.4.1.2.2.4.1 sn=1 he=003594 pt=fff"],  // unsure: stripe layout
  ["rams", "1973-1999", "away", "fff 003594 ffd100 003594 ffd100 ss=4.0.4.1.2.2.4.1 sn=1 he=003594 pt=fff"],  // unsure: stripe layout
  ["stlrams", "2000-2016", "home", "002244 b3995d - fff b3995d ss=0 he=002244 pt=b3995d"],
  ["stlrams", "2000-2016", "away", "fff 002244 b3995d 002244 b3995d ss=0 he=002244 pt=b3995d"],
  ["rams", "2020-", "home", "003594 ffa300 fff fff ffa300 ss=0 he=003594 pt=ffa300"],  // unsure: number colours

  // https://en.wikipedia.org/wiki/Seattle_Seahawks#Logos_and_uniforms
  ["seahawks", "1976-2001", "home", "004c91 006747 c0c0c0 c0c0c0 fff ss=2 he=c0c0c0"],  // unsure: blue shade, numbers
  ["seahawks", "1976-2001", "away", "fff 004c91 006747 004c91 c0c0c0 ss=2 he=c0c0c0"],  // unsure: numbers
  ["seahawks", "2002-2011", "home", "002244 a5acaf 69be28 fff a5acaf ss=0 he=002244 pt=002244"],
  ["seahawks", "2002-2011", "away", "fff 002244 69be28 002244 a5acaf ss=0 he=002244 pt=a5acaf"],
  ["seahawks", "2012-", "home", "002244 a5acaf 69be28 fff 69be28 ss=0 he=002244 pt=002244"],
  ["seahawks", "2012-", "away", "fff 002244 69be28 002244 69be28 ss=0 he=002244 pt=002244"],
  ["seahawks", "2012-", "grey", "a5acaf 002244 69be28 002244 69be28 ss=0 he=002244 pt=a5acaf"],

  // https://en.wikipedia.org/wiki/Buffalo_Bills#Logos_and_uniforms
  ["bills", "1962-1973", "home", "00338d fff c60c30 fff - ss=2 sn=1 he=fff pt=fff"],
  ["bills", "1962-1973", "away", "fff 00338d c60c30 00338d - ss=2 sn=1 he=fff pt=fff"],
  ["bills", "1974-1983", "home", "00338d fff c60c30 fff - ss=2 sn=1 he=c60c30 pt=fff"],  // unsure: sleeve layout
  ["bills", "1984-2001", "home", "00338d fff c60c30 fff c60c30 ss=3 he=fff pt=fff"],  // unsure: sleeve layout
  ["bills", "1984-2001", "away", "fff 00338d c60c30 00338d c60c30 ss=3 he=fff pt=fff"],  // unsure: sleeve layout
  ["bills", "2011-", "home", "00338d c60c30 fff fff c60c30 ss=0 he=fff pt=fff"],

  // https://en.wikipedia.org/wiki/Miami_Dolphins#Logos_and_uniforms
  ["dolphins", "1966-1996", "white", "fff 008e97 fc4c02 008e97 - ss=4.0.3.1.3.2.3.1 sn=1 he=fff pt=fff"],  // unsure: sleeve layout
  ["dolphins", "1966-1996", "aqua", "008e97 fff fc4c02 fff - ss=4.0.3.1.3.2.3.1 sn=1 he=fff pt=fff"],  // unsure: sleeve layout
  ["dolphins", "1997-2012", "white", "fff 005778 008e97 005778 008e97 ss=0 he=fff pt=fff"],  // unsure: number outline
  ["dolphins", "1997-2012", "aqua", "008e97 005778 fc4c02 fff 005778 ss=0 he=fff pt=fff"],  // unsure: number colours
  ["dolphins", "2018-", "white", "fff 008e97 fc4c02 005778 008e97 ss=0 he=fff pt=fff"],  // unsure: number colours

  // https://en.wikipedia.org/wiki/New_England_Patriots#Logos_and_uniforms
  ["bospatriots", "1960-1992", "red", "c60c30 fff 002244 fff - ss=2 sn=1 he=fff pt=fff"],  // unsure: sleeve layout
  ["bospatriots", "1960-1992", "white", "fff c60c30 002244 c60c30 - ss=2 sn=1 he=fff pt=fff"],  // unsure: sleeve layout
  ["patriots", "1993-1999", "blue", "0c2340 b0b7bc c60c30 fff c60c30 ss=0 he=b0b7bc pt=b0b7bc"],  // unsure: blue shade
  ["patriots", "1993-1999", "white", "fff 0c2340 c60c30 0c2340 c60c30 ss=0 he=b0b7bc pt=b0b7bc"],  // unsure: blue shade
  ["patriots", "2000-", "home", "002244 c60c30 b0b7bc fff - ss=0 he=b0b7bc pt=b0b7bc"],
  ["patriots", "2000-", "away", "fff 002244 c60c30 002244 - ss=0 he=b0b7bc pt=b0b7bc"],

  // https://en.wikipedia.org/wiki/New_York_Jets#Logos_and_uniforms
  ["nytitans", "1960-1962", "home", "0b3a8e ffcc00 - fff - ss=2 he=ffcc00"],  // unsure: royal and gold, stripes
  ["jets", "1963-1977", "home", "00573c fff - fff - ss=2 sn=1 he=00573c pt=fff"],
  ["jets", "1963-1977", "away", "fff 00573c - 00573c - ss=2 sn=1 he=00573c pt=fff"],
  ["jets", "1978-1997", "home", "125740 fff - fff - ss=2 sn=1 he=125740 pt=fff"],
  ["jets", "1978-1997", "away", "fff 125740 - 125740 - ss=2 sn=1 he=125740 pt=fff"],
  ["jets", "1998-2018", "home", "003f2d fff - fff - ss=0 he=003f2d pt=fff"],
  ["jets", "1998-2018", "away", "fff 003f2d - 003f2d - ss=0 he=003f2d pt=fff"],

  // https://en.wikipedia.org/wiki/Baltimore_Ravens#Logos_and_uniforms
  ["ravens", "1996-", "home", "241773 000 9e7c0c fff 000 ss=0 he=241773 pt=000"],
  ["ravens", "1996-", "away", "fff 241773 9e7c0c 241773 000 ss=0 he=241773 pt=fff"],  // unsure: away pants
  ["ravens", "2005-", "black", "000 241773 9e7c0c 9e7c0c 241773 ss=0 he=241773 pt=000"],  // unsure: number colours

  // https://en.wikipedia.org/wiki/Cincinnati_Bengals#Logos_and_uniforms
  ["bengals", "1968-1996", "orange", "fb4f14 000 fff fff 000 ss=2 sn=1 he=fb4f14 pt=fff"],  // unsure: sleeve stripe colours
  ["bengals", "1968-1996", "white", "fff fb4f14 000 000 fb4f14 ss=2 sn=1 he=fb4f14 pt=fff"],  // unsure: sleeve stripe colours
  ["bengals", "1997-", "orange", "fb4f14 000 fff fff 000 ss=0 he=fb4f14 pt=fb4f14"],  // unsure: pants colour
  ["bengals", "1997-", "white", "fff fb4f14 000 000 fb4f14 ss=0 he=fb4f14 pt=fff"],

  // https://en.wikipedia.org/wiki/Cleveland_Browns#Logos_and_uniforms
  ["browns", "1950-1974", "brown", "311d00 ff3c00 fff fff - ss=3 sn=1 he=ff3c00 pt=fff"],  // unsure: stripe layout
  ["browns", "1950-1974", "white", "fff 311d00 ff3c00 ff3c00 311d00 ss=3 sn=1 he=ff3c00 pt=fff"],  // unsure: stripe layout
  ["browns", "1975-1995", "brown", "311d00 ff3c00 fff fff - ss=3 sn=1 he=ff3c00 pt=fff ptt=ff3c00 pb=3.1"],
  ["browns", "1975-1995", "white", "fff 311d00 ff3c00 ff3c00 311d00 ss=3 sn=1 he=ff3c00 pt=fff ptt=ff3c00 pb=3.1"],
  ["browns", "2006-2014", "orange", "ff3c00 311d00 fff fff 311d00 ss=0 he=ff3c00 pt=fff"],  // unsure: number outline
  ["browns", "2020-", "brown", "4f2c1d ff3c00 fff fff ff3c00 ss=0 he=ff3c00 pt=4f2c1d"],  // unsure: number outline

  // https://en.wikipedia.org/wiki/Pittsburgh_Steelers#Logos_and_uniforms
  ["steelers", "1933", "home", "ffb612 000 - 000 - p=h r=14.0.7.1 he=ffb612"],  // unsure: stripe widths
  ["steelers", "1936-1961", "home", "000 ffb612 fff ffb612 - ss=2 he=ffb612 pt=000"],  // unsure: sleeve layout
  ["steelers", "1966-1967", "home", "000 ffb612 - ffb612 - p=y y=s pa=1 he=000 pt=ffb612"],  // unsure: the shoulder diamond is approximated by a square yoke
  ["steelers", "1966-1967", "away", "fff ffb612 - 000 - p=y y=s pa=1 he=000 pt=ffb612"],  // unsure: the shoulder diamond is approximated by a square yoke
  ["steelers", "1968-", "home", "000 ffb612 fff ffb612 - ss=4.0.2.2.5.1.2.2 sn=1 he=000 pt=ffb612"],
  ["steelers", "1968-", "away", "fff 000 ffb612 ffb612 000 ss=4.0.2.1.5.2.2.1 sn=1 he=000 pt=ffb612"],

  // https://en.wikipedia.org/wiki/Houston_Texans#Logos_and_uniforms
  ["texans", "2002-", "home", "03202f a71930 - fff a71930 ss=0 he=03202f pt=03202f"],  // unsure: number outline
  ["texans", "2002-", "away", "fff 03202f a71930 03202f a71930 ss=0 he=03202f pt=fff"],  // unsure: number outline
  ["texans", "2003-", "red", "a71930 03202f - fff 03202f ss=0 he=03202f pt=a71930"],

  // https://en.wikipedia.org/wiki/Indianapolis_Colts#Logos_and_uniforms
  ["baltcolts", "1953-1983", "home", "00338d fff - fff - ss=2 sn=1 he=fff pt=fff"],
  ["baltcolts", "1953-1983", "away", "fff 00338d - 00338d - ss=2 sn=1 he=fff pt=fff"],
  ["colts", "2004-", "home", "002c5f a2aaad - fff - ss=2 he=fff pt=fff"],  // unsure: sleeve layout
  ["colts", "2004-", "away", "fff 002c5f a2aaad 002c5f - ss=2 he=fff pt=fff"],  // unsure: sleeve layout

  // https://en.wikipedia.org/wiki/Jacksonville_Jaguars#Logos_and_uniforms
  ["jaguars", "1995-2008", "teal", "006778 000 9f792c fff 000 ss=0 he=006778 pt=000"],  // unsure: number colours
  ["jaguars", "1995-2008", "white", "fff 006778 000 000 006778 ss=0 he=006778 pt=fff"],  // unsure: number colours
  ["jaguars", "2013-2024", "teal", "006778 101820 d7a22a fff 101820 ss=0 he=101820 pt=101820"],  // unsure: details
  ["jaguars", "2013-2024", "white", "fff 101820 006778 101820 006778 ss=0 he=101820 pt=101820"],  // unsure: details

  // https://en.wikipedia.org/wiki/Tennessee_Titans#Logos_and_uniforms
  ["oilers", "1960-1965", "red", "c8102e fff - fff - ss=2 he=fff pt=fff"],  // unsure: first Oilers uniform
  ["oilers", "1966-1996", "blue", "4b92db fff c8102e fff c8102e ss=3 sn=1 he=4b92db pt=fff ptt=c8102e pb=3.1"],
  ["oilers", "1966-1996", "white", "fff 4b92db c8102e 4b92db c8102e ss=3 sn=1 he=4b92db pt=fff ptt=c8102e pb=3.1"],
  ["titans", "1999-2017", "navy", "0c2340 4b92db c8102e fff 4b92db ss=0 he=fff pt=0c2340"],  // unsure: details
  ["titans", "1999-2017", "white", "fff 0c2340 4b92db 0c2340 4b92db ss=0 he=fff pt=fff"],  // unsure: details
  ["titans", "2018-", "navy", "0c2340 4b92db c8102e fff c8102e ss=0 he=0c2340 pt=0c2340"],  // unsure: details
  ["titans", "2018-", "white", "fff 0c2340 4b92db 0c2340 c8102e ss=0 he=0c2340 pt=fff"],  // unsure: details

  // https://en.wikipedia.org/wiki/Denver_Broncos#Logos_and_uniforms
  ["broncos", "1960-1961", "home", "e0a82e 5a3a1c - 5a3a1c - ss=0 he=5a3a1c sk=e0a82e skt=5a3a1c"],  // unsure: brown and mustard yellow, vertical sock stripes cannot be drawn
  ["broncos", "1962-1996", "orange", "fb4f14 0c2340 fff fff 0c2340 ss=3 sn=1 he=fb4f14 pt=fff"],  // unsure: sleeve layout
  ["broncos", "1962-1996", "white", "fff 0c2340 fb4f14 0c2340 fb4f14 ss=3 sn=1 he=fb4f14 pt=fff"],  // unsure: sleeve layout
  ["broncos", "1997-2023", "navy", "0c2340 fb4f14 fff fff fb4f14 ss=0 he=0c2340 pt=0c2340"],  // unsure: pants
  ["broncos", "1997-2023", "white", "fff 0c2340 fb4f14 0c2340 fb4f14 ss=0 he=0c2340 pt=fff"],
  ["broncos", "2024-", "orange", "fb4f14 0c2340 fff fff 0c2340 ss=0 he=0c2340 pt=0c2340"],  // unsure: details

  // https://en.wikipedia.org/wiki/Kansas_City_Chiefs#Logos_and_uniforms
  ["chiefs", "1963-1973", "home", "e31837 fff ffb81c fff - ss=2 sn=1 he=e31837 pt=fff"],  // unsure: sleeve layout
  ["chiefs", "1963-1973", "away", "fff e31837 ffb81c e31837 - ss=2 sn=1 he=e31837 pt=fff"],  // unsure: sleeve layout
  ["chiefs", "1974-", "home", "e31837 ffb81c fff fff - ss=2 sn=1 he=e31837 pt=fff"],  // unsure: sleeve layout
  ["chiefs", "1974-", "away", "fff e31837 ffb81c e31837 - ss=2 sn=1 he=e31837 pt=fff"],  // unsure: sleeve layout

  // https://en.wikipedia.org/wiki/Las_Vegas_Raiders#Logos_and_uniforms
  ["oakraiders", "1960-1962", "home", "000 d4af37 - d4af37 - ss=0 he=000 pt=d4af37"],  // unsure: black and gold years, details
  ["oakraiders", "1963-1981", "home", "000 a5acaf fff fff a5acaf ss=4.0.2.2.5.1.2.2 sn=1 he=a5acaf pt=a5acaf ptt=000 pb=3.1"],  // unsure: sleeve stripe order
  ["oakraiders", "1963-1981", "away", "fff 000 a5acaf 000 a5acaf ss=4.0.2.2.5.1.2.2 sn=1 he=a5acaf pt=a5acaf ptt=000 pb=3.1"],  // unsure: sleeve stripe order
  ["laraiders", "1982-1994", "home", "000 a5acaf fff fff a5acaf ss=4.0.2.2.5.1.2.2 sn=1 he=a5acaf pt=a5acaf ptt=000 pb=3.1"],
  ["oakraiders", "1995-2019", "home", "000 a5acaf fff fff a5acaf ss=4.0.2.2.5.1.2.2 sn=1 he=a5acaf pt=a5acaf ptt=000 pb=3.1"],
  ["raiders", "2020-", "away", "fff 000 a5acaf 000 a5acaf ss=4.0.2.2.5.1.2.2 sn=1 he=a5acaf pt=a5acaf ptt=000 pb=3.1"],

  // https://en.wikipedia.org/wiki/Los_Angeles_Chargers#Logos_and_uniforms
  ["sdchargers", "1961-1973", "home", "0080c6 ffc20e fff fff - ss=2 sn=1 he=fff pt=fff"],  // unsure: details
  ["sdchargers", "1961-1973", "away", "fff 0080c6 ffc20e 0080c6 - ss=2 sn=1 he=fff pt=fff"],  // unsure: details
  ["sdchargers", "1974-1987", "home", "fff 0080c6 ffc20e 0080c6 ffc20e ss=3 sn=1 he=fff pt=fff"],  // unsure: details
  ["sdchargers", "1988-2006", "home", "002a5e ffc20e 0080c6 fff ffc20e ss=0 he=002a5e pt=ffc20e"],  // unsure: details
  ["sdchargers", "1988-2006", "away", "fff 002a5e ffc20e 002a5e ffc20e ss=0 he=002a5e pt=ffc20e"],  // unsure: details
  ["sdchargers", "2007-2016", "home", "0080c6 ffc20e 002a5e fff 002a5e ss=0 he=002a5e pt=ffc20e"],
  ["chargers", "2017-", "home", "0080c6 ffc20e fff ffc20e fff ss=0 he=0080c6 pt=0080c6"],  // unsure: number outline
  ["chargers", "2017-", "away", "fff 0080c6 ffc20e 0080c6 ffc20e ss=0 he=0080c6 pt=fff"],
]);
