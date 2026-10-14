// National Basketball Association and the ABA clubs whose looks are known by colours: the tank cut, home (white) and away. Colours, trim and number colours only;
// the chest stays empty (no wordmark, no crest, no city name). co= r round, v v-neck; pa=1 side panels in the trim colour; cb= bands across the chest; p=p pinstripes.
import { defineLeague } from "./core.ts";

export const NBA = defineLeague("nba", "basketball", {
  hawks: ["Atlanta Hawks", "アトランタ・ホークス"],
  celtics: ["Boston Celtics", "ボストン・セルティックス"],
  nets: ["Brooklyn Nets", "ブルックリン・ネッツ"],
  njnets: ["New Jersey Nets", "ニュージャージー・ネッツ"],
  nynets: ["New York Nets", "ニューヨーク・ネッツ"],
  charlotte: ["Charlotte Hornets", "シャーロット・ホーネッツ"],
  neworleans: ["New Orleans Hornets", "ニューオーリンズ・ホーネッツ"],
  bobcats: ["Charlotte Bobcats", "シャーロット・ボブキャッツ"],
  bulls: ["Chicago Bulls", "シカゴ・ブルズ"],
  cavaliers: ["Cleveland Cavaliers", "クリーブランド・キャバリアーズ"],
  mavericks: ["Dallas Mavericks", "ダラス・マーベリックス"],
  nuggets: ["Denver Nuggets", "デンバー・ナゲッツ"],
  rockets_aba: ["Denver Rockets", "デンバー・ロケッツ"],
  pistons: ["Detroit Pistons", "デトロイト・ピストンズ"],
  warriors: ["Golden State Warriors", "ゴールデンステート・ウォリアーズ"],
  phillywarriors: ["Philadelphia Warriors", "フィラデルフィア・ウォリアーズ"],
  rockets: ["Houston Rockets", "ヒューストン・ロケッツ"],
  pacers: ["Indiana Pacers", "インディアナ・ペイサーズ"],
  clippers: ["Los Angeles Clippers", "ロサンゼルス・クリッパーズ"],
  braves: ["Buffalo Braves", "バッファロー・ブレーブス"],
  lakers: ["Los Angeles Lakers", "ロサンゼルス・レイカーズ"],
  mpls: ["Minneapolis Lakers", "ミネアポリス・レイカーズ"],
  grizzlies: ["Memphis Grizzlies", "メンフィス・グリズリーズ"],
  vancouver: ["Vancouver Grizzlies", "バンクーバー・グリズリーズ"],
  heat: ["Miami Heat", "マイアミ・ヒート"],
  bucks: ["Milwaukee Bucks", "ミルウォーキー・バックス"],
  wolves: ["Minnesota Timberwolves", "ミネソタ・ティンバーウルブズ"],
  pelicans: ["New Orleans Pelicans", "ニューオーリンズ・ペリカンズ"],
  knicks: ["New York Knicks", "ニューヨーク・ニックス"],
  thunder: ["Oklahoma City Thunder", "オクラホマシティ・サンダー"],
  sonics: ["Seattle SuperSonics", "シアトル・スーパーソニックス"],
  magic: ["Orlando Magic", "オーランド・マジック"],
  sixers: ["Philadelphia 76ers", "フィラデルフィア・セブンティシクサーズ"],
  nationals: ["Syracuse Nationals", "シラキュース・ナショナルズ"],
  suns: ["Phoenix Suns", "フェニックス・サンズ"],
  blazers: ["Portland Trail Blazers", "ポートランド・トレイルブレイザーズ"],
  royals: ["Cincinnati Royals", "シンシナティ・ロイヤルズ"],
  kckings: ["Kansas City Kings", "カンザスシティ・キングス"],
  kings: ["Sacramento Kings", "サクラメント・キングス"],
  spurs: ["San Antonio Spurs", "サンアントニオ・スパーズ"],
  raptors: ["Toronto Raptors", "トロント・ラプターズ"],
  nojazz: ["New Orleans Jazz", "ニューオーリンズ・ジャズ"],
  jazz: ["Utah Jazz", "ユタ・ジャズ"],
  bullets: ["Washington Bullets", "ワシントン・ブレッツ"],
  wizards: ["Washington Wizards", "ワシントン・ウィザーズ"],
  colonels: ["Kentucky Colonels", "ケンタッキー・カーネルズ"],
  spirits: ["Spirits of St. Louis", "スピリッツ・オブ・セントルイス"],
}, [
  // https://en.wikipedia.org/wiki/Atlanta_Hawks#Uniforms (red, yellow and blue before 2015; red and volt green after)
  // unsure: 1972 to 1995 home and road trim
  ["hawks", "1972-1995", "home", "fff e03a3e ffc72c e03a3e"],
  ["hawks", "1972-1995", "away", "e03a3e ffc72c fff fff"],
  ["hawks", "2020-", "home", "fff c8102e c1d32f c8102e 26282a"],
  ["hawks", "2020-", "away", "c8102e fff c1d32f fff 26282a"],
  // https://en.wikipedia.org/wiki/Boston_Celtics#Uniforms (kelly green and white; V-neck; green numbers at home, white on the road)
  ["celtics", "1950-1996", "home", "fff 007a33 - 007a33 co=v pa=0"],
  ["celtics", "1950-1996", "away", "007a33 fff - fff co=v pa=0"],
  ["celtics", "1997-", "home", "fff 007a33 ba9653 007a33 co=r"],
  ["celtics", "1997-", "away", "007a33 fff ba9653 fff co=r"],
  // https://en.wikipedia.org/wiki/Brooklyn_Nets#Uniforms (read from the club's history of uniforms: ABA 1972 to 1977, then 1977 stars and stripes, 1990, 1997, Brooklyn)
  // unsure: where the thick stripe sits on the 1972 home
  ["nynets", "1972-1977", "home", "fff 0033a0 c8102e c8102e cb=10.1.5.2"],
  ["nynets", "1972-1977", "away", "0033a0 fff c8102e fff"],
  ["njnets", "1977-1989", "home", "fff c8102e 002a60 002a60 cb=6.1.4.0.6.2"],
  ["njnets", "1977-1989", "away", "002a60 fff c8102e fff"],
  ["njnets", "1990-1996", "home", "fff c8102e 002a60 c8102e cb=6.1.4.2"],
  ["njnets", "1990-1996", "away", "0f2d65 c8102e fff fff"],
  ["njnets", "1997-2011", "home", "fff 0c2340 c4ced4 0c2340"],
  ["njnets", "1997-2011", "away", "0c2340 c4ced4 c8102e c4ced4"],
  ["njnets", "2009-2011", "red", "c8102e 0c2340 c4ced4 fff"],
  ["nets", "2012-", "home", "fff 000 - 000"],
  ["nets", "2012-", "away", "000 fff - fff"],
  // https://en.wikipedia.org/wiki/Charlotte_Hornets#Uniforms (teal, purple and white; pinstripes at home from 1988)
  // unsure: number colours
  ["charlotte", "1988-2001", "home", "fff 00788c 1d1160 00788c 1d1160 p=p"],
  ["charlotte", "1988-2001", "away", "00788c fff 1d1160 fff 1d1160"],
  ["charlotte", "2014-", "home", "fff 1d1160 00788c 1d1160 00788c"],
  ["charlotte", "2014-", "away", "1d1160 00788c fff fff 00788c"],
  // unsure: New Orleans 2002 to 2013 colours (teal, purple, gold)
  ["neworleans", "2003-2013", "home", "fff 00778b 1d1160 00778b ffc72c"],
  ["neworleans", "2003-2013", "away", "00778b 1d1160 ffc72c fff 1d1160"],
  // unsure: Bobcats orange and blue
  ["bobcats", "2004-2013", "home", "fff f26531 1d4f91 f26531 1d4f91"],
  ["bobcats", "2004-2013", "away", "1d4f91 f26531 000 fff f26531"],
  // https://en.wikipedia.org/wiki/Chicago_Bulls#Uniforms (red and black; red numbers outlined black at home)
  ["bulls", "1966-", "home", "fff ce1141 000 ce1141 000"],
  ["bulls", "1966-", "away", "ce1141 000 fff fff 000"],
  // https://en.wikipedia.org/wiki/Cleveland_Cavaliers#Uniforms (wine and gold 1970 to 1983, blue and orange 1983 to 1994, navy and orange 1994 to 2003, wine and gold again)
  ["cavaliers", "1970-1982", "home", "fff 860038 fdbb30 860038"],
  ["cavaliers", "1970-1982", "away", "860038 fdbb30 fff fdbb30"],
  ["cavaliers", "1983-1993", "home", "fff 005baa f26f21 005baa f26f21"],
  ["cavaliers", "1983-1993", "away", "005baa f26f21 fff f26f21"],
  ["cavaliers", "1994-2002", "home", "fff 041e42 f26f21 041e42"],
  ["cavaliers", "1994-2002", "away", "041e42 f26f21 fff f26f21"],
  ["cavaliers", "2003-2009", "home", "fff 860038 fdbb30 860038 041e42"],
  ["cavaliers", "2003-2009", "away", "860038 fdbb30 041e42 fdbb30"],
  // https://en.wikipedia.org/wiki/Dallas_Mavericks#Uniforms
  // unsure: the 1980 kelly green and royal blue set
  ["mavericks", "1980-1992", "home", "fff 0053bc 00843d 0053bc"],
  ["mavericks", "1980-1992", "away", "00843d fff 0053bc fff"],
  ["mavericks", "2001-", "home", "fff 00538c 002b5e 00538c b8c4ca"],
  ["mavericks", "2001-", "away", "002b5e 00538c b8c4ca fff"],
  // https://en.wikipedia.org/wiki/Denver_Nuggets#Uniforms
  // unsure: the 1982 to 1993 rainbow skyline set (light blue, gold and navy; the real jersey had several stripes)
  ["nuggets", "1982-1992", "home", "fff 4b92db fdb927 1d428a fdb927"],
  ["nuggets", "1982-1992", "away", "4b92db fdb927 fff fff 1d428a"],
  // 1993 to 2003: navy, gold and maroon (wine)
  ["nuggets", "1993-2002", "home", "fff 0c2340 ffc72c 0c2340 7d1d4a"],
  ["nuggets", "1993-2002", "away", "0c2340 ffc72c 7d1d4a fff"],
  // 2003 to 2018: powder blue, navy and gold
  ["nuggets", "2003-2017", "home", "fff 4b92db 0c2340 4b92db fdb927"],
  ["nuggets", "2003-2017", "away", "4b92db 0c2340 fdb927 fff fdb927"],
  ["nuggets", "2018-", "home", "fff 0e2240 fec524 0e2240 fec524"],
  ["nuggets", "2018-", "away", "0e2240 fec524 8b2131 fec524"],
  // unsure: colours of the Denver Rockets (ABA, 1967 to 1974); no source found, light blue and gold from memory
  ["rockets_aba", "1970-1974", "home", "fff 4b92db fdb927 4b92db"],
  ["rockets_aba", "1970-1974", "away", "4b92db fdb927 fff fff"],
  // https://en.wikipedia.org/wiki/Detroit_Pistons#Uniforms
  // unsure: number colours of the 1980 to 1996 set (red and blue)
  ["pistons", "1980-1995", "home", "fff c8102e 1d42ba c8102e 1d42ba"],
  ["pistons", "1980-1995", "away", "1d42ba c8102e fff fff c8102e"],
  // 1996 to 2001: teal, red and black
  ["pistons", "1996-2000", "home", "fff 00756a c8102e 00756a 000"],
  ["pistons", "1996-2000", "away", "00756a c8102e 000 fff"],
  ["pistons", "2005-2016", "home", "fff c8102e 1d42ba c8102e 1d42ba"],
  ["pistons", "2005-2016", "away", "1d42ba c8102e fff fff c8102e"],
  // https://en.wikipedia.org/wiki/Golden_State_Warriors#Uniforms (Philadelphia 1959 to 1962: white home, red and blue stripe round the middle, red numbers outlined blue)
  ["phillywarriors", "1959-1962", "home", "fff c8102e 0033a0 c8102e 0033a0 cy=150 cb=4.1.3.2"],
  // unsure: Golden State 1970s to 1990s royal blue and gold
  ["warriors", "1975-1996", "home", "fff 1d428a ffc72c 1d428a"],
  ["warriors", "1975-1996", "away", "1d428a ffc72c fff ffc72c"],
  ["warriors", "2010-", "home", "fff 1d428a ffc72c 1d428a ffc72c"],
  ["warriors", "2010-", "away", "1d428a ffc72c fff ffc72c"],
  // https://en.wikipedia.org/wiki/Houston_Rockets#Uniforms (red, gold in the 1980s, red and silver from 2003)
  ["rockets", "1980-1994", "home", "fff ce1141 ffc72c ce1141"],
  ["rockets", "1980-1994", "away", "ce1141 ffc72c fff ffc72c"],
  ["rockets", "2003-2019", "home", "fff ce1141 c4ced4 ce1141 c4ced4"],
  ["rockets", "2003-2019", "away", "ce1141 c4ced4 000 fff"],
  // https://en.wikipedia.org/wiki/Indiana_Pacers#Uniforms (navy and gold since the ABA)
  ["pacers", "1967-1989", "home", "fff 002d62 fdbb30 002d62"],
  ["pacers", "1967-1989", "away", "002d62 fdbb30 fff fdbb30"],
  ["pacers", "2005-", "home", "fff 002d62 fdbb30 002d62 fdbb30"],
  ["pacers", "2005-", "away", "002d62 fdbb30 fff fdbb30"],
  // https://en.wikipedia.org/wiki/Los_Angeles_Clippers#Uniforms
  // Buffalo Braves: orange and black 1971 to 1973 (white home, orange road), Columbia blue and white 1973 to 1978 with black trim
  ["braves", "1971-1972", "home", "fff f58426 000 f58426 000"],
  ["braves", "1971-1972", "away", "f58426 000 fff 000 fff"],
  ["braves", "1973-1977", "home", "fff 6cace4 000 6cace4 000"],
  ["braves", "1973-1977", "away", "6cace4 fff 000 fff 000"],
  ["clippers", "1984-2009", "home", "fff c8102e 1d428a c8102e 1d428a"],
  ["clippers", "1984-2009", "away", "c8102e fff 1d428a fff"],
  ["clippers", "2010-", "home", "fff c8102e 1d428a c8102e 1d428a"],
  ["clippers", "2010-", "away", "1d428a c8102e fff c8102e fff"],
  // https://en.wikipedia.org/wiki/Logos_and_uniforms_of_the_Los_Angeles_Lakers
  // Minneapolis 1948 to 1958: white home with powder blue and gold trim; powder blue road with gold trim
  ["mpls", "1948-1957", "home", "fff 7fb3e0 fdb927 7fb3e0"],
  ["mpls", "1948-1957", "away", "7fb3e0 fdb927 fff fff"],
  // late Minneapolis years: royal blue replaces powder blue, gold removed
  ["mpls", "1958-1960", "home", "fff 0033a0 - 0033a0"],
  ["mpls", "1958-1960", "away", "0033a0 fff - fff"],
  // Los Angeles 1960 to 1967: royal and powder blue
  ["lakers", "1960-1966", "home", "fff 0033a0 7fb3e0 0033a0"],
  ["lakers", "1960-1966", "away", "0033a0 fff 7fb3e0 fff"],
  // 1967 on: purple and gold; gold at home, purple on the road
  ["lakers", "1967-1977", "home", "fdb927 552583 fff fff 552583 co=v"],
  ["lakers", "1967-1977", "away", "552583 fdb927 fff fff fdb927 co=v"],
  ["lakers", "1978-1998", "home", "fdb927 552583 fff 552583 fff co=v"],
  ["lakers", "1978-1998", "away", "552583 fdb927 fff fdb927 fff co=v"],
  ["lakers", "1999-2017", "home", "fdb927 552583 fff fff pa=1"],
  ["lakers", "1999-2017", "away", "552583 fdb927 fff fdb927 pa=1"],
  ["lakers", "2002-", "white", "fff 552583 fdb927 552583 fdb927"],
  ["lakers", "2018-", "home", "fdb927 552583 fff 552583 fff"],
  ["lakers", "2018-", "away", "552583 000 fdb927 fdb927 fff"],
  // https://en.wikipedia.org/wiki/Vancouver_Grizzlies#Uniforms (turquoise, bronze, red and black; white home with black lettering and teal side stripes)
  // unsure: the road set
  ["vancouver", "1995-2000", "home", "fff 00a9b5 000 000 pa=1"],
  ["vancouver", "1995-2000", "away", "00a9b5 000 a4552b fff 000"],
  ["vancouver", "1995-2000", "black", "000 00a9b5 fff 00a9b5"],
  // https://en.wikipedia.org/wiki/Memphis_Grizzlies#Uniforms (navy, beale street blue, gold)
  ["grizzlies", "2004-", "home", "fff 5d76a9 12173f 12173f 5d76a9"],
  ["grizzlies", "2004-", "away", "5d76a9 f5b112 12173f 12173f f5b112"],
  // https://en.wikipedia.org/wiki/Miami_Heat#Uniforms
  // unsure: number colours of the 1988 set
  ["heat", "1988-1998", "home", "fff 98002e f9a01b 98002e 000"],
  ["heat", "1988-1998", "away", "98002e f9a01b 000 f9a01b"],
  ["heat", "1999-", "home", "fff 98002e f9a01b 98002e 000"],
  ["heat", "1999-", "away", "98002e f9a01b 000 f9a01b"],
  ["heat", "1999-", "black", "000 98002e f9a01b 98002e f9a01b"],
  // https://en.wikipedia.org/wiki/Milwaukee_Bucks#Uniforms
  // unsure: kelly green with red in the early years
  ["bucks", "1968-1992", "home", "fff 00471b cc0000 00471b"],
  ["bucks", "1968-1992", "away", "00471b fff cc0000 fff"],
  ["bucks", "1993-2005", "home", "fff 4b2e83 00a65a 4b2e83 c4ced4"],
  ["bucks", "1993-2005", "away", "4b2e83 00a65a c4ced4 fff"],
  ["bucks", "2015-", "home", "fff 00471b eee1c6 00471b eee1c6"],
  ["bucks", "2015-", "away", "00471b eee1c6 0077c0 eee1c6"],
  // https://en.wikipedia.org/wiki/Minnesota_Timberwolves#Uniforms
  ["wolves", "2008-2016", "home", "fff 236192 78be20 236192 78be20"],
  ["wolves", "2008-2016", "away", "236192 78be20 9ea2a2 fff"],
  ["wolves", "2017-", "home", "fff 0c2340 78be20 0c2340 236192"],
  ["wolves", "2017-", "away", "0c2340 236192 78be20 fff 78be20"],
  // https://en.wikipedia.org/wiki/New_York_Knicks#Uniforms (blue and orange)
  ["knicks", "1960-", "home", "fff 006bb6 f58426 006bb6 f58426"],
  ["knicks", "1960-", "away", "006bb6 f58426 fff f58426 fff"],
  // https://en.wikipedia.org/wiki/New_Orleans_Pelicans#Uniforms (navy, gold and red)
  ["pelicans", "2013-", "home", "fff 0c2340 c8102e 0c2340 85714d"],
  ["pelicans", "2013-", "away", "0c2340 85714d c8102e 85714d"],
  ["pelicans", "2013-", "red", "c8102e 0c2340 85714d fff"],
  // https://en.wikipedia.org/wiki/Oklahoma_City_Thunder#Uniforms
  ["thunder", "2008-", "home", "fff 007ac1 ef3b24 007ac1 ef3b24"],
  ["thunder", "2008-", "away", "007ac1 ef3b24 fdbb30 fff ef3b24"],
  // https://en.wikipedia.org/wiki/Seattle_SuperSonics (green and gold; green numbers outlined gold at home)
  // unsure: trim details of every Seattle set
  ["sonics", "1967-1974", "home", "fff 00653a ffc200 00653a"],
  ["sonics", "1967-1974", "away", "00653a fff ffc200 fff"],
  ["sonics", "1975-1994", "home", "fff 00653a ffc200 00653a ffc200"],
  ["sonics", "1975-1994", "away", "00653a ffc200 fff ffc200"],
  ["sonics", "1995-2000", "home", "fff 00653a ee1c25 00653a a75d0f"],
  ["sonics", "1995-2000", "away", "00653a ee1c25 a75d0f fff"],
  ["sonics", "2001-2007", "home", "fff 00653a ffc200 00653a"],
  ["sonics", "2001-2007", "away", "00653a ffc200 fff ffc200"],
  // https://en.wikipedia.org/wiki/Orlando_Magic#Uniforms (blue pinstripes 1989 to 2000)
  // unsure: pinstripe colours and numbers
  ["magic", "1989-1999", "home", "fff 0077c0 000 0077c0 000 p=p"],
  ["magic", "1989-1999", "away", "0077c0 000 - fff 000 p=p"],
  ["magic", "2008-", "home", "fff 0077c0 c4ced4 0077c0"],
  ["magic", "2008-", "away", "0077c0 c4ced4 000 fff"],
  // https://en.wikipedia.org/wiki/Philadelphia_76ers#Uniforms (red and royal blue)
  // unsure: road set of the 1970s and 1980s
  ["sixers", "1970-1996", "home", "fff ed174c 006bb6 ed174c 006bb6"],
  ["sixers", "1970-1996", "away", "006bb6 ed174c fff fff ed174c"],
  ["sixers", "2010-", "home", "fff 006bb6 ed174c 006bb6 ed174c"],
  ["sixers", "2010-", "away", "006bb6 ed174c fff fff ed174c"],
  // https://en.wikipedia.org/wiki/Philadelphia_76ers#History (Syracuse Nationals: red, white and blue)
  // unsure: which colour was worn where
  ["nationals", "1950-1962", "home", "fff c8102e 0033a0 c8102e"],
  ["nationals", "1950-1962", "away", "0033a0 fff c8102e fff"],
  // https://en.wikipedia.org/wiki/Phoenix_Suns#Uniforms (purple and orange)
  // unsure: 1968 to 1992
  ["suns", "1968-1991", "home", "fff 1d1160 e56020 1d1160"],
  ["suns", "1968-1991", "away", "1d1160 e56020 fff e56020"],
  ["suns", "2013-", "home", "fff 1d1160 e56020 1d1160 e56020"],
  ["suns", "2013-", "away", "1d1160 e56020 fff fff e56020"],
  ["suns", "2013-", "orange", "e56020 1d1160 fff 1d1160"],
  // https://en.wikipedia.org/wiki/Portland_Trail_Blazers#Uniforms (red and black)
  ["blazers", "1970-2001", "home", "fff e03a3e 000 e03a3e 000"],
  ["blazers", "1970-2001", "away", "e03a3e 000 fff fff 000"],
  ["blazers", "2017-", "home", "fff e03a3e 000 e03a3e 000"],
  ["blazers", "2017-", "away", "000 e03a3e fff e03a3e"],
  // https://en.wikipedia.org/wiki/Sacramento_Kings#Uniforms (Cincinnati Royals royal blue; Kansas City red, white and blue)
  ["royals", "1957-1971", "home", "fff 0033a0 - 0033a0"],
  ["royals", "1957-1971", "away", "0033a0 fff - fff"],
  // unsure: Kansas City and the first Sacramento years were red, white and blue
  ["kckings", "1972-1984", "home", "fff c8102e 0033a0 c8102e 0033a0"],
  ["kckings", "1972-1984", "away", "0033a0 c8102e fff fff c8102e"],
  ["kings", "1994-2007", "home", "fff 5a2d81 000 5a2d81 c4ced4"],
  ["kings", "1994-2007", "away", "5a2d81 c4ced4 000 fff"],
  ["kings", "1994-2007", "black", "000 5a2d81 c4ced4 c4ced4"],
  ["kings", "2016-", "home", "fff 5a2d81 63727a 5a2d81"],
  ["kings", "2016-", "away", "5a2d81 63727a fff fff"],
  // https://en.wikipedia.org/wiki/San_Antonio_Spurs#Uniforms (silver and black from 1976)
  ["spurs", "1976-", "home", "fff c4ced4 000 000"],
  ["spurs", "1976-", "away", "000 c4ced4 fff c4ced4"],
  // https://en.wikipedia.org/wiki/Toronto_Raptors#Uniforms (purple, red, black and silver until 2008; red, black and silver after)
  // unsure: 1995 to 2008 trim
  ["raptors", "1995-2007", "home", "fff 753bbd ce1141 753bbd c4ced4"],
  ["raptors", "1995-2007", "away", "753bbd ce1141 000 fff"],
  ["raptors", "2008-", "home", "fff ce1141 000 ce1141 000"],
  ["raptors", "2008-", "away", "ce1141 000 fff fff 000"],
  ["raptors", "2008-", "black", "000 ce1141 c4ced4 fff"],
  // https://en.wikipedia.org/wiki/Utah_Jazz#Uniforms (New Orleans 1974: purple, gold and green)
  // unsure: trim details
  ["nojazz", "1974-1978", "home", "fff 4b2e83 ffc72c 4b2e83 00843d"],
  ["nojazz", "1974-1978", "away", "4b2e83 ffc72c 00843d fff"],
  ["jazz", "1979-1995", "home", "fff 4b2e83 ffc72c 4b2e83"],
  ["jazz", "1979-1995", "away", "4b2e83 ffc72c fff ffc72c"],
  ["jazz", "1996-2003", "home", "fff 4b2e83 00a3b1 4b2e83 a35b2f"],
  ["jazz", "1996-2003", "away", "4b2e83 00a3b1 a35b2f fff"],
  ["jazz", "2016-", "home", "fff 002b5c f9a01b 002b5c"],
  ["jazz", "2016-", "away", "002b5c f9a01b fff f9a01b"],
  // https://en.wikipedia.org/wiki/Washington_Wizards#Uniforms (Bullets red, white and blue)
  // unsure: road set of the Bullets
  ["bullets", "1974-1996", "home", "fff e31837 002b5c e31837"],
  ["bullets", "1974-1996", "away", "e31837 fff 002b5c fff"],
  ["wizards", "1997-2006", "home", "fff 002b5c cb8e48 002b5c"],
  ["wizards", "1997-2006", "away", "002b5c cb8e48 000 fff"],
  ["wizards", "2011-", "home", "fff 002b5c e31837 002b5c e31837"],
  ["wizards", "2011-", "away", "002b5c e31837 fff fff e31837"],
  // https://en.wikipedia.org/wiki/Kentucky_Colonels#Team_colors (chartreuse and white 1967 to 1970, blue and white 1970 to 1974, blue, red and white 1974 to 1976)
  ["colonels", "1967-1969", "home", "fff c4d600 - c4d600"],
  ["colonels", "1967-1969", "away", "c4d600 fff - fff"],
  ["colonels", "1970-1973", "home", "fff 0033a0 - 0033a0"],
  ["colonels", "1970-1973", "away", "0033a0 fff - fff"],
  ["colonels", "1974-1975", "home", "fff 0033a0 c8102e 0033a0 c8102e"],
  // https://en.wikipedia.org/wiki/Spirits_of_St._Louis (burnt orange, white and black)
  ["spirits", "1975-1976", "home", "fff cc5500 000 cc5500 000"],
  ["spirits", "1975-1976", "away", "cc5500 000 fff fff 000"],
]);
