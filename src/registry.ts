// The presets a page has loaded, by id: `usePresets(NHL)` once, then `preset: "nhl:montreal-1950s-home"` anywhere, and `preset="..."` on the element.
import type { JerseyOptions } from "./options.ts";
import type { Preset } from "./presets/core.ts";

const table = new Map<string, Preset>();

/** Make presets known by id. Call once at start-up with the leagues the page uses. */
export function usePresets(list: readonly Preset[]): void {
  for (const p of list) table.set(p.id, p);
}

/** A loaded preset by id. */
export const presetOf = (id: string): Preset | undefined => table.get(id);

/** The options of a loaded preset, or `undefined`. */
export const presetOptions = (id: string): JerseyOptions | undefined => table.get(id)?.options;

/** Every loaded preset. */
export const loadedPresets = (): Preset[] => [...table.values()];
