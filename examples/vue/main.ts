import { createApp } from "vue";
import JerseyView from "./JerseyView.vue";

const app = createApp(JerseyView);
app.config.compilerOptions.isCustomElement = (tag) => tag === "senshu-jersey";
app.mount("#app");
