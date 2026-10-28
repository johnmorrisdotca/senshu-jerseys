// The designer's pickers: a colour is a swatch, a few-way visual choice is a picture tile, on or off is a switch, a set of places is a set of checkboxes, a short
// choice of words is a segmented control, and only a long list is a dropdown. Each picker is a plain element built from the page's state, with the same
// `data-testid` its dropdown had (`judo-<key>`), its options carrying `data-value`. Nothing here draws the judogi.

/** A button group in the family's segmented style, each button a toggle (`aria-pressed`). */
function pressButtons(box, values, current, onPick) {
  const buttons = new Map();
  for (const [value, button] of values) {
    button.type = "button";
    button.dataset.value = value;
    button.setAttribute("aria-pressed", String(value === current));
    button.addEventListener("click", () => {
      for (const [v, b] of buttons) b.setAttribute("aria-pressed", String(v === value));
      onPick(value);
    });
    buttons.set(value, button);
    box.append(button);
  }
  return box;
}

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

/** A picker's wrapper: its test id and its name for a screen reader. */
function frame(id, label, className) {
  const box = el("div", className);
  box.dataset.testid = id;
  box.id = id;
  box.setAttribute("role", "group");
  box.setAttribute("aria-label", label);
  return box;
}

/**
 * Colour swatches, one chosen. `css(value)` is the swatch's background, `name(value)` its name (what a screen reader and a hover say).
 * A value of `none` is drawn crossed out.
 */
export function swatches({ id, label, values, current, css, name, onPick }) {
  const box = frame(id, label, "judo-swatches");
  return pressButtons(box, values.map((v) => {
    const b = el("button", "judo-swatch");
    b.setAttribute("aria-label", name(v));
    b.title = name(v);
    const dot = el("span", `judo-dot${v === "none" ? " is-none" : ""}`);
    if (v !== "none") dot.style.background = css(v);
    b.append(dot);
    return [v, b];
  }), current, onPick);
}

/** Picture tiles, one chosen: a small picture over its name. `picture(value)` is an SVG string or a short text (a brush mark's character). */
export function tiles({ id, label, values, current, picture, name, onPick, wide }) {
  const box = frame(id, label, `judo-tiles${wide ? " is-wide" : ""}`);
  return pressButtons(box, values.map((v) => {
    const b = el("button", "judo-tile");
    const pic = el("span", "judo-pic");
    const p = picture(v);
    if (p.startsWith("<")) pic.innerHTML = p;
    else {
      pic.textContent = p;
      pic.classList.add("is-glyph");
    }
    pic.setAttribute("aria-hidden", "true");
    b.append(pic, el("span", "judo-cap", name(v)));
    return [v, b];
  }), current, onPick);
}

/** A short choice of words, one chosen, in the family's segmented style. */
export function segmented({ id, label, values, current, name, onPick }) {
  const box = frame(id, label, "fam-seg judo-seg");
  return pressButtons(box, values.map((v) => [v, el("button", "", name(v))]), current, onPick);
}

/** An on and off switch with the state in words beside it. */
export function toggle({ id, label, on, words, onChange }) {
  const b = el("button", "judo-switch");
  b.type = "button";
  b.id = id;
  b.dataset.testid = id;
  b.setAttribute("role", "switch");
  b.setAttribute("aria-label", label);
  b.setAttribute("aria-checked", String(on));
  const track = el("span", "judo-track");
  track.append(el("span", "judo-knob"));
  const state = el("span", "judo-state", on ? words.on : words.off);
  b.append(track, state);
  b.addEventListener("click", () => {
    const next = b.getAttribute("aria-checked") !== "true";
    b.setAttribute("aria-checked", String(next));
    state.textContent = next ? words.on : words.off;
    onChange(next);
  });
  return b;
}

