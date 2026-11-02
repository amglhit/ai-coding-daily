import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { accentColor, formatMasthead, storyDescription, storyLead } from "../src/lib/stories.mjs";

const root = path.resolve(import.meta.dirname, "..");
const issue = JSON.parse(fs.readFileSync(path.join(root, "src/content/daily/2026-11-03.json"), "utf8"));
const previous = JSON.parse(fs.readFileSync(path.join(root, "src/content/daily/2026-11-02.json"), "utf8"));

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

const MESSAGE_THREADS = "https://claude.com/resources/articles/message-threads";

test("2026-11-03 is the 6-story issue", () => {
  assert.equal(fs.existsSync(path.join(root, "src/content/daily/2026-11-03.md")), false);
  assert.equal(issue.date, "2026-11-03");
  assert.equal(issue.masthead, "11 月 3 日 · AI Coding 日报");
  assert.equal(formatMasthead("2026-11-03T00:00:00.000Z"), issue.masthead);
  assert.equal(issue.stories.length, 6);
  assert.deepEqual(
    issue.stories.map((story) => story.id),
    [
      "anth-msg-threads",
      "hanh-trust",
      "dplouffe-manager",
      "pair-mailbox",
      "deepseek-superagent",
      "octoverse-agents",
    ],
  );
  assert.deepEqual(
    issue.stories.map((story) => [story.id, story.column, story.title]),
    [
      ["anth-msg-threads", "工程化实践", "Message threads：长会话少重发，TTFT 大约少 35%"],
      ["hanh-trust", "工程化实践", "信任 agent：读日志，别只读摘要"],
      ["dplouffe-manager", "工程化实践", "AI Manager 好做；难的是信得过它合并的代码"],
      ["pair-mailbox", "工程化实践", "Writer + Critic：用确定性协议做双 agent pair"],
      ["deepseek-superagent", "行业动向", "少占人的注意力，多给可用结果：dsh-superagent 原型"],
      ["octoverse-agents", "行业动向", "Octoverse：四成多 PR 已由 agent 起稿"],
    ],
  );
  assert.equal(issue.stories.filter((story) => story.column !== "选读").length, 6);
  assert.equal(issue.stories.filter((story) => story.column === "选读").length, 0);
  assert.equal(issue.stories[0].id, "anth-msg-threads");
  assert.deepEqual(issue.must_read, ["anth-msg-threads", "hanh-trust"]);
});

test("Message threads opens on the TTFT pull and the Claude article", () => {
  const threads = issue.stories.find((story) => story.id === "anth-msg-threads");
  assert.equal(threads.originalTitle, "Make long-running agents faster with message threads");
  assert.equal(threads.body.pattern, "practice");
  assert.deepEqual(
    threads.body.sections.map((section) => section.kind),
    ["p", "p", "p", "pull"],
  );
  const pull = threads.body.sections.find((section) => section.kind === "pull");
  assert.equal(pull.text, "上下文越长，Message threads 越能压低 time to first token——token 用量不变。");
  assert.equal(threads.sourceUrl, MESSAGE_THREADS);
  assert.equal(threads.sourceLabel, "读原文");
  const urls = JSON.stringify(threads).match(/https?:\/\/[^\s"]+/g) || [];
  assert.deepEqual(urls, [MESSAGE_THREADS]);
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
  assert.match(description, /^Message threads：长会话少重发，TTFT 大约少 35%。/);
  assert.ok(description.length <= 110);
});

test("2026-11-03 source URLs do not repeat 2026-11-02", () => {
  const previousUrls = new Set(previous.stories.map((story) => story.sourceUrl));
  for (const story of issue.stories) {
    assert.equal(previousUrls.has(story.sourceUrl), false, story.id);
  }
});

test("home and archive index daily issues from the content collection", () => {
  for (const file of ["src/pages/index.astro", "src/pages/archive.astro"]) {
    const text = fs.readFileSync(path.join(root, file), "utf8");
    assert.match(text, /getCollection\("daily"\)/);
    assert.doesNotMatch(text, /2026-11-02|2026-11-03/);
  }
});
