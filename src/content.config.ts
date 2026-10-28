import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const practice = z
  .object({
    pattern: z.literal("practice"),
    scene: z.string(),
    problems: z.array(z.string()).min(1),
    approach: z.union([z.string(), z.array(z.string()).min(1)]),
    outcomes: z.array(z.string()).min(1),
    judgment: z.string().optional(),
    caveat: z.string().optional(),
  })
  .strict();

const benchmark = z
  .object({
    pattern: z.literal("benchmark"),
    motive: z.string(),
    method: z.string(),
    findings: z.array(z.string()).min(1),
    bound: z.string(),
  })
  .strict();

const advice = z
  .object({
    pattern: z.literal("advice"),
    conclusion: z.string(),
    cost: z.string(),
    points: z.array(z.string()).min(1),
    pointStyle: z.enum(["number", "rule"]),
    transfer: z.string(),
  })
  .strict();

const framework = z
  .object({
    pattern: z.literal("framework"),
    claim: z.string(),
    tracks: z.array(z.string()).min(1),
  })
  .strict();

const experiment = z
  .object({
    pattern: z.literal("experiment"),
    result: z.string(),
    setup: z.string(),
    close: z.string(),
  })
  .strict();

const essay = z
  .object({
    pattern: z.literal("essay"),
    observe: z.string(),
    evidence: z.string(),
    reflect: z.string(),
  })
  .strict();

const story = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    company: z.string().min(1),
    companyColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    column: z.enum(["行业动向", "工程化实践", "社区热点", "选读"]),
    title: z.string().min(1),
    originalTitle: z.string().min(1).optional(),
    byline: z.string().min(1),
    body: z.discriminatedUnion("pattern", [practice, benchmark, advice, framework, experiment, essay]),
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
