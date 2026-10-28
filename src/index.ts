// The pure entry point: functions that take options and return SVG strings, and nothing else. No timer, no DOM, no network. Turning is `./turn`, the custom element `./element`
// (or `./define`), and the presets of each league `./presets/<league>`.
export { renderJersey } from "./render.ts";
export { titleOf } from "./title.ts";
export { renderCap } from "./cap.ts";
export type { CapOptions } from "./cap.ts";
export {
  JUDOGI_BELTS, JUDOGI_BELT_LABELS, JUDOGI_COLOURS, JUDOGI_MODES, JUDOGI_SIZES, JUDOGI_VIEWS,
  judogiCheck, judogiFrame, judogiHeightCm, renderJudogi,
} from "./judogi.ts";
export type { JudogiBelt, JudogiCheck, JudogiColour, JudogiMode, JudogiOptions, JudogiSize, JudogiView } from "./judogi.ts";
export { BELT_RGB as JUDOGI_BELT_RGB } from "./judogiBelt.ts";
export { PATCH_COLOURS, PATCH_COLOUR_LABELS, PATCH_FACTS, PATCH_STYLES, ZEKKEN_INKS, ZEKKEN_INK_LABELS } from "./judogiPatch.ts";
export type { JudogiBackPatch, PatchColour, PatchStyle, ZekkenInk } from "./judogiPatch.ts";
export { HELMET_KINDS, HELMET_MARKS, renderHelmet } from "./helmet.ts";
export type { HelmetKind, HelmetMark, HelmetOptions } from "./helmet.ts";
export { BANNER_KINDS, BANNER_SHAPES, logoHref, renderBanner } from "./banner.ts";
export type { BannerKind, BannerOptions, BannerShape } from "./banner.ts";
export { TITLE_BANNER_KINDS, renderTitleBanner, yearLines } from "./titleBanner.ts";
export type { TitleBannerKind, TitleBannerOptions } from "./titleBanner.ts";
export { formationRows, jerseyLineup, kitClash, kitMatchup } from "./kit.ts";
export type { KitSide, LineupOptions, LineupPlayer, MatchupOptions } from "./kit.ts";
export { renderKit } from "./uniform.ts";
export { useEmblems } from "./emblems.ts";
export type { EmblemDrawOptions, EmblemRenderer, EmblemStyleName } from "./emblems.ts";
export { decode, defineLeague } from "./presets/core.ts";
export type { Preset, Row, Teams } from "./presets/core.ts";
export { loadedPresets, presetOf, presetOptions, usePresets } from "./registry.ts";
export { CDN, EMBED_KINDS, SITE, embedCode } from "./embed.ts";
export type { EmbedKind, EmbedSettings } from "./embed.ts";
export { OPTION_ATTRIBUTES, attributesFromOptions, jerseyFromParams, jerseyToParams, optionsFromAttributes } from "./attrs.ts";
export { COLLAR_IDS, CUT_IDS, CUTS, cutSpec, FIT_IDS, SLEEVE_IDS } from "./cuts.ts";
export type { CollarId, CutId, CutSpec, FitId, SleeveId, Spot } from "./cuts.ts";
export { ARCH_IDS, BADGE_IDS, CHEST_KINDS, CLOSURE_IDS, LANGUAGE_IDS, LOOK_IDS, PATCH_IDS, PATTERN_IDS, TEXT_ANGLE_IDS, VIEW_IDS, YOKE_IDS } from "./options.ts";
export type { ArchId, BadgeId, Bands, ChestBadge, ChestKind, ClosureId, JerseyOptions, SleeveDetail, LanguageId, LookId, PatchId, PatternId, TextAngleId, ViewId, YokeId } from "./options.ts";
export { NATIONAL_COUNTRIES, NATIONAL_DIRECTIONS, NATIONAL_LAYOUTS, NATIONAL_NAMES } from "./national.ts";
export type { NationalCountry, NationalLayout, NationalOptions } from "./national.ts";
export { CUT_NAMES, PATTERN_NAMES } from "./names.ts";
export { contrast, readColour } from "./colour.ts";
export { JERSEY_HEIGHT, JERSEY_WIDTH, jerseyBox } from "./jersey.ts";
export type { JerseyBox } from "./jersey.ts";
export { VERSION } from "./version.ts";
export { EMBROIDERY_FONTS, EMBROIDERY_PLACES, FONT_STACKS, LOGO_PLACES, MARK_RULES } from "./judogiMarks.ts";
export type { EmbroideryDirection, EmbroideryFontFace, EmbroideryFontName, EmbroideryPlace, JudogiEmblem, JudogiEmbroidery, JudogiLogo, LogoPlace, MarkRules } from "./judogiMarks.ts";
export { THREAD_COLOURS, THREAD_LABELS, THREAD_RGB } from "./judogiThread.ts";
export type { ThreadColour } from "./judogiThread.ts";
export { LABEL_COLOURS, LABEL_COLOUR_LABELS } from "./judogiLabel.ts";
export type { JudogiLabel, LabelColour } from "./judogiLabel.ts";
export { BRAND_KANJI, BRAND_KANJI_LABELS } from "./judogiBrand.ts";
export type { BrandKanji, JudogiBranding } from "./judogiBrand.ts";
export { BELT_MODELS, BELT_SIZES, BELT_SPEC_SOURCES, BELT_END_TAGS, BELT_SIZE_TAG_LINE, BELT_STITCH_LINES, BELT_TAG_NEEDS, BELT_THICKNESSES, EMBROIDERY_STITCHINGS, KOHAKU, MAKER_EMBROIDERY, beltDefaultWidthCm, beltLengthFor, beltStitchLinesFor, beltThicknessOf, beltThicknessesFor, beltWidthIsReal, beltWidthsFor } from "./beltSpecs.ts";
export type { BeltColourName, BeltEndTag, BeltModel, BeltSize, BeltStitchLines, BeltThickness, EmbroideryStitching } from "./beltSpecs.ts";
export { BELT_SOURCES, BELT_SYSTEMS, beltSystem, beltSystemSources } from "./beltSystems.ts";
export type { BeltColour, BeltEnds, BeltGrade, BeltSource, BeltSystem, BeltTags, BeltTextCustom, BeltTip } from "./beltSystems.ts";
