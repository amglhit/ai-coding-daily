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

const MS_COWORK = "https://commandline.microsoft.com/how-we-built-copilot-cowork-python-to-rust-migration/";
const PAIR_MAILBOX = "https://avpdev.com/en/blog/pair-programming-two-ai-agents/";

test("2026-11-03 is the 7-story morning issue", () => {
  assert.equal(fs.existsSync(path.join(root, "src/content/daily/2026-11-03.md")), false);
  assert.equal(issue.date, "2026-11-03");
  assert.equal(issue.masthead, "11 月 3 日 · AI Coding 日报");
  assert.equal(formatMasthead("2026-11-03T00:00:00.000Z"), issue.masthead);
  assert.equal(issue.stories.length, 7);
  assert.deepEqual(
    issue.stories.map((story) => story.id),
    [
      "ms-cowork",
      "pair-mailbox",
      "anth-msg-threads",
      "kilo-allday",
      "dplouffe-manager",
      "hanh-trust",
      "karasu-risk",
    ],
  );
  assert.deepEqual(
    issue.stories.map((story) => [story.id, story.column, story.title]),
    [
      ["ms-cowork", "工程化实践", "九人一天合 1211 个 PR：Copilot Cowork 六条做法"],
      ["pair-mailbox", "工程化实践", "Writer + Critic：用确定性协议做双 agent pair"],
      ["anth-msg-threads", "工程化实践", "Message threads：长会话少重发，TTFT 大约少 35%"],
      ["kilo-allday", "社区热点", "All Day AI：五条被反复提到的 coding agent 做法"],
      ["dplouffe-manager", "工程化实践", "AI Manager 好做；难的是信得过它合并的代码"],
      ["hanh-trust", "工程化实践", "信任 agent：读日志，别只读摘要"],
      ["karasu-risk", "工程化实践", "按路径分风险档：从「请求」变成机械检查"],
    ],
  );
  assert.equal(issue.stories.filter((story) => story.column !== "选读").length, 7);
  assert.equal(issue.stories.filter((story) => story.column === "选读").length, 0);
  for (const story of issue.stories) {
    assert.ok(MORNING.has(story.column), story.id);
  }
  assert.equal(issue.stories.find((story) => story.id === "kilo-allday").column, "社区热点");
  assert.equal(issue.stories[0].id, "ms-cowork");
  assert.deepEqual(issue.must_read, ["ms-cowork", "pair-mailbox"]);
});

test("must-read stories keep their primary sources", () => {
  const cowork = issue.stories.find((story) => story.id === "ms-cowork");
  const pair = issue.stories.find((story) => story.id === "pair-mailbox");
  assert.equal(cowork.sourceUrl, MS_COWORK);
  assert.equal(pair.sourceUrl, PAIR_MAILBOX);
  assert.equal(cowork.sourceLabel, "读原文");
  assert.equal(pair.sourceLabel, "读原文");
  const coworkUrls = JSON.stringify(cowork).match(/https?:\/\/[^\s"]+/g) || [];
  const pairUrls = JSON.stringify(pair).match(/https?:\/\/[^\s"]+/g) || [];
  assert.deepEqual(coworkUrls, [MS_COWORK]);
  assert.deepEqual(pairUrls, [PAIR_MAILBOX]);
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
  assert.match(description, /^九人一天合 1211 个 PR：Copilot Cowork 六条做法。/);
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
