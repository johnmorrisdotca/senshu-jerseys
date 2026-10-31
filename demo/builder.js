// The Builder: the jersey's options as one page, the jersey as it stands, and the code for what is shown. The list of
// options is the package's own (OPTION_ATTRIBUTES); rendering and code come from the family's embed builder.
import { CUT_IDS, FIT_IDS, COLLAR_IDS } from "./dist/index.js";
import { SENSHU_ATTRIBUTES } from "./dist/element-entry.js";
import { FAMILY_EMBED_BUILDER_WORDS, familyEmbedBuilder } from "./family-embed-builder.js";
import "./dist/element-define.js";

const words = {
  en: {
    ...FAMILY_EMBED_BUILDER_WORDS.en,
    pitch: "Choose a jersey's cut, colours, pattern and number, see it, and copy the code for what is shown.",
    name: "Senshu (選手, せんしゅ) is Japanese for a player or an athlete.",
    nameLink: "The name",
    foot: "The setup is in the link. No personal data is stored.",
    bldBack: "The playground",
    makerJersey: "A jersey",
    makerJerseySays: "The custom element, the frame, or the code that draws it as an SVG string.",
    copyLink: "Copy a link to this jersey",
  },
  ja: {
    ...FAMILY_EMBED_BUILDER_WORDS.ja,
    pitch: "ジャージの型、色、柄、背番号を選んで確認し、そのコードをコピーできます。",
    name: "「選手」は、競技をする人を表す言葉です。",
    nameLink: "名前について",
    foot: "設定はリンクに入ります。個人情報は保存しません。",
    bldBack: "試してみる",
    makerJersey: "ジャージ",
    makerJerseySays: "カスタム要素、iframe、またはSVG文字列を描くコードのいずれかを選べます。",
    copyLink: "このジャージへのリンクをコピー",
  },
};

const row = (id, kind, en, ja, extra = {}, group = "shape") => ({
  id,
  kind,
  group,
  names: { jersey: id },
  say: { en: { label: en[0], help: en[1] }, ja: { label: ja[0], help: ja[1] } },
  ...extra,
});
const choice = (id, en, ja, choices, labels, extra = {}, group = "shape") =>
  row(id, "choice", en, ja, { choices, ...(labels ? { choiceLabels: { ja: labels } } : {}), ...extra }, group);
const colour = (id, en, ja) => row(id, "text", en, ja, {}, "colours");

