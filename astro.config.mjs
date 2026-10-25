import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://wladysplaw.github.io",
  base: "/product/",
  output: "static",
  build: {
    format: "directory"
  }
});
