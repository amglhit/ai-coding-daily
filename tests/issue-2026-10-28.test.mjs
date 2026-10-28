import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { accentColor, formatMasthead, storyDescription, storyLead } from "../src/lib/stories.mjs";

const root = path.resolve(import.meta.dirname, "..");
const issue = JSON.parse(fs.readFileSync(path.join(root, "src/content/daily/2026-10-28.json"), "utf8"));

const REQUIRED = {
  practice: ["scene", "problems", "approach", "outcomes"],
  benchmark: ["motive", "method", "findings", "bound"],
  advice: ["conclusion", "cost", "points", "pointStyle", "transfer"],
  framework: ["claim", "tracks"],
  experiment: ["result", "setup", "close"],
  essay: ["observe", "evidence", "reflect"],
};

test("2026-10-28 is the locked 13-story issue", () => {
  assert.equal(fs.existsSync(path.join(root, "src/content/daily/2026-10-28.md")), false);
  assert.equal(issue.date, "2026-10-28");
  assert.equal(issue.masthead, "10 月 28 日 · AI Coding 日报");
  assert.equal(formatMasthead("2026-10-28T00:00:00.000Z"), issue.masthead);
  assert.deepEqual(
    issue.stories.map((story) => [story.id, story.column, story.title]),
    [
      ["manus", "工程化实践", "用 Manus 改造 Manus"],
      ["claude-review", "工程化实践", "Claude Code 团队怎么做 code review"],
      ["thorsten", "社区热点", "我怎么和 Agents 一起干活"],
      ["ms", "行业动向", "Code is cheap 之后，稀缺的是信任"],
      ["anth-fold", "工程化实践", "多数时候，少用 subagent，并进主循环"],
      ["katelyn", "行业动向", "工程师要解的新题集"],
      ["google-adk", "工程化实践", "能停、能续、不丢 context 的长跑 agent"],
      ["orestis", "社区热点", "AI 许诺少干活，我却从未干得这么多"],
      ["ocr", "选读", "内部用了两年的 AI review 开源"],
      ["snowpr", "选读", "用自家 monorepo 的已合 PR 测 coding agent"],
      ["pause", "选读", "第一次改源码前，拦一次就够"],
      ["openai-maint", "选读", "用 GPT-6 家族做大规模维护，而不是绿场 demo"],
      ["argon-adk", "选读", "隔夜无人值守优化 20 万行 ADK"],
    ],
  );
});

test("each story is a full page with one primary source link", () => {
  const ids = new Set();
  for (const story of issue.stories) {
    assert.equal(ids.has(story.id), false);
    ids.add(story.id);
    assert.equal(story.sourceLabel, "读原文");
    assert.match(story.sourceUrl, /^https:\/\//);
    const urls = JSON.stringify(story).match(/https?:\/\/[^\s"]+/g) || [];
    assert.deepEqual(urls, [story.sourceUrl]);
    const fields = REQUIRED[story.body.pattern];
    assert.ok(fields, story.body.pattern);
    for (const field of fields) assert.ok(story.body[field], `${story.id} ${field}`);
    assert.ok(storyLead(story.body).length > 40, story.id);
    assert.equal(accentColor(story.companyColor), story.companyColor);
  }
  assert.equal(issue.stories.filter((story) => story.column === "选读").length, 5);
  assert.equal(issue.stories.find((story) => story.id === "claude-review").body.pointStyle, "rule");
  assert.equal(issue.stories.find((story) => story.id === "anth-fold").body.pointStyle, "number");
  assert.equal(JSON.stringify(issue).includes("小虎"), false);
  assert.equal(JSON.stringify(issue).includes("xiaohu"), false);
  const description = storyDescription(issue.stories);
  assert.match(description, /^用 Manus 改造 Manus。/);
  assert.ok(description.length <= 110);
});

test("published sources do not keep secondary commentary links", () => {
  const files = [
    "src/content/daily/2026-10-28.json",
    "src/components/DailyReader.astro",
    "src/components/StoryPattern.astro",
    "src/pages/index.astro",
    "src/pages/daily/[date].astro",
  ];
  for (const file of files) {
    const text = fs.readFileSync(path.join(root, file), "utf8");
    assert.equal(text.includes("小虎"), false, file);
    assert.equal(text.includes("xiaohu"), false, file);
  }
});
