---
title: iframe に入れる
section: how-to
order: 5
description: スクリプトを動かせないページに、埋め込み用ページと iframe でユニフォームを出します。
---

CMS、掲示板、文書のように、スクリプトを動かせない場所があります。そういう場所でも `<iframe>` なら出せることが多いです。デモサイトには、そのための `embed.html` があります。アドレスに書かれたとおりに描き、ほかには何も出しません。デモの「ページに組み込む」パネルは、設定したジャージの iframe を（「回転できる」つきで）書いてくれます。HTML、ESモジュール、React、Vue、Angular、Svelte、SVG、データURI のコードも同じパネルにあります。

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Senshu Jerseys in an iframe</title>
  </head>
  <body>
    <iframe
      src="https://johnmorrisdotca.github.io/senshu-jerseys/embed.html?cut=hockey&colors=af1e2d,ffffff,192168&number=9&view=both"
      title="A hockey sweater, front and back"
      width="420"
      height="232"
      loading="lazy"
      style="border: 0"
    ></iframe>
  </body>
</html>
```

このページは、iframe を入れた状態でパッケージのテストがブラウザーで開いて確かめています。

## アドレスに書くこと

クエリは要素の属性と同じです。色の `#` は省けます。

| クエリ | 意味 |
| --- | --- |
| `cut`、`colors`、`number`、`name`、`pattern`、`collar` など | シャツ。`renderJersey` と同じです。 |
| `view` | `front`、`back`、`both` |
| `turn=1` | 読む人が手で回せます。 |
| `turn=auto` | 自動で回ります。 |
| `direction` | `clockwise` か `counterclockwise` |
| `volume=1`、`yaw` | 厚みのある服にします。止める角度です。 |

`embedCode(options, "iframe")` は、オプションに合わせたコードを書き出します。

## 大きさと色

このページは背景が透明で、読む人の配色 (ダークかライト) に合わせた色で描きます。どんなページにも合います。枠は絵の形に合わせてください。正面から見たユニフォームなら `width="420" height="232"` が合います。枠が小さすぎると、絵は縮んで収まります。
