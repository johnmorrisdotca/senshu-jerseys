// Major League Baseball: flannels of the 1900s to 1950s, the pullover era of the 1960s to 1980s, and each club's current home and road. Colours and layouts only: the chest
// stays empty (no script, no crest, no cap logo); numbers are the real number colours. Greys: a9adb0 for the old road flannel, a2aaad for the road grey of today.
// Cuts: cl=b button front, cl=p pullover, cl=v vest; p=p pinstripes in the trim colour; rg=1 raglan sleeves in the trim colour; he= cap, sk= socks.
import { defineLeague } from "./core.ts";

export const MLB = defineLeague("mlb", "baseball", {
  yankees: ["New York Yankees", "ニューヨーク・ヤンキース"],
  redsox: ["Boston Red Sox", "ボストン・レッドソックス"],
  orioles: ["Baltimore Orioles", "ボルチモア・オリオールズ"],
  rays: ["Tampa Bay Rays", "タンパベイ・レイズ"],
  bluejays: ["Toronto Blue Jays", "トロント・ブルージェイズ"],
  whitesox: ["Chicago White Sox", "シカゴ・ホワイトソックス"],
  cleveland: ["Cleveland Guardians", "クリーブランド・ガーディアンズ"],
  tigers: ["Detroit Tigers", "デトロイト・タイガース"],
  royals: ["Kansas City Royals", "カンザスシティ・ロイヤルズ"],
  twins: ["Minnesota Twins", "ミネソタ・ツインズ"],
  astros: ["Houston Astros", "ヒューストン・アストロズ"],
  angels: ["Los Angeles Angels", "ロサンゼルス・エンゼルス"],
  athletics: ["Athletics", "アスレチックス"],
  mariners: ["Seattle Mariners", "シアトル・マリナーズ"],
  rangers: ["Texas Rangers", "テキサス・レンジャーズ"],
  braves: ["Atlanta Braves", "アトランタ・ブレーブス"],
  marlins: ["Miami Marlins", "マイアミ・マーリンズ"],
  mets: ["New York Mets", "ニューヨーク・メッツ"],
  phillies: ["Philadelphia Phillies", "フィラデルフィア・フィリーズ"],
  nationals: ["Washington Nationals", "ワシントン・ナショナルズ"],
  cubs: ["Chicago Cubs", "シカゴ・カブス"],
  reds: ["Cincinnati Reds", "シンシナティ・レッズ"],
  brewers: ["Milwaukee Brewers", "ミルウォーキー・ブルワーズ"],
  pirates: ["Pittsburgh Pirates", "ピッツバーグ・パイレーツ"],
  cardinals: ["St. Louis Cardinals", "セントルイス・カージナルス"],
  dbacks: ["Arizona Diamondbacks", "アリゾナ・ダイヤモンドバックス"],
  rockies: ["Colorado Rockies", "コロラド・ロッキーズ"],
  dodgers: ["Los Angeles Dodgers", "ロサンゼルス・ドジャース"],
  giants: ["San Francisco Giants", "サンフランシスコ・ジャイアンツ"],
  padres: ["San Diego Padres", "サンディエゴ・パドレス"],
  brooklyn: ["Brooklyn Dodgers", "ブルックリン・ドジャース"],
  bostonbraves: ["Boston Braves", "ボストン・ブレーブス"],
  milbraves: ["Milwaukee Braves", "ミルウォーキー・ブレーブス"],
  nygiants: ["New York Giants", "ニューヨーク・ジャイアンツ"],
  expos: ["Montreal Expos", "モントリオール・エクスポズ"],
  pilots: ["Seattle Pilots", "シアトル・パイロッツ"],
  senators: ["Washington Senators", "ワシントン・セネタース"],
  phila: ["Philadelphia Athletics", "フィラデルフィア・アスレチックス"],
  colts: ["Houston Colt .45s", "ヒューストン・コルト・フォーティファイブス"],
}, [
  // https://en.wikipedia.org/wiki/New_York_Yankees#Uniforms (pinstripes since 1915, numbers since 1929; navy cap, navy socks)
  ["yankees", "1929-", "home", "fff 0c2340 - 0c2340 p=p cl=b he=0c2340 sk=0c2340"],
  ["yankees", "1930-", "away", "a9adb0 0c2340 - 0c2340 cl=b he=0c2340 sk=0c2340"],
  // unsure: the 1973 to 1978 doubleknit kept the pinstripes and the grey road, with a navy collar band
  ["yankees", "1973-1978", "home", "fff 0c2340 - 0c2340 p=p cl=b he=0c2340 sk=0c2340 co=b"],
  // https://en.wikipedia.org/wiki/Boston_Red_Sox#Uniforms
  ["redsox", "1930-1969", "home", "fff bd3039 0c2340 bd3039 sk=bd3039 he=0c2340"],
  ["redsox", "1930-1969", "away", "a9adb0 bd3039 0c2340 bd3039 sk=bd3039 he=0c2340"],
  ["redsox", "1990-", "home", "fff bd3039 0c2340 bd3039 0c2340 he=0c2340 sk=0c2340"],
  ["redsox", "1990-", "away", "a2aaad bd3039 0c2340 bd3039 0c2340 he=0c2340 sk=0c2340"],
  // https://en.wikipedia.org/wiki/Baltimore_Orioles#Uniforms (orange and black from 1954)
  ["orioles", "1966-1988", "home", "fff df4601 000 000 he=000 sk=df4601"],
  ["orioles", "1966-1988", "away", "a9adb0 df4601 000 000 he=000 sk=df4601"],
  ["orioles", "1971-1988", "orange", "df4601 000 fff 000 he=000 sk=df4601"],
  ["orioles", "1995-", "home", "fff df4601 000 000 df4601 he=000 sk=000"],
  ["orioles", "1995-", "away", "a2aaad df4601 000 000 df4601 he=000 sk=000"],
  // https://en.wikipedia.org/wiki/Tampa_Bay_Rays#Uniforms
  // unsure: the 1998 to 2007 Devil Rays purple and green, shades from the club's colour names
  ["rays", "1998-2007", "home", "fff 29235c 00a651 29235c he=29235c sk=29235c"],
  ["rays", "1998-2007", "away", "a9adb0 29235c 00a651 29235c he=29235c sk=29235c"],
  ["rays", "2008-", "home", "fff 092c5c 8fbce6 092c5c he=092c5c sk=092c5c"],
  ["rays", "2008-", "away", "a2aaad 092c5c 8fbce6 092c5c he=092c5c sk=092c5c"],
  ["rays", "2008-", "sunday", "8fbce6 092c5c f5d130 092c5c he=092c5c sk=092c5c"],
  // https://en.wikipedia.org/wiki/Toronto_Blue_Jays#Uniforms (1977 to 1996: royal blue lettering, powder blue road)
  // unsure: closure on the 1977 set
  ["bluejays", "1977-1996", "home", "fff 134a8e - 134a8e he=134a8e sk=134a8e cl=p"],
  ["bluejays", "1977-1996", "away", "7bb3e0 134a8e - 134a8e he=134a8e sk=134a8e cl=p"],
  ["bluejays", "2012-", "home", "fff 134a8e 1d2d5c 134a8e he=134a8e sk=134a8e"],
  ["bluejays", "2012-", "away", "a2aaad 134a8e 1d2d5c 134a8e he=134a8e sk=134a8e"],
  // https://en.wikipedia.org/wiki/Chicago_White_Sox#Uniforms
  ["whitesox", "1951-1963", "home", "fff 27251f c8102e 27251f he=27251f sk=27251f"],
  ["whitesox", "1951-1963", "away", "a9adb0 27251f c8102e 27251f he=27251f sk=27251f"],
  ["whitesox", "1964-1970", "home", "fff 0c2340 c8102e 0c2340 he=0c2340 sk=0c2340"],
  ["whitesox", "1964-1970", "away", "9cbcdc 0c2340 c8102e 0c2340 he=0c2340 sk=0c2340"],
  // red era: red caps, red socks, red pinstripes. unsure: the road set
  ["whitesox", "1971-1975", "home", "fff c8102e - c8102e p=p cl=p he=c8102e sk=c8102e"],
  ["whitesox", "1971-1975", "away", "a9adb0 c8102e - c8102e cl=p he=c8102e sk=c8102e"],
  // 1976 to 1981: navy, collars worn untucked, white home and navy road
  ["whitesox", "1976-1981", "home", "fff 0c2340 c8102e 0c2340 co=v cl=p he=0c2340 sk=fff"],
  ["whitesox", "1976-1981", "away", "0c2340 fff c8102e fff co=v cl=p he=0c2340 sk=0c2340"],
  ["whitesox", "1991-", "home", "fff 27251f c4ced4 27251f p=p he=27251f sk=27251f"],
  ["whitesox", "1991-", "away", "a2aaad 27251f c4ced4 27251f he=27251f sk=27251f"],
  // https://en.wikipedia.org/wiki/Cleveland_Guardians#Uniforms (navy and red)
  ["cleveland", "1950-1969", "home", "fff e31937 0c2340 e31937 he=0c2340 sk=e31937"],
  ["cleveland", "1950-1969", "away", "a9adb0 e31937 0c2340 e31937 he=0c2340 sk=e31937"],
  // 1975 to 1977: red pullovers. unsure: which set was worn on the road
  ["cleveland", "1975-1977", "home", "fff e31937 - e31937 cl=p he=e31937 sk=e31937"],
  ["cleveland", "1975-1977", "away", "e31937 fff 0c2340 fff cl=p he=e31937 sk=e31937"],
  ["cleveland", "1994-2021", "home", "fff 0c2340 e31937 e31937 0c2340 he=0c2340 sk=0c2340"],
  ["cleveland", "1994-2021", "away", "a2aaad 0c2340 e31937 0c2340 he=0c2340 sk=0c2340"],
  ["cleveland", "2022-", "home", "fff e31937 0c2340 e31937 0c2340 he=0c2340 sk=0c2340"],
  ["cleveland", "2022-", "away", "a2aaad 0c2340 e31937 0c2340 he=0c2340 sk=0c2340"],
  // https://en.wikipedia.org/wiki/Detroit_Tigers#Uniforms
  ["tigers", "1930-1969", "home", "fff 0c2340 fa4616 0c2340 he=0c2340 sk=0c2340"],
  ["tigers", "1930-1969", "away", "a9adb0 0c2340 fa4616 0c2340 he=0c2340 sk=0c2340"],
  ["tigers", "1994-", "home", "fff 0c2340 fa4616 0c2340 he=0c2340 sk=0c2340"],
  ["tigers", "1994-", "away", "a2aaad 0c2340 fa4616 fa4616 0c2340 he=0c2340 sk=0c2340"],
  // https://en.wikipedia.org/wiki/Kansas_City_Royals#Uniforms (road powder blue from 1969)
  ["royals", "1969-1972", "home", "fff 004687 - 004687 he=004687 sk=004687"],
  ["royals", "1969-1972", "away", "7ab2dd 004687 - 004687 he=004687 sk=004687"],
  // unsure: pullover from 1973
  ["royals", "1973-1991", "home", "fff 004687 - 004687 cl=p he=004687 sk=004687"],
  ["royals", "1973-1991", "away", "7ab2dd 004687 - 004687 cl=p he=004687 sk=004687"],
  ["royals", "2006-", "home", "fff 004687 bd9b60 004687 he=004687 sk=004687"],
  ["royals", "2006-", "away", "a2aaad 004687 bd9b60 004687 he=004687 sk=004687"],
  ["royals", "2006-", "powder", "7ab2dd 004687 bd9b60 004687 he=004687 sk=004687"],
  // https://en.wikipedia.org/wiki/Minnesota_Twins#Uniforms
  ["twins", "1961-1971", "home", "fff 002b5c d31145 002b5c he=002b5c sk=002b5c"],
  ["twins", "1961-1971", "away", "a9adb0 002b5c d31145 002b5c he=002b5c sk=002b5c"],
  // 1973 to 1986: pullover, powder blue road
  ["twins", "1973-1986", "home", "fff 002b5c d31145 002b5c cl=p he=002b5c sk=002b5c"],
  ["twins", "1973-1986", "away", "9cbcdc 002b5c d31145 002b5c cl=p he=002b5c sk=002b5c"],
  ["twins", "2010-", "home", "fff 002b5c d31145 002b5c he=002b5c sk=002b5c"],
  ["twins", "2010-", "away", "a2aaad 002b5c d31145 002b5c he=002b5c sk=002b5c"],
  // https://en.wikipedia.org/wiki/Houston_Astros#Uniforms (navy and orange)
  // unsure: pinstripes on the Colt .45s home
  ["colts", "1962-1964", "home", "fff 002d62 ff6600 002d62 he=002d62 sk=002d62"],
  ["colts", "1962-1964", "away", "a9adb0 002d62 ff6600 002d62 he=002d62 sk=002d62"],
  // rainbow: the stripes across the chest and body are three colours, orange and red here; yellow is not available (see report)
  ["astros", "1975-1993", "home", "fff eb6e1f c8102e eb6e1f cb=10.1.10.2.10.1 cl=p he=002d62 sk=eb6e1f"],
  ["astros", "1975-1993", "away", "eb6e1f f9a01b c8102e fff cb=10.1.10.2.10.1 cl=p he=eb6e1f sk=eb6e1f"],
  ["astros", "1994-1999", "home", "fff 002d62 eb9c2a 002d62 he=002d62 sk=002d62"],
  ["astros", "1994-1999", "away", "a9adb0 002d62 eb9c2a eb9c2a 002d62 he=002d62 sk=002d62"],
  // unsure: cream home of the 2000 to 2012 brick red, sand and black look
  ["astros", "2000-2012", "home", "f5ecd0 000 9d3a2c 9d3a2c he=9d3a2c sk=000"],
  ["astros", "2000-2012", "away", "a9adb0 000 9d3a2c 9d3a2c he=000 sk=000"],
  ["astros", "2013-", "home", "fff 002d62 eb6e1f 002d62 eb6e1f he=002d62 sk=002d62"],
  ["astros", "2013-", "away", "a2aaad 002d62 eb6e1f 002d62 he=002d62 sk=002d62"],
  // https://en.wikipedia.org/wiki/Los_Angeles_Angels#Uniforms
  // 1972 to 1985: white home, red road. unsure: pullover
  ["angels", "1972-1985", "home", "fff ba0021 003263 ba0021 cl=p he=ba0021 sk=ba0021"],
  ["angels", "1972-1985", "away", "ba0021 fff 003263 fff cl=p he=ba0021 sk=ba0021"],
  ["angels", "2002-", "home", "fff ba0021 003263 ba0021 he=ba0021 sk=ba0021"],
  ["angels", "2002-", "away", "a2aaad ba0021 003263 003263 he=ba0021 sk=ba0021"],
  ["angels", "2002-", "red", "ba0021 fff c4ced4 fff he=ba0021 sk=ba0021"],
  // https://en.wikipedia.org/wiki/Oakland_Athletics#Uniforms (kelly green and gold from 1963, pullovers in the 1970s)
  ["athletics", "1972-1981", "home", "fff 006341 efb21e 006341 cl=p he=006341 sk=efb21e"],
  ["athletics", "1972-1981", "green", "006341 efb21e fff fff cl=p he=006341 sk=efb21e"],
  ["athletics", "1972-1981", "gold", "efb21e 006341 fff fff cl=p he=006341 sk=006341"],
  ["athletics", "1987-", "home", "fff 003831 efb21e 003831 he=003831 sk=003831"],
  ["athletics", "1987-", "away", "a2aaad 003831 efb21e 003831 he=003831 sk=003831"],
  ["athletics", "1987-", "green", "003831 efb21e fff efb21e he=003831 sk=003831"],
  // https://en.wikipedia.org/wiki/Seattle_Mariners#Uniforms
  // unsure: the 1977 to 1992 set, navy and gold with a royal tint
  ["mariners", "1977-1992", "home", "fff 0c2c56 ffcc00 0c2c56 he=0c2c56 sk=0c2c56"],
  ["mariners", "1977-1992", "away", "a9adb0 0c2c56 ffcc00 0c2c56 he=0c2c56 sk=0c2c56"],
  ["mariners", "1993-2010", "home", "fff 0c2c56 005c5c c4ced4 0c2c56 he=0c2c56 sk=0c2c56"],
  ["mariners", "1993-2010", "away", "a9adb0 0c2c56 005c5c c4ced4 0c2c56 he=0c2c56 sk=0c2c56"],
  ["mariners", "1993-2010", "navy", "0c2c56 005c5c c4ced4 fff he=0c2c56 sk=0c2c56"],
  ["mariners", "2011-", "home", "fff 0c2c56 005c5c 0c2c56 he=0c2c56 sk=0c2c56"],
  ["mariners", "2011-", "away", "a2aaad 0c2c56 005c5c 0c2c56 he=0c2c56 sk=0c2c56"],
  // https://en.wikipedia.org/wiki/Texas_Rangers_(baseball)#Uniforms
  // unsure: pullover in the 1970s, powder blue road
  ["rangers", "1972-1981", "home", "fff 003278 c0111f 003278 cl=p he=003278 sk=003278"],
  ["rangers", "1972-1981", "away", "a4c6e8 003278 c0111f 003278 cl=p he=003278 sk=003278"],
  ["rangers", "2020-", "home", "fff 003278 c0111f 003278 he=003278 sk=003278"],
  ["rangers", "2020-", "away", "a2aaad 003278 c0111f 003278 he=003278 sk=003278"],
  ["rangers", "2020-", "red", "c0111f fff 003278 fff he=c0111f sk=003278"],
  // https://en.wikipedia.org/wiki/Atlanta_Braves#Uniforms (navy and red; Boston and Milwaukee years by their colours)
  ["bostonbraves", "1936-1952", "home", "fff c8102e 0c2340 c8102e he=0c2340 sk=c8102e"],
  ["bostonbraves", "1936-1952", "away", "a9adb0 c8102e 0c2340 c8102e he=0c2340 sk=c8102e"],
  ["milbraves", "1953-1965", "home", "fff 0c2340 c8102e 0c2340 he=0c2340 sk=0c2340"],
  ["milbraves", "1953-1965", "away", "a9adb0 0c2340 c8102e 0c2340 he=0c2340 sk=0c2340"],
  ["braves", "1966-1971", "home", "fff 0c2340 ce1141 0c2340 he=0c2340 sk=0c2340"],
  ["braves", "1966-1971", "away", "a9adb0 0c2340 ce1141 0c2340 he=0c2340 sk=0c2340"],
  // unsure: powder blue pullover road of the 1970s
  ["braves", "1972-1975", "away", "9cbcdc ce1141 0c2340 ce1141 cl=p he=0c2340 sk=0c2340"],
  ["braves", "1987-", "home", "fff ce1141 0c2340 ce1141 0c2340 he=0c2340 sk=0c2340"],
  ["braves", "1987-", "away", "a2aaad ce1141 0c2340 ce1141 0c2340 he=0c2340 sk=0c2340"],
  // https://en.wikipedia.org/wiki/Miami_Marlins#Uniforms
  ["marlins", "1993-2002", "home", "fff 00a3ad 000 000 p=p he=000 sk=000"],
  ["marlins", "1993-2002", "away", "a9adb0 00a3ad 000 000 he=000 sk=000"],
  ["marlins", "2012-2018", "home", "fff ff6600 00a3e0 ff6600 he=000 sk=000"],
  ["marlins", "2019-", "home", "fff 000 00a3e0 000 he=000 sk=000"],
  ["marlins", "2019-", "away", "a2aaad 000 00a3e0 000 he=000 sk=000"],
  // https://en.wikipedia.org/wiki/New_York_Mets#Uniforms (blue pinstripes and orange since 1962)
  ["mets", "1962-1977", "home", "fff 002d72 ff5910 002d72 p=p he=002d72 sk=002d72"],
  ["mets", "1962-1977", "away", "a9adb0 002d72 ff5910 002d72 he=002d72 sk=002d72"],
  // unsure: no pinstripes in 1978 to 1982
  ["mets", "1978-1982", "home", "fff 002d72 ff5910 002d72 he=002d72 sk=002d72"],
  ["mets", "1999-", "home", "fff 002d72 ff5910 002d72 p=p he=002d72 sk=002d72"],
  ["mets", "1999-", "away", "a2aaad 002d72 ff5910 002d72 he=002d72 sk=002d72"],
  // https://en.wikipedia.org/wiki/Philadelphia_Phillies#Uniforms
  ["phillies", "1950-1969", "home", "fff e81828 002d72 e81828 he=e81828 sk=e81828"],
  ["phillies", "1950-1969", "away", "a9adb0 e81828 002d72 e81828 he=e81828 sk=e81828"],
  // 1970 to 1991: burgundy, pullover. unsure: powder blue road
  ["phillies", "1970-1991", "home", "fff 6f263d - 6f263d cl=p he=6f263d sk=6f263d"],
  ["phillies", "1970-1991", "away", "9cbcdc 6f263d - 6f263d cl=p he=6f263d sk=6f263d"],
  ["phillies", "1992-", "home", "fff e81828 002d72 e81828 002d72 p=p he=002d72 sk=e81828"],
  ["phillies", "1992-", "away", "a2aaad e81828 002d72 e81828 002d72 he=002d72 sk=e81828"],
  // https://en.wikipedia.org/wiki/Washington_Nationals#Uniforms
  ["nationals", "2005-", "home", "fff ab0003 14225a ab0003 14225a he=ab0003 sk=14225a"],
  ["nationals", "2005-", "away", "a2aaad ab0003 14225a ab0003 14225a he=14225a sk=14225a"],
  // https://en.wikipedia.org/wiki/Montreal_Expos#Uniforms (red, white and blue; powder blue road)
  ["expos", "1969-1976", "home", "fff c8102e 003087 c8102e he=003087 sk=003087"],
  ["expos", "1977-1991", "home", "fff 003087 c8102e 003087 cl=p he=003087 sk=003087"],
  ["expos", "1977-1991", "away", "6cace4 003087 c8102e fff cl=p he=003087 sk=003087"],
  ["expos", "1992-2004", "home", "fff 003087 c8102e 003087 he=003087 sk=003087"],
  ["expos", "1992-2004", "away", "a9adb0 003087 c8102e 003087 he=003087 sk=003087"],
  // https://en.wikipedia.org/wiki/Chicago_Cubs#Uniforms (blue pinstripes at home from 1957)
  ["cubs", "1957-", "home", "fff 0e3386 cc3433 0e3386 p=p he=0e3386 sk=0e3386"],
  ["cubs", "1957-", "away", "a9adb0 0e3386 cc3433 0e3386 he=0e3386 sk=0e3386"],
  ["cubs", "1990-", "blue", "0e3386 cc3433 fff fff he=0e3386 sk=0e3386"],
  // https://en.wikipedia.org/wiki/Cincinnati_Reds#Uniforms (sleeveless vests 1956 to 1966)
  ["reds", "1956-1966", "home", "fff c6011f - c6011f cl=v sl=n he=c6011f sk=c6011f"],
  ["reds", "1956-1966", "away", "a9adb0 c6011f - c6011f cl=v sl=n he=c6011f sk=c6011f"],
  ["reds", "1967-", "home", "fff c6011f 000 c6011f he=c6011f sk=c6011f"],
  ["reds", "1967-", "away", "a2aaad c6011f 000 c6011f he=c6011f sk=c6011f"],
  // https://en.wikipedia.org/wiki/Milwaukee_Brewers#Uniforms
  // unsure: navy and gold pullover, powder blue road
  ["brewers", "1978-1993", "home", "fff 00297b ffc52f 00297b cl=p he=00297b sk=00297b"],
  ["brewers", "1978-1993", "away", "9cbcdc 00297b ffc52f 00297b cl=p he=00297b sk=00297b"],
  ["brewers", "2000-2019", "home", "fff 13294b ffc52f 13294b he=13294b sk=13294b"],
  ["brewers", "2000-2019", "away", "a2aaad 13294b ffc52f 13294b he=13294b sk=13294b"],
  ["brewers", "2020-", "home", "fff 12284b ffc52f 12284b he=12284b sk=12284b"],
  ["brewers", "2020-", "away", "a2aaad 12284b ffc52f 12284b he=12284b sk=12284b"],
  // https://en.wikipedia.org/wiki/Pittsburgh_Pirates#Uniforms (black and gold from 1948)
  ["pirates", "1960-1969", "home", "fff 27251f fdb827 27251f he=27251f sk=27251f"],
  ["pirates", "1960-1969", "away", "a9adb0 27251f fdb827 27251f he=27251f sk=27251f"],
  // 1970 to 1976: pullovers, gold cap with a black brim
  ["pirates", "1970-1976", "home", "fff 27251f fdb827 27251f cl=p he=fdb827 sk=fdb827"],
  ["pirates", "1970-1976", "away", "a9adb0 27251f fdb827 27251f cl=p he=fdb827 sk=fdb827"],
  // 1977 to 1979: three sets, white with black and gold pinstripes, all black, all gold
  ["pirates", "1977-1979", "home", "fff 27251f fdb827 27251f p=p cl=p he=27251f sk=fdb827"],
  ["pirates", "1977-1979", "black", "27251f fdb827 fff fdb827 cl=p he=27251f sk=fdb827"],
  ["pirates", "1977-1979", "gold", "fdb827 27251f fff 27251f cl=p he=fdb827 sk=27251f"],
  ["pirates", "1991-", "home", "fff 27251f fdb827 27251f he=27251f sk=27251f"],
  ["pirates", "1991-", "away", "a2aaad 27251f fdb827 27251f he=27251f sk=27251f"],
  ["pirates", "1991-", "black", "27251f fdb827 fff fdb827 he=27251f sk=27251f"],
  // https://en.wikipedia.org/wiki/St._Louis_Cardinals#Uniforms
  ["cardinals", "1940-1969", "home", "fff c41e3a 0c2340 c41e3a pi=1 he=c41e3a sk=c41e3a"],
  ["cardinals", "1940-1969", "away", "a9adb0 c41e3a 0c2340 c41e3a pi=1 he=c41e3a sk=c41e3a"],
  // 1970 to 1991: pullovers, powder blue road
  ["cardinals", "1970-1991", "home", "fff c41e3a - c41e3a cl=p he=c41e3a sk=c41e3a"],
  ["cardinals", "1970-1991", "away", "9cbcdc c41e3a - c41e3a cl=p he=c41e3a sk=c41e3a"],
  ["cardinals", "1992-", "home", "fff c41e3a 0c2340 c41e3a 0c2340 he=c41e3a sk=c41e3a"],
  ["cardinals", "1992-", "away", "a2aaad c41e3a 0c2340 c41e3a 0c2340 he=c41e3a sk=c41e3a"],
  // https://en.wikipedia.org/wiki/Arizona_Diamondbacks#Uniforms
  // unsure: the 1998 to 2006 purple, teal and copper set
  ["dbacks", "1998-2006", "home", "fff 5b2c83 00a3a6 5b2c83 he=5b2c83 sk=5b2c83"],
  ["dbacks", "1998-2006", "away", "a9adb0 5b2c83 00a3a6 5b2c83 he=5b2c83 sk=5b2c83"],
  ["dbacks", "2007-2023", "home", "fff a71930 e3d4ad a71930 he=000 sk=000"],
  ["dbacks", "2007-2023", "away", "a2aaad a71930 e3d4ad a71930 he=000 sk=000"],
  ["dbacks", "2007-2023", "red", "a71930 e3d4ad 000 e3d4ad he=a71930 sk=000"],
  // https://en.wikipedia.org/wiki/Colorado_Rockies#Uniforms (purple, black and silver)
  ["rockies", "1993-", "home", "fff 33006f c4ced4 33006f p=p he=000 sk=33006f"],
  ["rockies", "1993-", "away", "a2aaad 33006f c4ced4 33006f he=000 sk=33006f"],
  ["rockies", "1993-", "purple", "33006f c4ced4 000 c4ced4 he=33006f sk=33006f"],
  // https://en.wikipedia.org/wiki/Brooklyn_Dodgers#Uniforms (blue lettering, red numbers, blue cap)
  ["brooklyn", "1939-1957", "home", "fff 005a9c ef3e42 ef3e42 he=005a9c sk=005a9c"],
  ["brooklyn", "1939-1957", "away", "a9adb0 005a9c ef3e42 ef3e42 he=005a9c sk=005a9c"],
  // https://en.wikipedia.org/wiki/Los_Angeles_Dodgers#Uniforms
  ["dodgers", "1958-", "home", "fff 005a9c ef3e42 ef3e42 he=005a9c sk=005a9c"],
  ["dodgers", "1958-", "away", "a9adb0 005a9c ef3e42 ef3e42 he=005a9c sk=005a9c"],
  // https://en.wikipedia.org/wiki/San_Francisco_Giants#Uniforms (black and orange)
  ["nygiants", "1947-1957", "home", "fff 000 fd5a1e 000 he=000 sk=000"],
  ["nygiants", "1947-1957", "away", "a9adb0 000 fd5a1e 000 he=000 sk=000"],
  ["giants", "1958-", "home", "fff 27251f fd5a1e fd5a1e 27251f he=27251f sk=27251f"],
  ["giants", "1958-", "away", "a2aaad 27251f fd5a1e fd5a1e 27251f he=27251f sk=27251f"],
  ["giants", "1990-", "orange", "fd5a1e 27251f fff 27251f he=27251f sk=27251f"],
  // https://en.wikipedia.org/wiki/San_Diego_Padres#Uniforms (brown and gold)
  ["padres", "1969-1971", "home", "f5ecd0 4a2c1a ffc425 4a2c1a he=4a2c1a sk=4a2c1a"],
  ["padres", "1969-1971", "away", "d2b48c 4a2c1a ffc425 4a2c1a he=4a2c1a sk=4a2c1a"],
  ["padres", "1972-1973", "gold", "ffc425 4a2c1a fff 4a2c1a he=4a2c1a sk=4a2c1a"],
  // 1976: brown road with gold sleeves
  ["padres", "1976-1977", "brown", "4a2c1a ffc425 fff fff rg=1 he=4a2c1a sk=4a2c1a"],
  ["padres", "1985-1990", "home", "fff 4a2c1a ff6600 4a2c1a p=p he=4a2c1a sk=4a2c1a"],
  ["padres", "1991-2003", "home", "fff 0c2340 fe5a1d 0c2340 p=p he=0c2340 sk=0c2340"],
  ["padres", "1991-2003", "away", "a9adb0 0c2340 fe5a1d 0c2340 he=0c2340 sk=0c2340"],
  ["padres", "2020-", "home", "fff 2f241d ffc425 2f241d p=p he=2f241d sk=2f241d"],
  ["padres", "2020-", "away", "e3d4ad 2f241d ffc425 2f241d he=2f241d sk=2f241d"],
  // https://en.wikipedia.org/wiki/Seattle_Pilots#Uniforms (navy and gold, 1969)
  // unsure: road set
  ["pilots", "1969", "home", "fff 0c2c56 ffcb05 0c2c56 he=0c2c56 sk=0c2c56"],
  ["pilots", "1969", "away", "a9adb0 0c2c56 ffcb05 0c2c56 he=0c2c56 sk=0c2c56"],
  // https://en.wikipedia.org/wiki/Washington_Senators_(1901%E2%80%931960)#Uniforms
  // unsure: red and navy on white and grey
  ["senators", "1950s", "home", "fff c8102e 0c2340 c8102e he=c8102e sk=c8102e"],
  ["senators", "1950s", "away", "a9adb0 c8102e 0c2340 c8102e he=c8102e sk=c8102e"],
  // https://en.wikipedia.org/wiki/Philadelphia_Athletics#Uniforms (navy and white)
  // unsure: navy trim
  ["phila", "1930s", "home", "fff 0c2340 - 0c2340 he=0c2340 sk=0c2340"],
  ["phila", "1930s", "away", "a9adb0 0c2340 - 0c2340 he=0c2340 sk=0c2340"],
]);
