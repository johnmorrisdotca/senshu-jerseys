// Rugby union: national and famous club shirts as colours, hoops and stripes only. No badges, emblems, sponsors or makers' marks.
// Pages: the kit / "Colours" sections of each team's English Wikipedia article, named above its rows.
import { defineLeague } from "./core.ts";

export const RUGBY = defineLeague("rugby", "rugby",
  {
    nz: ["New Zealand", "ニュージーランド"],
    rsa: ["South Africa", "南アフリカ"],
    aus: ["Australia", "オーストラリア"],
    eng: ["England", "イングランド"],
    sco: ["Scotland", "スコットランド"],
    irl: ["Ireland", "アイルランド"],
    wal: ["Wales", "ウェールズ"],
    fra: ["France", "フランス"],
    ita: ["Italy", "イタリア"],
    arg: ["Argentina", "アルゼンチン"],
    fij: ["Fiji", "フィジー"],
    sam: ["Samoa", "サモア"],
    ton: ["Tonga", "トンガ"],
    jpn: ["Japan", "日本"],
    can: ["Canada", "カナダ"],
    usa: ["United States", "アメリカ合衆国"],
    geo: ["Georgia", "ジョージア"],
    lions: ["British & Irish Lions", "ブリティッシュ&アイリッシュ・ライオンズ"],
    baabaas: ["Barbarians", "バーバリアンズ"],
    quins: ["Harlequins", "ハーレクインズ"],
    leicester: ["Leicester Tigers", "レスター・タイガース"],
    bath: ["Bath", "バス"],
    gloucester: ["Gloucester", "グロスター"],
    wasps: ["Wasps", "ワスプス"],
    saracens: ["Saracens", "サラセンズ"],
    cardiff: ["Cardiff", "カーディフ"],
    newport: ["Newport", "ニューポート"],
    llanelli: ["Llanelli", "ラネリー"],
    munster: ["Munster", "マンスター"],
    leinster: ["Leinster", "レンスター"],
    toulouse: ["Stade Toulousain", "トゥールーズ"],
    toulon: ["Toulon", "トゥーロン"],
    stadefrancais: ["Stade Français", "スタッド・フランセ"],
    clermont: ["Clermont", "クレルモン"],
    biarritz: ["Biarritz", "ビアリッツ"],
    auckland: ["Auckland", "オークランド"],
    canterbury: ["Canterbury", "カンタベリー"],
  },
  [
    // https://en.wikipedia.org/wiki/New_Zealand_national_rugby_union_team#Kit
    ["nz", "1905-1990", "home", "000 fff pt=000 sk=000 skt=fff"],
    ["nz", "1990-2000", "home", "000 fff pt=000 sk=000 skt=fff"], // unsure: collar and cuff trim
    ["nz", "1980-2000", "away", "fff 000 pt=000 sk=000 skt=fff"], // unsure: the white away, its eras and trim
    // https://en.wikipedia.org/wiki/South_Africa_national_rugby_union_team#Kit
    ["rsa", "1950-1990", "home", "093 fd0 pt=fff sk=093 skt=fd0"],
    ["rsa", "1995", "home", "093 fd0 pt=fff sk=093 skt=fd0 ss=1"], // unsure: cuff trim
    ["rsa", "1995-2000", "away", "fff 093 fd0 pt=fff sk=fff skt=093"], // unsure: the white away
    // https://en.wikipedia.org/wiki/Australia_national_rugby_union_team#Kit
    ["aus", "1980-1995", "home", "fd0 093 pt=013 sk=fd0 skt=093"], // unsure: shorts and socks
    ["aus", "1991", "home", "fd0 093 pt=013 sk=fd0 skt=093 ss=1"], // unsure: cuff trim
    ["aus", "1990-1995", "away", "093 fd0 pt=013 sk=093 skt=fd0"], // unsure: the green away
    // https://en.wikipedia.org/wiki/England_national_rugby_union_team#Kit
    ["eng", "1950-1980", "home", "fff 013 pt=fff sk=fff skt=013"], // unsure: collar and sock detail
    ["eng", "1980-1990", "home", "fff c11 013 pt=fff sk=fff skt=013"], // unsure: collar and cuff trim
    ["eng", "1990-2000", "home", "fff 013 c11 pt=fff sk=fff skt=013"], // unsure: collar and cuff trim
    ["eng", "1990-2000", "away", "c11 fff 013 pt=013 sk=c11 skt=fff"], // unsure: the red away
    // https://en.wikipedia.org/wiki/Scotland_national_rugby_union_team#Kit
    ["sco", "1950-1990", "home", "013 fff pt=fff sk=013 skt=fff"],
    ["sco", "1990-2000", "home", "013 fff c11 pt=fff sk=013 skt=fff"], // unsure: collar and cuff trim
    // https://en.wikipedia.org/wiki/Ireland_national_rugby_union_team#Kit
    ["irl", "1950-1990", "home", "093 fff pt=fff sk=093 skt=fff"],
    ["irl", "1990-2000", "home", "093 fff pt=fff sk=093 skt=fff ss=1"], // unsure: cuff trim
    ["irl", "1990-2000", "away", "fff 093 pt=fff sk=fff skt=093"], // unsure: the white away
    // https://en.wikipedia.org/wiki/Wales_national_rugby_union_team#Kit
    ["wal", "1950-1990", "home", "d11 fff pt=fff sk=d11 skt=fff"], // unsure: sock detail
    ["wal", "1990-2000", "home", "d11 fff fd0 pt=fff sk=d11 skt=fff"], // unsure: collar trim
    ["wal", "1970-1990", "away", "fff d11 pt=fff sk=fff skt=d11"], // unsure: the white away, its eras
    // https://en.wikipedia.org/wiki/France_national_rugby_union_team#Kit
    ["fra", "1950-1990", "home", "13a fff d11 pt=fff sk=13a skt=fff"], // unsure: collar and cuff trim
    ["fra", "1990-2000", "home", "13a fff d11 pt=fff sk=d11 skt=fff"], // unsure: collar trim
    ["fra", "1950-1990", "away", "fff 13a d11 pt=13a sk=fff skt=13a"], // unsure: the white away
    // https://en.wikipedia.org/wiki/Italy_national_rugby_union_team#Kit
    ["ita", "1990-2000", "home", "08c fff pt=fff sk=08c skt=fff"],
    // https://en.wikipedia.org/wiki/Argentina_national_rugby_union_team#Kit
    ["arg", "1965-1990", "home", "fff 7ae p=h r=20.0.20.1 pt=fff sk=fff skt=7ae"], // unsure: hoop widths
    ["arg", "1965-1990", "away", "013 7ae pt=013 sk=013 skt=7ae"], // unsure: the navy away
    // https://en.wikipedia.org/wiki/Fiji_national_rugby_union_team#Kit
    ["fij", "1990-2000", "home", "fff 000 pt=000 sk=000 skt=fff"], // unsure: trim
    // https://en.wikipedia.org/wiki/Samoa_national_rugby_union_team#Kit
    ["sam", "1991-2000", "home", "13a fff d11 pt=13a sk=13a skt=fff"], // unsure: trim
    // https://en.wikipedia.org/wiki/Tonga_national_rugby_union_team#Kit
    ["ton", "1990-2000", "home", "d11 fff pt=d11 sk=d11 skt=fff"], // unsure: trim
    // https://en.wikipedia.org/wiki/Japan_national_rugby_union_team#Kit
    ["jpn", "1950-2000", "home", "fff d11 p=h r=20.0.20.1 pt=fff sk=fff skt=d11"], // unsure: hoop widths and socks
    // https://en.wikipedia.org/wiki/Canada_men%27s_national_rugby_union_team#Kit
    ["can", "1990-2000", "home", "d11 fff pt=fff sk=d11 skt=fff"], // unsure: trim
    // https://en.wikipedia.org/wiki/United_States_men%27s_national_rugby_union_team#Kit
    ["usa", "1990-2000", "home", "fff 013 d11 pt=013 sk=fff skt=d11"], // unsure: trim
    // https://en.wikipedia.org/wiki/Georgia_national_rugby_union_team#Kit
    ["geo", "1990-2000", "home", "fff d11 pt=fff sk=fff skt=d11"], // unsure: trim

    // https://en.wikipedia.org/wiki/British_%26_Irish_Lions#Kit
    ["lions", "1950-1990", "home", "d11 fff pt=fff sk=013 skt=093"], // unsure: sock detail
    // https://en.wikipedia.org/wiki/Barbarian_F.C.#Colours
    ["baabaas", "1950-2000", "home", "fff 000 p=h r=20.0.20.1 pt=000 sk=000 skt=fff"],
    // https://en.wikipedia.org/wiki/Harlequin_F.C.#Colours
    ["quins", "1950-1990", "home", "7bd 612 p=4 pt=fff sk=000 skt=612"], // unsure: the true shirt is quartered in six colours (light blue, magenta, chocolate, black, French grey, light green); only two are drawn
    // https://en.wikipedia.org/wiki/Leicester_Tigers#Colours
    ["leicester", "1950-2000", "home", "093 d11 fff p=h r=14.0.14.1.14.2 pt=fff sk=093 skt=d11"], // unsure: green, red and white hoops: order and widths
    // https://en.wikipedia.org/wiki/Bath_Rugby#Colours
    ["bath", "1950-2000", "home", "13a fff 000 p=h r=14.0.14.1.14.2 pt=fff sk=13a skt=fff"], // unsure: blue, white and black hoops: order and widths
    // https://en.wikipedia.org/wiki/Gloucester_Rugby#Colours
    ["gloucester", "1950-2000", "home", "fff c25 p=h r=20.0.20.1 pt=fff sk=fff skt=c25"], // unsure: cherry-and-white hoop widths
    // https://en.wikipedia.org/wiki/London_Wasps#Colours
    ["wasps", "1950-2000", "home", "000 fd0 p=h r=22.0.8.1 pt=000 sk=000 skt=fd0"], // unsure: black with gold hoops: widths
    // https://en.wikipedia.org/wiki/Saracens_F.C.#Colours
    ["saracens", "1950-1995", "home", "000 d11 pt=000 sk=000 skt=d11"], // unsure: trim
    // https://en.wikipedia.org/wiki/Cardiff_RFC#Colours
    ["cardiff", "1950-2000", "home", "13a 000 p=h r=18.0.18.1 pt=000 sk=13a skt=000"], // unsure: blue-and-black hoop widths
    // https://en.wikipedia.org/wiki/Newport_RFC#Colours
    ["newport", "1950-2000", "home", "000 fb1 p=h r=18.0.18.1 pt=000 sk=000 skt=fb1"], // unsure: black-and-amber hoop widths
    // https://en.wikipedia.org/wiki/Llanelli_RFC#Colours
    ["llanelli", "1950-2000", "home", "d11 fff pt=fff sk=d11 skt=fff"], // unsure: sock detail
    // https://en.wikipedia.org/wiki/Munster_Rugby#Colours
    ["munster", "1990-2000", "home", "d11 fff pt=fff sk=d11 skt=fff"], // unsure: trim
    // https://en.wikipedia.org/wiki/Leinster_Rugby#Colours
    ["leinster", "1990-2000", "home", "13a fff pt=fff sk=13a skt=fff"], // unsure: trim
    // https://en.wikipedia.org/wiki/Stade_Toulousain#Colours
    ["toulouse", "1990-2000", "home", "d11 000 fff pt=000 sk=d11 skt=000"], // unsure: trim split
    // https://en.wikipedia.org/wiki/RC_Toulonnais#Colours
    ["toulon", "1990-2000", "home", "d11 000 pt=000 sk=d11 skt=000"], // unsure: red with black trim
    // https://en.wikipedia.org/wiki/Stade_Fran%C3%A7ais#Colours
    ["stadefrancais", "2000s", "home", "13a e3a pt=13a sk=13a skt=e3a"], // unsure: the blue and pink shirt's layout
    // https://en.wikipedia.org/wiki/ASM_Clermont_Auvergne#Colours
    ["clermont", "1990-2000", "home", "fd0 13a pt=13a sk=fd0 skt=13a"], // unsure: trim
    // https://en.wikipedia.org/wiki/Biarritz_Olympique#Colours
    ["biarritz", "1990-2000", "home", "fff 7ae p=h r=20.0.20.1 pt=fff sk=fff skt=7ae"], // unsure: hoops or plain; widths
    // https://en.wikipedia.org/wiki/Auckland_rugby_union_team#Colours
    ["auckland", "1950-2000", "home", "fff 13a p=h r=20.0.20.1 pt=fff sk=13a skt=fff"], // unsure: hoop widths
    // https://en.wikipedia.org/wiki/Canterbury_rugby_union_team#Colours
    ["canterbury", "1950-2000", "home", "d11 000 pt=000 sk=d11 skt=000"], // unsure: red and black layout
  ]);
