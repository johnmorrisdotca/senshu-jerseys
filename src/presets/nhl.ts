// The 32 current NHL franchises under their present names, from the 1967 expansion to 2025-26: colours and stripes only, no crests or sponsor marks.
// Before 2003-04 the home team wore white, and from 2003-04 the dark jersey: eras that cross a change use a colour word instead of home/away.
// Stripes are read from the cuff (and the hem) inwards: `ss=4.0.3.2.11.1.3.2` is a gap of 4, then a 2 border in trim2, a 7 band in trim, a 2 border in trim2.
import { defineLeague } from "./core.ts";

export const NHL = defineLeague(
  "nhl",
  "hockey",
  {
    montreal: ["Montreal Canadiens", "モントリオール・カナディアンズ"],
    toronto: ["Toronto Maple Leafs", "トロント・メープルリーフス"],
    boston: ["Boston Bruins", "ボストン・ブルーインズ"],
    chicago: ["Chicago Blackhawks", "シカゴ・ブラックホークス"],
    detroit: ["Detroit Red Wings", "デトロイト・レッドウィングス"],
    rangers: ["New York Rangers", "ニューヨーク・レンジャーズ"],
    flyers: ["Philadelphia Flyers", "フィラデルフィア・フライヤーズ"],
    penguins: ["Pittsburgh Penguins", "ピッツバーグ・ペンギンズ"],
    blues: ["St. Louis Blues", "セントルイス・ブルース"],
    kings: ["Los Angeles Kings", "ロサンゼルス・キングス"],
    sabres: ["Buffalo Sabres", "バッファロー・セイバーズ"],
    canucks: ["Vancouver Canucks", "バンクーバー・カナックス"],
    islanders: ["New York Islanders", "ニューヨーク・アイランダース"],
    capitals: ["Washington Capitals", "ワシントン・キャピタルズ"],
    oilers: ["Edmonton Oilers", "エドモントン・オイラーズ"],
    flames: ["Calgary Flames", "カルガリー・フレームス"],
    devils: ["New Jersey Devils", "ニュージャージー・デビルズ"],
    stars: ["Dallas Stars", "ダラス・スターズ"],
    avalanche: ["Colorado Avalanche", "コロラド・アバランチ"],
    hurricanes: ["Carolina Hurricanes", "カロライナ・ハリケーンズ"],
    jets: ["Winnipeg Jets", "ウィニペグ・ジェッツ"],
    wild: ["Minnesota Wild", "ミネソタ・ワイルド"],
    coyotes: ["Arizona Coyotes", "アリゾナ・コヨーテス"],
    utah: ["Utah Mammoth", "ユタ・マンモス"],
    senators: ["Ottawa Senators", "オタワ・セネターズ"],
    lightning: ["Tampa Bay Lightning", "タンパベイ・ライトニング"],
    sharks: ["San Jose Sharks", "サンノゼ・シャークス"],
    panthers: ["Florida Panthers", "フロリダ・パンサーズ"],
    predators: ["Nashville Predators", "ナッシュビル・プレデターズ"],
    bluejackets: ["Columbus Blue Jackets", "コロンバス・ブルージャケッツ"],
    ducks: ["Anaheim Ducks", "アナハイム・ダックス"],
    knights: ["Vegas Golden Knights", "ベガス・ゴールデンナイツ"],
    kraken: ["Seattle Kraken", "シアトル・クラーケン"],
  },
  [
    // https://en.wikipedia.org/wiki/Montreal_Canadiens#Team_identity
    // red: blue-and-white stripe on each arm, across the chest and at the waist; white: red yoke, red cuffs, red-blue-red waist stripe
    ["montreal", "1967-", "red", "af1e2d fff 192168 fff 192168 ss=4.0.5.1.10.2.5.1 hs=4.0.5.1.10.2.5.1 cb=3.1.6.2.3.1 cy=104 pt=192168 sk=af1e2d skt=192168 sb=6.0.3.2.6.1.3.2"],
    // unsure: number colours on the white jersey; the red cuffs are `cf`, not a sleeve stripe
    ["montreal", "1967-", "white", "fff af1e2d 192168 192168 af1e2d ss=0 cf=18.1 hs=4.0.5.1.8.2.5.1 p=y y=c pa=1 co=l pt=192168 sk=af1e2d"],
    // Reverse Retro 2020-21: the red template with blue as the base; Reverse Retro 2022-23: light blue base (unsure: the exact light blue)
    ["montreal", "2020-2021", "alt", "192168 fff af1e2d fff af1e2d ss=4.0.5.1.10.2.5.1 hs=4.0.5.1.10.2.5.1 cb=3.1.6.2.3.1 cy=104 pt=af1e2d"],
    ["montreal", "2022-2023", "alt", "9bcbeb fff 192168 fff 192168 ss=4.0.5.1.10.2.5.1 hs=4.0.5.1.10.2.5.1 cb=3.1.6.2.3.1 cy=104"],

    // https://en.wikipedia.org/wiki/Toronto_Maple_Leafs#Logo_and_uniform
    // 1967-70: thin-thick-thin stripes on arms, waist and socks, lace-up neck; the white jersey had a blue yoke
    ["toronto", "1967-1970", "blue", "003e7e fff - fff - ss=4.0.3.1.3.0.8.1.3.0.3.1 hs=4.0.3.1.3.0.8.1.3.0.3.1 co=l pt=003e7e sk=003e7e skt=fff sb=8.0.2.1.2.0.5.1.2.0.2.1"],
    ["toronto", "1967-1970", "white", "fff 003e7e - 003e7e - ss=4.0.3.1.3.0.8.1.3.0.3.1 hs=4.0.3.1.3.0.8.1.3.0.3.1 p=y y=c pa=1 co=l pt=003e7e sk=003e7e skt=fff sb=8.0.2.1.2.0.5.1.2.0.2.1"],
    // 1970-92: a long yoke to the cuffs and one waist stripe, two socks stripes. unsure: the blue jersey's arm band is drawn as one cuff stripe
    ["toronto", "1970-1992", "blue", "003e7e fff - fff - ss=4.0.23.1 hs=4.0.11.1 co=v pt=003e7e sk=003e7e skt=fff sb=8.0.3.1.3.0.3.1"],
    ["toronto", "1970-1992", "white", "fff 003e7e - 003e7e - p=y y=f hs=4.0.11.1 co=v pt=003e7e sk=003e7e skt=fff sb=8.0.3.1.3.0.3.1"],
    // 1992-2016: two stripes on the arms and at the waist
    ["toronto", "1992-2016", "blue", "003e7e fff - fff - ss=4.0.7.1.5.0.7.1 hs=4.0.7.1.5.0.7.1 co=v pt=003e7e sk=003e7e skt=fff sb=8.0.3.1.3.0.3.1"],
    ["toronto", "1992-2016", "white", "fff 003e7e - 003e7e - ss=4.0.7.1.5.0.7.1 hs=4.0.7.1.5.0.7.1 co=v pt=003e7e sk=003e7e skt=fff sb=8.0.3.1.3.0.3.1"],
    // 2016-: two arm stripes, one waist stripe, laces
    ["toronto", "2016-", "home", "00205b fff - fff - ss=4.0.7.1.5.0.7.1 hs=4.0.8.1 co=l pt=00205b sk=00205b skt=fff sb=8.0.3.1.3.0.3.1"],
    ["toronto", "2016-", "away", "fff 00205b - 00205b - ss=4.0.7.1.5.0.7.1 hs=4.0.8.1 co=l pt=00205b sk=00205b skt=fff sb=8.0.3.1.3.0.3.1"],

    // https://en.wikipedia.org/wiki/Boston_Bruins#Logo_and_uniforms
    // unsure: the 1970s-90s stripe order is read as gold with white borders on black, black with gold borders on white
    ["boston", "1967-1995", "black", "000 ffb81c fff ffb81c fff ss=4.0.3.2.10.1.3.2 hs=4.0.3.2.10.1.3.2 co=v pt=000 sk=ffb81c skt=000 sb=6.0.2.1.5.0.2.1"],
    ["boston", "1967-1995", "white", "fff 000 ffb81c 000 ffb81c ss=4.0.3.2.10.1.3.2 hs=4.0.3.2.10.1.3.2 p=y y=c pa=1 co=v pt=000 sk=ffb81c skt=000 sb=6.0.2.1.5.0.2.1"],
    // 1995-2006: a thick stripe from sleeve to sleeve across the chest. unsure: the exact stripe order
    ["boston", "1995-2006", "black", "000 ffb81c fff ffb81c fff ss=4.0.3.2.19.1.3.2 hs=4.0.3.2.10.1.3.2 cb=2.2.12.1.2.2 cy=96 pt=000 sk=ffb81c skt=000 sb=6.0.2.1.5.0.2.1"],
    ["boston", "1995-2006", "white", "fff 000 ffb81c 000 ffb81c ss=4.0.3.2.19.1.3.2 hs=4.0.3.2.10.1.3.2 cb=2.2.12.1.2.2 cy=96 pt=000 sk=ffb81c skt=000 sb=6.0.2.1.5.0.2.1"],
    // unsure: the gold third's stripes
    ["boston", "1995-2006", "third", "ffb81c 000 fff 000 fff ss=4.0.3.2.16.1.3.2 hs=4.0.3.2.13.1.3.2 pt=000"],
    ["boston", "2007-", "home", "000 ffb81c fff ffb81c fff ss=4.0.3.2.13.1.3.2 hs=4.0.3.2.13.1.3.2 co=l pt=000 sk=ffb81c skt=000 sb=6.0.2.1.5.0.2.1"],
    ["boston", "2007-", "away", "fff 000 ffb81c 000 ffb81c ss=4.0.3.2.13.1.3.2 hs=4.0.3.2.13.1.3.2 co=l pt=000 sk=ffb81c skt=000 sb=6.0.2.1.5.0.2.1"],
    ["boston", "2020-2021", "alt", "ffb81c 000 fff 000 fff ss=4.0.3.2.13.1.3.2 hs=4.0.3.2.13.1.3.2 pt=000"],

    // https://en.wikipedia.org/wiki/Chicago_Blackhawks#Jerseys
    // red: white stripes edged in black on the arms and waist; white: red stripes edged in black. unsure: the old stripe is a set of three, drawn as one
    ["chicago", "1967-", "red", "cf0a2c fff 000 fff 000 ss=4.0.3.2.11.1.3.2 hs=4.0.3.2.11.1.3.2 co=v pt=000 sk=cf0a2c skt=000 sb=6.0.2.1.7.2.2.1"],
    ["chicago", "1967-", "white", "fff cf0a2c 000 cf0a2c 000 ss=4.0.3.2.11.1.3.2 hs=4.0.3.2.11.1.3.2 co=v pt=000"],
    ["chicago", "1996-2007", "third", "000 cf0a2c fff fff cf0a2c ss=4.0.3.2.10.1.3.2 hs=4.0.3.2.10.1.3.2 co=v pt=000"],
    // 2009 Winter Classic (1936-37 look): black with a wide beige chest and sleeve stripe edged in red
    ["chicago", "2009-2011", "third", "000 e0d3a8 cf0a2c e0d3a8 cf0a2c ss=4.0.3.2.23.1.3.2 hs=0 cb=2.2.20.1.2.2 cy=96 co=l pt=000"],

    // https://en.wikipedia.org/wiki/Detroit_Red_Wings#Logo_and_uniforms
    // unsure: stripe widths; the traditional design is a base colour with piping and a cuff band in the other
    ["detroit", "1967-", "red", "ce1126 fff - fff - ss=4.0.19.1 hs=4.0.15.1 co=v pt=ce1126 sk=ce1126 skt=fff sb=6.0.3.1.8.0.3.1"],
    ["detroit", "1967-", "white", "fff ce1126 - ce1126 - ss=4.0.19.1 hs=4.0.15.1 co=v pt=ce1126 sk=ce1126 skt=fff sb=6.0.3.1.8.0.3.1"],
    // 2009 Winter Classic (1926-27 Cougars): white with one bold red stripe on the chest and the sleeves
    ["detroit", "2009", "alt", "fff ce1126 - ce1126 - ss=4.0.23.1 hs=0 cb=16.1 cy=100 co=l pt=ce1126"],
    // Reverse Retro 2020-21: white base with silver stripes
    ["detroit", "2020-2021", "alt", "fff c0c0c0 - ce1126 - ss=4.0.19.1 hs=4.0.15.1 co=v pt=ce1126"],

    // https://en.wikipedia.org/wiki/New_York_Rangers#Uniforms
    // blue: white-red-white stripes; white: red-blue-red stripes; red pants since 1929-30. unsure: the order inside the stripe
    ["rangers", "1967-1975", "blue", "0038a8 fff ce1126 fff ce1126 ss=4.0.3.1.8.2.3.1 hs=4.0.3.1.8.2.3.1 co=v pt=ce1126"],
    ["rangers", "1967-1975", "white", "fff 0038a8 ce1126 0038a8 ce1126 ss=4.0.3.2.8.1.3.2 hs=4.0.3.2.8.1.3.2 co=v pt=ce1126"],
    // 1978-97: bolder arm and waist stripes, red-white-red V neck; unsure: the exact widths
    ["rangers", "1978-1997", "blue", "0038a8 fff ce1126 fff ce1126 ss=4.0.5.2.3.0.5.1 hs=4.0.5.2.3.0.5.1 co=v cc=2 pt=ce1126"],
    // 1997-: the stripes sit at the elbow (`ss` starts with a gap of 24 from the cuff); red numbers with white trim on the blue jersey. The diagonal team word on the chest is a wordmark, so it is not drawn
    ["rangers", "1997-", "blue", "0038a8 fff ce1126 ce1126 fff ss=24.0.4.1.10.2.4.1 hs=4.0.3.1.8.2.3.1 co=l pt=ce1126"],
    ["rangers", "1997-", "white", "fff 0038a8 ce1126 0038a8 ce1126 ss=24.0.4.2.10.1.4.2 hs=4.0.3.2.8.1.3.2 co=l pt=ce1126"],
    // 1996-2007 navy alternate; unsure: stripes
    ["rangers", "1996-2007", "third", "001a4d ce1126 c0c0c0 fff ce1126 ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=v pt=001a4d"],
    // 2012 Winter Classic: cream with blue and red stripes
    ["rangers", "2012", "alt", "efe3c1 0038a8 ce1126 0038a8 ce1126 ss=4.0.3.2.7.1.3.2 hs=4.0.3.2.7.1.3.2 co=l pt=ce1126"],

    // https://en.wikipedia.org/wiki/Philadelphia_Flyers#Logo_and_jerseys
    // 1967-82: a white stripe down each shoulder and arm (the wings); unsure: drawn as one cuff stripe because the stripe runs the length of the arm
    ["flyers", "1967-1982", "orange", "f74902 fff 000 fff 000 ss=4.0.16.1 hs=0 sn=1 co=v pt=000 sk=f74902 skt=fff sb=6.0.3.1.3.0.3.1"],
    ["flyers", "1967-1982", "white", "fff f74902 000 f74902 000 ss=4.0.16.1 hs=0 sn=1 co=v pt=000 sk=f74902 skt=000 sb=6.0.3.1.3.0.3.1"],
    // 1982-2007: wider stripes with black borders and a pinstripe at the cuff
    ["flyers", "1982-2007", "orange", "f74902 fff 000 fff 000 ss=4.0.3.2.16.1.3.2 hs=0 co=v pt=000"],
    ["flyers", "1982-2007", "white", "fff f74902 000 f74902 000 ss=4.0.3.2.16.1.3.2 hs=0 co=v pt=000"],
    ["flyers", "1997-2010", "black", "000 f74902 fff f74902 fff ss=4.0.3.2.16.1.3.2 hs=0 co=v pt=000"],
    // 2009-: the 1973 look back as the main jersey
    ["flyers", "2009-", "home", "f74902 fff 000 fff 000 ss=4.0.16.1 hs=0 sn=1 co=v pt=000"],
    ["flyers", "2010-", "away", "fff f74902 000 f74902 000 ss=4.0.16.1 hs=0 sn=1 co=v pt=000"],

    // https://en.wikipedia.org/wiki/Pittsburgh_Penguins#Crest_and_sweater_design
    // 1967-73: powder blue (unsure: the shade) with three navy stripes round the sleeves and the bottom; white away
    ["penguins", "1967-1973", "blue", "9cc3e6 1b2c6b fff 1b2c6b - ss=5.1.3.0.5.1.3.0.5.1 hs=5.1.3.0.5.1.3.0.5.1 co=v pt=1b2c6b"],
    ["penguins", "1967-1973", "white", "fff 1b2c6b 9cc3e6 1b2c6b - ss=5.1.3.0.5.1.3.0.5.1 hs=5.1.3.0.5.1.3.0.5.1 co=v pt=1b2c6b"],
    // 1980-92: black and gold from 30 January 1980. unsure: the stripe order
    ["penguins", "1980-1992", "black", "000 fcb514 fff fcb514 fff ss=4.0.3.2.11.1.3.2 hs=4.0.3.2.11.1.3.2 co=v pt=000 sk=000 skt=fcb514 sb=6.0.3.1.5.0.3.1"],
    ["penguins", "1980-1992", "white", "fff 000 fcb514 000 fcb514 ss=4.0.3.2.11.1.3.2 hs=4.0.3.2.11.1.3.2 co=v pt=000 sk=fcb514 skt=000 sb=6.0.3.1.5.0.3.1"],
    ["penguins", "1980-1984", "third", "fcb514 000 fff 000 fff ss=4.0.3.2.11.1.3.2 hs=4.0.3.2.11.1.3.2 co=v pt=000"],
    // 2000-2016: the metallic Vegas gold (cfc493)
    ["penguins", "2000-2016", "black", "000 cfc493 fff cfc493 fff ss=4.0.3.2.11.1.3.2 hs=4.0.3.2.11.1.3.2 co=l pt=000"],
    ["penguins", "2000-2016", "white", "fff 000 cfc493 000 cfc493 ss=4.0.3.2.11.1.3.2 hs=4.0.3.2.11.1.3.2 co=l pt=000"],
    // 2014-: Pittsburgh gold, the 1991-92 look
    ["penguins", "2014-", "home", "000 fcb514 fff fcb514 fff ss=4.0.3.2.11.1.3.2 hs=4.0.3.2.11.1.3.2 co=l pt=000 sk=000 skt=fcb514 sb=6.0.3.1.5.0.3.1"],
    ["penguins", "2014-", "away", "fff 000 fcb514 000 fcb514 ss=4.0.3.2.11.1.3.2 hs=4.0.3.2.11.1.3.2 co=l pt=000 sk=000 skt=fcb514 sb=6.0.3.1.5.0.3.1"],

    // https://en.wikipedia.org/wiki/St._Louis_Blues#Jerseys
    // unsure: the 1967-84 blue (a lighter blue than later) and the stripe order; the white jersey has a blue yoke
    ["blues", "1967-1984", "blue", "0a56a8 fcb514 fff fcb514 fff ss=4.0.3.2.10.1.3.2 hs=4.0.3.2.10.1.3.2 co=v pt=0a56a8"],
    ["blues", "1967-1984", "white", "fff 0a56a8 fcb514 0a56a8 fcb514 ss=4.0.3.2.10.1.3.2 hs=4.0.3.2.10.1.3.2 p=y y=c pa=1 co=v pt=0a56a8"],
    // 1984-94: darker blue with red added; unsure: the stripe order
    ["blues", "1984-1994", "blue", "003087 fcb514 c8102e fcb514 c8102e ss=4.0.5.2.8.1.5.2 hs=4.0.5.2.8.1.5.2 co=v pt=003087"],
    ["blues", "1984-1994", "white", "fff 003087 c8102e 003087 c8102e ss=4.0.5.2.8.1.5.2 hs=4.0.5.2.8.1.5.2 co=v pt=003087"],
    // 1994-98: red much more prominent, thin diagonal stripes on the arms and tail (not drawable; plain stripes here)
    ["blues", "1994-1998", "blue", "002a6e c8102e fcb514 fff c8102e ss=4.0.5.1.8.2.5.1 hs=4.0.5.1.8.2.5.1 co=v pt=002a6e"],
    // 1998-2025: lighter blue back, navy replaces red
    ["blues", "1998-2025", "blue", "002f87 fcb514 041e42 fcb514 041e42 ss=4.0.3.2.8.1.3.2 hs=4.0.3.2.8.1.3.2 co=l pt=002f87"],
    ["blues", "1998-2025", "white", "fff 002f87 fcb514 002f87 - ss=4.0.3.2.8.1.3.2 hs=4.0.3.2.8.1.3.2 p=y y=c pa=1 co=l pt=002f87"],
    // unsure: 2025 home built on the 2017 heritage jersey: gold and white chest and sleeve stripes
    ["blues", "2025-", "home", "002f87 fcb514 fff fcb514 002f87 ss=4.0.3.2.10.1.3.2 hs=0 cb=2.2.8.1.2.2 cy=100 co=l pt=002f87"],

    // https://en.wikipedia.org/wiki/Los_Angeles_Kings#Team_identity
    // 1967-80: Forum blue (a purple, unsure: the shade) and gold; gold pants with the gold jersey 1970-79
    ["kings", "1967-1980", "purple", "4d2f8a ffc72c fff ffc72c fff ss=4.0.5.1.8.0.5.1 hs=4.0.5.1.8.0.5.1 co=v pt=4d2f8a sk=4d2f8a skt=ffc72c sb=6.0.3.1.5.0.3.1"],
    ["kings", "1967-1980", "gold", "ffc72c 4d2f8a fff 4d2f8a fff ss=4.0.5.1.8.0.5.1 hs=4.0.5.1.8.0.5.1 co=v pt=ffc72c sk=ffc72c skt=4d2f8a sb=6.0.3.1.5.0.3.1"],
    // 1980-88: a contrasting yoke from sleeve to sleeve
    ["kings", "1980-1988", "purple", "4d2f8a ffc72c fff ffc72c fff ss=4.0.5.1.8.0.5.1 hs=4.0.5.1.8.0.5.1 p=y y=s pa=1 co=v pt=4d2f8a sk=4d2f8a skt=ffc72c sb=6.0.3.1.5.0.3.1"],
    ["kings", "1980-1988", "gold", "ffc72c 4d2f8a fff 4d2f8a fff ss=4.0.5.1.8.0.5.1 hs=4.0.5.1.8.0.5.1 p=y y=s pa=1 co=v pt=4d2f8a sk=ffc72c skt=4d2f8a sb=6.0.3.1.5.0.3.1"],
    // 1988-98: black and silver; a wide silver arm stripe holds the sleeve number
    ["kings", "1988-1998", "black", "000 a2aaad fff fff 000 ss=4.0.3.2.23.1.3.2 hs=4.0.3.2.10.1.3.2 co=v pt=000 sk=000 skt=a2aaad sb=6.0.3.1.5.0.3.1"],
    ["kings", "1988-1998", "white", "fff 000 a2aaad 000 a2aaad ss=4.0.3.2.23.1.3.2 hs=4.0.3.2.10.1.3.2 co=v pt=000 sk=000 skt=a2aaad sb=6.0.3.1.5.0.3.1"],
    // 1998-2007: purple, silver and white; purple on the yoke, arm stripes and tail. unsure: the purple (lighter than before)
    ["kings", "1998-2007", "white", "fff 5b2c8f a2aaad 5b2c8f - ss=4.0.3.2.11.1.3.2 hs=4.0.3.2.11.1.3.2 p=y y=c pa=1 co=v pt=5b2c8f"],
    ["kings", "1999-2007", "purple", "5b2c8f a2aaad fff fff 5b2c8f ss=4.0.3.2.11.1.3.2 hs=4.0.3.2.11.1.3.2 co=v pt=5b2c8f"],
    // 2011-: black home without a tail stripe, white away with a black and silver tail stripe
    ["kings", "2011-", "home", "000 a2aaad fff fff 000 ss=4.0.3.2.23.1.3.2 hs=0 co=v pt=000 sk=000 skt=a2aaad sb=6.0.3.1.5.0.3.1"],
    ["kings", "2011-", "away", "fff 000 a2aaad 000 a2aaad ss=4.0.3.2.23.1.3.2 hs=4.0.3.2.10.1.3.2 co=v pt=000 sk=000 skt=a2aaad sb=6.0.3.1.5.0.3.1"],

    // https://en.wikipedia.org/wiki/Buffalo_Sabres#Logo_and_uniforms
    // 1970-96: white with a blue and gold yoke and alternating gold, white and blue stripes; blue with gold stripes
    ["sabres", "1970-1996", "white", "fff 00479d fcb514 00479d - ss=4.0.5.2.3.0.8.1.3.0.5.2 hs=4.0.5.2.3.0.8.1.3.0.5.2 p=y y=c pa=1 co=v pt=00479d"],
    ["sabres", "1970-1996", "blue", "00479d fcb514 fff fcb514 fff ss=4.0.5.1.3.0.8.2.3.0.5.1 hs=4.0.5.1.3.0.8.2.3.0.5.1 co=v pt=00479d"],
    // 1996-2006: black, red and silver. unsure: the stripes (a bull's head shape is drawn as plain stripes)
    ["sabres", "1996-2006", "black", "000 c8102e a2aaad fff c8102e ss=4.0.3.2.8.1.3.2 hs=4.0.3.2.8.1.3.2 co=v pt=000"],
    ["sabres", "1996-2006", "white", "fff 000 c8102e 000 c8102e ss=4.0.3.2.8.1.3.2 hs=4.0.3.2.8.1.3.2 co=v pt=000"],
    // 2006-2020: navy and gold. unsure: the stripes (the 2006-10 slug jerseys are drawn as the 2010 look)
    ["sabres", "2010-2020", "navy", "041e42 ffb81c a2aaad fff 041e42 ss=4.0.3.2.8.1.3.2 hs=4.0.3.2.8.1.3.2 co=l pt=041e42"],
    ["sabres", "2010-2020", "white", "fff 041e42 ffb81c 041e42 ffb81c ss=4.0.3.2.8.1.3.2 hs=4.0.3.2.8.1.3.2 co=l pt=041e42"],
    // 2020-: the original royal blue returns
    ["sabres", "2020-", "home", "00479d fcb514 fff fcb514 fff ss=4.0.5.1.3.0.8.2.3.0.5.1 hs=4.0.5.1.3.0.8.2.3.0.5.1 co=l pt=00479d"],
    ["sabres", "2020-", "away", "fff 00479d fcb514 00479d - ss=4.0.5.2.3.0.8.1.3.0.5.2 hs=4.0.5.2.3.0.8.1.3.0.5.2 p=y y=c pa=1 co=l pt=00479d"],

    // https://en.wikipedia.org/wiki/Vancouver_Canucks#Logos_and_jerseys
    // 1970-78: blue and white with green stripes. unsure: the border colours
    ["canucks", "1970-1978", "blue", "003d8f 00843d fff fff 003d8f ss=4.0.3.2.10.1.3.2 hs=4.0.3.2.10.1.3.2 co=v pt=003d8f"],
    ["canucks", "1970-1978", "white", "fff 00843d 003d8f 003d8f 00843d ss=4.0.3.2.10.1.3.2 hs=4.0.3.2.10.1.3.2 co=v pt=003d8f"],
    // 1978-85 Flying V: a big V of black, orange and yellow stripes from the shoulders; yellow at home, black away. unsure: the V is a chevron here
    ["canucks", "1978-1985", "yellow", "fcd116 000 f15a22 000 f15a22 p=c r=26.1.18.2.60.0 ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=v pt=000 sk=000 skt=fcd116 sb=6.0.3.1.5.2.3.1"],
    ["canucks", "1978-1985", "black", "000 fcd116 f15a22 fcd116 f15a22 p=c r=26.1.18.2.60.0 ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=v pt=000 sk=000 skt=fcd116 sb=6.0.3.1.5.2.3.1"],
    // 1992-97 Flying Skate (red and yellow after 1992). unsure: the stripes
    ["canucks", "1992-1997", "white", "fff 000 e31837 000 fcd116 ss=4.0.3.1.8.2.3.1 hs=4.0.3.1.8.2.3.1 co=v pt=000"],
    ["canucks", "1992-1997", "black", "000 e31837 fcd116 fff e31837 ss=4.0.3.2.8.1.3.2 hs=4.0.3.2.8.1.3.2 co=v pt=000"],
    // 1997-2007 orca: blue, red and silver
    ["canucks", "1997-2007", "blue", "0b1f4d e31837 a2aaad fff 0b1f4d ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=v pt=0b1f4d"],
    ["canucks", "1997-2007", "white", "fff 0b1f4d e31837 0b1f4d e31837 ss=4.0.5.2.7.1.5.2 hs=4.0.5.2.7.1.5.2 co=v pt=0b1f4d"],
    // 2007-19: royal blue and kelly green
    ["canucks", "2007-2019", "home", "00205b 00843d fff fff 00843d ss=4.0.5.2.8.1.5.2 hs=4.0.5.2.8.1.5.2 co=l pt=00205b"],
    ["canucks", "2007-2019", "away", "fff 00205b 00843d 00205b 00843d ss=4.0.5.2.8.1.5.2 hs=4.0.5.2.8.1.5.2 co=l pt=00205b"],
    // 2019 heritage third: the 1970 look in blue and white with green stripes
    ["canucks", "2019-", "third", "00205b 00843d fff fff 00843d ss=4.0.3.2.10.1.3.2 hs=4.0.3.2.10.1.3.2 co=v pt=00205b"],
    // 2023 black Flying Skate alternate: thick red and yellow stripes
    ["canucks", "2023-", "alt", "000 e31837 fcd116 fff e31837 ss=4.0.5.2.11.1.5.2 hs=4.0.5.2.11.1.5.2 co=l pt=000"],

    // https://en.wikipedia.org/wiki/New_York_Islanders#Jerseys
    // 1972-95: white with orange and royal blue stripes; royal blue with white and orange stripes
    ["islanders", "1972-1995", "blue", "00539b f47d30 fff fff f47d30 ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=v pt=00539b sk=00539b skt=f47d30 sb=6.0.3.1.4.2.3.1"],
    ["islanders", "1972-1995", "white", "fff 00539b f47d30 00539b f47d30 ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=v pt=00539b sk=00539b skt=f47d30 sb=6.0.3.1.4.2.3.1"],
    // 1997-2010: navy and brighter orange; a traditional design again
    ["islanders", "1997-2010", "navy", "002d62 ff6a13 fff fff ff6a13 ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=v pt=002d62"],
    ["islanders", "1997-2010", "white", "fff 002d62 ff6a13 002d62 ff6a13 ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=v pt=002d62"],
    // 2002-07 orange third with navy yokes (unsure: the sharp points on the sides are not drawn)
    ["islanders", "2002-2007", "third", "ff6a13 002d62 fff fff 002d62 p=y y=c pa=1 ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=v pt=002d62"],
    // 2010-: the 1970s look is back
    ["islanders", "2010-", "home", "00539b f47d30 fff fff f47d30 ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=l pt=00539b sk=00539b skt=f47d30 sb=6.0.3.1.4.2.3.1"],
    ["islanders", "2010-", "away", "fff 00539b f47d30 00539b f47d30 ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=l pt=00539b sk=00539b skt=f47d30 sb=6.0.3.1.4.2.3.1"],

    // https://en.wikipedia.org/wiki/Washington_Capitals#Logos_and_jerseys
    // 1974-95: red, white and blue with contrasting shoulders. unsure: which colour is the yoke on each jersey, and the stripes
    ["capitals", "1974-1995", "red", "c8102e fff 041e42 fff 041e42 ss=4.0.3.1.8.2.3.1 hs=4.0.3.1.8.2.3.1 p=y y=c pa=2 co=v pt=041e42"],
    ["capitals", "1974-1995", "white", "fff c8102e 041e42 c8102e 041e42 ss=4.0.3.1.8.2.3.1 hs=4.0.3.1.8.2.3.1 p=y y=c pa=1 co=v pt=041e42"],
    // 1995-2007: blue, black and copper (unsure: the stripes)
    ["capitals", "1995-2007", "blue", "041e42 b87333 000 fff 000 ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=v pt=041e42"],
    ["capitals", "1995-2007", "white", "fff 041e42 b87333 041e42 b87333 ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=v pt=041e42"],
    ["capitals", "1997-2007", "black", "000 b87333 fff b87333 fff ss=4.0.5.1.5.0.5.1 hs=4.0.5.1.5.0.5.1 co=v pt=000"],
    // 2007-: red, white and blue again
    ["capitals", "2007-", "home", "c8102e fff 041e42 fff 041e42 ss=4.0.3.1.8.2.3.1 hs=4.0.3.1.8.2.3.1 co=l pt=c8102e sk=c8102e skt=fff sb=6.0.3.1.5.0.3.1"],
    ["capitals", "2007-", "away", "fff c8102e 041e42 c8102e 041e42 ss=4.0.3.2.8.1.3.2 hs=4.0.3.2.8.1.3.2 co=l pt=c8102e sk=c8102e skt=fff sb=6.0.3.1.5.0.3.1"],
    // 2015 Winter Classic: a vintage deep red with stripes on the shoulders, waist and legs
    ["capitals", "2015-", "third", "a6162b fff 041e42 fff 041e42 ss=4.0.3.1.8.2.3.1 hs=4.0.3.1.8.2.3.1 co=l pt=a6162b"],

    // https://en.wikipedia.org/wiki/Edmonton_Oilers#Jerseys
    // WHA 1972-74: orange base with blue trim (the numbers high on the shoulders); 1974-79: blue base with orange trim
    ["oilers", "1972-1974", "orange", "f26b21 003777 fff fff 003777 ss=4.0.5.1.8.0.5.1 hs=4.0.5.1.8.0.5.1 co=v pt=003777 sk=f26b21 skt=003777 sb=6.0.3.1.5.0.3.1 he=003777"],
    ["oilers", "1974-1979", "blue", "003777 f26b21 fff fff f26b21 ss=4.0.5.1.8.2.5.1 hs=4.0.5.1.8.2.5.1 co=v pt=003777 sk=003777 skt=f26b21 sb=6.0.3.1.5.2.3.1 he=003777"],
    // 1979-96: white at home, blue away, with orange and white stripes on the sleeves and hem. unsure: the away jersey's yoke and cuffs, the socks
    ["oilers", "1979-1996", "white", "fff 003777 f26b21 003777 f26b21 ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=v pt=003777 sk=003777 skt=f26b21 sb=6.0.3.2.4.1.3.2 he=003777"],
    ["oilers", "1979-1996", "blue", "003777 f26b21 fff fff f26b21 ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=v pt=003777 sk=003777 skt=f26b21 sb=6.0.3.1.4.2.3.1 he=003777"],
    // 1996-2007: midnight blue, copper and red, with the yoke and cuffs gone; unsure: the stripes
    ["oilers", "1996-2007", "blue", "00205b b86125 fff fff 00205b ss=4.0.3.2.8.1.3.2 hs=4.0.3.2.8.1.3.2 co=v pt=00205b sk=00205b skt=b86125 sb=6.0.3.1.4.2.3.1 he=00205b"],
    ["oilers", "1996-2007", "white", "fff 00205b b86125 00205b b86125 ss=4.0.3.2.8.1.3.2 hs=4.0.3.2.8.1.3.2 co=v pt=00205b sk=00205b skt=b86125 sb=6.0.3.1.4.2.3.1 he=00205b"],
    // 2001-07 third: midnight blue with two silver greys and a white sleeve stripe (unsure: stripes)
    ["oilers", "2001-2007", "third", "00205b a5acaf fff fff 00205b ss=4.0.5.1.8.2.5.1 hs=4.0.5.1.8.2.5.1 co=v pt=00205b he=00205b"],
    // 2009-17: the blue and orange jersey of the dynasty years is the home jersey; the Edge cut has no waist stripes
    ["oilers", "2009-2017", "home", "003777 f26b21 fff fff f26b21 ss=4.0.5.1.7.2.5.1 hs=0 co=l pt=003777 sk=003777 skt=f26b21 sb=6.0.3.1.4.2.3.1 he=003777"],
    ["oilers", "2011-2017", "away", "fff 003777 f26b21 003777 f26b21 ss=4.0.5.1.7.2.5.1 hs=0 co=l pt=003777 sk=003777 skt=f26b21 sb=6.0.3.1.4.2.3.1 he=003777"],
    // 2017-: orange home with the 1980s template, midnight blue as the second colour
    ["oilers", "2017-", "home", "ff4c00 041e42 fff fff 041e42 ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=l pt=041e42 sk=041e42 skt=ff4c00 sb=6.0.3.1.4.2.3.1 he=041e42"],
    ["oilers", "2017-", "away", "fff 041e42 ff4c00 041e42 ff4c00 ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=l pt=041e42 sk=041e42 skt=ff4c00 sb=6.0.3.1.4.2.3.1 he=041e42"],
    // 2019-: midnight blue alternate with minimal striping
    ["oilers", "2019-", "third", "041e42 ff4c00 - fff 041e42 ss=4.0.7.1 hs=4.0.7.1 co=l pt=041e42 he=041e42"],
    // 2023 Heritage Classic: blue with orange and cream stripes, brown pants
    ["oilers", "2023", "alt", "041e42 ff4c00 f1e6c8 f1e6c8 ff4c00 ss=4.0.5.1.7.2.5.1 hs=0 co=l pt=5c4033"],
    // 2025-26 alternate: tan base with blue and orange stripes across the shoulders, sleeves and waist
    ["oilers", "2025-", "alt", "d8c7a5 041e42 ff4c00 041e42 ff4c00 ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=l pt=041e42"],

    // https://en.wikipedia.org/wiki/Calgary_Flames#Jerseys
    // 1980-94 (and from 2020): white with red shoulders and red-and-yellow stripes; red with yellow and white stripes
    ["flames", "1980-1994", "white", "fff c8102e f1be48 c8102e f1be48 ss=4.0.3.2.8.1.3.2 hs=4.0.3.2.8.1.3.2 p=y y=c pa=1 co=v pt=c8102e he=c8102e"],
    ["flames", "1980-1994", "red", "c8102e f1be48 fff f1be48 fff ss=4.0.3.2.8.1.3.2 hs=4.0.3.2.8.1.3.2 co=v pt=c8102e he=c8102e"],
    // 2020-: a set of yellow, white and red (the body showing between) at the elbow and at the hem; white numbers with yellow trim. unsure: the away is the 1980 white with the new stripes
    ["flames", "2020-", "home", "c8102e f1be48 fff fff f1be48 ss=20.0.4.1.3.0.8.2.3.0.4.1 hs=4.0.4.1.3.0.8.2.3.0.4.1 co=l pt=c8102e he=c8102e"],
    ["flames", "2020-", "away", "fff c8102e f1be48 c8102e f1be48 p=y y=c pa=1 ss=20.0.4.2.3.0.8.1.3.0.4.2 hs=4.0.4.2.3.0.8.1.3.0.4.2 co=l pt=c8102e he=c8102e"],
    // 1994-2000: red and white with black and yellow stripes (unsure: stripe order)
    ["flames", "1994-2000", "red", "c8102e 000 f1be48 fff 000 ss=4.0.5.1.5.2.5.1 hs=4.0.5.1.5.2.5.1 co=v pt=c8102e he=c8102e"],
    ["flames", "1994-2000", "white", "fff 000 f1be48 c8102e 000 ss=4.0.5.1.5.2.5.1 hs=4.0.5.1.5.2.5.1 co=v pt=c8102e he=c8102e"],
    // 1998-2007 black third and road jersey
    ["flames", "1998-2007", "black", "000 c8102e f1be48 fff c8102e ss=4.0.5.2.7.1.5.2 hs=4.0.5.2.7.1.5.2 co=v pt=000"],
    // 2007-20: black trim, white away
    ["flames", "2007-2020", "home", "c8102e 000 f1be48 fff 000 ss=4.0.5.2.7.1.5.2 hs=0 co=l pt=c8102e he=c8102e"],
    ["flames", "2007-2020", "away", "fff c8102e 000 c8102e 000 ss=4.0.5.2.7.1.5.2 hs=0 co=l pt=c8102e he=c8102e"],
    // 2011 Heritage Classic (Calgary Tigers): maroon and mustard with a yellow chest stripe
    ["flames", "2011", "alt", "6f1d1b e6b800 f1e6c8 f1e6c8 6f1d1b ss=4.0.5.1.5.0.5.1 hs=0 cb=14.1 cy=100 co=l pt=f1e6c8"],

    // https://en.wikipedia.org/wiki/New_Jersey_Devils#Jerseys
    // 1982-92: red and green; unsure: stripe order
    ["devils", "1982-1992", "red", "ce1126 fff 00843d fff 00843d ss=4.0.3.1.10.2.3.1 hs=4.0.3.1.10.2.3.1 co=v pt=ce1126"],
    ["devils", "1982-1992", "white", "fff ce1126 00843d 00843d ce1126 ss=4.0.3.1.10.2.3.1 hs=4.0.3.1.10.2.3.1 co=v pt=ce1126"],
    // 1992-2017: red, black and white, black shoulders; three stripes on arms and waist
    ["devils", "1992-2017", "red", "ce1126 000 fff fff 000 ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 p=y y=c pa=1 co=v pt=000 he=ce1126"],
    ["devils", "1992-2017", "white", "fff 000 ce1126 000 ce1126 ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 p=y y=c pa=1 co=v pt=000 he=ce1126"],
    // 2017-: no waist stripe, thick equal black and white arm stripes
    ["devils", "2017-", "home", "ce1126 000 fff fff 000 ss=6.0.10.1.10.2 hs=0 p=y y=c pa=1 co=l pt=000 he=ce1126"],
    ["devils", "2017-", "away", "fff 000 ce1126 000 ce1126 ss=6.0.10.1.10.2 hs=0 p=y y=c pa=1 co=l pt=000 he=ce1126"],
    // Reverse Retro 2020-21: the 1982 template with green as the base
    ["devils", "2020-2021", "alt", "00843d fff ce1126 fff ce1126 ss=4.0.3.1.10.2.3.1 hs=4.0.3.1.10.2.3.1 co=v pt=00843d"],
    // 2021-: black alternate with white stripes across the shoulders and sleeves
    ["devils", "2021-", "alt", "000 fff ce1126 fff ce1126 ss=4.0.5.1.5.0.5.1 hs=0 co=l pt=000"],

    // https://en.wikipedia.org/wiki/Dallas_Stars#Logo_and_jersey_design
    // 1993-99: black away, white home, with green, gold and black trim (the Minnesota look) ; unsure: stripes
    ["stars", "1993-1999", "black", "000 006847 ffc72c fff 006847 ss=4.0.5.2.8.1.5.2 hs=4.0.5.2.8.1.5.2 co=v pt=000"],
    ["stars", "1993-1999", "white", "fff 006847 000 006847 ffc72c ss=4.0.5.2.8.1.5.2 hs=4.0.5.2.8.1.5.2 co=v pt=000"],
    // 1999-2007: a star-shaped split, white on top and green below at home, green on top and black below away
    ["stars", "1999-2007", "white", "fff 006847 ffc72c 006847 ffc72c hs=70.1 ss=4.0.32.1 co=v pt=000"],
    ["stars", "1999-2007", "green", "006847 000 ffc72c fff 000 hs=70.1 ss=4.0.32.1 co=v pt=000"],
    // 2007-13: black home with gold and green trim, white away (unsure: stripes)
    ["stars", "2007-2013", "black", "000 ffc72c 006847 fff 006847 ss=4.0.5.2.7.1.5.2 hs=4.0.5.2.7.1.5.2 co=v pt=000"],
    ["stars", "2007-2013", "white", "fff 006847 ffc72c 006847 ffc72c ss=4.0.5.2.7.1.5.2 hs=4.0.5.2.7.1.5.2 co=v pt=000"],
    // 2013-: Victory Green home with black and white stripes; white away with a green yoke
    // black and white stripe sets (black, white, black) at the elbow and the hem; white numbers with black trim
    ["stars", "2013-", "home", "006847 000 fff fff 000 ss=20.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=l pt=006847 he=006847"],
    ["stars", "2013-", "away", "fff 006847 000 006847 000 p=y y=c pa=1 ss=20.0.5.2.7.1.5.2 hs=4.0.5.2.7.1.5.2 co=l pt=006847 he=006847"],

    // https://en.wikipedia.org/wiki/Colorado_Avalanche
    // 1995-2007: burgundy, steel blue, black and silver. unsure: the stripes (the curved mountain lines are drawn as plain stripes)
    ["avalanche", "1995-2007", "burgundy", "6f263d 236192 000 fff 000 ss=4.0.3.2.7.1.3.2 hs=4.0.3.2.7.1.3.2 co=v pt=6f263d"],
    ["avalanche", "1995-2007", "white", "fff 6f263d 236192 6f263d 000 ss=4.0.3.2.7.1.3.2 hs=4.0.3.2.7.1.3.2 co=v pt=6f263d"],
    ["avalanche", "2007-", "home", "6f263d 236192 000 fff 000 ss=4.0.3.2.7.1.3.2 hs=4.0.3.2.7.1.3.2 co=l pt=6f263d he=6f263d"],
    ["avalanche", "2007-", "away", "fff 6f263d 236192 6f263d 000 ss=4.0.3.2.7.1.3.2 hs=4.0.3.2.7.1.3.2 co=l pt=6f263d he=6f263d"],

    // https://en.wikipedia.org/wiki/Carolina_Hurricanes#Logos_and_uniforms
    // 1997-2007: red with black, silver and white stripes
    ["hurricanes", "1997-2007", "red", "cc0000 000 c0c0c0 fff 000 ss=4.0.3.2.8.1.3.2 hs=4.0.3.2.8.1.3.2 co=v pt=cc0000 he=cc0000"],
    ["hurricanes", "1997-2007", "white", "fff cc0000 000 cc0000 000 ss=4.0.3.2.8.1.3.2 hs=4.0.3.2.8.1.3.2 co=v pt=cc0000 he=cc0000"],
    // 2008 black alternate with red and silver V stripes (unsure: not drawn)
    ["hurricanes", "2008-2018", "black", "000 cc0000 c0c0c0 fff cc0000 ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=v pt=000"],
    // 2013-: red with black trim, white with black and red striping
    ["hurricanes", "2013-", "home", "c8102e 000 fff fff 000 ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=l pt=c8102e he=c8102e"],
    ["hurricanes", "2013-", "away", "fff 000 c8102e 000 c8102e p=y y=c pa=1 ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=l pt=c8102e he=c8102e"],
    // 2018-: black with a dark grey yoke
    ["hurricanes", "2018-", "black", "000 c8102e 5b6670 fff c8102e p=y y=c pa=2 ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=l pt=000"],

    // https://en.wikipedia.org/wiki/Winnipeg_Jets#Jerseys (the franchise from 2011)
    // unsure: navy, aviator blue and silver stripes
    ["jets", "2011-", "home", "041e42 fff 004a98 fff 004a98 ss=4.0.5.1.8.2.5.1 hs=4.0.5.1.8.2.5.1 co=l pt=041e42 he=041e42"],
    ["jets", "2011-", "away", "fff 041e42 004a98 041e42 004a98 ss=4.0.5.2.8.1.5.2 hs=4.0.5.2.8.1.5.2 co=l pt=041e42 he=041e42"],

    // https://en.wikipedia.org/wiki/Minnesota_Wild#Jerseys
    // 2000-07: green or white jersey with red and gold stripes (unsure: stripe order)
    ["wild", "2000-2007", "green", "154734 af2335 eaaa00 eaaa00 af2335 ss=4.0.3.2.8.1.3.2 hs=4.0.3.2.8.1.3.2 co=v pt=154734"],
    ["wild", "2000-2007", "white", "fff af2335 eaaa00 af2335 eaaa00 ss=4.0.3.2.8.1.3.2 hs=4.0.3.2.8.1.3.2 co=v pt=154734"],
    // 2007-17: red home with green sleeve swatches edged in wheat; white away
    ["wild", "2007-2017", "home", "af2335 154734 eaaa00 fff 154734 ss=4.0.3.2.16.1.3.2 hs=0 co=l pt=af2335"],
    ["wild", "2007-2017", "away", "fff af2335 154734 af2335 154734 ss=4.0.3.2.8.1.3.2 hs=4.0.3.2.8.1.3.2 co=l pt=af2335"],
    // 2009 green alternate with wheat accents
    ["wild", "2009-2017", "third", "154734 eaaa00 af2335 fff af2335 ss=4.0.5.2.7.1.5.2 hs=0 co=l pt=154734"],
    // 2017-: green with a wheat stripe through the chest and a wheat-and-red stripe on the arms
    ["wild", "2017-", "home", "154734 eaaa00 af2335 fff af2335 ss=4.0.3.2.13.1 hs=0 cb=12.1 cy=100 co=l pt=154734"],
    ["wild", "2013-", "away", "fff 154734 af2335 154734 af2335 ss=4.0.5.2.7.1.5.2 hs=4.0.5.2.7.1.5.2 co=l pt=154734"],

    // https://en.wikipedia.org/wiki/Arizona_Coyotes#Logos_and_jerseys
    // 1996-2003 Kachina: white or black with pointed green shoulders and brick red trim (the points are not drawn)
    ["coyotes", "1996-2003", "white", "fff 1f7a63 b5372d 1f7a63 b5372d p=y y=c pa=1 ss=4.0.5.2.7.1.5.2 hs=4.0.5.2.7.1.5.2 co=v pt=000"],
    ["coyotes", "1996-2003", "black", "000 1f7a63 b5372d fff b5372d p=y y=c pa=1 ss=4.0.5.2.7.1.5.2 hs=4.0.5.2.7.1.5.2 co=v pt=000"],
    // 2003-14: Sedona red and white with sand and black trim
    ["coyotes", "2003-2014", "red", "8c2633 000 e2d6b5 fff 000 ss=4.0.3.1.3.0.3.2 hs=4.0.3.1.3.0.3.2 co=v pt=8c2633"],
    ["coyotes", "2003-2014", "white", "fff 8c2633 000 8c2633 000 ss=4.0.3.1.3.0.3.2 hs=4.0.3.1.3.0.3.2 co=l pt=8c2633"],

    // https://en.wikipedia.org/wiki/Utah_Mammoth#Logo,_colors,_and_uniforms
    // black home, white away: blue and white striping. unsure: the stripe order and widths
    ["utah", "2024-", "home", "010101 6cace4 fff fff 6cace4 ss=4.0.5.1.5.2.5.1 hs=4.0.5.1.5.2.5.1 co=l pt=010101"],
    ["utah", "2024-", "away", "fff 010101 6cace4 010101 6cace4 ss=4.0.5.2.5.1.5.2 hs=4.0.5.2.5.1.5.2 co=l pt=010101"],

    // https://en.wikipedia.org/wiki/Ottawa_Senators#Logo_and_jersey_design
    // 1992-95 black with red stripes, white stripes added in 1995; white with black sleeves and black tail stripes with red accents until 2007
    ["senators", "1992-1995", "black", "000 c8102e fff c8102e fff ss=4.0.5.1.7.0.5.1 hs=4.0.5.1.7.0.5.1 co=v pt=000"],
    ["senators", "1995-2007", "black", "000 c8102e fff fff c8102e ss=4.0.3.2.8.1.3.2 hs=4.0.3.2.8.1.3.2 co=v pt=000"],
    ["senators", "1992-2007", "white", "fff 000 c8102e 000 c8102e sc=1 hs=4.0.13.1.3.2 co=v pt=000"],
    ["senators", "1997-2007", "red", "c8102e 000 fff fff 000 ss=4.0.3.2.8.1.3.2 hs=4.0.3.2.8.1.3.2 co=v pt=000"],
    // 2007-: black home and white away with red trim and gold details (unsure: stripes)
    ["senators", "2007-", "home", "000 c8102e fff fff c8102e ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=l pt=000"],
    ["senators", "2007-", "away", "fff 000 c8102e 000 c8102e ss=4.0.5.2.7.1.5.2 hs=4.0.5.2.7.1.5.2 co=l pt=000"],
    // 2011-17 black third with horizontal barber-pole stripes
    ["senators", "2011-2017", "third", "000 c8102e fff fff c8102e p=h r=10.0.4.1.2.0.4.2.10.0 co=l pt=000"],
    // 2018-24 red third: horizontal black and silver stripes
    ["senators", "2018-2024", "third", "c8102e 000 c0c0c0 fff 000 cb=3.1.2.2.3.1 cy=100 ss=4.0.5.1.5.2 hs=4.0.5.1.5.2 co=l pt=c8102e"],

    // https://en.wikipedia.org/wiki/Tampa_Bay_Lightning#Logo_and_jerseys
    // 1992-2007: simple stripes on the sleeves and tail; black shoulders over the white jersey, white over the black. unsure: the blue shade and stripe order
    ["lightning", "1992-2007", "white", "fff 000 003f87 000 003f87 p=y y=c pa=1 ss=4.0.5.2.7.1.5.2 hs=4.0.5.2.7.1.5.2 co=v pt=000"],
    ["lightning", "1992-2007", "black", "000 fff 003f87 fff 003f87 p=y y=c pa=1 ss=4.0.5.2.7.1.5.2 hs=4.0.5.2.7.1.5.2 co=v pt=000"],
    // 2011-: blue and white with black number trim; a traditional sweater
    ["lightning", "2011-", "home", "002868 fff 000 fff 000 ss=4.0.7.1.5.0.7.1 hs=4.0.8.1 co=l pt=002868 he=002868"],
    ["lightning", "2011-", "away", "fff 002868 000 002868 000 ss=4.0.7.1.5.0.7.1 hs=4.0.8.1 co=l pt=002868 he=002868"],
    // 2019 black alternate (unsure: it has no blue or white, only grey patterns)
    ["lightning", "2019-", "alt", "000 5b6670 - fff - ss=4.0.7.1.5.0.7.1 hs=4.0.8.1 co=l pt=000"],

    // https://en.wikipedia.org/wiki/San_Jose_Sharks#Logo_and_jerseys
    // 1991-97: teal away with white, grey and black striping; white home with teal, grey and black
    ["sharks", "1991-1997", "teal", "006d75 fff 000 fff 000 ss=4.0.3.2.8.1.3.2 hs=4.0.3.2.8.1.3.2 co=v pt=000 sk=006d75 skt=000 sb=6.0.3.1.5.2.3.1"],
    ["sharks", "1991-1997", "white", "fff 006d75 000 006d75 000 ss=4.0.3.2.8.1.3.2 hs=4.0.3.2.8.1.3.2 co=v pt=000"],
    // 1997-2007: darker teal with wide grey sleeve and shoulder stripes. unsure: widths
    ["sharks", "1997-2007", "teal", "00585e a2aaad 000 fff 000 ss=4.0.19.1 hs=4.0.10.2 co=v pt=000"],
    ["sharks", "1998-2007", "white", "fff 00585e a2aaad 00585e - ss=4.0.13.1.5.2 hs=4.0.5.1.5.2 co=v pt=000"],
    ["sharks", "2001-2007", "black", "000 006d75 fff fff 006d75 ss=4.0.5.1.5.2 hs=0 co=v pt=000"],
    // 2007-: teal home with a black yoke, white away with a teal yoke; orange replaces grey in the trim
    ["sharks", "2007-", "home", "006272 000 ea7200 fff 000 p=y y=c pa=1 ss=4.0.5.1.5.2 hs=4.0.5.1.5.2 co=l pt=000"],
    ["sharks", "2007-", "away", "fff 006272 000 006272 000 p=y y=c pa=1 ss=4.0.5.1.5.2 hs=4.0.5.1.5.2 co=l pt=000"],

    // https://en.wikipedia.org/wiki/Florida_Panthers#Logos,_colors,_and_uniforms
    // 1993-2007: red and white, diagonal sleeve stripes, a triangular yoke, navy and yellow trim. unsure: the stripes and yoke
    ["panthers", "1993-2003", "red", "ce1126 041e42 f4a900 fff 041e42 ss=4.0.5.2.7.1.5.2 hs=4.0.5.2.7.1.5.2 p=y y=c pa=1 co=v pt=ce1126"],
    ["panthers", "1993-2007", "white", "fff 041e42 f4a900 041e42 ce1126 ss=4.0.5.2.7.1.5.2 hs=4.0.5.2.7.1.5.2 p=y y=c pa=1 co=v pt=ce1126"],
    ["panthers", "1998-2011", "navy", "041e42 ce1126 f4a900 fff ce1126 ss=4.0.5.2.7.1.5.2 hs=4.0.5.2.7.1.5.2 co=v pt=041e42"],
    // 2016-: red and white with flat gold; thick contrasting stripes on the chest and sleeves
    ["panthers", "2016-", "home", "c8102e 041e42 b9975b fff 041e42 ss=4.0.5.2.10.1.5.2 hs=0 cb=3.2.8.1.3.2 cy=100 co=l pt=c8102e he=c8102e"],
    ["panthers", "2016-", "away", "fff 041e42 b9975b 041e42 b9975b ss=4.0.5.2.10.1.5.2 hs=0 cb=3.2.8.1.3.2 cy=100 co=l pt=c8102e he=c8102e"],

    // https://en.wikipedia.org/wiki/Nashville_Predators#Jersey_and_logo
    // 1998-2007: navy and white with a silver yoke, gold as an accent
    ["predators", "1998-2007", "navy", "041e42 ffb81c c0c0c0 ffb81c 041e42 p=y y=c pa=2 ss=4.0.5.1.5.2 hs=4.0.5.1.5.2 co=v pt=041e42"],
    ["predators", "1998-2007", "white", "fff 041e42 c0c0c0 041e42 ffb81c p=y y=c pa=2 ss=4.0.5.1.5.2 hs=4.0.5.1.5.2 co=v pt=041e42"],
    // 2001-07 mustard third
    ["predators", "2001-2007", "gold", "e5ac1a 041e42 fff 041e42 fff ss=4.0.5.1.5.2 hs=4.0.5.1.5.2 co=v pt=041e42"],
    // 2011-: bright gold at home with navy and white; white away with gold and navy; gold helmets at home
    ["predators", "2011-", "home", "ffb81c 041e42 fff 041e42 fff ss=4.0.5.1.5.2 hs=4.0.5.1.5.2 co=l pt=041e42 he=ffb81c"],
    ["predators", "2011-", "away", "fff ffb81c 041e42 ffb81c 041e42 ss=4.0.5.1.5.2 hs=4.0.5.1.5.2 co=l pt=041e42 he=041e42"],

    // https://en.wikipedia.org/wiki/Columbus_Blue_Jackets#Logos_and_jerseys
    // unsure: all stripe layouts here; the colours are Union Blue (002654), goal red and ice blue
    ["bluejackets", "2000-2007", "blue", "002654 ce1126 a4a9ad fff ce1126 ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=v pt=002654"],
    ["bluejackets", "2000-2007", "white", "fff 002654 ce1126 002654 ce1126 ss=4.0.5.2.7.1.5.2 hs=4.0.5.2.7.1.5.2 co=v pt=002654"],
    ["bluejackets", "2007-", "home", "002654 ce1126 a4a9ad fff ce1126 ss=4.0.5.1.7.2.5.1 hs=4.0.5.1.7.2.5.1 co=l pt=002654 he=002654"],
    ["bluejackets", "2007-", "away", "fff 002654 ce1126 002654 ce1126 ss=4.0.5.2.7.1.5.2 hs=4.0.5.2.7.1.5.2 co=l pt=002654 he=002654"],

    // https://en.wikipedia.org/wiki/Anaheim_Ducks#Uniforms
    // 2006-: black and orange with gold trim (unsure: the stripes)
    ["ducks", "2006-2024", "home", "000 f47a38 b9975b fff 000 ss=4.0.5.1.5.2 hs=4.0.5.1.5.2 co=v pt=000"],
    ["ducks", "2006-2024", "away", "fff f47a38 000 000 f47a38 ss=4.0.5.1.5.2 hs=4.0.5.1.5.2 co=v pt=000"],

    // https://en.wikipedia.org/wiki/Vegas_Golden_Knights#Logos,_colors,_and_uniforms
    // 2017-: steel grey at home, white away, with gold, black and red stripes (red is not drawn; unsure: the order); the gold alternate (2020) became the main jersey in 2022
    ["knights", "2017-", "home", "333f42 b4975a 000 fff 000 ss=4.0.3.2.10.1.3.2 hs=4.0.3.2.10.1.3.2 co=l pt=333f42 he=333f42"],
    ["knights", "2017-", "away", "fff b4975a 000 000 b4975a ss=4.0.3.2.10.1.3.2 hs=4.0.3.2.10.1.3.2 co=l pt=333f42 he=333f42"],
    ["knights", "2020-", "alt", "b4975a 000 333f42 000 333f42 ss=4.0.3.2.10.1.3.2 hs=4.0.3.2.10.1.3.2 co=l pt=000"],

    // https://en.wikipedia.org/wiki/Seattle_Kraken#Logo_and_uniforms
    // 2021-: deep sea blue with ice blue and boundless blue; unsure: the stripe layout
    // home: a wide ice-blue band at the elbow with thin red edges (`ss` is a gap of 20, red 3, ice 14, red 3), and an ice-blue and red hem stripe; ice-blue numbers (the outline given is the fill itself, so none is drawn)
    ["kraken", "2021-", "home", "001628 99d9d9 e9072b 99d9d9 99d9d9 ss=20.0.3.2.14.1.3.2 hs=3.0.3.2.8.1.3.2 co=l pt=001628"],
    // away is white with deep sea blue and ice blue stripes (unsure: order); Reverse Retro 2022-23: ice blue base with deep sea blue stripes
    ["kraken", "2021-", "away", "fff 001628 99d9d9 001628 99d9d9 ss=20.0.3.2.14.1.3.2 hs=3.0.3.2.8.1.3.2 co=l pt=001628"],
    ["kraken", "2022-2023", "alt", "99d9d9 001628 355464 001628 - ss=4.0.5.1.5.2 hs=4.0.5.1.5.2 co=l pt=001628"],
  ],
);
