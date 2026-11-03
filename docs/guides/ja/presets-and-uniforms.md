---
title: プリセット、ユニフォーム一式、ラインナップ
section: how-to
order: 7
description: リーグのプリセットでチームの色を描き、パンツ、ソックス、ヘルメットを合わせ、二つのキットやチームのラインナップを並べます。
---

自分で設計するユニフォームは、いくつかのオプションの集まりです。実在のチームのある年のユニフォームはプリセットです。ある時代の色、縞、襟、ヨークを、同じオプションに読み込んだものです。このガイドでは、リーグを読み込み、プリセットから描き、ユニフォーム一式で全身を揃え、二つのキットやチームのラインナップを並べます。

## リーグを読み込み、プリセットを使う

プリセットはリーグごとに一つのモジュール（`nhl`、`mlb`、`nba`、`nfl`、`cfl`、`soccer` など。[一覧](../../presets.md)を参照）なので、ページは指定したリーグだけを取り込みます。`usePresets` はリーグを一度だけ読み込み、`presetOptions` は ID をオプションに変換し、そのオプションに自分の番号と名前を足して `renderJersey` に渡します。

```js
import { presetOptions, renderJersey, usePresets } from "@johnmorrisdotca/senshu-jerseys";
import { MLB } from "@johnmorrisdotca/senshu-jerseys/presets/mlb";

usePresets(MLB);
const options = presetOptions("mlb:yankees-1929-home");
const svg = renderJersey({ ...options, number: 3, name: "Ruth", view: "both" });

console.log(options.pattern); // pinstripes
console.log(svg.startsWith("<svg")); // true
console.log(MLB.some((p) => p.team === "Houston Astros")); // true
```

プリセットは色と縞だけです。クレスト、ロゴ、モノグラム、ワードマーク、スポンサーのマークは決して描かず、それは今はないチームでも同じです。胸は空のままか、自分で渡した `crest` が付きます。要素では、リーグを読み込んだ後なら `preset="mlb:yankees-1929-home"` で同じことができます。

## 読み込み済みのものを調べる

```js
import { loadedPresets, presetOf, usePresets } from "@johnmorrisdotca/senshu-jerseys";
import { NHL } from "@johnmorrisdotca/senshu-jerseys/presets/nhl";

usePresets(NHL);
const loaded = loadedPresets();
console.log(loaded.length > 100, presetOf(loaded[0].id)?.id === loaded[0].id);
```

`decode` はプリセットの一行の仕様を読み、`defineLeague` は同じ形式の行から自分のリーグを作ります。`presets` エントリーポイントの `PRESETS` と `LEAGUES` はすべてのリーグを一度に持つので、一覧を表示するツールに使えます。色は Wikipedia の記事のユニフォームの節、Wikidata、クラブが公表した色コードから取った事実です。出典に色の名前しかないときの配置は、当てはまるもののうち最も単純なもので、確認できなかった行には `unsure` の印が付いています。

## ユニフォーム一式

`kit: true` は、ユニフォームの下にパンツまたはショーツ、ソックス、ヘルメット（または帽子）を、`pants`、`pantsTrim`、`pantsBands`、`socks`、`socksTrim`、`socksBands`、`helmet` から描きます。プリセットには、分かっているものが入っています。`renderKit` は同じ描画を、名前の付いた関数で呼び出せるようにしたものです。バンドは二つ一組で読まれます。描画単位での幅と、色です（`0` はその衣類自身の色、`1` はふち取り、`2` は二つ目のふち取り）。

```js
import { renderJersey, renderKit } from "@johnmorrisdotca/senshu-jerseys";

const set = { cut: "hockey", colors: ["#af1e2d", "#ffffff", "#192168"], pants: "#192168", pantsBands: [4, 2, 3, 1], socks: "#af1e2d", socksBands: [20, 0, 5, 1, 3, 2, 5, 1], helmet: "#192168" };
console.log(renderJersey({ ...set, kit: true }) === renderKit(set)); // true
```

## 二つのキットと、色がかぶるか

`kitMatchup` は二つのキットを、アウェー、ホームの順に向かい合わせにして並べ、それぞれの下に名前を付けます。`kitClash` は、画面で見分けにくいほど二つのキットが似ているかを判定します（胴の色のコントラストで比べるので、わずかに違う二つの赤は「かぶる」と判定されます）。

```js
import { kitClash, kitMatchup } from "@johnmorrisdotca/senshu-jerseys";

const away = { cut: "soccer", colors: ["#1f3a8a", "#ffffff"], label: "Japan" };
const home = { cut: "soccer", colors: ["#d52b1e", "#ffffff"], label: "Canada" };
console.log(kitMatchup({ away, home }).includes("Japan vs Canada")); // true
console.log(kitClash(away, home)); // false
console.log(kitClash({ colors: ["#c8102e"] }, { colors: ["#c8102f"] })); // true
```

## ラインナップ

`jerseyLineup` は、チームのシャツを、フォーメーション（`4-4-2`）または指定した列（`rows: [5, 6]`）で並べます。隣り合うシャツは、ラックに掛けたシャツのように、既定で互いの下に少し入り込みます。`overlap` はシャツの幅に対する割合で 0 から 0.4 まで、0 なら離れたままです。

```js
import { jerseyLineup } from "@johnmorrisdotca/senshu-jerseys";

const players = Array.from({ length: 11 }, (_, i) => ({ number: i + 1, name: `Player ${i + 1}` }));
const team = jerseyLineup(players, { formation: "4-4-2", jersey: { cut: "soccer", colors: ["#c8102e", "#ffffff"] } });
const apart = jerseyLineup(players, { rows: [5, 6], overlap: 0 });
const tucked = jerseyLineup(players, { rows: [5, 6], overlap: 0.25 });
console.log(team.includes("Lineup, 4-4-2"), apart.includes("<filter"), tucked.includes("<filter")); // true false true
```

## 審判

アイスホッケー、バスケットボール、アメリカンフットボール、サッカー、野球、ラグビー、ラクロスの審判（レフェリー、ラインズマン、アンパイア）もプリセットです（`ref:nhl-modern-referee`、`ref:soccer-yellow`、`ref:mlb-umpire-navy`）。腕章、胸ポケット、何も入れないバッジ用の位置、ジップ襟とロングポイント襟といった専用のオプションで作られています。出典つきの一覧は[審判](../../officials.md)にあります。

## 次に

- ユニフォームをページに置く、または回す: [はじめに](getting-started.md)、[回転](../../turning.md)
- プリセットにクレストがない理由と、描画がどこでも同じになるしくみ: [しくみ](how-it-works.md)と[設計](architecture.md)
