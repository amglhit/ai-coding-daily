import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const daily = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/daily" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    type: z.string().default("daily"),
    columns: z.array(z.string()).default([]),
    must_read: z.array(z.string()).default([]),
  }),
});

export const collections = { daily };
