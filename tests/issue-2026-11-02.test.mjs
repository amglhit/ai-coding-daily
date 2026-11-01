import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { accentColor, formatMasthead, storyDescription, storyLead } from "../src/lib/stories.mjs";

const root = path.resolve(import.meta.dirname, "..");
const issue = JSON.parse(fs.readFileSync(path.join(root, "src/content/daily/2026-11-02.json"), "utf8"));
const previous = JSON.parse(fs.readFileSync(path.join(root, "src/content/daily/2026-10-29.json"), "utf8"));

const PATTERNS = new Set(["practice", "benchmark", "advice", "framework", "experiment", "essay"]);
const KINDS = new Set(["quote", "p", "h", "steps", "pull", "aside"]);
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

const CURSOR_NOTICE = "https://cursor.com/blog/claude-code-extension-security-notice";

test("2026-11-02 is the 9-story issue", () => {
  assert.equal(fs.existsSync(path.join(root, "src/content/daily/2026-11-02.md")), false);
  assert.equal(issue.date, "2026-11-02");
  assert.equal(issue.masthead, "11 月 2 日 · AI Coding 日报");
  assert.equal(formatMasthead("2026-11-02T00:00:00.000Z"), issue.masthead);
  assert.equal(issue.stories.length, 9);
  assert.deepEqual(
    issue.stories.map((story) => story.id),
    [
      "cursor-sec",
      "meta-jit",
      "outerloop-tdd",
      "allen-agents",
      "replit-habitat",
      "ms-ext-malware",
      "meta-thin-orch",
      "anth-asr",
      "cognition-fc2",
    ],
  );
  assert.deepEqual(
    issue.stories.map((story) => [story.id, story.column, story.title]),
    [
      ["cursor-sec", "行业动向", "Cursor Marketplace 恶意 Claude Code 扩展：先查再清"],
      ["meta-jit", "工程化实践", "落地前抓 bug：JiTTesting 的 human-on-the-loop"],
      ["outerloop-tdd", "工程化实践", "用测试合同带 AI：红绿重构的 pair"],
      ["allen-agents", "社区热点", "Guidelines 与 guardrails 该进 Git"],
      ["replit-habitat", "工程化实践", "Secure Agent Work：Habitat 的四条原则"],
      ["ms-ext-malware", "工程化实践", "恶意 Claude Code 扩展：loader 链与持久化取证"],
      ["meta-thin-orch", "工程化实践", "Thin Orchestrator：路由变薄，专家变深"],
      ["anth-asr", "选读", "用 Claude 缩攻击面：25 个项目里的 493 个问题"],
      ["cognition-fc2", "选读", "FrontierCode 2.0：用 thoroughness 卡住「看起来做完」"],
    ],
  );
  assert.equal(issue.stories.filter((story) => story.column !== "选读").length, 7);
  assert.equal(issue.stories.filter((story) => story.column === "选读").length, 2);
  assert.equal(issue.stories[0].id, "cursor-sec");
  assert.deepEqual(issue.must_read, ["cursor-sec", "meta-jit"]);
});

test("Cursor security notice opens on the persistence pull and the blog primary", () => {
  const cursor = issue.stories.find((story) => story.id === "cursor-sec");
  assert.equal(
    cursor.originalTitle,
    "Security notice — malicious version of Anthropic.claude-code (2.1.312 and 2.1.313) identified in the Cursor VS Code Extension Marketplace",
  );
  assert.equal(cursor.body.pattern, "practice");
  assert.deepEqual(
    cursor.body.sections.map((section) => section.kind),
    ["p", "p", "steps", "aside", "pull"],
  );
  const pull = cursor.body.sections.find((section) => section.kind === "pull");
  assert.equal(pull.text, "卸掉扩展可能不够——payload 会落下继续跑的独立持久化脚本。");
  assert.equal(cursor.sourceUrl, CURSOR_NOTICE);
  assert.equal(cursor.sourceLabel, "读原文");
  const urls = JSON.stringify(cursor).match(/https?:\/\/[^\s"]+/g) || [];
  assert.deepEqual(urls, [CURSOR_NOTICE]);
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
  assert.match(description, /^Cursor Marketplace 恶意 Claude Code 扩展：先查再清。/);
  assert.ok(description.length <= 110);
});

test("2026-11-02 source URLs do not repeat 2026-10-29", () => {
  const previousUrls = new Set(previous.stories.map((story) => story.sourceUrl));
  for (const story of issue.stories) {
    assert.equal(previousUrls.has(story.sourceUrl), false, story.id);
  }
});

test("home and archive index daily issues from the content collection", () => {
  for (const file of ["src/pages/index.astro", "src/pages/archive.astro"]) {
    const text = fs.readFileSync(path.join(root, file), "utf8");
    assert.match(text, /getCollection\("daily"\)/);
    assert.doesNotMatch(text, /2026-10-29|2026-11-02/);
  }
});
