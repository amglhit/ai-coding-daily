import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const section = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("quote"), text: z.string().min(1) }).strict(),
  z.object({ kind: z.literal("p"), text: z.string().min(1) }).strict(),
  z.object({ kind: z.literal("h"), text: z.string().min(1) }).strict(),
  z
    .object({
      kind: z.literal("steps"),
      items: z.array(z.string().min(1)).min(1),
    })
    .strict(),
  z.object({ kind: z.literal("pull"), text: z.string().min(1) }).strict(),
  z.object({ kind: z.literal("aside"), text: z.string().min(1) }).strict(),
]);

const body = z
  .object({
    pattern: z.enum(["practice", "benchmark", "advice", "framework", "experiment", "essay"]),
    sections: z.array(section).min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    const pulls = value.sections.filter((item) => item.kind === "pull").length;
    if (pulls > 1) {
      ctx.addIssue({
        code: "custom",
        message: "at most one pull",
        path: ["sections"],
      });
    }
  });

const story = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    company: z.string().min(1),
    companyColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    column: z.enum(["行业动向", "工程化实践", "社区热点", "选读"]),
    title: z.string().min(1),
    originalTitle: z.string().min(1).optional(),
    byline: z.string().min(1),
    body,
    sourceUrl: z.string().url(),
    sourceLabel: z.literal("读原文"),
  })
  .strict();

const daily = defineCollection({
  loader: glob({
    pattern: "**/*.{md,json}",
    base: "./src/content/daily",
    generateId: ({ entry }) => entry.replace(/^\.\//, "").replace(/\.(md|json)$/i, ""),
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    type: z.string().default("daily"),
    columns: z.array(z.string()).default([]),
    must_read: z.array(z.string()).default([]),
    masthead: z.string().optional(),
    stories: z.array(story).optional(),
  }),
});

export const collections = { daily };
