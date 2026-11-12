import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { ensureAstroBuild } from "./helpers/astro-build.mjs";

const root = path.resolve(import.meta.dirname, "..");
const issuePath = path.join(root, "src/content/weekly/2026-11-13.json");
const issue = JSON.parse(fs.readFileSync(issuePath, "utf8"));

const STORY_IDS = [
  "worse-together",
  "anth-fable-fleet",
  "anth-memory",
  "google-distraction",
  "hf-coord",
  "gemini-4-hydrogen",
];

test("2026-11-13 weekly keeps the source issue", () => {
  assert.equal(issue.date, "2026-11-13");
  assert.equal(issue.type, "weekly");
  assert.equal(issue.masthead, "11 月 13 日 · AI Coding 周报");
  assert.equal(issue.title, "AI Coding 周报 · 2026-11-13（周五）");
  assert.deepEqual(issue.must_read, ["anth-memory", "worse-together"]);
  assert.deepEqual(
    issue.stories.map((story) => story.id),
    STORY_IDS,
  );
  assert.equal(issue.themes.length, 5);
  assert.equal(issue.themes[0].title, "多 agent 团队能冲规模，也会一起变差");
  assert.equal(issue.themes[4].title, "同一模型换 harness，新的执行模型也在上场");
  assert.equal(issue.practices.length, 5);
  const worse = issue.stories.find((story) => story.id === "worse-together");
  assert.equal(worse.column, "行业动向");
  assert.equal(worse.title, "每人一个 agent，群体结果更差：四个环境里 coordinator 高出约 10–45 个百分点");
  assert.equal(
    worse.sourceUrl,
    "https://alignment.anthropic.com/2026/worse-together/",
  );
  const memory = issue.stories.find((story) => story.id === "anth-memory");
  assert.equal(memory.column, "工程化实践");
  assert.equal(
    memory.sourceUrl,
    "https://www.anthropic.com/research/components-of-agent-memory",
  );
  const fleet = issue.stories.find((story) => story.id === "anth-fable-fleet");
  assert.equal(fleet.column, "行业动向");
  assert.equal(
    fleet.sourceUrl,
    "https://claude.dev/blog/safely-scaling-multi-agent-teams-with-fable-5-2/",
  );
  const hydrogen = issue.stories.find((story) => story.id === "gemini-4-hydrogen");
  assert.equal(hydrogen.column, "选读");
  assert.equal(
    hydrogen.sourceUrl,
    "https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/",
  );
});

test("build emits /weekly/2026-11-13/", { timeout: 180000 }, () => {
  ensureAstroBuild();
  const html = fs.readFileSync(path.join(root, "dist", "weekly", "2026-11-13", "index.html"), "utf8");
  assert.match(html, /11 月 13 日 · AI Coding 周报/);
  assert.match(html, /本周主线/);
  assert.match(html, /落地实践/);
  assert.match(html, /每人一个 agent，群体结果更差/);
  for (const id of STORY_IDS) {
    assert.match(html, new RegExp(`id="story-${id}"`));
  }
  assert.match(html, /href="https:\/\/alignment\.anthropic\.com\/2026\/worse-together\//);
  const archive = fs.readFileSync(path.join(root, "dist", "archive", "index.html"), "utf8");
  assert.match(archive, /\/weekly\/2026-11-13\//);
  assert.match(archive, /\/weekly\/2026-11-06\//);
  assert.match(archive, /\/weekly\/2026-10-30\//);
  const home = fs.readFileSync(path.join(root, "dist", "index.html"), "utf8");
  assert.match(home, /\/weekly\/2026-11-13\//);
  assert.match(home, /\/daily\/2026-11-12\//);
  assert.doesNotMatch(home, /\/daily\/2026-11-13\//);
});
