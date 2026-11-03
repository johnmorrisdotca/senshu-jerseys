---
title: 設計
section: explanation
order: 13
description: オプションから SVG 文字列までの流れ、ユニフォームをどこでも同じに保つ規則、それを守る検査を説明します。
---

このガイドは、パッケージを変更したい人、またはその振る舞いの理由を知りたい人のための地図です。[しくみ](how-it-works.md)はユニフォームが何であるかを説明します。このガイドは `renderJersey(options)` の一回の呼び出しをファイルごとにたどり、ファイルが守る規則を示します。

## 流れ

```text
options ──► options.ts ──► cuts.ts ──► jersey.ts ──► svg.ts ──► one string of SVG
 (any)      (checked,       (the cut's    (silhouette,   (the root, the
             cleaned)        measures)     pattern,       accessible
                                           parts, cloth,  name, the defs)
                                           text)            │
                                              ├─ glyphs.ts, text.ts: numbers and names as strokes
                                              ├─ colour.ts: colours read, mixed and compared for contrast
                                              └─ overlap.ts, kit.ts, uniform.ts: shirts in a row, a matchup, a whole uniform
```

- **`options.ts`** は外から来るものを読みます。どの値も許される値の一覧と照合され、色は `#rgb`、`#rrggbb`、`rgb()` として読まれ、テキストはサニタイズされます。許されない値は既定値に置き換えられ、例外は投げられません。
- **`cuts.ts`** は、各カット（シャツの型）を、幅 200 単位の図の中の寸法の表として持ちます（シャツの中央が x = 100）。さらに、その競技のシャツにあるもの、つまり袖、襟、そして番号、名前、クレスト、ワッペンを置く位置も持ちます。
- **`jersey.ts`** はシャツの片面を描きます。輪郭、カットに備わるもの、柄、布のひだと縁、番号、名前、クレストです。
- **`svg.ts`** は描画を包みます。ルート要素、`title.ts` による英語か日本語のアクセシブルな名前、共有の defs です。**`render.ts`** は `renderJersey` で、前、後ろ、または左右に並べた両面を描きます。

```js
import { renderJersey } from "@johnmorrisdotca/senshu-jerseys";

// A value that is not allowed is replaced by the default, and nothing throws.
const odd = renderJersey({ cut: "polo", colors: ["not a colour"], number: 9 });
const plain = renderJersey({ number: 9 });
console.log(odd === plain, odd.startsWith("<svg"));
```

## 四つの規則

1. **描画は、オプションだけで決まる純粋な関数。** 時計も乱数もカウンターも DOM も使いません。描画の中のすべての ID はオプションのハッシュから作られるので、同じページの二つの描画が偶然 ID を共有することはなく、同じオプションからはサーバーでも、テストでも、ブラウザーでも同じ文字列ができます。
2. **フォントを使わない。** ラテン文字の番号と名前は、ユニフォームのタックルツイル（縫い付け文字）のように、先端が四角く、角がマイター結合になった太い線として `glyphs.ts` から描かれます。そのため番号はどこでも同じに見えます。字形のない文字（日本語の名前）は、弧に沿って並べられるよう一文字ずつシステムテキストで組みます。`brush-kana` は、ペン書き風の字形を自分で使いたい場合のための、文字の輪郭を収めたエントリーポイントです。
3. **外から来るものは、入る時点ですべて安全にする。** 色は三つの数値から読まれるので、エスケープなしで属性に書けます。テキストはエスケープされるか、線として描かれます。クレストは画像として表示されるので、スクリプトは動かず、何も読み込みません。エンブレムは渡された描画関数から来るので、パッケージは図柄を同梱せず、依存もありません。
4. **コントラストは、努力目標ではなく規則。** 番号と名前には、背景に対して 4.5 対 1 のコントラストになる色が選ばれ、縞の上では縁取りが付きます。プリセットは色と縞だけで、クレスト、ロゴ、ワードマークはありません。

```js
import { contrast, renderJersey } from "@johnmorrisdotca/senshu-jerseys";

const options = { cut: "soccer", colors: ["#c8102e", "#ffffff"], number: 10, name: "Gray" };
console.log(renderJersey(options) === renderJersey(options));
console.log(contrast("#000000", "#ffffff") > 20);
```

## エントリーポイント

| エントリーポイント | 含むもの |
| --- | --- |
| `@johnmorrisdotca/senshu-jerseys` | 描画（`renderJersey`、`renderCap`、`renderHelmet`、`renderBanner`、`renderJudogi` など）、テキストとしてのオプション、`embedCode`、プリセットのレジストリ |
| `/turn` | 回転: `jerseyFrame`、`bindTurn`、`judogiCanvas`、`judogiTurn` |
| `/element`、`/define` | カスタム要素 `<senshu-jersey>` と、それを登録するインポート |
| `/brush-kana` | ペン書き風の日本語の文字の輪郭 |
| `/presets/<league>` | 一つのリーグのプリセット（約 5 kB）。インポートした場所でだけ読み込まれます |

どれも単独で成り立ちます。平らなユニフォームを描くページは回転のコードを一切読み込まず、リーグを一つ指定するページはそのリーグだけを読み込みます。

## 回転は、同じシャツの二つ目の描画

`turn.ts` はユニフォームを、縦の軸を中心に回る薄い布として扱います。正面は回るにつれて幅が狭まり、90 度で縁だけになって布の厚みが見え、背面は 90 度から 270 度で見えます。平らなユニフォームは、いくつかの部品の変形を変えて回り、描き直すことはありません。`volume: true` なら `volume.ts` がシャツに厚みを与えます。胴は楕円の断面をなめらかにつないだ形、各袖は先細りの筒で、平らな前面と背面の絵が小さなセルの格子としてその上に貼られます。柔道着はキャンバス上で同じことをします（`judogiCanvas`。ページ全体で WebGL コンテキストは一つ、キャンバスは一辺 4096 ピクセルまで）。

何も変わらないときは何も動きません。ユニフォームが止まっている間はタイマーがなく、画面の外にあるときやタブが隠れているときも動かず、1 秒あたり約 60 フレームを超えません。

## データはスクリプトから、ドキュメントはデータから

プリセットはそれぞれ色と縞を書いた短い一行で表され、`decode` が `renderJersey` のオプションに読み込みます。`docs/presets.md` は `pnpm presets:doc` で生成され、`pnpm test:readme` が `--check` つきで実行するので、表がコードに遅れることはありません。生成されたファイルは直接編集せず、元を変えてスクリプトを実行してください。

## 正しさを保つしくみ

| 検査 | 何を確かめるか |
| --- | --- |
| `pnpm check` | lint、型、単体テスト（描画の決定性、すべての番号のコントラスト、悪意のある入力）、ビルド、パックしたパッケージ |
| `pnpm test:readme` | 生成されたドキュメント。続いて README、ドキュメント、ガイドのすべての例を、ビルドしたパッケージに対して実行する |
| `pnpm test:usage` | ガイドが示すパッケージの使い方すべてを、npm がパックしたとおりのパッケージに対してビルドまたは実行する |
| `pnpm test:demo` | 実際のブラウザーでのデモ（スマートフォンの幅とデスクトップの幅） |
| `pnpm docs:check` | すべてのエクスポートにドキュメントコメントと実行できる例があり、すべてのガイドにフロントマターがあり、リンク先が存在する |

同じファミリーのパッケージで共有するファイル（`scripts/family-template.mjs`、`scripts/docs-site.mjs` など）は、パッケージ間でバイト単位で同じコピーです。ここでは編集しないでください。
