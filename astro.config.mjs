import { unified } from "@astrojs/markdown-remark";
import { defineConfig } from "astro/config";
import { magazineRehype } from "./src/plugins/magazine-rehype.mjs";

export default defineConfig({
  site: "https://amglhit.github.io",
  base: "/ai-coding-daily",
  trailingSlash: "always",
  markdown: {
    processor: unified({
      smartypants: false,
      rehypePlugins: [magazineRehype],
    }),
  },
});