const options = [
  choice(
    "cut",
    ["Cut", "The sport the jersey is cut for."],
    ["型", "どの競技のジャージかを選びます。"],
    CUT_IDS,
    { hockey: "ホッケー", baseball: "野球", basketball: "バスケットボール", football: "アメフト", soccer: "サッカー", rugby: "ラグビー", handball: "ハンドボール" },
    { default: "hockey", control: "select" },
  ),
  choice("fit", ["Fit", "Men's or women's."], ["体型", "男性用または女性用です。"], FIT_IDS, { mens: "男性用", womens: "女性用" }, { default: "mens" }),
  choice(
    "view",
    ["View", "The front, the back, or both."],
    ["向き", "前、後ろ、または両方です。"],
    ["front", "back", "both"],
    { front: "前", back: "後ろ", both: "両方" },
    { default: "front" },
  ),
  choice(
    "look",
    ["Style", "How it is drawn: as cloth, flat or in line."],
    ["描き方", "布地、平面、線画から選びます。"],
    ["cloth", "flat", "line"],
    { cloth: "布地", flat: "平面", line: "線画" },
    { default: "cloth" },
  ),
  choice(
    "pattern",
    ["Pattern", "What is on the body of the jersey."],
    ["柄", "ジャージの胴の柄です。"],
    ["solid", "stripes", "hoops", "halves", "quarters", "sash", "chevron", "pinstripes", "yoke", "chest-band"],
    { solid: "無地", stripes: "縦じま", hoops: "横じま", halves: "左右二色", quarters: "四分割", sash: "たすき", chevron: "山形", pinstripes: "細い縦じま", yoke: "肩の切り替え", "chest-band": "胸の帯" },
    { default: "solid", control: "select" },
  ),
  choice(
    "collar",
    ["Collar", "Unless said, the cut's own."],
    ["襟", "指定がなければ、その型の襟です。"],
    COLLAR_IDS,
    { crew: "丸首", v: "Vネック", "lace-up": "編み上げ", polo: "ポロ", round: "ラウンド", wishbone: "ウィッシュボーン", band: "バンド", zip: "ジッパー", point: "ポイント" },
    { control: "select" },
  ),
  colour("body", ["Body colour", "A colour such as #af1e2d."], ["胴の色", "#af1e2d のような色です。"]),
  colour("trim", ["Trim colour", "A colour such as #ffffff."], ["縁の色", "#ffffff のような色です。"]),
  colour("accent", ["Second trim colour", "A colour such as #192168."], ["二番目の縁の色", "#192168 のような色です。"]),
  row("number", "text", ["Number", "The digits on the back."], ["背番号", "背中の数字です。"], {}, "words"),
  row("name", "text", ["Name", "The name above the number."], ["名前", "背番号の上の名前です。"], {}, "words"),
  row("front-text", "text", ["Front text", "The words across the chest."], ["胸の文字", "胸に入れる文字です。"], {}, "words"),
  choice("language", ["Language", "The words it says to a screen reader."], ["読み上げる言語", "スクリーンリーダーに読ませる言葉です。"], ["en", "ja"], null, {}, "words"),
  row("title", "text", ["Spoken title", "An optional name for a screen reader."], ["読み上げる名前", "スクリーンリーダー用の名前です。指定は任意です。"], {}, "words"),
  row("size", "number", ["Width", "Pixels."], ["幅", "ピクセルで指定します。"], { range: { min: 80, max: 800, step: 10 } }, "words"),
  row("turnable", "boolean", ["Turn by hand", "Drag the jersey to turn it."], ["手で回す", "ドラッグして回せます。"], { default: false }, "turning"),
  row("autoplay", "boolean", ["Turn by itself", "The jersey turns on its own."], ["自動で回す", "ジャージが自動で回ります。"], { default: false }, "turning"),
  row("volume", "boolean", ["Volume", "Draw the turning jersey with depth."], ["立体感", "回るジャージに奥行きを付けます。"], { default: false }, "turning"),
];

// The options of the package this page has no row for, each with why, so nothing is left out by accident.
const leftOut = {};
const listed = new Set(options.map((option) => option.id));
for (const name of SENSHU_ATTRIBUTES)
  if (!listed.has(name)) leftOut[`jersey.${name}`] = "A detail of the garment, set in the playground or by the attribute itself: see the API reference.";

let mounted;
const page = globalThis.familyLanguage({ id: "senshu-jerseys", words, onChange: () => mounted?.draw() });
const builder = familyEmbedBuilder({
  id: "senshu-jerseys",
  packageName: "@johnmorrisdotca/senshu-jerseys",
  major: "0",
  site: "https://johnmorrisdotca.github.io/senshu-jerseys/",
  title: "Senshu Jerseys · a jersey",
  titleJa: "ジャージの埋め込み",
  options,
  leftOut,
  groups: {
    shape: { en: "The jersey", ja: "ジャージ" },
    colours: { en: "Its colours", ja: "色" },
    words: { en: "Its words and size", ja: "文字と大きさ" },
    turning: { en: "Turning", ja: "回転" },
  },
  makers: {
    jersey: {
      names: "jersey",
      element: "jersey",
      tag: "senshu-jersey",
      embed: "embed.html",
      required: ["cut"],
      description: "makerJerseySays",
      formats: ["element", "iframe", "module", "react", "vue", "svelte", "angular", "html", "url"],
      width: 420,
      height: 480,
    },
  },
});
builder.validateCoverage({ jersey: SENSHU_ATTRIBUTES });
mounted = builder.mount({
  words,
  language: () => page,
  initial: { jersey: { cut: "hockey", number: "9", body: "#af1e2d", trim: "#ffffff" } },
  renderPreview: ({ stage, attrs }) => {
    const jersey = globalThis.document.createElement("senshu-jersey");
    for (const [name, value] of attrs) jersey.setAttribute(name, value);
    stage.append(jersey);
    return { destroy: () => jersey.remove() };
  },
});