/** A set of places, each a checkbox in a chip, none or many chosen. `groups` is `[title, [value, ...]]`. */
export function checks({ id, label, groups, chosen, name, onChange }) {
  const box = frame(id, label, "judo-checks");
  const set = new Set(chosen);
  for (const [title, values] of groups) {
    const part = el("div", "judo-checkgroup");
    part.setAttribute("role", "group");
    part.setAttribute("aria-label", title);
    part.append(el("span", "judo-checktitle", title));
    const list = el("div", "judo-checklist");
    for (const v of values) {
      const row = el("label", "judo-check");
      const input = el("input");
      input.type = "checkbox";
      input.dataset.value = v;
      input.checked = set.has(v);
      input.addEventListener("change", () => {
        if (input.checked) set.add(v);
        else set.delete(v);
        onChange([...set]);
      });
      row.append(input, el("span", "", name(v)));
      list.append(row);
    }
    part.append(list);
    box.append(part);
  }
  return box;
}

// ---- Pictures for the tiles: small, flat, and made for the page's text colour so that they follow a dark theme. ----
const svg = (inner, w = 64, h = 56) => `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" focusable="false">${inner}</svg>`;
const BODY = '<path d="M21 7 28 4h8l7 3 15 15-6 8-6-5v27H18V25l-6 5-6-8Z" fill="currentColor" fill-opacity=".1"/>';
const FRONT = `${BODY}<path d="M27 5l5 19 5-19" />`;
const BACK = `${BODY}<path d="M26 5q6 3 12 0" />`;

export const PICTURES = {
  mode: {
    pieces: svg('<g transform="translate(-7 0) scale(.78)"><path d="M21 7 28 4h8l7 3 15 15-6 8-6-5v27H18V25l-6 5-6-8Z" fill="currentColor" fill-opacity=".1"/><path d="M27 5l5 19 5-19"/></g><path d="M40 20h18l-2 33h-7l-3-17-3 17h-7Z" fill="currentColor" fill-opacity=".1"/>'),
    suit: svg('<path d="M21 3 28 1h8l7 2 13 13-5 7-5-4v16H18V19l-5 4-5-7Z" fill="currentColor" fill-opacity=".1"/><path d="M27 2l5 14 5-14"/><path d="M20 33h24l-1 21h-6l-2-12-2 12h-6l-2-12Z" fill="currentColor" fill-opacity=".1"/><path d="M19 29h26" stroke-width="3"/>'),
    jacket: svg(FRONT),
    pants: svg('<path d="M20 6h24l3 46h-9l-6-24-6 24h-9Z" fill="currentColor" fill-opacity=".1"/><path d="M20 12h24"/>'),
    belt: svg('<path d="M5 24h54v8H5Z" fill="currentColor" fill-opacity=".1"/><path d="M26 22h12v12H26Z"/><path d="M29 34l-4 16M35 34l5 16" stroke-width="3"/>'),
  },
  patch: {
    none: svg(BACK),
    ijf: svg(`${BACK}<rect x="21" y="14" width="22" height="22" fill="#fff" fill-opacity=".9"/><rect x="21" y="14" width="22" height="6" fill="#1b3a8c" stroke="none"/><path d="M24 25h16M24 30h16" stroke-width="2.6"/>`),
    zekken: svg(`${BACK}<rect x="21" y="14" width="22" height="22" fill="#fff" fill-opacity=".9"/><path d="M25 20h14M32 18v10M26 31h12" stroke-width="2.2"/>`),
  },
  emblem: {
    none: svg(FRONT),
    placeholder: svg(`${FRONT}<circle cx="42" cy="17" r="5.5" fill="#fff" fill-opacity=".9"/><path d="m42 13.4 1 2.3 2.5.2-1.9 1.6.6 2.4-2.2-1.3-2.2 1.3.6-2.4-1.9-1.6 2.5-.2Z" fill="currentColor" stroke="none"/>`),
    flag: svg(`${FRONT}<rect x="36" y="13" width="12" height="8" fill="#fff"/><path d="M36 13h3v8h-3zM45 13h3v8h-3z" fill="#c8102e" stroke="none"/><path d="M42 15.2l1 1.4-.6 1.8h-.8l-.6-1.8Z" fill="#c8102e" stroke="none"/>`),
  },
  sewing: {
    x: svg('<rect x="10" y="8" width="44" height="40" fill="#fff" fill-opacity=".9"/><path d="M14 12l36 32M50 12 14 44" stroke-dasharray="3 2.4"/>'),
    lines: svg('<rect x="10" y="8" width="44" height="40" fill="#fff" fill-opacity=".9"/><path d="M21 12v32M32 12v32M43 12v32" stroke-dasharray="3 2.4"/>'),
  },
};
