// The names the package says about itself, in English and Japanese: for a drawing's accessible title and for a page that lists the cuts and the patterns.
import type { CutId } from "./cuts.ts";
import type { LanguageId, PatternId } from "./options.ts";

export const CUT_NAMES: Readonly<Record<CutId, { en: string; ja: string }>> = {
  hockey: { en: "Hockey sweater", ja: "アイスホッケーのジャージ" },
  baseball: { en: "Baseball jersey", ja: "野球のユニフォーム" },
  basketball: { en: "Basketball jersey", ja: "バスケットボールのユニフォーム" },
  football: { en: "Football jersey", ja: "アメリカンフットボールのジャージ" },
  soccer: { en: "Soccer shirt", ja: "サッカーのユニフォーム" },
  rugby: { en: "Rugby shirt", ja: "ラグビーのジャージ" },
  handball: { en: "Handball shirt", ja: "ハンドボールのユニフォーム" },
};

export const PATTERN_NAMES: Readonly<Record<PatternId, { en: string; ja: string }>> = {
  solid: { en: "Solid", ja: "無地" },
  stripes: { en: "Stripes", ja: "縦縞" },
  hoops: { en: "Hoops", ja: "横縞" },
  halves: { en: "Halves", ja: "左右二分割" },
  quarters: { en: "Quarters", ja: "四分割" },
  sash: { en: "Sash", ja: "斜め帯" },
  chevron: { en: "Chevron", ja: "山形" },
  pinstripes: { en: "Pinstripes", ja: "ピンストライプ" },
  yoke: { en: "Yoke", ja: "ヨーク切り替え" },
  "chest-band": { en: "Chest band", ja: "胸の横帯" },
};

/** The words of a title: `{ jersey, number, front, back, both }` in a language. */
export const TITLE_WORDS: Readonly<Record<LanguageId, { number: string; front: string; back: string; both: string; cap: string; helmet: string; banner: string; retired: string; titleBanner: string; womens: string }>> = {
  en: { number: "number", front: "front", back: "back", both: "front and back", cap: "Cap", helmet: "Helmet", banner: "Retired number banner", retired: "retired", titleBanner: "Championship banner", womens: "Women's " },
  ja: { number: "背番号", front: "前", back: "後ろ", both: "前と後ろ", cap: "キャップ", helmet: "ヘルメット", banner: "永久欠番バナー", retired: "永久欠番", titleBanner: "優勝バナー", womens: "女性用" },
};
