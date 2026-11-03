// `<senshu-jersey>`: a jersey as a standard custom element. Every option is an attribute; `turnable` lets a reader turn it by hand, `autoplay`, `speed` and `direction` turn it by itself.
import { OPTION_ATTRIBUTES, optionsFromAttributes } from "./attrs.ts";
import type { JerseyOptions } from "./options.ts";
import { presetOptions } from "./registry.ts";
import { renderJersey } from "./render.ts";
import { bindTurn, jerseyFrame, turnDirection, type TurnHandle } from "./turn.ts";

/**
 * The tag of the element.
 *
 * @example
 * ```ts
 * import { SENSHU_TAG } from "@johnmorrisdotca/senshu-jerseys/element";
 *
 * console.log(SENSHU_TAG);
 * ```
 */
export const SENSHU_TAG = "senshu-jersey";

/**
 * Every attribute of the `<senshu-jersey>` element: the option attributes and the ones for turning and the controls.
 *
 * @example
 * ```ts
 * import { SENSHU_ATTRIBUTES } from "@johnmorrisdotca/senshu-jerseys/element";
 *
 * console.log(SENSHU_ATTRIBUTES.length, SENSHU_ATTRIBUTES[0]);
 * ```
 */
export const SENSHU_ATTRIBUTES = [...OPTION_ATTRIBUTES, "preset", "turnable", "autoplay", "speed", "direction", "yaw", "volume", "pitch"] as const;

// Importing the module in a server or a test with no DOM must not fail: the class stands on an empty base there.
const Base: typeof HTMLElement = typeof HTMLElement === "undefined" ? (class {} as unknown as typeof HTMLElement) : HTMLElement;

const STYLE = ":host{display:inline-block;line-height:0;max-width:100%}.box{display:block;outline-offset:3px}.box:focus-visible{outline:2px solid currentColor;border-radius:6px}svg{max-width:100%;height:auto}";

/**
 * The `<senshu-jersey>` element: a jersey drawn from its attributes, turnable by hand or by itself.
 *
 * @example
 * ```ts no-run
 * import { SenshuJersey, defineSenshuJersey } from "@johnmorrisdotca/senshu-jerseys/element";
 *
 * defineSenshuJersey();
 * const jersey = document.createElement("senshu-jersey") as SenshuJersey;
 * jersey.setAttribute("cut", "hockey");
 * document.body.append(jersey);
 * ```
 */
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
    const given = this.current();
    const volume = this.hasAttribute("volume") && this.getAttribute("volume") !== "false";
    const pitch = Number(this.getAttribute("pitch"));
    const options = { ...given, volume, ...(this.hasAttribute("pitch") && Number.isFinite(pitch) ? { pitch } : {}) };
    if (!this.hasAttribute("turnable") && !this.hasAttribute("autoplay")) {
      this.#turn?.destroy();
      this.#turn = undefined;
      box.removeAttribute("tabindex");
      box.removeAttribute("role");
      box.removeAttribute("aria-label");
      box.removeAttribute("aria-roledescription");
      box.removeAttribute("style");
      const still = Number(this.getAttribute("yaw"));
      box.innerHTML = volume && given.view !== "both" && given.kit !== true ? jerseyFrame({ ...options, yaw: Number.isFinite(still) ? still : 0 }) : renderJersey(given);
      return;
    }
    const speed = Number(this.getAttribute("speed"));
    const yaw = Number(this.getAttribute("yaw"));
    if (this.#turn === undefined) {
      this.#turn = bindTurn(box, options, { yaw: Number.isFinite(yaw) ? yaw : 0, autoPlay: this.hasAttribute("autoplay"), speed: Number.isFinite(speed) && speed > 0 ? speed : undefined, direction: turnDirection(this.getAttribute("direction")) });
    } else {
      this.#turn.setDirection(turnDirection(this.getAttribute("direction")));
      this.#turn.update(options);
    }
  }
}

/**
 * Register the element under a tag (`senshu-jersey` unless told otherwise). Safe to call twice; does nothing without a DOM.
 *
 * @param tag - the tag to register (`senshu-jersey` by default)
 * @param registry - the custom elements registry to use (the page's by default)
 * @example
 * ```ts no-run
 * import { defineSenshuJersey } from "@johnmorrisdotca/senshu-jerseys/element";
 *
 * defineSenshuJersey();
 * document.body.insertAdjacentHTML("beforeend", '<senshu-jersey cut="hockey" colors="af1e2d,ffffff" number="9"></senshu-jersey>');
 * ```
 */
export function defineSenshuJersey(tag: string = SENSHU_TAG, registry: CustomElementRegistry | undefined = typeof customElements === "undefined" ? undefined : customElements): void {
  if (registry === undefined || registry.get(tag) !== undefined) return;
  registry.define(tag, SenshuJersey);
}
