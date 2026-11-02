import { defineConfig } from "astro/config";

// Served from https://nandovejer.github.io/apiChrome/ on GitHub Pages
export default defineConfig({
  site: "https://nandovejer.github.io",
  base: "/apiChrome",
  output: "static",
  trailingSlash: "always",
});
