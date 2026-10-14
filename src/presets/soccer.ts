// Soccer clubs: shirts of notable eras as colours and stripes only. No crests, badges, sponsors or makers' marks.
// Pages: the "Colours and badge" / "Kit" sections of each club's English Wikipedia article, named above its rows.
import { defineLeague } from "./core.ts";

export const SOCCER = defineLeague("soccer", "soccer",
  {
    arsenal: ["Arsenal", "アーセナル"],
    liverpool: ["Liverpool", "リバプール"],
    manutd: ["Manchester United", "マンチェスター・ユナイテッド"],
    chelsea: ["Chelsea", "チェルシー"],
    spurs: ["Tottenham Hotspur", "トッテナム・ホットスパー"],
    everton: ["Everton", "エバートン"],
    newcastle: ["Newcastle United", "ニューカッスル・ユナイテッド"],
    sunderland: ["Sunderland", "サンダーランド"],
    sheffutd: ["Sheffield United", "シェフィールド・ユナイテッド"],
    sheffwed: ["Sheffield Wednesday", "シェフィールド・ウェンズデイ"],
    stoke: ["Stoke City", "ストーク・シティ"],
    southampton: ["Southampton", "サウサンプトン"],
    brighton: ["Brighton & Hove Albion", "ブライトン"],
    westbrom: ["West Bromwich Albion", "ウェスト・ブロムウィッチ・アルビオン"],
    blackpool: ["Blackpool", "ブラックプール"],
    wolves: ["Wolverhampton Wanderers", "ウォルバーハンプトン・ワンダラーズ"],
    villa: ["Aston Villa", "アストン・ビラ"],
    westham: ["West Ham United", "ウェストハム・ユナイテッド"],
    burnley: ["Burnley", "バーンリー"],
    leeds: ["Leeds United", "リーズ・ユナイテッド"],
    forest: ["Nottingham Forest", "ノッティンガム・フォレスト"],
    derby: ["Derby County", "ダービー・カウンティ"],
    ipswich: ["Ipswich Town", "イプスウィッチ・タウン"],
    coventry: ["Coventry City", "コベントリー・シティ"],
    mancity: ["Manchester City", "マンチェスター・シティ"],
    preston: ["Preston North End", "プレストン・ノースエンド"],
    huddersfield: ["Huddersfield Town", "ハダースフィールド・タウン"],
    qpr: ["Queens Park Rangers", "クイーンズ・パーク・レンジャーズ"],
    norwich: ["Norwich City", "ノリッジ・シティ"],
    watford: ["Watford", "ワトフォード"],
    wimbledon: ["Wimbledon", "ウィンブルドン"],
    celtic: ["Celtic", "セルティック"],
    rangers: ["Rangers", "レンジャーズ"],
    aberdeen: ["Aberdeen", "アバディーン"],
    hearts: ["Heart of Midlothian", "ハート・オブ・ミドロシアン"],
    hibs: ["Hibernian", "ハイバーニアン"],
    dundeeutd: ["Dundee United", "ダンディー・ユナイテッド"],
    realmadrid: ["Real Madrid", "レアル・マドリード"],
    barcelona: ["Barcelona", "バルセロナ"],
    atletico: ["Atlético Madrid", "アトレティコ・マドリード"],
    athletic: ["Athletic Bilbao", "アスレティック・ビルバオ"],
    valencia: ["Valencia", "バレンシア"],
    sevilla: ["Sevilla", "セビージャ"],
    sociedad: ["Real Sociedad", "レアル・ソシエダ"],
    espanyol: ["Espanyol", "エスパニョール"],
    betis: ["Real Betis", "レアル・ベティス"],
    celta: ["Celta Vigo", "セルタ"],
    deportivo: ["Deportivo La Coruña", "デポルティーボ・ラ・コルーニャ"],
    juventus: ["Juventus", "ユベントス"],
    milan: ["AC Milan", "ACミラン"],
    inter: ["Inter Milan", "インテル"],
    roma: ["AS Roma", "ASローマ"],
    lazio: ["Lazio", "ラツィオ"],
    napoli: ["Napoli", "ナポリ"],
    fiorentina: ["Fiorentina", "フィオレンティーナ"],
    torino: ["Torino", "トリノ"],
    sampdoria: ["Sampdoria", "サンプドリア"],
    bologna: ["Bologna", "ボローニャ"],
    atalanta: ["Atalanta", "アタランタ"],
    genoa: ["Genoa", "ジェノア"],
    cagliari: ["Cagliari", "カリアリ"],
    verona: ["Hellas Verona", "ヴェローナ"],
    udinese: ["Udinese", "ウディネーゼ"],
    bayern: ["Bayern Munich", "バイエルン・ミュンヘン"],
    dortmund: ["Borussia Dortmund", "ボルシア・ドルトムント"],
    schalke: ["Schalke 04", "シャルケ04"],
    hsv: ["Hamburger SV", "ハンブルガーSV"],
    koln: ["1. FC Köln", "ケルン"],
    gladbach: ["Borussia Mönchengladbach", "ボルシア・メンヒェングラートバッハ"],
    werder: ["Werder Bremen", "ヴェルダー・ブレーメン"],
    stuttgart: ["VfB Stuttgart", "シュトゥットガルト"],
    lautern: ["1. FC Kaiserslautern", "カイザースラウテルン"],
    munich1860: ["1860 Munich", "1860ミュンヘン"],
    marseille: ["Olympique de Marseille", "マルセイユ"],
    psg: ["Paris Saint-Germain", "パリ・サンジェルマン"],
    stetienne: ["Saint-Étienne", "サンテティエンヌ"],
    reims: ["Stade de Reims", "スタッド・ランス"],
    nantes: ["FC Nantes", "ナント"],
    lens: ["RC Lens", "RCランス"],
    bordeaux: ["Girondins de Bordeaux", "ボルドー"],
    lyon: ["Olympique Lyonnais", "リヨン"],
    nice: ["OGC Nice", "ニース"],
    ajax: ["Ajax", "アヤックス"],
    feyenoord: ["Feyenoord", "フェイエノールト"],
    psv: ["PSV Eindhoven", "PSVアイントホーフェン"],
    benfica: ["Benfica", "ベンフィカ"],
    porto: ["Porto", "ポルト"],
    sporting: ["Sporting CP", "スポルティング"],
    santos: ["Santos", "サントス"],
    flamengo: ["Flamengo", "フラメンゴ"],
    corinthians: ["Corinthians", "コリンチャンス"],
    palmeiras: ["Palmeiras", "パルメイラス"],
    saopaulo: ["São Paulo", "サンパウロ"],
    vasco: ["Vasco da Gama", "ヴァスコ・ダ・ガマ"],
    fluminense: ["Fluminense", "フルミネンセ"],
    botafogo: ["Botafogo", "ボタフォゴ"],
    cruzeiro: ["Cruzeiro", "クルゼイロ"],
    gremio: ["Grêmio", "グレミオ"],
    internacional: ["Internacional", "インテルナシオナル"],
    atleticomg: ["Atlético Mineiro", "アトレチコ・ミネイロ"],
    boca: ["Boca Juniors", "ボカ・ジュニアーズ"],
    river: ["River Plate", "リーベル・プレート"],
    independiente: ["Independiente", "インデペンディエンテ"],
    racing: ["Racing Club", "ラシン・クラブ"],
    sanlorenzo: ["San Lorenzo", "サン・ロレンソ"],
    estudiantes: ["Estudiantes", "エストゥディアンテス"],
    newells: ["Newell's Old Boys", "ニューウェルズ・オールドボーイズ"],
    rosario: ["Rosario Central", "ロサリオ・セントラル"],
    america: ["Club América", "クラブ・アメリカ"],
    chivas: ["Guadalajara (Chivas)", "チーバス・グアダラハラ"],
    cruzazul: ["Cruz Azul", "クルス・アスル"],
    pumas: ["Pumas UNAM", "プーマスUNAM"],
    toluca: ["Toluca", "トルーカ"],
    monterrey: ["Monterrey", "モンテレイ"],
    pachuca: ["Pachuca", "パチューカ"],
    atlas: ["Atlas", "アトラス"],
    cosmos: ["New York Cosmos", "ニューヨーク・コスモス"],
    dcunited: ["D.C. United", "DCユナイテッド"],
    crew: ["Columbus Crew", "コロンバス・クルー"],
    sounders: ["Seattle Sounders FC", "シアトル・サウンダーズ"],
    torontofc: ["Toronto FC", "トロントFC"],
    whitecaps: ["Vancouver Whitecaps", "バンクーバー・ホワイトキャップス"],
    galaxy: ["LA Galaxy", "LAギャラクシー"],
    sportingkc: ["Sporting Kansas City", "スポルティング・カンザスシティ"],
    kashima: ["Kashima Antlers", "鹿島アントラーズ"],
    verdy: ["Verdy Kawasaki", "ヴェルディ川崎"],
    urawa: ["Urawa Red Diamonds", "浦和レッズ"],
    marinos: ["Yokohama Marinos", "横浜マリノス"],
    flugels: ["Yokohama Flügels", "横浜フリューゲルス"],
    sspulse: ["Shimizu S-Pulse", "清水エスパルス"],
    gamba: ["Gamba Osaka", "ガンバ大阪"],
    grampus: ["Nagoya Grampus Eight", "名古屋グランパスエイト"],
    jubilo: ["Júbilo Iwata", "ジュビロ磐田"],
    sanfrecce: ["Sanfrecce Hiroshima", "サンフレッチェ広島"],
    jef: ["JEF United Ichihara", "ジェフユナイテッド市原"],
  },
  [
    // England
    // https://en.wikipedia.org/wiki/Arsenal_F.C.#Colours_and_badge
    ["arsenal", "1950-1970", "home", "d11 fff sc=1 co=v pt=fff sk=fff"],
    ["arsenal", "1970-1990", "home", "d11 fff sc=1 pt=fff sk=fff skt=d11"],
    ["arsenal", "1970-1980", "away", "fd0 135 co=v pt=135 sk=135 skt=fd0"], // unsure: collar and sock trim
    // https://en.wikipedia.org/wiki/Liverpool_F.C.#Colours_and_badge
    ["liverpool", "1950-1964", "home", "c11 fff co=v pt=fff sk=c11"], // unsure: sock tops
    ["liverpool", "1964-1990", "home", "c11 fff co=v pt=c11 sk=c11 skt=fff"],
    ["liverpool", "1970-1990", "away", "fff c11 co=v pt=fff sk=fff"], // unsure: trim
    // https://en.wikipedia.org/wiki/Manchester_United_F.C.#Colours_and_badge
    ["manutd", "1950-1970", "home", "d11 fff co=v pt=fff sk=000 skt=fff"],
    ["manutd", "1970-1990", "home", "d11 fff ss=2 pt=fff sk=000 skt=fff"],
    ["manutd", "1967-1970", "away", "69c fff co=v pt=fff sk=69c"], // unsure: the all-blue away of the 1968 European Cup final
    ["manutd", "1995-1996", "away", "999 000 co=c pt=000 sk=999"], // unsure: the grey away
    // https://en.wikipedia.org/wiki/Chelsea_F.C.#Colours_and_badge
    ["chelsea", "1955-1975", "home", "04b fff pt=fff sk=fff skt=04b"],
    ["chelsea", "1975-1990", "home", "04b fff pt=04b sk=fff skt=04b"],
    ["chelsea", "1970-1985", "away", "fd0 04b pt=04b sk=fd0 skt=04b"], // unsure: era of the yellow away
    // https://en.wikipedia.org/wiki/Tottenham_Hotspur_F.C.#Colours_and_badge
    ["spurs", "1950-1975", "home", "fff 013 co=v pt=013 sk=013 skt=fff"],
    ["spurs", "1975-1995", "home", "fff 013 pt=013 sk=013 skt=fff"],
    // https://en.wikipedia.org/wiki/Everton_F.C.#Colours_and_badge
    ["everton", "1950-1975", "home", "039 fff co=v pt=fff sk=039 skt=fff"],
    ["everton", "1975-1995", "home", "039 fff pt=039 sk=039 skt=fff"],
    // https://en.wikipedia.org/wiki/Newcastle_United_F.C.#Colours_and_badge
    ["newcastle", "1950-1990", "home", "fff 000 p=s r=10.0.20.1.10.0 pt=000 sk=000 skt=fff"],
    // https://en.wikipedia.org/wiki/Sunderland_A.F.C.#Colours_and_badge
    ["sunderland", "1950-1990", "home", "fff d11 p=s r=10.0.20.1.10.0 pt=000 sk=d11 skt=fff"], // unsure: sock trim
    // https://en.wikipedia.org/wiki/Sheffield_United_F.C.#Colours_and_badge
    ["sheffutd", "1950-1990", "home", "fff d11 p=s r=10.0.20.1.10.0 pt=000 sk=000 skt=fff"],
    // https://en.wikipedia.org/wiki/Sheffield_Wednesday_F.C.#Colours_and_badge
    ["sheffwed", "1950-1990", "home", "fff 04b p=s r=10.0.20.1.10.0 pt=000 sk=04b skt=fff"], // unsure: sock tops
    // https://en.wikipedia.org/wiki/Stoke_City_F.C.#Colours_and_badge
    ["stoke", "1950-1990", "home", "fff d11 p=s r=10.0.20.1.10.0 pt=fff sk=d11 skt=fff"],
    // https://en.wikipedia.org/wiki/Southampton_F.C.#Colours_and_badge
    ["southampton", "1950-1990", "home", "fff d11 p=s r=10.0.20.1.10.0 pt=000 sk=fff skt=d11"], // unsure: sock tops
    // https://en.wikipedia.org/wiki/Brighton_%26_Hove_Albion_F.C.#Colours_and_badge
    ["brighton", "1950-1990", "home", "fff 06c p=s r=10.0.20.1.10.0 pt=fff sk=fff skt=06c"],
    // https://en.wikipedia.org/wiki/West_Bromwich_Albion_F.C.#Colours_and_badge
    ["westbrom", "1950-1990", "home", "fff 013 p=s r=10.0.20.1.10.0 pt=fff sk=fff skt=013"],
    // https://en.wikipedia.org/wiki/Blackpool_F.C.#Colours_and_badge
    ["blackpool", "1950s", "home", "f60 fff co=v pt=fff sk=fff skt=f60"], // unsure: sock tops
    // https://en.wikipedia.org/wiki/Wolverhampton_Wanderers_F.C.#Colours_and_badge
    ["wolves", "1950s", "home", "fb1 000 co=v pt=000 sk=fb1 skt=000"],
    ["wolves", "1960-1990", "home", "fb1 000 pt=000 sk=fb1 skt=000"],
    // https://en.wikipedia.org/wiki/Aston_Villa_F.C.#Colours_and_badge
    ["villa", "1950-1975", "home", "712 9be sc=1 co=v pt=fff sk=9be skt=712"],
    ["villa", "1975-1995", "home", "712 9be sc=1 pt=fff sk=9be skt=712"],
    // https://en.wikipedia.org/wiki/West_Ham_United_F.C.#Colours_and_badge
    ["westham", "1960-1990", "home", "712 9be sc=1 pt=fff sk=9be skt=712"], // unsure: sock trim
    // https://en.wikipedia.org/wiki/Burnley_F.C.#Colours_and_badge
    ["burnley", "1955-1975", "home", "712 9be sc=1 co=v pt=fff sk=712 skt=9be"], // unsure: sock trim
    // https://en.wikipedia.org/wiki/Leeds_United_F.C.#Colours_and_badge
    ["leeds", "1961-1970", "home", "fff 000 pt=fff sk=fff"],
    ["leeds", "1970-1975", "home", "fff 06c fd0 pt=fff sk=fff skt=06c"], // unsure: collar and cuff trim
    ["leeds", "1970-1980", "away", "fd0 06c pt=06c sk=fd0 skt=06c"], // unsure: sock trim
    // https://en.wikipedia.org/wiki/Nottingham_Forest_F.C.#Colours_and_badge
    ["forest", "1955-1985", "home", "d11 fff co=v pt=fff sk=d11 skt=fff"],
    // https://en.wikipedia.org/wiki/Derby_County_F.C.#Colours_and_badge
    ["derby", "1960-1985", "home", "fff 000 pt=000 sk=fff skt=000"], // unsure: sock trim
    // https://en.wikipedia.org/wiki/Ipswich_Town_F.C.#Colours_and_badge
    ["ipswich", "1960-1990", "home", "04b fff pt=fff sk=04b skt=fff"], // unsure: sock tops
    // https://en.wikipedia.org/wiki/Coventry_City_F.C.#Colours_and_badge
    ["coventry", "1960-1995", "home", "7cf fff pt=7cf sk=7cf skt=fff"],
    // https://en.wikipedia.org/wiki/Manchester_City_F.C.#Colours_and_badge
    ["mancity", "1950-1990", "home", "6ad fff co=v pt=fff sk=6ad skt=fff"],
    ["mancity", "1956-1975", "away", "d11 000 p=s r=10.0.20.1.10.0 pt=000 sk=000 skt=d11"], // unsure: the red-and-black striped away; exact eras and stripe count
    // https://en.wikipedia.org/wiki/Preston_North_End_F.C.#Colours_and_badge
    ["preston", "1950s", "home", "fff 013 co=v pt=013 sk=fff skt=013"],
    // https://en.wikipedia.org/wiki/Huddersfield_Town_A.F.C.#Colours_and_badge
    ["huddersfield", "1950-1990", "home", "fff 06c p=s r=10.0.20.1.10.0 pt=fff sk=fff skt=06c"],
    // https://en.wikipedia.org/wiki/Queens_Park_Rangers_F.C.#Colours_and_badge
    ["qpr", "1960-1985", "home", "fff 06c p=h r=20.0.20.1 pt=fff sk=fff skt=06c"],
    // https://en.wikipedia.org/wiki/Norwich_City_F.C.#Colours_and_badge
    ["norwich", "1960-1995", "home", "fd0 080 pt=080 sk=fd0 skt=080"],
    // https://en.wikipedia.org/wiki/Watford_F.C.#Colours_and_badge
    ["watford", "1977-1990", "home", "fd0 d11 000 pt=d11 sk=fd0 skt=d11"], // unsure: trim split
    // https://en.wikipedia.org/wiki/Wimbledon_F.C.#Colours_and_badge
    ["wimbledon", "1985-1995", "home", "fd0 04b pt=04b sk=fd0 skt=04b"],

    // Scotland
    // https://en.wikipedia.org/wiki/Celtic_F.C.#Colours_and_badge
    ["celtic", "1960-1980", "home", "090 fff p=h r=20.0.20.1 pt=fff sk=090 skt=fff"],
    ["celtic", "1980-1995", "home", "090 fff p=h r=20.0.20.1 pt=fff sk=090 skt=fff co=v"],
    // https://en.wikipedia.org/wiki/Rangers_F.C.#Colours_and_badge
    ["rangers", "1950-1990", "home", "13c fff co=v pt=fff sk=000 skt=d11"], // unsure: sock tops
    // https://en.wikipedia.org/wiki/Aberdeen_F.C.#Colours_and_badge
    ["aberdeen", "1970-1990", "home", "d11 fff pt=d11 sk=d11 skt=fff"],
    // https://en.wikipedia.org/wiki/Heart_of_Midlothian_F.C.#Colours_and_badge
    ["hearts", "1950-1990", "home", "712 fff co=v pt=fff sk=712 skt=fff"],
    // https://en.wikipedia.org/wiki/Hibernian_F.C.#Colours_and_badge
    ["hibs", "1950-1990", "home", "fff 090 sc=1 pt=fff sk=090 skt=fff"],
    // https://en.wikipedia.org/wiki/Dundee_United_F.C.#Colours_and_badge
    ["dundeeutd", "1969-1995", "home", "f60 000 pt=f60 sk=f60 skt=000"],

    // Spain
    // https://en.wikipedia.org/wiki/Real_Madrid_CF#Crest_and_colours
    ["realmadrid", "1950-1970", "home", "fff 639 co=c pt=fff sk=fff"],
    ["realmadrid", "1970-1990", "home", "fff 639 pt=fff sk=fff skt=639"],
    ["realmadrid", "1990s", "home", "fff 639 pt=fff sk=fff"],
    // https://en.wikipedia.org/wiki/FC_Barcelona#Crest_and_colours
    ["barcelona", "1950-1990", "home", "04a a04 p=s r=9.0.17.1.8.0 pt=04a sk=a04 skt=04a"],
    // https://en.wikipedia.org/wiki/Atl%C3%A9tico_Madrid#Crest_and_colours
    ["atletico", "1950-1990", "home", "fff d11 p=s r=10.0.20.1.10.0 pt=04a sk=fff skt=d11"],
    // https://en.wikipedia.org/wiki/Athletic_Bilbao#Crest_and_colours
    ["athletic", "1950-1990", "home", "fff d11 p=s r=10.0.20.1.10.0 pt=000 sk=000 skt=d11"],
    // https://en.wikipedia.org/wiki/Valencia_CF#Crest_and_colours
    ["valencia", "1950-1995", "home", "fff 000 pt=000 sk=000 skt=fff"], // unsure: sock detail
    // https://en.wikipedia.org/wiki/Sevilla_FC#Crest_and_colours
    ["sevilla", "1950-1995", "home", "fff d11 pt=fff sk=fff"], // unsure: shorts
    // https://en.wikipedia.org/wiki/Real_Sociedad#Crest_and_colours
    ["sociedad", "1950-1995", "home", "fff 06c p=s r=10.0.20.1.10.0 pt=fff sk=fff skt=06c"], // unsure: shorts
    // https://en.wikipedia.org/wiki/RCD_Espanyol#Crest_and_colours
    ["espanyol", "1950-1995", "home", "fff 06c p=s r=10.0.20.1.10.0 pt=fff sk=fff skt=06c"],
    // https://en.wikipedia.org/wiki/Real_Betis#Crest_and_colours
    ["betis", "1950-1995", "home", "fff 080 p=s r=10.0.20.1.10.0 pt=fff sk=fff skt=080"], // unsure: shorts
    // https://en.wikipedia.org/wiki/RC_Celta_de_Vigo#Crest_and_colours
    ["celta", "1950-1995", "home", "8bf fff pt=fff sk=8bf skt=fff"],
    // https://en.wikipedia.org/wiki/Deportivo_de_La_Coru%C3%B1a#Crest_and_colours
    ["deportivo", "1990-2005", "home", "fff 06c p=s r=10.0.20.1.10.0 pt=fff sk=fff skt=06c"],

    // Italy
    // https://en.wikipedia.org/wiki/Juventus_F.C.#Colours_and_badge
    ["juventus", "1950-1990", "home", "fff 000 p=s r=10.0.20.1.10.0 pt=000 sk=000 skt=fff"],
    ["juventus", "1990-2000", "home", "fff 000 p=s r=10.0.20.1.10.0 pt=fff sk=fff"],
    // https://en.wikipedia.org/wiki/A.C._Milan#Colours_and_badge
    ["milan", "1950-1980", "home", "d11 000 p=s r=10.1.20.0.10.1 pt=fff sk=d11 skt=000"],
    ["milan", "1980-2000", "home", "d11 000 p=s r=10.1.20.0.10.1 pt=000 sk=000 skt=d11"], // unsure: sock detail
    ["milan", "1950-1990", "away", "fff d11 000 pt=fff sk=fff"], // unsure: trim
    // https://en.wikipedia.org/wiki/Inter_Milan#Colours_and_badge
    ["inter", "1950-1990", "home", "13a 000 p=s r=10.0.20.1.10.0 pt=000 sk=000 skt=13a"],
    ["inter", "1950-1990", "away", "fff 13a 000 pt=fff sk=fff"], // unsure: trim
    // https://en.wikipedia.org/wiki/A.S._Roma#Colours_and_badge
    ["roma", "1950-1990", "home", "912 fa0 pt=fff sk=912 skt=fa0"],
    // https://en.wikipedia.org/wiki/S.S._Lazio#Colours_and_badge
    ["lazio", "1950-1990", "home", "8df fff pt=fff sk=8df skt=fff"],
    // https://en.wikipedia.org/wiki/S.S.C._Napoli#Colours_and_badge
    ["napoli", "1980-1995", "home", "29d fff pt=fff sk=fff skt=29d"],
    ["napoli", "1980-1995", "away", "fff 29d pt=fff sk=fff skt=29d"],
    // https://en.wikipedia.org/wiki/ACF_Fiorentina#Colours_and_badge
    ["fiorentina", "1950-1990", "home", "639 fff pt=639 sk=639 skt=fff"],
    // https://en.wikipedia.org/wiki/Torino_F.C.#Colours_and_badge
    ["torino", "1948-1990", "home", "812 fff pt=fff sk=812 skt=fff"],
    // https://en.wikipedia.org/wiki/U.C._Sampdoria#Colours_and_badge
    ["sampdoria", "1980-2000", "home", "13a fff d11 000 p=b cb=8.1.4.2.8.0.8.1 pt=13a sk=13a"], // unsure: the white-red-black-white chest band widths
    // https://en.wikipedia.org/wiki/Bologna_F.C._1909#Colours_and_badge
    ["bologna", "1950-1995", "home", "d11 13a p=s r=10.0.20.1.10.0 pt=fff sk=d11 skt=13a"],
    // https://en.wikipedia.org/wiki/Atalanta_B.C.#Colours_and_badge
    ["atalanta", "1950-1995", "home", "13a 000 p=s r=10.0.20.1.10.0 pt=000 sk=000 skt=13a"],
    // https://en.wikipedia.org/wiki/Genoa_C.F.C.#Colours_and_badge
    ["genoa", "1950-1995", "home", "d11 13a p=2 pt=fff sk=13a skt=d11"],
    // https://en.wikipedia.org/wiki/Cagliari_Calcio#Colours_and_badge
    ["cagliari", "1960-1995", "home", "d11 13a p=4 pt=fff sk=13a skt=d11"],
    // https://en.wikipedia.org/wiki/Hellas_Verona_F.C.#Colours_and_badge
    ["verona", "1980-1995", "home", "fd0 13a pt=13a sk=fd0 skt=13a"],
    // https://en.wikipedia.org/wiki/Udinese_Calcio#Colours_and_badge
    ["udinese", "1980-2000", "home", "fff 000 p=s r=10.0.20.1.10.0 pt=fff sk=fff"], // unsure: shorts

    // Germany
    // https://en.wikipedia.org/wiki/FC_Bayern_Munich#Colours_and_badge
    ["bayern", "1965-1980", "home", "d11 fff pt=fff sk=d11 skt=fff"],
    ["bayern", "1980-1995", "home", "d11 fff pt=fff sk=d11 skt=fff co=v"],
    // https://en.wikipedia.org/wiki/Borussia_Dortmund#Colours_and_badge
    ["dortmund", "1960-1995", "home", "fd0 000 pt=000 sk=fd0 skt=000"],
    // https://en.wikipedia.org/wiki/FC_Schalke_04#Colours_and_badge
    ["schalke", "1955-1995", "home", "13c fff pt=fff sk=13c skt=fff"], // unsure: shorts
    // https://en.wikipedia.org/wiki/Hamburger_SV#Colours_and_badge
    ["hsv", "1960-1990", "home", "fff d11 013 pt=013 sk=013 skt=d11"], // unsure: trim
    // https://en.wikipedia.org/wiki/1._FC_K%C3%B6ln#Colours_and_badge
    ["koln", "1960-1995", "home", "fff d11 pt=fff sk=fff skt=d11"],
    // https://en.wikipedia.org/wiki/Borussia_M%C3%B6nchengladbach#Colours_and_badge
    ["gladbach", "1965-1980", "home", "fff 090 000 pt=000 sk=fff skt=090"], // unsure: shorts
    // https://en.wikipedia.org/wiki/SV_Werder_Bremen#Colours_and_badge
    ["werder", "1960-1995", "home", "090 fff pt=fff sk=090 skt=fff"],
    // https://en.wikipedia.org/wiki/VfB_Stuttgart#Colours_and_badge
    ["stuttgart", "1980-2000", "home", "fff d11 p=b cb=8.1 pt=fff sk=fff"], // unsure: the red chest band width
    // https://en.wikipedia.org/wiki/1._FC_Kaiserslautern#Colours_and_badge
    ["lautern", "1960-1995", "home", "d11 fff pt=fff sk=d11 skt=fff"],
    // https://en.wikipedia.org/wiki/TSV_1860_Munich#Colours_and_badge
    ["munich1860", "1960-1995", "home", "6ad fff pt=fff sk=6ad skt=fff"], // unsure: shorts

    // France
    // https://en.wikipedia.org/wiki/Olympique_de_Marseille#Colours_and_badge
    ["marseille", "1970-2000", "home", "fff 5bf pt=fff sk=fff skt=5bf"],
    // https://en.wikipedia.org/wiki/Paris_Saint-Germain_F.C.#Crest_and_colours
    ["psg", "1980-2000", "home", "13a d11 fff p=s r=40.0.4.2.12.1.4.2.40.0 pt=13a sk=13a skt=d11"], // unsure: centre stripe widths
    // https://en.wikipedia.org/wiki/AS_Saint-%C3%89tienne#Crest_and_colours
    ["stetienne", "1965-1985", "home", "090 fff pt=fff sk=090 skt=fff"],
    // https://en.wikipedia.org/wiki/Stade_de_Reims#Crest_and_colours
    ["reims", "1950s", "home", "d11 fff pt=fff sk=d11 skt=fff"], // unsure: sleeve colour
    // https://en.wikipedia.org/wiki/FC_Nantes#Crest_and_colours
    ["nantes", "1965-1995", "home", "fd0 090 pt=090 sk=fd0 skt=090"],
    // https://en.wikipedia.org/wiki/RC_Lens#Crest_and_colours
    ["lens", "1980-2000", "home", "d11 fd0 p=s r=11.0.22.1.11.0 pt=fff sk=d11 skt=fd0"], // unsure: stripe layout
    // https://en.wikipedia.org/wiki/FC_Girondins_de_Bordeaux#Crest_and_colours
    ["bordeaux", "1980-2000", "home", "013 fff pt=013 sk=013 skt=fff"],
    // https://en.wikipedia.org/wiki/Olympique_Lyonnais#Crest_and_colours
    ["lyon", "1990-2005", "home", "fff d11 13a p=b cb=6.1.6.2 pt=fff sk=fff"], // unsure: chest band layout
    // https://en.wikipedia.org/wiki/OGC_Nice#Crest_and_colours
    ["nice", "1950-1995", "home", "d11 000 p=s r=10.0.20.1.10.0 pt=000 sk=000 skt=d11"], // unsure: stripe width

    // Netherlands
    // https://en.wikipedia.org/wiki/AFC_Ajax#Crest_and_colours
    ["ajax", "1965-1980", "home", "fff d11 p=s r=33.0.34.1.33.0 pt=fff sk=fff skt=d11"], // unsure: the single wide red band down the centre
    // https://en.wikipedia.org/wiki/Feyenoord#Crest_and_colours
    ["feyenoord", "1965-1995", "home", "d11 fff p=2 pt=000 sk=000 skt=d11"],
    // https://en.wikipedia.org/wiki/PSV_Eindhoven#Crest_and_colours
    ["psv", "1960-1995", "home", "d11 fff p=s r=10.0.20.1.10.0 pt=fff sk=fff skt=d11"],

    // Portugal
    // https://en.wikipedia.org/wiki/S.L._Benfica#Crest_and_colours
    ["benfica", "1955-1975", "home", "d11 fff co=v pt=fff sk=d11 skt=fff"],
    // https://en.wikipedia.org/wiki/FC_Porto#Crest_and_colours
    ["porto", "1960-1995", "home", "fff 04b p=s r=10.0.20.1.10.0 pt=fff sk=fff skt=04b"],
    // https://en.wikipedia.org/wiki/Sporting_CP#Crest_and_colours
    ["sporting", "1960-1995", "home", "fff 090 p=h r=20.0.20.1 pt=000 sk=000 skt=090"], // unsure: shorts and socks

    // Brazil
    // https://en.wikipedia.org/wiki/Santos_FC#Crest_and_colours
    ["santos", "1955-1975", "home", "fff 000 co=c pt=fff sk=fff"],
    // https://en.wikipedia.org/wiki/CR_Flamengo#Crest_and_colours
    ["flamengo", "1950-1995", "home", "d11 000 p=h r=20.0.20.1 pt=fff sk=000 skt=d11"], // unsure: hoop widths
    // https://en.wikipedia.org/wiki/Sport_Club_Corinthians_Paulista#Crest_and_colours
    ["corinthians", "1950-1995", "home", "fff 000 pt=000 sk=fff skt=000"],
    // https://en.wikipedia.org/wiki/Sociedade_Esportiva_Palmeiras#Crest_and_colours
    ["palmeiras", "1950-1995", "home", "090 fff pt=fff sk=090 skt=fff"],
    // https://en.wikipedia.org/wiki/S%C3%A3o_Paulo_FC#Crest_and_colours
    ["saopaulo", "1985-2000", "home", "fff d11 000 p=b cb=3.1.4.2.3.1 pt=fff sk=fff"], // unsure: red-black hoops at the chest
    // https://en.wikipedia.org/wiki/CR_Vasco_da_Gama#Crest_and_colours
    ["vasco", "1950-1995", "home", "000 fff p=a pt=000 sk=000 skt=fff"],
    // https://en.wikipedia.org/wiki/Fluminense_FC#Crest_and_colours
    ["fluminense", "1950-1995", "home", "712 090 fff p=s r=3.1.3.2.3.0.3.2.3.1 pt=fff sk=fff"], // unsure: tricolour pinstripes are drawn as thin stripes
    // https://en.wikipedia.org/wiki/Botafogo_de_Futebol_e_Regatas#Crest_and_colours
    ["botafogo", "1950-1995", "home", "000 fff p=s r=10.0.20.1.10.0 pt=000 sk=000 skt=fff"],
    // https://en.wikipedia.org/wiki/Cruzeiro_Esporte_Clube#Crest_and_colours
    ["cruzeiro", "1960-1995", "home", "13c fff pt=fff sk=fff skt=13c"],
    // https://en.wikipedia.org/wiki/Gr%C3%AAmio_FBPA#Crest_and_colours
    ["gremio", "1950-1995", "home", "6ad 000 fff p=s r=10.0.10.1.10.2 pt=000 sk=000 skt=fff"], // unsure: stripe order
    // https://en.wikipedia.org/wiki/Sport_Club_Internacional#Crest_and_colours
    ["internacional", "1950-1995", "home", "d11 fff pt=fff sk=d11 skt=fff"],
    // https://en.wikipedia.org/wiki/Clube_Atl%C3%A9tico_Mineiro#Crest_and_colours
    ["atleticomg", "1950-1995", "home", "fff 000 p=s r=10.0.20.1.10.0 pt=000 sk=000 skt=fff"],

    // Argentina
    // https://en.wikipedia.org/wiki/Boca_Juniors#Crest_and_colours
    ["boca", "1950-2000", "home", "13a fd0 p=b cb=22.1 cy=96 pt=13a sk=13a skt=fd0"],
    // https://en.wikipedia.org/wiki/Club_Atl%C3%A9tico_River_Plate#Crest_and_colours
    ["river", "1950-2000", "home", "fff d11 p=a pt=fff sk=fff"], // unsure: shorts
    // https://en.wikipedia.org/wiki/Club_Atl%C3%A9tico_Independiente#Crest_and_colours
    ["independiente", "1950-1995", "home", "d11 fff pt=fff sk=d11 skt=fff"], // unsure: shorts
    // https://en.wikipedia.org/wiki/Racing_Club_de_Avellaneda#Crest_and_colours
    ["racing", "1950-1995", "home", "fff 7bd p=s r=10.0.20.1.10.0 pt=fff sk=fff skt=7bd"],
    // https://en.wikipedia.org/wiki/San_Lorenzo_de_Almagro#Crest_and_colours
    ["sanlorenzo", "1950-1995", "home", "13a d11 p=s r=10.0.20.1.10.0 pt=13a sk=13a skt=d11"], // unsure: shorts
    // https://en.wikipedia.org/wiki/Estudiantes_de_La_Plata#Crest_and_colours
    ["estudiantes", "1960-1995", "home", "fff d11 p=s r=10.0.20.1.10.0 pt=fff sk=fff skt=d11"], // unsure: shorts
    // https://en.wikipedia.org/wiki/Newell%27s_Old_Boys#Crest_and_colours
    ["newells", "1950-1995", "home", "d11 000 p=2 pt=000 sk=d11 skt=000"],
    // https://en.wikipedia.org/wiki/Rosario_Central#Crest_and_colours
    ["rosario", "1950-1995", "home", "13a fd0 p=s r=10.0.20.1.10.0 pt=13a sk=13a skt=fd0"], // unsure: stripe layout

    // Mexico
    // https://en.wikipedia.org/wiki/Club_Am%C3%A9rica#Crest_and_colours
    ["america", "1960-1995", "home", "fd0 13a pt=13a sk=fd0 skt=13a"],
    // https://en.wikipedia.org/wiki/C.D._Guadalajara#Crest_and_colours
    ["chivas", "1950-1995", "home", "fff d11 p=s r=10.0.20.1.10.0 pt=13a sk=d11 skt=fff"],
    // https://en.wikipedia.org/wiki/Cruz_Azul#Crest_and_colours
    ["cruzazul", "1970-1995", "home", "13c fff pt=13c sk=13c skt=fff"],
    // https://en.wikipedia.org/wiki/Club_Universidad_Nacional#Crest_and_colours
    ["pumas", "1970-1995", "home", "013 fb1 sc=1 pt=013 sk=013 skt=fb1"], // unsure: sleeve colour
    // https://en.wikipedia.org/wiki/Deportivo_Toluca_F.C.#Crest_and_colours
    ["toluca", "1970-1995", "home", "d11 fff pt=fff sk=d11 skt=fff"],
    // https://en.wikipedia.org/wiki/C.F._Monterrey#Crest_and_colours
    ["monterrey", "1990-2005", "home", "13a fff p=s r=10.0.20.1.10.0 pt=13a sk=13a"],
    // https://en.wikipedia.org/wiki/C.F._Pachuca#Crest_and_colours
    ["pachuca", "1990-2005", "home", "fff 13a p=s r=10.0.20.1.10.0 pt=13a sk=fff"],
    // https://en.wikipedia.org/wiki/Atlas_F.C.#Crest_and_colours
    ["atlas", "1950-1995", "home", "d11 000 p=s r=10.0.20.1.10.0 pt=000 sk=000 skt=d11"],

    // USA and Canada
    // https://en.wikipedia.org/wiki/New_York_Cosmos_(1970%E2%80%931985)#Colors_and_badge
    ["cosmos", "1971-1974", "home", "090 fd0 pt=090 sk=090 skt=fd0"], // unsure: shorts and sock trim
    ["cosmos", "1971-1974", "away", "fd0 090 pt=fd0 sk=fd0 skt=090"], // unsure: shorts and sock trim
    ["cosmos", "1975-1978", "home", "fff 090 fd0 pt=fff sk=fff skt=090"],
    ["cosmos", "1975-1978", "away", "090 fd0 pt=fff sk=090 skt=fd0"], // green shirt, white shorts
    ["cosmos", "1979-1985", "home", "fff 013 fb1 pt=fff sk=fff skt=013"],
    ["cosmos", "1979-1985", "away", "013 fb1 pt=013 sk=013 skt=fb1"], // navy, yellow trim; the socks were hooped yellow and navy for a time
    // https://en.wikipedia.org/wiki/D.C._United#Kits
    ["dcunited", "1996-2000", "home", "000 d11 fff pt=000 sk=000 skt=d11"], // unsure: trim
    // https://en.wikipedia.org/wiki/Columbus_Crew#Colors_and_badge
    ["crew", "1996-2000", "home", "fd0 000 pt=000 sk=fd0 skt=000"], // unsure: trim
    // https://en.wikipedia.org/wiki/Seattle_Sounders_FC#Colors_and_badge
    ["sounders", "2009-2012", "home", "6c3 13a pt=13a sk=6c3 skt=13a"], // unsure: shorts and sock colours
    // https://en.wikipedia.org/wiki/Toronto_FC#Colours_and_badge
    ["torontofc", "2007-2010", "home", "d11 888 pt=d11 sk=d11 skt=888"], // unsure: grey trim
    // https://en.wikipedia.org/wiki/Vancouver_Whitecaps_FC#Colours_and_badge
    ["whitecaps", "2011-2014", "home", "fff 13a pt=fff sk=fff skt=13a"], // unsure: trim
    // https://en.wikipedia.org/wiki/LA_Galaxy#Colors_and_badge
    ["galaxy", "1996-2000", "home", "fff 013 fb1 pt=fff sk=fff skt=013"], // unsure: first-season trim
    // https://en.wikipedia.org/wiki/Sporting_Kansas_City#Colors_and_badge
    ["sportingkc", "2011-2016", "home", "9be 013 pt=013 sk=9be skt=013"], // unsure: trim

    // Japan: the first ten J.League clubs, 1993
    // https://en.wikipedia.org/wiki/Kashima_Antlers#Colours_and_badge
    ["kashima", "1993-1996", "home", "c11 013 pt=013 sk=c11 skt=013"], // unsure: shorts and sock trim
    // https://en.wikipedia.org/wiki/Tokyo_Verdy#Colours_and_badge
    ["verdy", "1993-1996", "home", "090 fff pt=090 sk=090 skt=fff"], // unsure: trim
    // https://en.wikipedia.org/wiki/Urawa_Red_Diamonds#Colours_and_badge
    ["urawa", "1993-1996", "home", "c11 fff pt=fff sk=c11 skt=fff"],
    // https://en.wikipedia.org/wiki/Yokohama_F._Marinos#Colours_and_badge
    ["marinos", "1993-1996", "home", "13a fff d11 p=b cb=5.1.5.2 pt=fff sk=13a"], // unsure: the white and red chest bands
    // https://en.wikipedia.org/wiki/Yokohama_Fl%C3%BCgels#Colours_and_badge
    ["flugels", "1993-1998", "home", "fff 5bf pt=fff sk=fff skt=5bf"], // unsure: the sky blue and white split
    // https://en.wikipedia.org/wiki/Shimizu_S-Pulse#Colours_and_badge
    ["sspulse", "1993-1996", "home", "f80 fff pt=fff sk=f80 skt=fff"], // unsure: shorts
    // https://en.wikipedia.org/wiki/Gamba_Osaka#Colours_and_badge
    ["gamba", "1993-1996", "home", "13a 000 p=s r=10.0.20.1.10.0 pt=000 sk=13a skt=000"], // unsure: shorts
    // https://en.wikipedia.org/wiki/Nagoya_Grampus#Colours_and_badge
    ["grampus", "1993-1996", "home", "d11 fd0 pt=d11 sk=d11 skt=fd0"], // unsure: trim
    // https://en.wikipedia.org/wiki/J%C3%BAbilo_Iwata#Colours_and_badge
    ["jubilo", "1994-2000", "home", "6ad fff pt=fff sk=6ad skt=fff"], // unsure: Saxe blue value
    // https://en.wikipedia.org/wiki/Sanfrecce_Hiroshima#Colours_and_badge
    ["sanfrecce", "1993-1996", "home", "639 fff pt=639 sk=639 skt=fff"],
    // https://en.wikipedia.org/wiki/JEF_United_Ichihara_Chiba#Colours_and_badge
    ["jef", "1993-1996", "home", "fd0 090 pt=090 sk=fd0 skt=090"], // unsure: shorts
  ]);
