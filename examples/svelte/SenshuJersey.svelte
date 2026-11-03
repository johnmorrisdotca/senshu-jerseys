<script lang="ts">
  import { onMount } from "svelte";

  let { cut = "hockey", colors = "#af1e2d,#ffffff,#192168", number = 9 }: { cut?: string; colors?: string; number?: number } = $props();

  // The element needs a browser: onMount never runs on the server.
  onMount(() => {
    void import("@johnmorrisdotca/senshu-jerseys/define");
  });
</script>

<senshu-jersey {cut} {colors} {number}></senshu-jersey>
