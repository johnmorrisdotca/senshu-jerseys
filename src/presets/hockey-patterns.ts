// Two hockey layouts of our own, drawn from parameters only: sleeve stripes that thin out toward the cuff with a pointed yoke, and red sleeves whose edge is a row of white teeth over cuff stripes. They are not any team's jersey and
// carry no crest, wordmark or maker's mark; the colours are plain white, red, navy and black.
import { defineLeague } from "./core.ts";

export const HOCKEY_PATTERNS = defineLeague("hockey", "hockey",
  {
    "shrinking-bands": ["Shrinking bands", "細くなる帯"],
    "sawtooth-sleeves": ["Sawtooth sleeves", "ぎざぎざの袖"],
  },
  [
    // Own layout: a pointed yoke, five sleeve bands and three hem bands, each thinner and closer together than the one before.
    ["shrinking-bands", "2026", "home", "fff c8102e 1b2a6b c8102e - y=p p=y sh=5.9.2.1.10 hh=3.7.3.1.10 co=v cc=1 sn=1"],
    ["shrinking-bands", "2026", "away", "1b2a6b fff c8102e fff - y=p p=y sh=5.9.2.1.10 hh=3.7.3.1.10 co=v cc=1 sn=1"],
    // Own layout: a black body, a curved red yoke and red sleeves, a row of white teeth where the sleeve colours meet and white stripes at the cuff.
    ["sawtooth-sleeves", "2026", "home", "151515 c8102e fff c8102e - p=y y=c sc=1 tt=58.2.7.9 ss=3.2.3.0.3.2 hs=6.1.3.2 co=l cc=2 sn=1"],
    ["sawtooth-sleeves", "2026", "away", "fff 151515 c8102e 151515 - p=y y=c sc=1 tt=58.2.7.9 ss=3.2.3.0.3.2 hs=6.2.3.1 co=l cc=2 sn=1"],
  ]);
