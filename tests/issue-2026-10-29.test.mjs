import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { accentColor, formatMasthead, storyDescription, storyLead } from "../src/lib/stories.mjs";

const root = path.resolve(import.meta.dirname, "..");
const issue = JSON.parse(fs.readFileSync(path.join(root, "src/content/daily/2026-10-29.json"), "utf8"));
const previous = JSON.parse(fs.readFileSync(path.join(root, "src/content/daily/2026-10-28.json"), "utf8"));

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

const DAVE_MEDIUM =
  "https://drensin.medium.com/elephants-goldfish-and-the-new-golden-age-of-software-engineering-c33641a48874";

test("2026-10-29 is the 8-story issue", () => {
  assert.equal(fs.existsSync(path.join(root, "src/content/daily/2026-10-29.md")), false);
  assert.equal(issue.date, "2026-10-29");
  assert.equal(issue.masthead, "10 月 29 日 · AI Coding 日报");
  assert.equal(formatMasthead("2026-10-29T00:00:00.000Z"), issue.masthead);
  assert.equal(issue.stories.length, 8);
  assert.deepEqual(
    issue.stories.map((story) => story.id),
    [
      "dave-egm",
      "google-hillclimb",
      "anth-automations",
      "nikolas-10h",
      "hemant-sdd",
      "google-aqua",
      "flavio-judgment",
      "colgrep",
    ],
  );
  assert.deepEqual(
    issue.stories.map((story) => [story.id, story.column, story.title]),
    [
      ["dave-egm", "工程化实践", "大象与金鱼：设计文档才是新的源码"],
      ["google-hillclimb", "工程化实践", "用 Agents CLI 做 agent 质量的 hill-climbing"],
      ["anth-automations", "工程化实践", "有效的 agent 自动化：六条规则"],
      ["nikolas-10h", "社区热点", "怎么让 coding agent 连跑 10 小时"],
      ["hemant-sdd", "社区热点", "Spec-driven：先测后写，再让 agent 实现"],
      ["google-aqua", "工程化实践", "Outer loop：生产里诊断 agent 的静默失败"],
      ["flavio-judgment", "社区热点", "和 AI 一起练工程判断"],
      ["colgrep", "选读", "本地 2B 搜仓：frontier agent 少花三分之一 token"],
    ],
  );
  assert.equal(issue.stories.filter((story) => story.column !== "选读").length, 7);
  assert.equal(issue.stories.filter((story) => story.column === "选读").length, 1);
  assert.equal(issue.stories[0].id, "dave-egm");
  assert.deepEqual(issue.must_read, ["dave-egm", "nikolas-10h"]);
});

test("Dave EGM opens on the bilingual measuring pull and the Medium primary", () => {
  const dave = issue.stories.find((story) => story.id === "dave-egm");
  assert.equal(dave.originalTitle, "Elephants, Goldfish and the New Golden Age of Software Engineering");
  assert.equal(dave.body.pattern, "practice");
  assert.equal(dave.body.sections[0].kind, "pull");
  assert.match(dave.body.sections[0].text, /一不小心，我们就不只是写代码更快，而是在量产错误。/);
  assert.match(dave.body.sections[0].text, /mass-producing our mistakes/);
  assert.equal(dave.sourceUrl, DAVE_MEDIUM);
  assert.equal(dave.sourceLabel, "读原文");
  assert.doesNotMatch(dave.sourceUrl, /x\.com|twitter\.com/i);
  assert.equal(dave.sourceUrl.includes("解读"), false);
  const urls = JSON.stringify(dave).match(/https?:\/\/[^\s"]+/g) || [];
  assert.deepEqual(urls, [DAVE_MEDIUM]);
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
    if (story.id === "nikolas-10h") {
      assert.equal(lead, "如果跑到一半还需要你，多半是某个决定被你留到了后来。");
    } else {
      assert.ok(lead.length > 40, story.id);
    }
    assert.equal(accentColor(story.companyColor), story.companyColor);
  }
  const description = storyDescription(issue.stories);
  assert.match(description, /^大象与金鱼：设计文档才是新的源码。/);
  assert.ok(description.length <= 110);
});

test("2026-10-29 source URLs do not repeat 2026-10-28", () => {
  const previousUrls = new Set(previous.stories.map((story) => story.sourceUrl));
  for (const story of issue.stories) {
    assert.equal(previousUrls.has(story.sourceUrl), false, story.id);
  }
});

test("home and archive index daily issues from the content collection", () => {
  for (const file of ["src/pages/index.astro", "src/pages/archive.astro"]) {
    const text = fs.readFileSync(path.join(root, file), "utf8");
    assert.match(text, /getCollection\("daily"\)/);
    assert.doesNotMatch(text, /2026-10-28|2026-10-29/);
  }
});
