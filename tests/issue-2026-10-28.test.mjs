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

test("Manus practice body stays faithful to the WeChat primary", () => {
  const manus = issue.stories.find((story) => story.id === "manus");
  assert.equal(manus.body.pattern, "practice");
  const monoSteps = [
    "补业务知识让 AI 看见全局并用 Git worktree 并行",
    "完整产品跑在本地，验证从五到十分钟落到几秒",
    "权限下读线上日志排查",
    "发版能力交给 AI，审批权仍在人",
    "再用测试账号走真实流程做端到端验证",
  ];
  assert.equal(
    manus.body.approach,
    "我们做了 Manus-mono：不是把代码并成 monorepo，而是统一入口 + 一本写给 AI 的说明书（各仓做什么、怎么配合、规范是什么）。它一步步长起来：" +
      monoSteps.join("；") +
      "。",
  );
  let from = 0;
  for (const step of monoSteps) {
    const at = manus.body.approach.indexOf(step, from);
    assert.ok(at >= from, step);
    from = at + step.length;
  }
  assert.equal(monoSteps.length, 5);
  assert.deepEqual(manus.body.outcomes, [
    "共识变成：一个需求，一个人可以写完所有端；移动端 7 人同时扛 2 个产品、共 4 个应用，进度和网页版基本同步。一个工程师常态并行十几、二十个需求。",
    "瓶颈翻到产品：约一半产品经理能独立把需求做到上线；所有产品经理都向 Manus 提交过代码。有人不再交传统 PRD，而是用视频把场景、界面、状态和实现逻辑一次讲清。",
    "市场侧接上「数字同事」：在一个工作台 Session 接需求再拆并行；会学策略、主动提醒项目阶段、跨团队问清能力边界——最后拍板仍是人。",
  ]);
  assert.equal(
    manus.body.judgment,
    "AI 的完成度已经很高，但「做什么」仍由人决定。人的角色没有变小，而是更集中了：定义问题，判断质量，决定什么值得做，并为结果负责。",
  );
  assert.equal(
    manus.body.caveat,
    "9 月公司 AI 开销人均超过 1 万美元，有人觉得过分。这笔钱买的不是人力，而是时间和注意力；贵是因为用最好的模型探边界——代码审核机器人用了当前最强模型后，同事反馈最近半年没听说因合入问题代码造成线上故障；成本还会随自己产品改进下降。积累下来的工作方式，才是更宝贵的资产。",
  );
  const text = JSON.stringify(manus);
  for (const banned of ["七步", "五步", "二百", "定不了", "user_id", "催进度", "传话可以省掉"]) {
    assert.equal(text.includes(banned), false, banned);
  }
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
  assert.equal(issue.stories.filter((story) => story.column === "选读").length, 6);
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
