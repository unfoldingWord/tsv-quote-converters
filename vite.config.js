import { defineConfig } from "vite";
import { resolve } from "path";
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [nodePolyfills()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.js"),
      name: "tsv7_ult_quotes_to_origl_quotes",
      formats: ["es"],
    },
  }
});
