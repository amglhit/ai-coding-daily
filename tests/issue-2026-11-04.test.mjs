import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { accentColor, formatMasthead, storyDescription, storyLead } from "../src/lib/stories.mjs";

const root = path.resolve(import.meta.dirname, "..");
const issue = JSON.parse(fs.readFileSync(path.join(root, "src/content/daily/2026-11-04.json"), "utf8"));
const previous = JSON.parse(fs.readFileSync(path.join(root, "src/content/daily/2026-11-03.json"), "utf8"));

const PATTERNS = new Set(["practice", "benchmark", "advice", "framework", "experiment", "essay", "result"]);
const KINDS = new Set(["quote", "p", "h", "steps", "pull", "aside"]);
const MORNING = new Set(["行业动向", "工程化实践", "社区热点"]);
const RETIRED = [
  "scene",
  "problems",
  "approach",
  "outcomes",
  "judgment",
  "caveat",
  "motive",
  "method",
  "findings",
  "bound",
  "conclusion",
  "cost",
  "points",
  "pointStyle",
  "transfer",
  "claim",
  "tracks",
  "result",
  "setup",
  "close",
  "observe",
  "evidence",
  "reflect",
];

const PANDO = "https://openai.com/index/scaling-git-at-openai/";
const COGNITION = "https://cognition.com/blog/practical-guide-to-security-november-2026";

test("2026-11-04 is the 10-story issue with 7 morning and 3 picks", () => {
  assert.equal(fs.existsSync(path.join(root, "src/content/daily/2026-11-04.md")), false);
  assert.equal(issue.date, "2026-11-04");
  assert.equal(issue.type, "daily");
  assert.equal(issue.masthead, "11 月 4 日 · AI Coding 日报");
  assert.equal(formatMasthead("2026-11-04T00:00:00.000Z"), issue.masthead);
  assert.equal(issue.stories.length, 10);
  assert.deepEqual(
    issue.stories.map((story) => story.id),
    [
      "openai-pando",
      "cognition-sec",
      "halfcycle-harness",
      "gabriel-presets",
      "ms-nuget-skills",
      "vercel-sec-review",
      "sourcegraph-abc",
      "deepseek-superagent",
      "anth-flashprove",
      "openai-eval-gap",
    ],
  );
  assert.deepEqual(
    issue.stories.map((story) => [story.id, story.column, story.title]),
    [
      ["openai-pando", "工程化实践", "Pando：为 Codex 级并行重做 Git 后端，中位 push 约快 5 倍"],
      ["cognition-sec", "工程化实践", "11 月安全清单：从公司账号到依赖的立刻做 / 30 天做"],
      ["halfcycle-harness", "工程化实践", "Harness 七件套：指令切片、计划、限制、检查、独立审、协调、记忆"],
      ["gabriel-presets", "社区热点", "CLI 周更在趋同：押工作流，别押某个 slash 命令"],
      ["ms-nuget-skills", "工程化实践", "用 NuGet 包投递 Agent Skills：跟版本走的 SKILL.md"],
      ["vercel-sec-review", "行业动向", "Vercel Security Review：每次 push 扫 diff，策略用白话写"],
      ["sourcegraph-abc", "行业动向", "Agentic Batch Changes：后台跑 workspace，对话不断；接上 MCP"],
      ["deepseek-superagent", "选读", "dsh-superagent：Router–Worker，默认可观察的主动 coding agent"],
      ["anth-flashprove", "选读", "FlashProve：400B MoE 上约 110 tok/s 的可证明推理原型"],
      ["openai-eval-gap", "选读", "安全评测比生产更差：关键是猜错了评测目标"],
    ],
  );
  assert.equal(issue.stories.filter((story) => story.column !== "选读").length, 7);
  assert.equal(issue.stories.filter((story) => story.column === "选读").length, 3);
  for (const story of issue.stories.filter((item) => item.column !== "选读")) {
    assert.ok(MORNING.has(story.column), story.id);
  }
  assert.equal(issue.stories[0].id, "openai-pando");
  assert.deepEqual(issue.must_read, ["openai-pando", "cognition-sec"]);
  assert.deepEqual(
    issue.stories.filter((story) => story.body.pattern === "result").map((story) => story.id),
    ["openai-pando", "anth-flashprove", "openai-eval-gap"],
  );
});

test("must-read stories keep their primary sources", () => {
  const pando = issue.stories.find((story) => story.id === "openai-pando");
  const cognition = issue.stories.find((story) => story.id === "cognition-sec");
  assert.equal(pando.sourceUrl, PANDO);
  assert.equal(cognition.sourceUrl, COGNITION);
  assert.equal(pando.sourceLabel, "读原文");
  assert.equal(cognition.sourceLabel, "读原文");
  const pandoUrls = JSON.stringify(pando).match(/https?:\/\/[^\s"]+/g) || [];
  const cognitionUrls = JSON.stringify(cognition).match(/https?:\/\/[^\s"]+/g) || [];
  assert.deepEqual(pandoUrls, [PANDO]);
  assert.deepEqual(cognitionUrls, [COGNITION]);
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
    assert.ok(PATTERNS.has(story.body.pattern), story.body.pattern);
    assert.ok(story.body.sections.length > 0, story.id);
    assert.ok(story.body.sections.filter((section) => section.kind === "pull").length <= 1, story.id);
    for (const section of story.body.sections) {
      assert.ok(KINDS.has(section.kind), `${story.id} ${section.kind}`);
      if (section.kind === "steps") {
        assert.ok(section.items.length > 0, story.id);
      } else {
        assert.ok(section.text.length > 0, story.id);
      }
    }
    for (const field of RETIRED) assert.equal(story.body[field], undefined, `${story.id} ${field}`);
    const lead = storyLead(story.body);
    assert.ok(lead.length > 40, story.id);
    assert.equal(accentColor(story.companyColor), story.companyColor);
  }
  const description = storyDescription(issue.stories);
  assert.match(description, /^Pando：为 Codex 级并行重做 Git 后端，中位 push 约快 5 倍。/);
  assert.ok(description.length <= 110);
});

test("2026-11-04 source URLs do not repeat 2026-11-03", () => {
  const previousUrls = new Set(previous.stories.map((story) => story.sourceUrl));
  for (const story of issue.stories) {
    assert.equal(previousUrls.has(story.sourceUrl), false, story.id);
  }
});

test("home and archive index daily issues from the content collection", () => {
  for (const file of ["src/pages/index.astro", "src/pages/archive.astro"]) {
    const text = fs.readFileSync(path.join(root, file), "utf8");
    assert.match(text, /getCollection\("daily"\)/);
    assert.doesNotMatch(text, /2026-11-03|2026-11-04/);
  }
});
