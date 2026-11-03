// The presets a page has loaded, by id: `usePresets(NHL)` once, then `preset: "nhl:montreal-1950s-home"` anywhere, and `preset="..."` on the element.
import type { JerseyOptions } from "./options.ts";
import type { Preset } from "./presets/core.ts";

const table = new Map<string, Preset>();

/**
 * Make presets known by id. Call once at start-up with the leagues the page uses.
 *
 * @param list - the presets to make known, such as `PRESETS` or one league's
 * @example
 * ```ts
 * import { presetOf, usePresets } from "@johnmorrisdotca/senshu-jerseys";
 * import { PRESETS } from "@johnmorrisdotca/senshu-jerseys/presets";
 *
 * usePresets(PRESETS);
 * console.log(presetOf("none"));
 * ```
 */
export function usePresets(list: readonly Preset[]): void {
  for (const p of list) table.set(p.id, p);
}

/**
 * A loaded preset by id.
 *
 * @param id - a preset's id
 * @returns the preset, or `undefined` when none of that id is loaded
 * @example
 * ```ts
 * import { presetOf, usePresets } from "@johnmorrisdotca/senshu-jerseys";
 * import { PRESETS } from "@johnmorrisdotca/senshu-jerseys/presets";
 *
 * usePresets(PRESETS.slice(0, 3));
 * const first = PRESETS[0];
 * console.log(first ? presetOf(first.id)?.team : undefined, presetOf("none"));
 * ```
 */
export const presetOf = (id: string): Preset | undefined => table.get(id);

/**
 * The options of a loaded preset, or `undefined`.
 *
 * @param id - a preset's id
 * @returns the jersey options of the preset, or `undefined` when none of that id is loaded
 * @example
 * ```ts
 * import { presetOptions, usePresets } from "@johnmorrisdotca/senshu-jerseys";
 * import { PRESETS } from "@johnmorrisdotca/senshu-jerseys/presets";
 *
 * usePresets(PRESETS.slice(0, 3));
 * const first = PRESETS[0];
 * console.log(first ? presetOptions(first.id)?.cut : undefined);
 * ```
 */
export const presetOptions = (id: string): JerseyOptions | undefined => table.get(id)?.options;

/**
 * Every loaded preset.
 *
 * @returns the presets `usePresets` was given, in order
 * @example
 * ```ts
 * import { loadedPresets, usePresets } from "@johnmorrisdotca/senshu-jerseys";
 * import { PRESETS } from "@johnmorrisdotca/senshu-jerseys/presets";
 *
 * usePresets(PRESETS.slice(0, 3));
 * console.log(loadedPresets().length);
 * ```
 */
export const loadedPresets = (): Preset[] => [...table.values()];
