import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { accentColor, formatMasthead, storyDescription, storyLead } from "../src/lib/stories.mjs";

const root = path.resolve(import.meta.dirname, "..");
const issue = JSON.parse(fs.readFileSync(path.join(root, "src/content/daily/2026-10-28.json"), "utf8"));

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
      ["google-adk", "工程化实践", "能停、能续、不丢 context 的长跑 agent"],
      ["orestis", "社区热点", "AI 许诺少干活，我却从未干得这么多"],
      ["openai-maint", "选读", "用 GPT-6 家族做大规模维护，而不是绿场 demo"],
      ["argon-adk", "选读", "隔夜无人值守优化 20 万行 ADK"],
      ["snowpr", "选读", "用自家 monorepo 的已合 PR 测 coding agent"],
      ["katelyn", "选读", "工程师要解的新题集"],
      ["ocr", "选读", "内部用了两年的 AI review 开源"],
      ["pause", "选读", "第一次改源码前，拦一次就够"],
    ],
  );
  assert.equal(issue.stories.filter((story) => story.column !== "选读").length, 7);
  assert.equal(issue.stories[0].id, "manus");
  assert.equal(
    issue.stories.find((story) => story.id === "manus").sourceUrl,
    "https://mp.weixin.qq.com/s/I_hNNAf7LFBf5nJ0rEJHig",
  );
});

test("Manus sections match the locked short article", () => {
  const manus = issue.stories.find((story) => story.id === "manus");
  assert.equal(manus.body.pattern, "practice");
  assert.deepEqual(
    manus.body.sections.map((section) => section.kind),
    ["quote", "p", "p", "p", "steps", "p", "pull", "aside"],
  );
  assert.equal(
    manus.body.sections[0].text,
    "我给工程师提了几条需求和 Bug，过一会儿去问进展。我看到工程师的电脑上开着的一排 Codex 和 Manus 的 Session，随便点开一个，这些 Session 的输入就是我刚刚在 Slack 上发给他的需求原文，一字未改。",
  );
  assert.match(manus.body.sections[2].text, /人和人之间很难完全对齐/);
  assert.match(manus.body.sections[3].text, /不是把代码并成 monorepo/);
  const steps = manus.body.sections[4].items;
  assert.equal(steps.length, 5);
  const signals = [/worktree/, /本地/, /日志/, /发版|审批/, /端到端|测试账号/];
  steps.forEach((step, index) => {
    assert.match(step, signals[index], step);
  });
  assert.match(manus.body.sections[5].text, /移动端 7 人同时扛 2 个产品/);
  assert.equal(
    manus.body.sections[6].text,
    "AI 的完成度已经很高，但「做什么」仍由人决定。人的角色没有变小，而是更集中了：定义问题，判断质量，决定什么值得做，并为结果负责。",
  );
  assert.equal(
    manus.body.sections[7].text,
    "9 月公司 AI 开销人均超过 1 万美元，有人觉得过分。这笔钱买的不是人力，而是时间和注意力；贵是因为用最好的模型探边界——代码审核机器人用了当前最强模型后，同事反馈最近半年没听说因合入问题代码造成线上故障；成本还会随自己产品改进下降。积累下来的工作方式，才是更宝贵的资产。",
  );
});

test("Orestis reflect drops the unsourced Manus backlog clause", () => {
  const orestis = issue.stories.find((story) => story.id === "orestis");
  const reflect = orestis.body.sections.find((section) => section.kind === "pull");
  assert.equal(
    reflect.text,
    "Implementation 变 cheap 之后，agent 不只是让原有的活更快做完，而是让我很容易给自己加一笔大得多的单。",
  );
  assert.equal(reflect.text.includes("Manus"), false);
  assert.equal(reflect.text.includes("待决策"), false);
  assert.equal(orestis.originalTitle, "AI Promised Less Work. I Have Never Worked More.");
});

test("Claude review matches the approved draft", () => {
  const claude = issue.stories.find((story) => story.id === "claude-review");
  assert.equal(claude.originalTitle, "How the Claude Code team does code review");
  assert.equal(claude.body.pattern, "practice");
  assert.equal(claude.company, "Anthropic");
  assert.equal(claude.column, "工程化实践");
  assert.equal(claude.byline, "Addy Osmani、Morgan Westlee Lunt、Qing Wang · 10-15");
  assert.equal(claude.sourceUrl, "https://claude.dev/blog/solving-code-review-at-anthropic/");
  assert.deepEqual(
    claude.body.sections.map((section) => section.kind),
    ["p", "p", "quote", "p", "p", "p", "p", "p", "pull"],
  );
  assert.equal(claude.body.sections[4].text, "Layers, not one gate");
  assert.equal(
    claude.body.sections[2].text,
    "「有没有人读过这段代码」不能代替真正该问的：这次变更可能出什么问题，该由自动化还是人来拦。",
  );
  assert.equal(claude.body.sections.at(-1).text, "目标没变：每次变更少花人时，revert 不比以前多。");
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
    if (story.id === "thorsten") {
      assert.equal(lead, "截至 2026 年 10 月，我是这样和 Agents 一起干活的。");
      assert.deepEqual(
        story.body.sections.map((section) => section.kind),
        ["p", "h", "p", "h", "p", "h", "p", "h", "p", "h", "p", "h", "p", "h", "p", "h", "p"],
      );
      assert.deepEqual(
        story.body.sections.filter((section) => section.kind === "h").map((section) => section.text),
        [
          "1. 用最新、最强的模型",
          "2. Prompt 写 What，不写 How",
          "3. 让整个 SDLC 对 agent 可见",
          "4. 别跟它来回试，让它造工具来试",
          "5. 要不可反驳的证据",
          "6. 异步：让它们等你",
          "7. 别再手工管 context",
          "8. 只审高 blast radius 的代码",
        ],
      );
    } else {
      assert.ok(lead.length > 40, story.id);
    }
    assert.equal(accentColor(story.companyColor), story.companyColor);
  }
  assert.equal(issue.stories.filter((story) => story.column === "选读").length, 6);
  const claude = issue.stories.find((story) => story.id === "claude-review");
  assert.equal(claude.body.sections.some((section) => section.kind === "steps"), false);
  assert.equal(claude.body.sections.filter((section) => section.kind === "p").length >= 2, true);
  const fold = issue.stories.find((story) => story.id === "anth-fold");
  assert.equal(fold.body.sections.find((section) => section.kind === "steps").items.length, 3);
  const issueText = JSON.stringify(issue);
  assert.equal(issueText.includes("小虎"), false);
  assert.equal(issueText.includes("xiaohu"), false);
  for (const banned of ["七步", "五步", "二百", "两百多个待决策", "user_id", "催进度", "传话可以省掉"]) {
    assert.equal(issueText.includes(banned), false, banned);
  }
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
