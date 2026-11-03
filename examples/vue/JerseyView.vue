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
