import "@johnmorrisdotca/senshu-jerseys/define";
import { renderJersey } from "@johnmorrisdotca/senshu-jerseys";

// The element draws itself once it is registered; renderJersey gives the same kind of drawing as a string.
document.querySelector("#plain")!.innerHTML = renderJersey({ cut: "soccer", colors: ["#192168", "#ffffff"], pattern: "hoops", number: 10 });
