export const PACKAGE: string;
export const KINDS: string[];
export const LABELS: Record<string, string>;
export const SIZES: number[];
export const DEFAULT_SIZE: number;
export const packageKind: (kind: string) => string;
export const canTurn: (kind: string) => boolean;
export function panelCode(api: { embedSnippet: unknown; embedCode: unknown; attributesFromOptions: unknown }, kind: string, options: object, settings?: { size?: number; turnable?: boolean; autoplay?: boolean; site?: string }): string;
export function pictureOf(holder: HTMLElement): HTMLElement;
