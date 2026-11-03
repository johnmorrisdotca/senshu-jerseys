---
title: React、Vue、Svelte、Angular で使う
section: how-to
order: 4
description: React、Vue、Svelte、Angular でユニフォームを使います。サーバーでの描画も壊さない import の書き方です。
---

`<senshu-jersey>` はウェブコンポーネントなので、どのフレームワークでも使えます。どれにも当てはまることが2つあります。

1. **要素は、ブラウザー側だけで import します。** 要素はブラウザーの `HTMLElement` を拡張しているので、サーバーで import しても意味がありません。下の例は、どれもフレームワークの「ページがブラウザーにある」フック (`useEffect`、`onMounted`、`onMount`、`ngOnInit`) の中で import しています。サーバーの描画ではこのフックは動きません。ブラウザーだけで動くアプリなら、先頭に `import "@johnmorrisdotca/senshu-jerseys/define"` と書いて構いません。
2. **Vue のコンポーネントに `SenshuJersey` という名前を付けないでください。** 単一ファイルコンポーネントは、ファイル名で自分自身を指します。`SenshuJersey.vue` の中の `<senshu-jersey>` は要素ではなくコンポーネントを読み込み、自分を呼び続けます。例では `JerseyView.vue` としています。

## React

```tsx
import { useEffect } from "react";

export function SenshuJersey({ cut = "hockey", colors = "#af1e2d,#ffffff,#192168", number = 9 }: { cut?: string; colors?: string; number?: number }) {
  useEffect(() => {
    // The element needs a browser, so it is imported here, never at the top of the file: a server render never reaches an effect.
    void import("@johnmorrisdotca/senshu-jerseys/define");
  }, []);
  return <senshu-jersey cut={cut} colors={colors} number={number} />;
}
```

TypeScript では、タグがあることを React に教えます (`senshu-jersey.d.ts` のようなファイル)。

```ts no-run
import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "senshu-jersey": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & { cut?: string; colors?: string; number?: number | string; name?: string; turnable?: boolean };
    }
  }
}
```

このコンポーネントは、サーバーでも文字列にできます (`renderToString`)。パッケージのテストで確かめています。タグは出力に入り、ユニフォームはブラウザーで描かれます。

## Vue

```vue
<script setup lang="ts">
import { onMounted } from "vue";

withDefaults(defineProps<{ cut?: string; colors?: string; number?: number }>(), { cut: "hockey", colors: "#af1e2d,#ffffff,#192168", number: 9 });

// The element needs a browser: import it once the component is on the page, never while a server renders it.
onMounted(() => {
  void import("@johnmorrisdotca/senshu-jerseys/define");
});
</script>

<template>
  <senshu-jersey :cut="cut" :colors="colors" :number="number"></senshu-jersey>
</template>
```

Vue のコンパイラーに、このタグがカスタム要素だと教えます。教えないと、同じ名前のコンポーネントを探してしまいます。

```ts no-check
import { createApp } from "vue";
import JerseyView from "./JerseyView.vue";

const app = createApp(JerseyView);
app.config.compilerOptions.isCustomElement = (tag) => tag === "senshu-jersey";
app.mount("#app");
```

## Svelte

```svelte
<script lang="ts">
  import { onMount } from "svelte";

  let { cut = "hockey", colors = "#af1e2d,#ffffff,#192168", number = 9 }: { cut?: string; colors?: string; number?: number } = $props();

  // The element needs a browser: onMount never runs on the server.
  onMount(() => {
    void import("@johnmorrisdotca/senshu-jerseys/define");
  });
</script>

<senshu-jersey {cut} {colors} {number}></senshu-jersey>
```

## Angular

スタンドアロンコンポーネントに `CUSTOM_ELEMENTS_SCHEMA` を付けて、タグを通します。要素の値は `[attr.name]` で渡します。

```ts no-check
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-senshu-jersey",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<senshu-jersey [attr.cut]="cut" [attr.colors]="colors" [attr.number]="number"></senshu-jersey>`,
})
export class SenshuJerseyComponent implements OnInit {
  @Input() cut = "hockey";
  @Input() colors = "#af1e2d,#ffffff,#192168";
  @Input() number = 9;

  ngOnInit(): void {
    // The element needs a browser: ngOnInit also runs when a server renders, so the import waits for one.
    if (typeof window !== "undefined") void import("@johnmorrisdotca/senshu-jerseys/define");
  }
}
```

要素を使いたくないときは、`renderJersey` が SVG を文字列で返すので、自分でページに入れられます (React なら `dangerouslySetInnerHTML`、Vue なら `v-html`)。この文字列はパッケージがあなたのオプションから作ります。読む人の入力をそのまま入れるときは、先に確かめてください。
