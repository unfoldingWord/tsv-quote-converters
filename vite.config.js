import { defineConfig } from "vite";
import { resolve } from "path";
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [nodePolyfills()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.js"),
      name: "TSV7ULTQuotesToOrigLQuotes",
      formats: ["es"],
    },
  }
});
