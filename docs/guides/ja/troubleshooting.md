---
title: 困ったとき
section: troubleshooting
order: 11
description: 何も表示されない理由と、フレームワークやサーバーで出会うエラーです。
---

## 何も表示されない

- **普通のページのスクリプトタグに `import "@johnmorrisdotca/senshu-jerseys/define"` と書いた。** ブラウザーはパッケージ名を解決できません。CDN のアドレス ([普通の HTML](html-and-cdn.md))、import map、バンドラー ([バンドラー](bundlers.md)) のどれかを使ってください。
- **スクリプトがモジュールではない。** `<script type="module">` を使ってください。
- **コンソールに「タグが定義されていない」と出る。** import がまだ動いていないか、要素が登録される前にフレームワークが未知のタグを消しています。[フレームワーク](frameworks.md) を見てください。
- **ユニフォームが小さい、または切れる。** 要素の幅は `size` 属性の値です。flex や grid の中では幅を指定してください。

## 「HTMLElement is not defined」が出る、またはサーバーの描画が失敗する

要素をサーバーで import しています。`/define` は、ブラウザーで動くコードの中だけで import してください ([フレームワーク](frameworks.md))。サーバーでは `renderJersey()` で描きます ([TypeScript と Node](typescript-and-node.md))。

## Vue:「Maximum call stack size exceeded」

`SenshuJersey.vue` というファイルの中で `<senshu-jersey>` と書くと、コンポーネントが自分自身を描いてしまいます。ファイル名を変えてください。

## Vue に「Failed to resolve component: senshu-jersey」と言われる

このタグがカスタム要素だと、コンパイラーに教えます。[フレームワーク](frameworks.md) の `isCustomElement` を見てください。

## 色や型が無視される

正しくない値は取り除かれ、初期値で描かれます。`cut` の綴りと、色が `#rgb`、`#rrggbb`、`rgb(r, g, b)` のどれかになっているかを確かめてください。

## iframe が空になる

`embed.html` のアドレスと、あなたのページが `johnmorrisdotca.github.io` の枠を許しているか (`frame-src` のポリシー) を確かめてください。

## バンドルが大きい

パッケージ全体ではなく、使うエントリーだけを import してください。描画関数は gzip で約 19 kB で、リーグごとのプリセットは別のモジュールです。
