日本語 · [English](hockey-styles.md)

# アイスホッケー代表スタイル

各国の色を使ったオリジナルのアイスホッケー代表ユニフォーム12種類です。それぞれホームとアウェイがあり、全部で24個のプリセットです。色の名前を並べただけではありません。国ごとに配置（ヨーク、帯、たすき、ラグラン袖、山形、左右半分、横縞、縞のまとまり）、襟、袖口、番号の見せ方が違い、名前・背番号・色を自分で決められます。

これは実在するチームのユニフォームではありません。色だけが、その国でよく知られている色です。紋章、国旗、ワードマーク、連盟、スポンサー、メーカーのマークは描いていません。市販の写真もコピーしていません。配置はこのパッケージで描いたものです。バッジ、国旗、紋章は使う人が用意し、`chestBadges`（[胸のバッジ](./chest.md)）か `crest` で付けます。

```js
import { renderJersey } from "@johnmorrisdotca/senshu-jerseys";
import { HOCKEY_STYLES, STYLE_COUNTRIES, personalStyle } from "@johnmorrisdotca/senshu-jerseys/presets/hockey-styles";

console.log(STYLE_COUNTRIES.length, HOCKEY_STYLES.length); // 12 24

// スタイルそのまま、または自分の名前・背番号・色を付けたもの（呼ぶたびに新しいオブジェクト）。
const plain = personalStyle("style:japan-2026-home");
const mine = personalStyle("style:japan-2026-home", { name: "Tanaka", number: 19, colors: ["#ffffff", "#1b2a6b", "#bc002d", "#bc002d", "#ffffff"], collar: "v", patch: "C" });
console.log(plain?.name, mine?.name); // undefined Tanaka

// 共有のプリセットは凍結されているので、他のページの描画には影響しません。
console.log(Object.isFrozen(HOCKEY_STYLES[0]?.options)); // true
console.log(renderJersey(mine ?? {}).length > 1000); // true
```

## 12か国

IDは `style:<国>-2026-home` と `style:<国>-2026-away` です。アウェイはホームの色を入れ替えたものです。英語名と日本語名は `STYLE_COUNTRIES`（`id`、`en`、`ja`）と、各プリセットの `team` と `ja` にあります。

| 国 | 国のID | その国らしい点 |
| --- | --- | --- |
| カナダ代表 | `canada` | 2色目の曲線ヨーク、袖の縞3組、V襟。 |
| アメリカ代表 | `usa` | 胸の3色の帯、3色目の袖口、丸首。 |
| スウェーデン代表 | `sweden` | 2色目のラグラン袖、パイピング、裾の線。 |
| フィンランド代表 | `finland` | 身頃と袖の横縞、ポロ襟、袖口。 |
| チェコ代表 | `czechia` | 胸の2色の山形、3色目の袖。 |
| スロバキア代表 | `slovakia` | 細い縦縞3本のまとまり、背中の文字の下の板、ポロ襟。 |
| スイス代表 | `switzerland` | 反対色の袖、裾の2本線、まっすぐな文字。 |
| ドイツ代表 | `germany` | 胸の黒・赤・金の帯、同じ色の袖の縞、まっすぐな文字。 |
| ラトビア代表 | `latvia` | 胸の太い帯1本、丸首、袖の縞1本。 |
| ノルウェー代表 | `norway` | 3色目の四角いヨーク、パイピング付きのひも襟、袖と裾の縞。 |
| 日本代表 | `japan` | 3色目で縁取ったたすき、袖口。 |
| フランス代表 | `france` | 身頃は左右半分、袖もそれに合わせる、3色目のV襟、パイピング。 |

## 自分用に変える

`personalStyle(id, overrides)` は、スタイルのオプションに上書きを重ねた新しいオブジェクトを返します。スタイル自体は変わりません（プリセットは凍結されているので、モジュールの中で書き換えようとするとエラーになります）。上書きに向いているのは次のものです。

| 上書き | 内容 |
| --- | --- |
| `name`、`number` | 背中の文字と、袖の番号の数字。 |
| `colors`（または `body`、`trim`、`accent`） | 配色。身頃、縁、2色目の縁、番号の色、番号の縁。`colors` はスタイルの5色を置き換えます。 |
| `numberFill`、`numberOutline` | 番号の色と縁だけ。 |
| `sleeveStripes`、`hemStripes` | 縞。0から3の本数、または帯の並び（READMEを参照）。 |
| `collar`、`collarColor` | 襟とその色。 |
| `patch`、`chestBadges` | キャプテン・アシスタントの文字、国旗、パッチ（[胸のバッジ](./chest.md)）。 |
| `sleeveNumbers`、`sleeveLeft`、`sleeveRight` | 袖の番号とパッチ（[袖](./sleeves.md)）。 |
| `view`、`look`、`size`、`language`、`crest` | 他のユニフォームと同じです。 |

`JerseyOptions` の他のものも使えます。ページでは `<senshu-jersey preset="style:japan-2026-home" name="Tanaka" number="19">` でも同じです（先に `usePresets(HOCKEY_STYLES)` で読み込みます）。属性はプリセットより優先されます。

## 見え方

スタイルは他と同じオプションの集まりなので、どの向きでも描けます。`view` は `"front"`、`"back"`、`"both"`。平面でも、`bindTurn` や `jerseyFrame` に `volume: true` を付けると、正面、背面、両側面、その間の角度でも、ヨーク、帯、たすき、縞、襟が服に沿って回ります（[回転](./turning.md)）。デモの「代表スタイル」では12か国をホームかアウェイで一度に見られ、タップするとステージに載せて自分用に変えられます。`node scripts/preset-sheet.mjs hockey-styles sheet.png` で一覧の画像を作れます。
