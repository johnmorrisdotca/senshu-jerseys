---
title: TypeScript と Node
section: how-to
order: 6
description: すべてのオプションの型と、DOM のないサーバーでユニフォームや柔道着を描く方法です。
---

## TypeScript

パッケージには型が入っています。オプションはすべて型付きのオブジェクトで、使えない値はエラーになります。

```ts
import { jerseyToParams, renderJersey, type JerseyOptions } from "@johnmorrisdotca/senshu-jerseys";
import type { SenshuJersey } from "@johnmorrisdotca/senshu-jerseys/element";
import { bindTurn, type TurnHandle } from "@johnmorrisdotca/senshu-jerseys/turn";

const options: JerseyOptions = { cut: "hockey", colors: ["#af1e2d", "#ffffff", "#192168"], number: 9 };
const svg: string = renderJersey(options);
console.log(svg.startsWith("<svg"), String(jerseyToParams(options)));

export function turn(box: HTMLElement): TurnHandle {
  return bindTurn(box, options, { autoPlay: true });
}

export function recolour(jersey: SenshuJersey): void {
  jersey.setAttribute("colors", "#192168,#ffffff");
}

// @ts-expect-error "polo" is not a cut
renderJersey({ cut: "polo" });
```

要素のクラスは `SenshuJersey` です (`@johnmorrisdotca/senshu-jerseys/element` から。ここでは何も登録されません)。回転の関数は `@johnmorrisdotca/senshu-jerseys/turn` にあります。

## Node とサーバー

描画関数は純粋です。時計も乱数も DOM もブラウザーのグローバルも使いません。Node 22 以降で、ブラウザーと同じ SVG が描けます。

```mjs
import { renderJersey, renderJudogi } from "@johnmorrisdotca/senshu-jerseys";

// A server draws the same SVG a browser does: pure, no DOM, no browser globals.
const jersey = renderJersey({ cut: "hockey", colors: ["#af1e2d", "#ffffff", "#192168"], number: 9, name: "Beaumont", view: "both" });
const judogi = renderJudogi({ mode: "suit", belt: "black" });
const page = `<!doctype html><title>Jerseys</title>${jersey}${judogi}`;
console.log(jersey.startsWith("<svg"), judogi.startsWith("<svg"), page.length > 1000);
```

文字列をファイルに書く、ハンドラーから返す、`data:` アドレスの `img` としてメールに入れる (`embedCode(options, "data")`) ことができます。Node で要素を import してもエラーにはなりませんが、何も描かれません。関数を使ってください。
