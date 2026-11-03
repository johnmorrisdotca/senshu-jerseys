---
title: In React, Vue, Svelte and Angular
section: how-to
order: 4
description: Use the jersey in React, Vue, Svelte and Angular, with the import that keeps a server render working.
---

`<senshu-jersey>` is a web component, so every framework can use it. Two things apply everywhere:

1. **Import the element on the client only.** The element extends the browser's `HTMLElement`, so importing it on a server is wasted work. Each example below imports it inside the framework's "the page is in a browser" hook (`useEffect`, `onMounted`, `onMount`, `ngOnInit`), which a server render never runs. A top-level `import "@johnmorrisdotca/senshu-jerseys/define"` is fine in a client-only app.
2. **Do not name a Vue component `SenshuJersey`.** A single-file component refers to itself by its file name, so `<senshu-jersey>` inside a file called `SenshuJersey.vue` loads the component instead of the element, and it recurses. The example is called `JerseyView.vue`.

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

With TypeScript, tell React the tag exists (a file such as `senshu-jersey.d.ts`):

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

The component renders to a string on a server (`renderToString`), as the package's tests check: the tag is there, the jersey is drawn in the browser.

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

Tell Vue's compiler that the tag is a custom element, or it looks for a component of that name:

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

A standalone component with `CUSTOM_ELEMENTS_SCHEMA`, so Angular lets the tag through. Set the element's values with `[attr.name]`:

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

If you would rather not use the element at all, `renderJersey` returns the SVG as a string that you can put in the page yourself (`dangerouslySetInnerHTML` in React, `v-html` in Vue). The string is made by this package from your options; never put a reader's text in it without checking it.
