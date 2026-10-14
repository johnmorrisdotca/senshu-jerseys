// National ice hockey teams, home and away by era: colours and stripes only. No national crests, coats of arms, flags, wordmarks or diagonal lettering.
// Layouts were read off the Wikipedia articles on each team and the "national ice hockey team jerseys" kit diagrams on Wikimedia Commons (looked at, not copied).
import { defineLeague } from "./core.ts";

export const HOCKEY_NATIONS = defineLeague("hockey", "hockey",
  {
    canada: ["Canada", "カナダ代表"],
    usa: ["United States", "アメリカ代表"],
    ussr: ["Soviet Union", "ソビエト連邦代表"],
    russia: ["Russia", "ロシア代表"],
    czechoslovakia: ["Czechoslovakia", "チェコスロバキア代表"],
    czech: ["Czech Republic", "チェコ代表"],
    sweden: ["Sweden", "スウェーデン代表"],
    finland: ["Finland", "フィンランド代表"],
    "west-germany": ["West Germany", "西ドイツ代表"],
    germany: ["Germany", "ドイツ代表"],
    switzerland: ["Switzerland", "スイス代表"],
    slovakia: ["Slovakia", "スロバキア代表"],
    norway: ["Norway", "ノルウェー代表"],
    latvia: ["Latvia", "ラトビア代表"],
    japan: ["Japan", "日本代表"],
    gb: ["Great Britain", "イギリス代表"],
    italy: ["Italy", "イタリア代表"],
    france: ["France", "フランス代表"],
  },
  [
    // https://en.wikipedia.org/wiki/Canada_men%27s_national_ice_hockey_team and https://en.wikipedia.org/wiki/1972_Summit_Series
    ["canada", "1920", "home", "e0a800 fff - fff - ss=0 hs=0 co=c"], // unsure: the 1920 Olympic team's mustard yellow wool, no stripes found
    ["canada", "1948", "home", "1f3a8a fff d52b1e fff - ss=6.0.4.1.3.2.4.1 hs=5.1.4.2.5.1 co=l"], // unsure: the RCAF Flyers' blue, white and red; stripe layout is a guess
    ["canada", "1972", "home", "fff d52b1e - d52b1e - sc=1 ss=0 hs=0 co=v cc=0"], // unsure: the big leaf is left out, the sleeves take its colour
    ["canada", "1972", "away", "d52b1e fff - fff - sc=1 ss=0 hs=0 co=v cc=0"], // unsure: the big leaf is left out, the sleeves take its colour
    ["canada", "1988", "home", "fff d52b1e 0b2a6a d52b1e - p=y y=c ss=18.0.4.1.3.0.4.1 hs=5.1 co=v cc=2 pt=0b2a6a ptt=d52b1e sk=fff sb=4.1.3.0.4.1"],
    ["canada", "1988", "away", "d52b1e fff 0b2a6a fff - p=y y=c ss=18.0.4.1.3.0.4.1 hs=5.1 co=v cc=2 pt=0b2a6a ptt=fff sk=d52b1e sb=4.1.3.0.4.1"],
    ["canada", "1992", "home", "d52b1e fff 1f4fb8 fff - ss=16.0.4.1.3.0.4.1 hs=12.1 co=v pt=1f4fb8 ptt=d52b1e sk=fff sb=4.2.3.0.4.2"],
    ["canada", "1992", "away", "fff d52b1e 1f4fb8 d52b1e - p=y y=c ss=16.0.4.1.3.0.4.1 hs=14.1 co=v pt=1f4fb8 ptt=d52b1e sk=d52b1e sb=4.1.3.0.4.1"],
    ["canada", "1994", "home", "fff d52b1e - d52b1e - ss=8.0.4.1.3.0.4.1.3.0.4.1 hs=4.1.4.0.4.1.4.0.4.1.4.0.4.1 co=v pt=d52b1e ptt=fff sk=fff sb=5.1.3.0.5.1"],
    ["canada", "1994", "away", "d52b1e fff - fff - ss=8.0.4.1.3.0.4.1.3.0.4.1 hs=4.1.4.0.4.1.4.0.4.1.4.0.4.1 co=v pt=d52b1e ptt=fff sk=d52b1e sb=5.1.3.0.5.1"],
    ["canada", "1998-2001", "home", "fff c1272d 000 c1272d - sc=1 ss=8.2 hs=0 co=v cc=1 pt=000 sk=fff sb=4.2.2.0.4.2"],
    ["canada", "1998-2001", "away", "c1272d fff 000 fff - p=y y=c pa=1 ss=8.2 hs=0 co=v pt=000 sk=c1272d sb=4.2.2.0.4.2"],
    ["canada", "2016", "home", "fff d52b1e - d52b1e - ss=14.0.8.1.3.0.8.1 hs=5.1.5.0.11.1 co=v pt=000 sk=fff sb=5.1.3.0.5.1"],
    ["canada", "2016", "away", "d52b1e fff - fff - ss=14.0.8.1.3.0.8.1 hs=5.1.5.0.11.1 co=v pt=000 sk=d52b1e sb=5.1.3.0.5.1"],
    ["canada", "2018", "home", "d52b1e 000 - fff - ss=16.0.8.1.3.0.8.1 hs=0 co=c pt=000 sk=d52b1e sb=4.1.3.0.4.1"],
    ["canada", "2018", "away", "fff d52b1e - d52b1e - ss=16.0.8.1.3.0.8.1 hs=0 co=c pt=000 sk=fff sb=4.1.3.0.4.1"],
    ["canada", "2018", "third", "111 d52b1e - d52b1e - ss=16.0.8.1.3.0.8.1 hs=0 co=c pt=000 sk=111 sb=4.1.3.0.4.1"],
    // https://en.wikipedia.org/wiki/United_States_men%27s_national_ice_hockey_team and https://en.wikipedia.org/wiki/Miracle_on_Ice
    ["usa", "1980", "home", "fff 0b4a97 c8102e c8102e 0b4a97 ss=8.0.3.2.10.1.3.2 hs=4.2.11.1.4.2 co=v pt=c8102e ptt=fff sk=fff sb=5.1.3.0.5.2 he=0b4a97"],
    ["usa", "1980", "away", "0b4a97 fff c8102e c8102e fff ss=8.0.3.2.10.1.3.2 hs=4.2.10.1.4.2 co=v pt=c8102e ptt=fff sk=0b4a97 sb=4.1.3.2.4.1 he=0b4a97"],
    ["usa", "1988", "home", "fff c8102e 0a2a6a 0a2a6a c8102e p=y y=c ss=24.0.4.2.2.0.4.1 hs=4.2.4.0.9.1.4.0.4.2 co=v pt=c8102e ptt=fff sk=fff sb=3.1.2.2.3.1"],
    ["usa", "1988", "away", "0a2a6a fff c8102e fff - p=y y=c ss=24.0.4.2.2.0.4.1 hs=4.2.4.0.9.1.4.0.4.2 co=v pt=c8102e ptt=fff sk=0a2a6a sb=3.1.2.2.3.1"],
    ["usa", "1989", "home", "fff 0b4a97 c8102e 0b4a97 - p=y y=c ss=20.0.4.2.2.0.4.1 hs=4.2.4.0.9.1.4.0.4.2 co=v pt=c8102e ptt=fff sk=fff sb=3.1.2.2.3.1"],
    ["usa", "1989", "away", "0b4a97 fff c8102e fff - p=y y=c ss=20.0.4.2.2.0.4.1 hs=4.2.4.0.9.1.4.0.4.2 co=v pt=c8102e ptt=fff sk=0b4a97 sb=3.1.2.2.3.1"],
    ["usa", "1994", "home", "fff 2a1f6e c8102e 2a1f6e - rg=1 hs=5.2.4.0.9.1 ss=0 co=v pt=c8102e sk=fff sb=4.2.3.0.4.1"],
    ["usa", "1994", "away", "2a1f6e fff c8102e fff - rg=1 hs=5.2.4.0.9.1 ss=0 co=v pt=c8102e sk=2a1f6e sb=4.2.3.0.4.1"],
    ["usa", "1998-2000", "home", "fff 1b1a4d 9aa0a6 1b1a4d - rg=1 ss=0 hs=0 co=v pt=1b1a4d sk=fff sb=4.1.3.0.4.1"],
    ["usa", "1998-2000", "away", "1b1a4d fff 9aa0a6 fff - rg=1 ss=0 hs=0 co=v pt=1b1a4d sk=1b1a4d sb=4.1.3.0.4.1"],
    // https://en.wikipedia.org/wiki/Soviet_Union_men%27s_national_ice_hockey_team (red and white, "CCCP"; the lettering is left out)
    ["ussr", "1964-1972", "home", "d4281c fff - fff - ss=12.0.6.1.4.0.6.1 hs=5.1.2.0.9.1 co=l pt=d4281c sk=d4281c sb=3.1.3.0.3.1.3.0.3.1 he=d4281c"],
    ["ussr", "1964-1972", "away", "fff d4281c - d4281c - ss=12.0.6.1.4.0.6.1 hs=5.1.2.0.9.1 co=l pt=d4281c sk=fff sb=3.1.3.0.3.1.3.0.3.1 he=d4281c"],
    ["ussr", "1972-1976", "home", "d4281c fff - fff - ss=12.0.8.1.4.0.8.1 hs=4.1.12.0.4.1 co=v pt=d4281c sk=d4281c sb=3.1.3.0.3.1.3.0.3.1 he=d4281c"], // unsure: the hem band's diamonds are left out
    ["ussr", "1972-1976", "away", "fff d4281c - d4281c - ss=12.0.8.1.4.0.8.1 hs=4.1.12.0.4.1 co=v pt=d4281c sk=fff sb=3.1.3.0.3.1.3.0.3.1 he=d4281c"], // unsure: the hem band's diamonds are left out
    ["ussr", "1976-1984", "home", "d4281c fff - fff - ss=12.0.8.1.4.0.8.1 hs=4.1.12.0.4.1 co=v pt=d4281c sk=d4281c sb=3.1.3.0.3.1.3.0.3.1 he=d4281c"],
    ["ussr", "1976-1984", "away", "fff d4281c - d4281c - ss=12.0.8.1.4.0.8.1 hs=4.1.12.0.4.1 co=v pt=d4281c sk=fff sb=3.1.3.0.3.1.3.0.3.1 he=d4281c"],
    ["ussr", "1984-1986", "home", "d4281c fff b01c12 fff - ss=14.0.6.2.6.1 hs=5.1.7.2.5.1 co=v pt=d4281c sk=d4281c sb=3.1.3.0.3.1 he=d4281c"],
    ["ussr", "1984-1986", "away", "fff d4281c - d4281c - ss=14.0.6.1.4.0.6.1 hs=5.1.11.0.5.1 co=v pt=d4281c sk=fff sb=3.1.3.0.3.1 he=d4281c"],
    ["ussr", "1986-1988", "home", "d4281c fff - fff - p=a ss=0 hs=5.1 co=v pt=d4281c sk=d4281c sb=3.1.3.0.3.1.3.0.3.1 he=d4281c"], // unsure: the white diagonal panel is a sash here
    ["ussr", "1986-1988", "away", "fff d4281c - d4281c - p=a ss=0 hs=5.1 co=v pt=d4281c sk=fff sb=3.1.3.0.3.1.3.0.3.1 he=d4281c"],
    ["ussr", "1988-1991", "home", "d4281c fff - fff - ss=14.0.4.1.3.0.4.1 cb=4.1.5.0.4.1 hs=5.1.5.0.5.1 co=v pt=d4281c sk=d4281c sb=3.1.3.0.3.1 he=d4281c"],
    ["ussr", "1988-1991", "away", "fff d4281c - d4281c - ss=14.0.4.1.3.0.4.1 cb=4.1.5.0.4.1 hs=5.1.5.0.5.1 co=v pt=d4281c sk=fff sb=3.1.3.0.3.1 he=d4281c"],
    // https://en.wikipedia.org/wiki/Russia_men%27s_national_ice_hockey_team
    ["russia", "1994", "home", "fff 0033a0 d4281c 0033a0 - p=c r=5.1.5.2.5.0 co=v pt=d4281c sk=fff sb=3.1.2.2.3.1 he=d4281c"], // unsure: the chevron bands' widths
    ["russia", "1994", "away", "d4281c fff 0033a0 fff - p=c r=5.1.5.2.5.0 co=v pt=d4281c sk=d4281c sb=3.1.2.2.3.1 he=d4281c"],
    ["russia", "1996-2000", "home", "fff 1c3fa8 d4281c 1c3fa8 - ss=0 hs=0 co=v pt=d4281c sk=fff sb=3.1.3.2.3.1 he=d4281c"],
    ["russia", "1996-2000", "away", "d4281c fff 1c3fa8 fff - ss=0 hs=0 co=v pt=d4281c sk=d4281c sb=3.1.3.2.3.1 he=d4281c"],
    ["russia", "2000-2004", "home", "fff 0b44d0 d4281c 0b44d0 - rg=1 ss=0 hs=5.1 co=v cc=1 pt=d4281c sk=0b44d0 sb=3.1.3.0.3.1 he=d4281c"],
    ["russia", "2000-2004", "away", "d4281c 0b44d0 fff fff - rg=1 ss=0 hs=5.1 co=v cc=1 pt=d4281c sk=d4281c sb=3.1.3.0.3.1 he=d4281c"],
    ["russia", "2014", "home", "cf1f26 1a2a6c fff fff - p=y y=s ss=10.0.3.1.3.0.3.1 hs=5.1.4.0.5.2 co=l pt=8a0018 sk=cf1f26 sb=3.2.3.1.3.2 he=cf1f26"],
    ["russia", "2014", "away", "fff cf1f26 1a2a6c 1a2a6c - ss=10.0.3.2.4.1.3.2 hs=10.2.5.0.5.1 co=l pt=8a0018 sk=fff sb=3.2.3.1.3.2 he=cf1f26"],
    ["russia", "2016", "home", "fff 1f4fb8 d4281c d4281c - p=y y=c ss=12.0.6.1.4.2.4.0 hs=0 co=c pt=d4281c sk=fff sb=4.1.3.0.4.2 he=d4281c"],
    ["russia", "2016", "away", "c91f37 1f4fb8 fff fff - p=y y=c ss=12.0.6.2.4.1.4.0 hs=0 co=c pt=c91f37 sk=c91f37 sb=4.2.3.0.4.1 he=c91f37"],
    ["russia", "2018", "home", "fff c91f37 - c91f37 - ss=16.0.8.1 hs=0 co=c pt=c91f37 sk=fff sb=4.1.3.0.4.1 he=c91f37"],
    ["russia", "2018", "away", "c91f37 fff - fff - ss=16.0.8.1 hs=0 co=c pt=c91f37 sk=c91f37 sb=4.1.3.0.4.1 he=c91f37"],
    // https://en.wikipedia.org/wiki/Czechoslovakia_men%27s_national_ice_hockey_team
    ["czechoslovakia", "1967", "home", "2a6fd0 fff d52b1e fff - ss=10.0.4.1.2.0.4.2 hs=5.1.4.2.5.1 co=l pt=d52b1e sk=2a6fd0 sb=3.1.2.2.3.1"], // unsure: the blue, white and red set of 1967
    ["czechoslovakia", "1967", "away", "fff d52b1e 2a6fd0 d52b1e - ss=10.0.4.1.2.0.4.2 hs=5.1.4.2.5.1 co=l pt=d52b1e sk=fff sb=3.1.2.2.3.1"],
    ["czechoslovakia", "1967", "third", "d52b1e fff 2a6fd0 fff - ss=10.0.4.1.2.0.4.2 hs=5.1.4.2.5.1 co=l pt=d52b1e sk=d52b1e sb=3.1.2.2.3.1"],
    ["czechoslovakia", "1974", "home", "d52b1e fff 2a6fd0 fff - ss=14.0.4.1.4.2.4.1 hs=4.1.5.2.4.1 co=l pt=d52b1e sk=d52b1e sb=3.1.2.2.3.1.2.0.3.1"],
    ["czechoslovakia", "1974", "away", "fff d52b1e 2a6fd0 d52b1e - ss=14.0.4.1.4.2.4.1 hs=4.1.5.2.4.1 co=l pt=d52b1e sk=fff sb=3.1.2.2.3.1.2.0.3.1"],
    ["czechoslovakia", "1985", "home", "d52b1e fff 2a5fc0 fff - ss=0 hs=4.1.5.2.4.1.7.0 co=v pt=d52b1e sk=d52b1e sb=4.2.3.1"],
    ["czechoslovakia", "1985", "away", "fff d52b1e 2a5fc0 d52b1e - ss=0 hs=4.1.5.2.4.1.7.0 co=v pt=d52b1e sk=fff sb=4.2.3.1"],
    ["czechoslovakia", "1988", "home", "fff d52b1e 2a5fc0 d52b1e - p=a ss=0 hs=4.2.5.1 co=v pt=d52b1e sk=fff sb=3.1.2.0.3.1"], // unsure: the red diagonal is a sash here
    ["czechoslovakia", "1988", "away", "d52b1e fff 2a5fc0 fff - p=a ss=0 hs=4.2.5.1 co=v pt=d52b1e sk=d52b1e sb=3.1.2.0.3.1"],
    // https://en.wikipedia.org/wiki/Czech_Republic_men%27s_national_ice_hockey_team
    ["czech", "1998-2002", "home", "fff 0b2a8a d52b1e 0b2a8a - ss=6.1 hs=14.1 co=v cc=1 pt=d52b1e sk=fff sb=4.1.3.0.3.2 he=0b2a8a"], // unsure: the hem band is half blue, half red
    ["czech", "1998-2002", "away", "d52b1e fff 0b2a8a fff - ss=6.2 hs=14.2 co=v cc=1 pt=d52b1e sk=d52b1e sb=4.2.3.0.3.1 he=0b2a8a"],
    ["czech", "2006", "home", "fff d52b1e 0b2a8a d52b1e - p=y y=s pa=2 ss=0 hs=0 co=v cc=2 pt=d52b1e sk=fff sb=3.1.2.2.3.1 he=0b2a8a"],
    ["czech", "2006", "away", "d52b1e fff 0b2a8a fff - p=y y=s pa=2 ss=0 hs=0 co=v cc=2 pt=d52b1e sk=d52b1e sb=3.1.2.2.3.1 he=0b2a8a"],
    ["czech", "2018", "home", "ef1c46 fff 1d3a8f 1d3a8f - p=y y=c ss=6.2 hs=0 co=c pt=ef1c46 sk=ef1c46 sb=6.1 he=1d3a8f"],
    ["czech", "2018", "away", "fff ef1c46 1d3a8f ef1c46 - p=y y=c ss=6.2 hs=0 co=c pt=ef1c46 sk=fff sb=6.1 he=1d3a8f"],
    // https://en.wikipedia.org/wiki/Sweden_men%27s_national_ice_hockey_team (yellow and blue, three crowns left out)
    ["sweden", "1988", "home", "fecb00 0b4a9a fff 0b4a9a - p=y y=c ss=16.0.4.2.4.1 hs=4.1.4.2.4.1 co=v pt=0b4a9a sk=fecb00 sb=3.1.2.2.3.1 he=fecb00"],
    ["sweden", "1988", "away", "0b4a9a fecb00 fff fecb00 - p=y y=c ss=16.0.4.2.4.1 hs=4.1.4.2.4.1 co=v pt=0b4a9a sk=0b4a9a sb=3.1.2.2.3.1 he=fecb00"],
    ["sweden", "1994", "home", "fecb00 0b4a9a - 0b4a9a - ss=12.0.4.1.3.0.4.1 hs=5.1.5.0.11.1 co=v pt=0b4a9a sk=fecb00 sb=3.1.3.0.3.1 he=0b4a9a"],
    ["sweden", "1994", "away", "0b4a9a fecb00 - fecb00 - ss=12.0.4.1.3.0.4.1 hs=5.1.5.0.11.1 co=v pt=0b4a9a sk=0b4a9a sb=3.1.3.0.3.1 he=0b4a9a"],
    ["sweden", "1998-2005", "home", "ffd800 0a4a96 - 0a4a96 - ss=10.0.6.1.3.0.6.1 hs=5.1.5.0.11.1 co=c cc=1 pt=0a4a96 sk=ffd800 sb=4.1.3.0.4.1 he=0a4a96"],
    ["sweden", "1998-2005", "away", "0a4a96 ffd800 - ffd800 - ss=10.0.6.1.3.0.6.1 hs=5.1.5.0.11.1 co=c cc=1 pt=0a4a96 sk=0a4a96 sb=4.1.3.0.4.1 he=0a4a96"],
    ["sweden", "2018", "home", "f5b800 1f3a7a - 1f3a7a - ss=14.0.10.1.5.0.10.1 hs=0 co=c cc=1 pt=1f3a7a sk=f5b800 sb=4.1.3.0.4.1 he=1f3a7a"],
    ["sweden", "2018", "away", "1f3a7a f5b800 - f5b800 - ss=14.0.10.1.5.0.10.1 hs=0 co=c cc=1 pt=1f3a7a sk=1f3a7a sb=4.1.3.0.4.1 he=1f3a7a"],
    // https://en.wikipedia.org/wiki/Finland_men%27s_national_ice_hockey_team (blue and white, the lion left out)
    ["finland", "1988", "home", "fff 1b5ed0 - 1b5ed0 - ss=16.0.6.1.2.0.6.1 hs=4.0.14.1 co=v pt=1b5ed0 sk=fff sb=5.1.3.0.5.1 he=1b5ed0"],
    ["finland", "1988", "away", "1b5ed0 fff - fff - ss=16.0.6.1.2.0.6.1 hs=4.0.14.1 co=v pt=1b5ed0 sk=1b5ed0 sb=5.1.3.0.5.1 he=1b5ed0"],
    ["finland", "1992", "home", "fff 0b3a8f - 0b3a8f - ss=16.0.10.1 hs=14.1 co=v pt=0b3a8f sk=fff sb=5.1.3.0.5.1 he=0b3a8f"],
    ["finland", "1992", "away", "0b3a8f fff - fff - ss=16.0.10.1 hs=14.1 co=v pt=0b3a8f sk=0b3a8f sb=5.1.3.0.5.1 he=0b3a8f"],
    ["finland", "1994", "home", "fff 0b4aa0 - 0b4aa0 - ss=14.0.4.1.3.0.4.1 hs=4.0.12.1.4.0 co=v pt=0b4aa0 sk=fff sb=3.1.3.0.3.1.3.0.3.1 he=0b4aa0"],
    ["finland", "1994", "away", "0b4aa0 fff - fff - ss=14.0.4.1.3.0.4.1 hs=4.0.12.1.4.0 co=v pt=0b4aa0 sk=0b4aa0 sb=3.1.3.0.3.1.3.0.3.1 he=0b4aa0"],
    ["finland", "1998-2004", "home", "fff 2a8fd0 1a1f5c 1a1f5c - ss=0 hs=0 co=v cc=2 pt=1a1f5c sk=fff sb=4.1.2.2.4.1 he=1a1f5c"],
    ["finland", "1998-2004", "away", "2a8fd0 fff 1a1f5c fff - ss=0 hs=0 co=v cc=2 pt=1a1f5c sk=2a8fd0 sb=4.1.2.2.4.1 he=1a1f5c"],
    ["finland", "2018", "home", "1b4da1 0a1f4a - fff - p=y y=c ss=0 hs=0 co=c pt=0a1f4a sk=1b4da1 sb=6.1 he=0a1f4a"],
    ["finland", "2018", "away", "fff 3a8fd4 0a1f4a 1b4da1 - p=y y=c ss=0 hs=0 co=c pt=0a1f4a sk=fff sb=6.1 he=0a1f4a"],
    // https://en.wikipedia.org/wiki/Germany_men%27s_national_ice_hockey_team (black, red and gold; the shield and the eagle are left out)
    ["west-germany", "1988", "home", "fff 000 dd0000 ffce00 - p=a hs=5.2.7.1 ss=0 co=v pt=000 ptt=ffce00 sk=fff sb=3.2.3.1.3.0 he=fff"], // unsure: the black, red and gold diagonal is a sash here
    ["west-germany", "1988", "away", "dd0000 000 ffce00 ffce00 - p=a hs=5.2.7.1 ss=0 co=v pt=000 ptt=ffce00 sk=dd0000 sb=3.2.3.1.3.0 he=fff"],
    ["germany", "1992", "home", "fff 000 dd0000 000 - hs=7.2.5.1.5.2 ss=0 co=v pt=000 ptt=ffce00 sk=fff sb=3.1.3.2.3.0 he=ffce00"], // unsure: the flame-shaped wedge across the hem is left out
    ["germany", "1992", "away", "dd0000 000 ffce00 ffce00 - hs=7.1.5.2.5.0 ss=0 co=v pt=000 ptt=ffce00 sk=dd0000 sb=3.1.3.2.3.0 he=ffce00"],
    ["germany", "1998-2000", "home", "fff 111 dd0000 111 - rg=1 ss=0 hs=0 co=v pt=111 sk=fff sb=3.2.3.1.3.0 he=fff"],
    ["germany", "1998-2000", "away", "111 dd0000 ffce00 ffce00 - ss=0 hs=0 co=v pt=111 sk=111 sb=3.2.3.1.3.0 he=fff"],
    ["germany", "2018", "home", "111 ffce00 dd0000 ffce00 - p=y y=c ss=0 hs=0 co=c pt=111 sk=111 sb=4.2.3.1 he=111"],
    ["germany", "2018", "away", "ffce00 111 dd0000 111 - p=y y=c ss=0 hs=0 co=c pt=111 sk=ffce00 sb=4.2.3.1 he=111"],
    // https://en.wikipedia.org/wiki/Switzerland_men%27s_national_ice_hockey_team (red and white, the cross left out)
    ["switzerland", "1988", "home", "fff e30a17 - e30a17 - p=h r=7.1.9.0 co=v pt=e30a17 sk=fff sb=4.1.2.0.4.1 he=e30a17"], // unsure: the width of the red hoops
    ["switzerland", "1988", "away", "e30a17 fff - fff - p=h r=9.1.7.0 co=v pt=e30a17 sk=e30a17 sb=4.1.2.0.4.1 he=e30a17"],
    ["switzerland", "1991", "home", "fff e30a17 - e30a17 - p=a ss=0 hs=0 co=v pt=e30a17 sk=fff sb=4.1.2.0.4.1 he=e30a17"], // unsure: the diagonal panel is a sash here
    ["switzerland", "1991", "away", "e30a17 fff - fff - p=a ss=0 hs=0 co=v pt=e30a17 sk=e30a17 sb=4.1.2.0.4.1 he=e30a17"],
    ["switzerland", "1998-2000", "home", "fff e30a17 000 e30a17 - ss=0 hs=5.2.8.1 co=v pt=e30a17 sk=fff sb=3.2.3.0.3.1 he=111"],
    ["switzerland", "1998-2000", "away", "e30a17 fff 000 fff - ss=0 hs=5.2.9.1 co=v pt=e30a17 sk=e30a17 sb=3.2.3.0.3.1 he=111"],
    ["switzerland", "2001-2004", "home", "fff e30a17 000 e30a17 - ss=0 hs=5.2.8.1 co=v pt=e30a17 sk=fff sb=3.2.3.0.3.1 he=111"],
    ["switzerland", "2001-2004", "away", "e30a17 fff 000 fff - ss=0 hs=5.2.11.1 co=v pt=e30a17 sk=e30a17 sb=3.2.3.0.3.1 he=111"],
    ["switzerland", "2018", "home", "e30a17 fff - fff - ss=0 hs=0 co=c pt=111 sk=e30a17 sb=6.1 he=111"],
    ["switzerland", "2018", "away", "fff e30a17 - e30a17 - ss=0 hs=0 co=c pt=111 sk=fff sb=6.1 he=111"],
    // https://en.wikipedia.org/wiki/Slovakia_men%27s_national_ice_hockey_team
    ["slovakia", "2014", "home", "fff 0b2a5e ee1c25 0b2a5e - p=y y=s ss=0 hs=0 co=c pt=0b2a5e sk=fff sb=4.1.3.0.4.1 he=0b2a5e"],
    ["slovakia", "2014", "away", "0b2a5e fff ee1c25 fff - p=y y=s ss=0 hs=0 co=c pt=0b2a5e sk=0b2a5e sb=4.1.3.0.4.1 he=0b2a5e"],
    ["slovakia", "2018", "home", "0b5fb0 fff ee1c25 fff - ss=0 hs=0 co=c pt=0b5fb0 sk=0b5fb0 sb=4.1.3.2.4.1 he=0b2a5e"], // unsure: the jagged sleeve ends are left out
    ["slovakia", "2018", "away", "fff 0b5fb0 ee1c25 0b5fb0 - ss=0 hs=0 co=c pt=0b5fb0 sk=fff sb=4.1.3.2.4.1 he=0b2a5e"],
    ["slovakia", "2022", "home", "fff 3b4ea9 b3202e 3b4ea9 - p=y y=c ss=0 hs=0 co=v pt=3b4ea9 sk=fff sb=4.2.3.0.4.1 he=3b4ea9"],
    ["slovakia", "2022", "away", "3b4ea9 fff b3202e fff - p=y y=c ss=0 hs=0 co=v pt=3b4ea9 sk=3b4ea9 sb=4.2.3.0.4.1 he=3b4ea9"],
    // https://en.wikipedia.org/wiki/Norway_men%27s_national_ice_hockey_team (red, white and blue)
    ["norway", "1937", "home", "fff d52b1e 1a3a8f d52b1e - cb=10.1.4.0.5.2.4.0.10.1 ss=14.0.10.1.2.0.4.2.2.0.10.1 hs=0 co=c pt=8a0000 sk=d52b1e sb=4.0.4.1"],
    ["norway", "1952-1963", "home", "d52b1e fff 1f3a8f fff - p=y y=c pa=2 ss=10.0.4.1.3.0.4.1.3.0.4.1.3.0.4.1 hs=0 co=c pt=1f3a8f sk=d52b1e sb=3.1.3.0.3.1.3.0.3.1.3.0.3.1.3.0"],
    ["norway", "1964", "home", "d52b1e fff 1a3a8f fff - ss=0 hs=5.2.4.1.5.2 co=l pt=1a3a8f sk=d52b1e sb=3.2.2.1.3.2"],
    ["norway", "1964", "away", "fff d52b1e 1a3a8f d52b1e - ss=0 hs=5.2.4.0.5.2 co=l pt=1a3a8f sk=fff sb=3.2.2.1.3.2"],
    ["norway", "1973", "home", "d52b1e fff 1a3a8f fff - ss=14.0.4.2.3.1.4.2 cb=5.2.4.1.5.2 hs=0 co=c pt=1a3a8f sk=d52b1e sb=3.1.3.2.3.0"],
    ["norway", "1973", "away", "fff 1a3a8f d52b1e 1a3a8f - ss=14.0.4.2.2.0.4.1 cb=5.1.4.0.7.2 hs=0 co=c pt=1a3a8f sk=fff sb=3.1.3.2.3.0"],
    ["norway", "1985", "home", "d52b1e fff 1a3a8f fff - ss=0 cb=5.2.4.1.5.2 hs=0 co=v pt=1a3a8f sk=d52b1e sb=3.2.3.1"],
    ["norway", "1985", "away", "fff 1a3a8f d52b1e 1a3a8f - ss=0 cb=5.1.4.0.7.2 hs=0 co=v pt=1a3a8f sk=fff sb=3.1.3.2"],
    ["norway", "1998", "home", "d52b1e fff 1a3a8f fff - ss=10.0.3.2.4.1.3.2 hs=0 co=v pt=1a3a8f sk=d52b1e sb=3.2.3.1.3.2"],
    ["norway", "1998", "away", "fff d52b1e 1a3a8f d52b1e - ss=10.0.3.2.4.1.3.2 hs=0 co=v pt=1a3a8f sk=fff sb=3.2.3.1.3.2"],
    ["norway", "2006", "home", "d52b1e fff 1a3a8f fff - ss=10.0.3.2.4.1.3.2 hs=0 co=c pt=1a3a8f sk=d52b1e sb=3.2.3.1.3.2"],
    ["norway", "2006", "away", "fff d52b1e 1a3a8f d52b1e - ss=10.0.3.2.4.1.3.2 hs=0 co=c pt=1a3a8f sk=fff sb=3.2.3.1.3.2"],
    // https://en.wikipedia.org/wiki/Latvia_men%27s_national_ice_hockey_team (maroon, white and black)
    ["latvia", "1996-1997", "home", "7a0c20 fff 000 fff - sc=2 ss=4.1 hs=5.2.8.1 co=v pt=000 sk=000 sb=4.0.3.1.4.0 he=111"],
    ["latvia", "1996-1997", "away", "fff 7a0c20 000 7a0c20 - sc=1 ss=4.2 hs=5.2.11.1 co=v pt=000 sk=fff sb=5.1.4.0.5.1 he=111"],
    ["latvia", "2002-2004", "home", "7a0c20 fff 000 fff - sc=2 ss=4.1 hs=5.2.8.1 co=v pt=000 sk=7a0c20 sb=5.2.4.0.5.1 he=111"],
    ["latvia", "2002-2004", "away", "fff 7a0c20 000 7a0c20 - sc=1 ss=4.2 hs=5.2.11.1 co=v pt=000 sk=fff sb=5.1.4.0.5.1 he=111"],
    ["latvia", "2018", "home", "7c1a38 fff - fff - ss=0 hs=0 co=c pt=111 sk=7c1a38 sb=6.1 he=111"], // unsure: the jagged white sleeve ends are left out
    ["latvia", "2018", "away", "fff 7c1a38 - 7c1a38 - ss=0 hs=0 co=c pt=111 sk=fff sb=6.1 he=111"],
    // https://en.wikipedia.org/wiki/Japan_men%27s_national_ice_hockey_team (red and white, the sun disc left out)
    ["japan", "1998-2000", "home", "fff d6261e - d6261e - ss=4.1 hs=0 co=v cc=1 pt=111 sk=fff sb=7.1 he=111"],
    ["japan", "1998-2000", "away", "d6261e fff - fff - ss=4.1 hs=0 co=v cc=1 pt=111 sk=d6261e sb=7.2 he=111"],
    ["japan", "2002-2004", "home", "fff d6261e 111 d6261e - ss=0 hs=0 co=v cc=1 pt=111 sk=fff sb=7.1 he=111"],
    ["japan", "2002-2004", "away", "d6261e fff 111 fff - ss=0 hs=0 co=v cc=1 pt=111 sk=d6261e sb=7.2 he=111"],
    ["japan", "2022", "home", "fff d6261e - d6261e - p=y y=c ss=0 hs=0 co=v pt=111 sk=fff sb=4.1.3.0.4.1 he=111"],
    ["japan", "2022", "away", "151515 d6261e - fff - p=y y=c ss=0 hs=0 co=v pt=151515 sk=151515 sb=4.1.3.0.4.1 he=111"],
    // https://en.wikipedia.org/wiki/Great_Britain_men%27s_national_ice_hockey_team (navy, red and white; the lion and the flag left out)
    ["gb", "2019", "home", "1b2a5c fff c8102e fff - cb=34.1 ss=8.0.4.2.4.1 hs=0 co=c pt=1b2a5c sk=fff sb=4.2.3.0.4.1 he=1b2a5c"], // unsure: the white chest panel is one wide band
    ["gb", "2022", "home", "fff 1b2a5c c8102e 1b2a5c - cb=4.1.14.2.4.1 ss=0 hs=0 co=c pt=1b2a5c sk=fff sb=4.2.3.0.4.2 he=1b2a5c"],
    ["gb", "2022", "away", "1b2a5c fff c8102e fff - cb=4.1.14.2.4.1 ss=0 hs=0 co=c pt=1b2a5c sk=1b2a5c sb=4.2.3.0.4.2 he=1b2a5c"],
    // https://en.wikipedia.org/wiki/Italy_men%27s_national_ice_hockey_team and https://en.wikipedia.org/wiki/France_men%27s_national_ice_hockey_team
    ["italy", "1992", "home", "fff 1b5fb3 009246 1b5fb3 - p=y y=c ss=0 hs=2.2.2.0.2.1 co=v pt=1b5fb3 sk=fff sb=3.2.2.0.3.1 he=1b5fb3"], // unsure: the red line of the tricolour hem is left out
    ["italy", "1992", "away", "1b5fb3 fff 009246 fff - p=y y=c ss=0 hs=2.2.2.0.2.1 co=v pt=1b5fb3 sk=1b5fb3 sb=3.2.2.0.3.1 he=1b5fb3"],
    ["france", "1998-2000", "home", "fff 241a8c d52b1e 241a8c - rg=1 pi=1 ss=0 hs=0 co=v pt=241a8c sk=fff sb=4.2.3.0.4.1 he=fff"],
    ["france", "1998-2000", "away", "241a8c fff d52b1e fff - rg=1 pi=1 ss=0 hs=0 co=v pt=241a8c sk=241a8c sb=4.2.3.0.4.1 he=fff"],
  ]);
