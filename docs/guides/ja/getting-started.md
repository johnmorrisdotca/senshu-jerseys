---
title: はじめに
section: tutorial
order: 1
description: スクリプトタグ1つでユニフォームをページに置き、色や番号を変え、読む人が回せるようにします。約5分で終わります。
---

このガイドでは、ホッケーのセーターをページに置き、色と番号を変え、読む人が回せるようにします。必要なのはテキストエディターとブラウザーだけです。何もインストールしません。ページが CDN からパッケージを読み込みます。

## 1. ユニフォームのあるページ

これを `jersey.html` という名前で保存して開きます。`<senshu-jersey>` タグがユニフォームです。その上のスクリプトが、このタグを使えるようにします。

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

ユニフォームは SVG で、タグの属性をもとにブラウザーが描きます。`cut` でシャツの種類を選びます (`hockey`、`baseball`、`basketball`、`football`、`soccer`、`rugby`、`handball`)。`colors` は色のリストで、本体、ふち取り、2つ目のふち取りの順です。`number` と `name` は背中に書かれます。

## 2. 変えてみる

`renderJersey` のオプションは、すべてタグの属性として書けます。`view="both"` で前と後ろが見えます。`pattern="stripes"` や `pattern="hoops"`、`collar="lace-up"` も試してください。一覧は [要素のページ](entry:element) にあります。

## 3. 読む人が回せるようにする

`turnable` を足すと、読む人がドラッグしてユニフォームを回せます。左右の矢印キーでも回せます。Home で正面に戻り、Space で回転の開始と停止ができます。`autoplay` を足すと自動で回ります (動きを減らす設定の人には回りません)。`volume` を足すと、厚みのある服として描かれ、横から見ても体の形が見えます。

```html
<senshu-jersey cut="hockey" colors="#af1e2d,#ffffff,#192168" number="9" turnable autoplay volume></senshu-jersey>
```

## 4. 次に読むもの

- バンドラーやフレームワークで使う: [バンドラー](bundlers.md)、[フレームワーク](frameworks.md)
- 自分のスクリプトなしで他の人のページに出す: [iframe に入れる](embed-in-an-iframe.md)
- サーバーで描く、型を使う: [TypeScript と Node](typescript-and-node.md)
- すべての関数のリファレンス: [メインのエントリー](entry:main)
- うまく表示されないとき: [困ったとき](troubleshooting.md)
