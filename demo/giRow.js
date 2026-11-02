// The row of gi besides judo: every karate, jiu-jitsu and taekwondo garment the package draws, side by side under the name of its art, each a picture and its name. A tile opens
// the garment on the Uniforms page, turning, with its controls (`pick` instead keeps the visitor on the page, as the Uniforms page does). Pictures are made one at a time and only
// when a tile is near the screen, so the row costs nothing until it is seen.
import { OTHER_ARTS } from "./uniformsList.js";
import { picture } from "./giPictures.js";
import { WORDS } from "./words.js";

const lang = () => window.senshuLanguage?.lang ?? "en";
const say = (key) => WORDS[lang()][key] ?? WORDS.en[key] ?? key;

const make = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

/**
 * Draw the row into `host`. `dressed(garment)` is the package's options for a garment (the page adds its belt and size); `keyOf(garment)` names the drawing, so one made before is not
 * made again. `href(garment)` is where a tile goes; `pick(garment)` (instead of `href`) is called when one is chosen. `current` is the garment shown as chosen.
 */
export function giRow(host, { dressed, keyOf, href, pick, current }) {
  host.replaceChildren();
  host.classList.add("gi-row");
  host.setAttribute("role", "group");
  host.setAttribute("aria-label", say("giGroupLabel"));
  for (const { art, garments } of OTHER_ARTS) {
    const group = make("div", "gi-group");
    group.dataset.art = art;
    group.append(make("h3", "gi-art", say(`uniformsArt_${art}`)));
    const list = make("div", "gi-tiles");
    for (const g of garments) {
      const tile = make(pick === undefined ? "a" : "button", "judo-tile gi-tile");
      tile.dataset.garment = g.id;
      tile.dataset.testid = `gi-${g.id}`;
      if (pick === undefined) tile.href = href(g);
      else {
        tile.type = "button";
        tile.setAttribute("aria-pressed", String(g.id === current?.()));
        tile.addEventListener("click", () => {
          for (const other of host.querySelectorAll(".gi-tile")) other.setAttribute("aria-pressed", String(other === tile));
          pick(g);
        });
      }
      const pic = make("span", "judo-pic");
      pic.setAttribute("aria-hidden", "true");
      const img = document.createElement("img");
      img.alt = "";
      img.width = 1;
      img.height = 1;
      img.decoding = "async";
      pic.append(img);
      tile.append(pic, make("span", "judo-cap", say(`uniformsG_${g.id}`)));
      list.append(tile);
      picture(tile, keyOf(g), dressed(g), 220, 3);
    }
    group.append(list);
    host.append(group);
  }
}

/** The package's options for a garment in the row of a page that has no belt choice of its own: worn as a suit, a black belt, the front. */
export const rowOptions = (garment, language) => ({ ...garment.options, mode: "suit", belt: "black", language: language === "ja" ? "ja" : "en", size: "170", view: "front", yaw: 0 });

/** Keep the row in the page's language: drawn again when the language changes. */
export function keepRow(draw) {
  window.addEventListener("senshu-language", draw);
  draw();
}
