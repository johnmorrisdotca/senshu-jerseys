---
title: Vite や webpack で使う
section: how-to
order: 3
description: パッケージをインストールして、Vite や webpack のプロジェクトで要素や描画関数を使います。
---

パッケージをインストールします。

```sh
npm install @johnmorrisdotca/senshu-jerseys
```

エントリーは2種類あります。`@johnmorrisdotca/senshu-jerseys` は SVG の文字列を返す関数です。`@johnmorrisdotca/senshu-jerseys/define` は `<senshu-jersey>` 要素を登録します。どちらも依存するもののない普通の ES モジュールなので、どのバンドラーでもそのまま使えます。

## Vite

`define` を一度 import すると、HTML の中でタグが使えます。描画関数を使うと、同じような絵が文字列で得られます。

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Senshu Jerseys with Vite</title>
  </head>
  <body>
    <senshu-jersey cut="hockey" colors="#af1e2d,#ffffff,#192168" number="9"></senshu-jersey>
    <div id="plain"></div>
    <script type="module" src="./main.ts"></script>
  </body>
</html>
```

```ts no-run
import "@johnmorrisdotca/senshu-jerseys/define";
import { renderJersey } from "@johnmorrisdotca/senshu-jerseys";

// The element draws itself once it is registered; renderJersey gives the same kind of drawing as a string.
document.querySelector("#plain")!.innerHTML = renderJersey({ cut: "soccer", colors: ["#192168", "#ffffff"], pattern: "hoops", number: 10 });
```

## webpack

webpack 5 では、このパッケージのためのローダーは要りません。入り口で `define` を import し、タグを手で作ります。

```js no-run
import "@johnmorrisdotca/senshu-jerseys/define";

const jersey = document.createElement("senshu-jersey");
jersey.setAttribute("cut", "hockey");
jersey.setAttribute("colors", "#af1e2d,#ffffff,#192168");
jersey.setAttribute("number", "9");
document.body.append(jersey);
```

ビルドできる最小の設定はこれです。

```mjs no-run
import { fileURLToPath } from "node:url";

export default {
  mode: "production",
  entry: "./src/index.js",
  output: { path: fileURLToPath(new URL("./dist", import.meta.url)), filename: "main.js" },
};
```

## 読み込む量を減らす

使うエントリーだけを import してください。描画関数は gzip で約 19 kB、回転は約 14 kB です (`@johnmorrisdotca/senshu-jerseys/turn`)。リーグごとのプリセットは別のモジュールです (`@johnmorrisdotca/senshu-jerseys/presets/nhl` など)。import しないものは、バンドラーが外します。
