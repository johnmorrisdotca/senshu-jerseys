import { defineLeague } from "./core.ts";

export const NHL_CLASSIC = defineLeague("nhl", "hockey",
  {
    montreal: ["Montreal Canadiens", "モントリオール・カナディアンズ"],
    maroons: ["Montreal Maroons", "モントリオール・マルーンズ"],
    ottawa: ["Ottawa Senators (1917-1934)", "オタワ・セネターズ（初代）"],
    tigers: ["Hamilton Tigers", "ハミルトン・タイガース"],
  },
  [
    // https://en.wikipedia.org/wiki/Montreal_Canadiens#Uniforms
    ["montreal", "1925-1927", "home", "af1e2d fff 192168 fff - ss=40.0.2.2.20.1.2.2 hs=2.1.3.2.2.1 cb=2.2.18.1.2.2 co=c pt=c9b27c"],
    ["maroons", "1925-1929", "home", "4f0f14 fff - fff - ss=3.0.3.1.3.0.3.1.3.0.3.1.3.0.3.1.3.0.3.1 hs=5.1.3.0.2.1.3.0.2.1 co=c pt=c19a5b"],
    ["maroons", "1924-1925", "home", "4f0f14 fff - fff - ss=0 hs=10.1 co=c pt=c19a5b"],
    ["ottawa", "1917-1921", "home", "fff c8102e 000 000 - p=h r=8.1.5.0.8.2.5.0 ss=0 hs=0 co=c pt=e8e4c8"],
    ["tigers", "1920-1921", "home", "ffb81c 000 - 000 - p=s r=6.1.6.0 ss=0 hs=0 co=c pt=e8e4c8"],
  ]);
