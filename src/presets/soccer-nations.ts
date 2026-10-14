// National football teams: classic shirts of notable eras as colours and stripes only. No federation crests, makers' marks or lettering.
// Pages: the "Kit" / "Kits" sections of each national team's English Wikipedia article, named above its rows.
import { defineLeague } from "./core.ts";

export const SOCCER_NATIONS = defineLeague("fifa", "soccer",
  {
    brazil: ["Brazil", "ブラジル"],
    argentina: ["Argentina", "アルゼンチン"],
    uruguay: ["Uruguay", "ウルグアイ"],
    england: ["England", "イングランド"],
    scotland: ["Scotland", "スコットランド"],
    wales: ["Wales", "ウェールズ"],
    ireland: ["Republic of Ireland", "アイルランド"],
    nireland: ["Northern Ireland", "北アイルランド"],
    germany: ["Germany", "ドイツ"],
    netherlands: ["Netherlands", "オランダ"],
    france: ["France", "フランス"],
    italy: ["Italy", "イタリア"],
    spain: ["Spain", "スペイン"],
    portugal: ["Portugal", "ポルトガル"],
    belgium: ["Belgium", "ベルギー"],
    hungary: ["Hungary", "ハンガリー"],
    ussr: ["Soviet Union", "ソビエト連邦"],
    yugoslavia: ["Yugoslavia", "ユーゴスラビア"],
    czechoslovakia: ["Czechoslovakia", "チェコスロバキア"],
    poland: ["Poland", "ポーランド"],
    sweden: ["Sweden", "スウェーデン"],
    denmark: ["Denmark", "デンマーク"],
    austria: ["Austria", "オーストリア"],
    switzerland: ["Switzerland", "スイス"],
    romania: ["Romania", "ルーマニア"],
    chile: ["Chile", "チリ"],
    colombia: ["Colombia", "コロンビア"],
    peru: ["Peru", "ペルー"],
    paraguay: ["Paraguay", "パラグアイ"],
    mexico: ["Mexico", "メキシコ"],
    usa: ["United States", "アメリカ"],
    canada: ["Canada", "カナダ"],
    costarica: ["Costa Rica", "コスタリカ"],
    japan: ["Japan", "日本"],
    korea: ["South Korea", "韓国"],
    australia: ["Australia", "オーストラリア"],
    cameroon: ["Cameroon", "カメルーン"],
    nigeria: ["Nigeria", "ナイジェリア"],
    morocco: ["Morocco", "モロッコ"],
    algeria: ["Algeria", "アルジェリア"],
    egypt: ["Egypt", "エジプト"],
    tunisia: ["Tunisia", "チュニジア"],
  },
  [
    // https://en.wikipedia.org/wiki/Brazil_national_football_team#Kit
    ["brazil", "1958-1962", "home", "fd0 093 co=c pt=037 sk=fff skt=093"], // unsure: sock tops
    ["brazil", "1958-1962", "away", "037 fff co=c pt=fff sk=037 skt=fff"], // unsure: the blue away's shorts and socks
    ["brazil", "1970", "home", "fd0 093 co=c ss=1 pt=037 sk=fff skt=093"], // unsure: cuff trim
    ["brazil", "1970", "away", "037 fff co=c pt=fff sk=037 skt=fff"], // unsure: shorts and socks
    ["brazil", "1982", "home", "fd0 093 037 ss=2 pt=037 sk=fff skt=093"], // unsure: sleeve stripes
    ["brazil", "1994", "home", "fd0 093 037 pt=037 sk=fff skt=093"], // unsure: cuff trim

    // https://en.wikipedia.org/wiki/Argentina_national_football_team#Kit
    ["argentina", "1950-1970", "home", "fff 7ae p=s r=10.0.20.1.10.0 co=c pt=000 sk=000 skt=fff"],
    ["argentina", "1978", "home", "fff 7ae p=s r=10.0.20.1.10.0 pt=000 sk=000 skt=fff"],
    ["argentina", "1986", "home", "fff 7ae p=s r=10.0.20.1.10.0 pt=000 sk=000 skt=fff"],
    ["argentina", "1986", "away", "013 7ae pt=013 sk=013 skt=7ae"], // unsure: the navy away's trim

    // https://en.wikipedia.org/wiki/Uruguay_national_football_team#Kit
    ["uruguay", "1950", "home", "7ae fff co=c pt=000 sk=000 skt=7ae"],
    ["uruguay", "1970", "home", "7ae fff pt=000 sk=000 skt=7ae"],
    ["uruguay", "1970", "away", "fff 7ae pt=000 sk=000 skt=fff"], // unsure: the white away's trim

    // https://en.wikipedia.org/wiki/England_national_football_team#Kit
    ["england", "1950-1965", "home", "fff 013 co=v pt=013 sk=fff skt=013"],
    ["england", "1966", "home", "fff 013 co=c pt=013 sk=fff skt=013"],
    ["england", "1966", "away", "d11 fff co=c pt=fff sk=d11 skt=fff"],
    ["england", "1982", "home", "fff c11 013 ss=2 pt=013 sk=fff skt=c11"], // unsure: sleeve and collar trim order
    ["england", "1990", "home", "fff 013 c11 pt=013 sk=fff skt=013"], // unsure: trim
    ["england", "1996", "home", "fff c11 013 pt=013 sk=fff skt=013"],
    ["england", "1996", "away", "999 c11 013 pt=999 sk=999 skt=013"], // unsure: the grey away's trim

    // https://en.wikipedia.org/wiki/Scotland_national_football_team#Kit
    ["scotland", "1970-1980", "home", "013 fff pt=fff sk=c11 skt=fff"], // unsure: sock tops
    ["scotland", "1982", "home", "013 c11 fff ss=2 pt=fff sk=c11 skt=fff"], // unsure: sleeve trim
    ["scotland", "1978", "away", "fd0 013 pt=fd0 sk=fd0 skt=013"], // unsure: a yellow away, its trim

    // https://en.wikipedia.org/wiki/Wales_national_football_team#Kit
    ["wales", "1958", "home", "d11 fff co=v pt=fff sk=d11 skt=fff"], // unsure: sock tops
    ["wales", "1990-1995", "away", "090 fff pt=fff sk=090 skt=fff"], // unsure: the green away

    // https://en.wikipedia.org/wiki/Republic_of_Ireland_national_football_team#Kit
    ["ireland", "1988-1992", "home", "090 fff pt=fff sk=090 skt=fff"],
    ["ireland", "1988-1992", "away", "fff 090 pt=fff sk=fff skt=090"], // unsure: a white away, its trim
    // https://en.wikipedia.org/wiki/Northern_Ireland_national_football_team#Kit
    ["nireland", "1980-1986", "home", "090 fff pt=fff sk=090 skt=fff"],

    // https://en.wikipedia.org/wiki/Germany_national_football_team#Kit
    ["germany", "1954", "home", "fff 000 co=c pt=000 sk=fff skt=000"], // unsure: collar
    ["germany", "1974", "home", "fff 000 ss=1 pt=000 sk=fff skt=000"], // unsure: sleeve and collar trim
    ["germany", "1974", "away", "090 fff pt=fff sk=090 skt=fff"], // unsure: shorts and socks
    ["germany", "1990", "home", "fff 000 c11 pt=000 sk=fff skt=000"], // unsure: the diagonal tricolour pattern is not drawn
    ["germany", "1990", "away", "090 000 c11 pt=000 sk=090"], // unsure: pattern not drawn

    // https://en.wikipedia.org/wiki/Netherlands_national_football_team#Kit
    ["netherlands", "1974", "home", "f60 000 pt=fff sk=f60 skt=000"], // unsure: sock trim
    ["netherlands", "1974", "away", "fff f60 pt=fff sk=fff skt=f60"], // unsure: the white away's trim
    ["netherlands", "1988", "home", "f60 000 pt=fff sk=f60 skt=000"], // unsure: Euro 88 trim

    // https://en.wikipedia.org/wiki/France_national_football_team#Kit
    ["france", "1958", "home", "13a fff co=v pt=fff sk=c11 skt=fff"], // unsure: collar
    ["france", "1982", "home", "13a fff c11 ss=2 pt=fff sk=c11 skt=fff"], // unsure: the chest and sleeve trim
    ["france", "1982", "away", "fff 13a c11 pt=fff sk=fff skt=13a"], // unsure
    ["france", "1998", "home", "13a fff c11 pt=fff sk=c11 skt=fff"], // unsure: collar and sleeve trim

    // https://en.wikipedia.org/wiki/Italy_national_football_team#Kit
    ["italy", "1970", "home", "08c fff co=v pt=fff sk=08c skt=fff"],
    ["italy", "1982", "home", "08c fff co=v pt=fff sk=08c skt=fff"],
    ["italy", "1982", "away", "fff 08c co=v pt=fff sk=fff skt=08c"],
    ["italy", "1990", "home", "08c fff co=v pt=fff sk=08c skt=fff"],

    // https://en.wikipedia.org/wiki/Spain_national_football_team#Kit
    ["spain", "1964", "home", "d00 fd0 co=v pt=04a sk=000 skt=fd0"], // unsure: trim
    ["spain", "1982", "home", "d00 fd0 04a pt=04a sk=000 skt=fd0"],
    ["spain", "1982", "away", "fff 04a d00 pt=fff sk=fff skt=04a"], // unsure: the away

    // https://en.wikipedia.org/wiki/Portugal_national_football_team#Kit
    ["portugal", "1966", "home", "a01 090 co=v pt=090 sk=a01 skt=090"], // unsure: collar and sock trim

    // https://en.wikipedia.org/wiki/Belgium_national_football_team#Kit
    ["belgium", "1986", "home", "d11 000 fd0 pt=d11 sk=d11 skt=000"], // unsure: trim

    // https://en.wikipedia.org/wiki/Hungary_national_football_team#Kit
    ["hungary", "1954", "home", "d11 fff co=c pt=fff sk=d11 skt=fff"], // unsure: shorts and socks
    ["hungary", "1954", "away", "fff d11 co=c pt=fff sk=fff skt=d11"], // unsure: the white away's trim

    // https://en.wikipedia.org/wiki/Soviet_Union_national_football_team#Kit
    ["ussr", "1960-1970", "home", "d11 fff co=c pt=fff sk=d11 skt=fff"], // unsure: shorts
    ["ussr", "1988", "home", "d11 fff ss=1 pt=d11 sk=d11 skt=fff"], // unsure: shorts and sleeve trim
    ["ussr", "1988", "away", "fff d11 pt=fff sk=fff skt=d11"], // unsure

    // https://en.wikipedia.org/wiki/Yugoslavia_national_football_team#Kit
    ["yugoslavia", "1990", "home", "13a fff d11 pt=fff sk=d11 skt=fff"],
    ["yugoslavia", "1960-1970", "away", "fff 13a pt=fff sk=fff skt=13a"], // unsure: the white away

    // https://en.wikipedia.org/wiki/Czechoslovakia_national_football_team#Kit
    ["czechoslovakia", "1962", "home", "d11 fff pt=fff sk=13a skt=fff"], // unsure: shorts and socks
    // https://en.wikipedia.org/wiki/Poland_national_football_team#Kit
    ["poland", "1974", "home", "fff d11 pt=d11 sk=fff skt=d11"], // unsure: trim
    ["poland", "1974", "away", "d11 fff pt=d11 sk=d11 skt=fff"], // unsure
    // https://en.wikipedia.org/wiki/Sweden_national_football_team#Kit
    ["sweden", "1958", "home", "fd0 04a pt=04a sk=fd0 skt=04a"], // unsure: trim
    // https://en.wikipedia.org/wiki/Denmark_national_football_team#Kit
    ["denmark", "1986", "home", "d11 fff pt=fff sk=d11 skt=fff"], // unsure: the chevron pattern is not drawn
    // https://en.wikipedia.org/wiki/Austria_national_football_team#Kit
    ["austria", "1954", "home", "fff 000 co=c pt=000 sk=fff skt=000"], // unsure: trim
    // https://en.wikipedia.org/wiki/Switzerland_national_football_team#Kit
    ["switzerland", "1954", "home", "d11 fff co=v pt=fff sk=d11 skt=fff"], // unsure: shorts
    // https://en.wikipedia.org/wiki/Romania_national_football_team#Kit
    ["romania", "1990", "home", "fd0 13a d11 pt=13a sk=d11 skt=13a"], // unsure: trim

    // https://en.wikipedia.org/wiki/Chile_national_football_team#Kit
    ["chile", "1962", "home", "d11 fff co=v pt=13a sk=fff skt=d11"], // unsure: shorts and socks
    // https://en.wikipedia.org/wiki/Colombia_national_football_team#Kit
    ["colombia", "1990", "home", "fd0 13a d11 pt=13a sk=d11 skt=fd0"], // unsure: trim
    // https://en.wikipedia.org/wiki/Peru_national_football_team#Kit
    ["peru", "1970", "home", "fff d11 p=a pt=fff sk=fff"], // unsure: shorts
    // https://en.wikipedia.org/wiki/Paraguay_national_football_team#Kit
    ["paraguay", "1950-1990", "home", "fff d11 p=s r=10.0.20.1.10.0 pt=13a sk=fff skt=d11"], // unsure: shorts and socks

    // https://en.wikipedia.org/wiki/Mexico_national_football_team#Kit
    ["mexico", "1970", "home", "090 fff co=v pt=fff sk=d11 skt=fff"], // unsure: sock detail
    // https://en.wikipedia.org/wiki/United_States_men%27s_national_soccer_team#Uniform
    ["usa", "1990", "home", "fff 13a d11 pt=13a sk=fff skt=d11"], // unsure: this is a plain reading of a patterned shirt
    ["usa", "1994", "away", "13a fff d11 pt=13a sk=13a skt=fff"], // unsure: the denim-effect pattern is not drawn
    // https://en.wikipedia.org/wiki/Canada_men%27s_national_soccer_team#Kit
    ["canada", "1986", "home", "d11 fff pt=fff sk=d11 skt=fff"], // unsure: sock tops
    // https://en.wikipedia.org/wiki/Costa_Rica_national_football_team#Kit
    ["costarica", "1990", "home", "d11 13a fff pt=13a sk=fff skt=d11"], // unsure: trim

    // https://en.wikipedia.org/wiki/Japan_national_football_team#Kit
    ["japan", "1998", "home", "13a fff pt=fff sk=13a skt=fff"], // unsure: sleeve and collar trim
    ["japan", "1998", "away", "fff 13a pt=fff sk=fff skt=13a"], // unsure
    // https://en.wikipedia.org/wiki/South_Korea_national_football_team#Kit
    ["korea", "1986", "home", "d11 13a pt=13a sk=d11 skt=13a"], // unsure: trim
    ["korea", "1986", "away", "fff d11 13a pt=13a sk=fff skt=d11"], // unsure
    // https://en.wikipedia.org/wiki/Australia_national_soccer_team#Kit
    ["australia", "1974", "home", "fd0 090 pt=090 sk=fd0 skt=090"], // unsure: trim

    // https://en.wikipedia.org/wiki/Cameroon_national_football_team#Kit
    ["cameroon", "1982-1990", "home", "090 fd0 d11 pt=d11 sk=fd0 skt=090"], // unsure: shirt trim
    // https://en.wikipedia.org/wiki/Nigeria_national_football_team#Kit
    ["nigeria", "1994", "home", "fff 090 pt=090 sk=fff skt=090"], // unsure: the printed pattern is not drawn
    ["nigeria", "1994", "away", "090 fff pt=090 sk=090 skt=fff"], // unsure: the printed pattern is not drawn
    // https://en.wikipedia.org/wiki/Morocco_national_football_team#Kit
    ["morocco", "1986", "home", "d11 090 pt=090 sk=d11 skt=090"], // unsure: trim
    // https://en.wikipedia.org/wiki/Algeria_national_football_team#Kit
    ["algeria", "1982", "home", "fff 090 d11 pt=090 sk=fff skt=090"], // unsure: trim
    // https://en.wikipedia.org/wiki/Egypt_national_football_team#Kit
    ["egypt", "1990", "home", "d11 fff 000 pt=fff sk=000 skt=d11"], // unsure: shorts and socks
    // https://en.wikipedia.org/wiki/Tunisia_national_football_team#Kit
    ["tunisia", "1978", "home", "d11 fff pt=fff sk=d11 skt=fff"], // unsure: sock tops
  ]);
