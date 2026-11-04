---
title: 普通の HTML ページで、CDN から使う
section: how-to
order: 2
description: jsDelivr か unpkg のスクリプトタグ1つで、どんなページにもユニフォームを入れます。
---

ビルドを使わないページは、CDN からパッケージを読み込みます。下の2つのページは、パッケージのテストがブラウザーで実際に開いて確かめています (CDN の返事は代わりのものを使っています)。名前を挙げているファイルは、公開済みのパッケージに入っています。

## jsDelivr から

jsDelivr は、パッケージのファイルをそのまま返します。このパッケージは依存するものがないので、`dist/element-define.js` の1ファイルが要素のすべてです。

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Senshu Jerseys from jsDelivr</title>
    <script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/senshu-jerseys/dist/element-define.js"></script>
  </head>
  <body>
    <senshu-jersey cut="hockey" colors="#af1e2d,#ffffff,#192168" number="9" name="Beaumont"></senshu-jersey>
  </body>
</html>
```

このスクリプトが `<senshu-jersey>` を登録します。アドレスにバージョンを書かないと最新が使われます。内容が変わっては困るページでは、`@johnmorrisdotca/senshu-jerseys@0.38.0/dist/element-define.js` のようにバージョンを固定してください。

## unpkg から

unpkg でも、同じファイルが自分のアドレスで返されます。

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Senshu Jerseys from unpkg</title>
    <script type="module" src="https://unpkg.com/@johnmorrisdotca/senshu-jerseys/dist/element-define.js"></script>
  </head>
  <body>
    <senshu-jersey cut="hockey" colors="#af1e2d,#ffffff,#192168" number="9" name="Beaumont"></senshu-jersey>
  </body>
</html>
```

## CDN のバージョンの選び方

バージョンのない CDN アドレスは最新のリリースに付いていきます。このパッケージは 0.x なので、マイナーバージョンで動きが変わることがあります ([アップグレード](upgrading.md))。公開するものには、バージョンを固定して書いてください。

## Content-Security-Policy

ポリシーの厳しいページでは、`script-src` に CDN のホストを入れます。要素はインラインのスクリプトを使いません。ただし、自分のシャドウルートの中に `style` 要素を書きます。インラインのスタイルを禁止するポリシーでは、`style-src 'unsafe-inline'` か nonce が必要です。
