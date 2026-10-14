// `<senshu-jersey>`: a jersey as a standard custom element. Every option is an attribute; `turnable` lets a reader turn it by hand, `autoplay` and `speed` turn it by itself.
import { OPTION_ATTRIBUTES, optionsFromAttributes } from "./attrs.ts";
import type { JerseyOptions } from "./options.ts";
import { presetOptions } from "./registry.ts";
import { renderJersey } from "./render.ts";
import { bindTurn, type TurnHandle } from "./turn.ts";

/** The tag of the element. */
export const SENSHU_TAG = "senshu-jersey";

export const SENSHU_ATTRIBUTES = [...OPTION_ATTRIBUTES, "preset", "turnable", "autoplay", "speed", "yaw"] as const;

// Importing the module in a server or a test with no DOM must not fail: the class stands on an empty base there.
const Base: typeof HTMLElement = typeof HTMLElement === "undefined" ? (class {} as unknown as typeof HTMLElement) : HTMLElement;

const STYLE = ":host{display:inline-block;line-height:0;max-width:100%}.box{display:block;outline-offset:3px}.box:focus-visible{outline:2px solid currentColor;border-radius:6px}svg{max-width:100%;height:auto}";

export class SenshuJersey extends Base {
  static observedAttributes = SENSHU_ATTRIBUTES;
  #box: HTMLElement | undefined;
  #turn: TurnHandle | undefined;
  #given: JerseyOptions | undefined;
  #queued = false;

  /** Options given as a property, laid under the attributes. */
  get options(): JerseyOptions | undefined {
    return this.#given;
  }
  set options(value: JerseyOptions | undefined) {
    this.#given = value;
    this.#schedule();
  }

  /** The options the element draws now: the preset, then the property, then the attributes. */
  current(): JerseyOptions {
    const preset = this.getAttribute("preset");
    const base = preset === null ? undefined : presetOptions(preset);
    return { ...base, ...this.#given, ...optionsFromAttributes((name) => this.getAttribute(name)) };
  }

  play(): void {
    this.#turn?.play();
  }
  pause(): void {
    this.#turn?.pause();
  }
  togglePlay(): void {
    this.#turn?.togglePlay();
  }
  get yaw(): number {
    return this.#turn?.yaw() ?? 0;
  }

  connectedCallback(): void {
    if (this.#box === undefined) {
      const root = this.shadowRoot ?? this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${STYLE}</style><div class="box" part="box"></div>`;
      this.#box = root.querySelector<HTMLElement>(".box") ?? undefined;
    }
    this.#render();
  }

  disconnectedCallback(): void {
    this.#turn?.destroy();
    this.#turn = undefined;
  }

  attributeChangedCallback(): void {
    this.#schedule();
  }

  #schedule(): void {
    if (this.#box === undefined || this.#queued) return;
    this.#queued = true;
    queueMicrotask(() => {
      this.#queued = false;
      if (this.isConnected) this.#render();
    });
  }

  #render(): void {
    const box = this.#box;
    if (box === undefined) return;
    const options = this.current();
    if (!this.hasAttribute("turnable") && !this.hasAttribute("autoplay")) {
      this.#turn?.destroy();
      this.#turn = undefined;
      box.removeAttribute("tabindex");
      box.removeAttribute("role");
      box.removeAttribute("aria-label");
      box.removeAttribute("aria-roledescription");
      box.removeAttribute("style");
      box.innerHTML = renderJersey(options);
      return;
    }
    const speed = Number(this.getAttribute("speed"));
    const yaw = Number(this.getAttribute("yaw"));
    if (this.#turn === undefined) {
      this.#turn = bindTurn(box, options, { yaw: Number.isFinite(yaw) ? yaw : 0, autoPlay: this.hasAttribute("autoplay"), speed: Number.isFinite(speed) && speed > 0 ? speed : undefined });
    } else this.#turn.update(options);
  }
}

/** Register the element under a tag (`senshu-jersey` unless told otherwise). Safe to call twice; does nothing without a DOM. */
export function defineSenshuJersey(tag: string = SENSHU_TAG, registry: CustomElementRegistry | undefined = typeof customElements === "undefined" ? undefined : customElements): void {
  if (registry === undefined || registry.get(tag) !== undefined) return;
  registry.define(tag, SenshuJersey);
}
