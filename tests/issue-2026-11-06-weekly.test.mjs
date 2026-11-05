import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const issuePath = path.join(root, "src/content/weekly/2026-11-06.json");
const issue = JSON.parse(fs.readFileSync(issuePath, "utf8"));

const STORY_IDS = ["cursor-sec", "openai-pando", "cognition-sec", "meta-jit", "kilo-allday", "karasu-risk", "pair-mailbox", "halfcycle-harness"];

test("2026-11-06 weekly keeps the source issue", () => {
  assert.equal(issue.date, "2026-11-06");
  assert.equal(issue.type, "weekly");
  assert.equal(issue.masthead, "11 月 6 日 · AI Coding 周报");
  assert.equal(issue.title, "AI Coding 周报 · 2026-11-06（周五）");
  assert.deepEqual(issue.must_read, ["cursor-sec", "cognition-sec"]);
  assert.deepEqual(
    issue.stories.map((story) => story.id),
    STORY_IDS,
  );
  assert.equal(issue.themes.length, 4);
  assert.equal(issue.themes[0].title, "供应链安全成了本周必修课");
  assert.equal(issue.practices.length, 5);
  const cursor = issue.stories.find((story) => story.id === "cursor-sec");
  assert.equal(cursor.title, "Cursor Marketplace 恶意 Claude Code 扩展：先查再清");
  assert.equal(
    cursor.sourceUrl,
    "https://cursor.com/blog/claude-code-extension-security-notice",
  );
  const cognition = issue.stories.find((story) => story.id === "cognition-sec");
  assert.equal(
    cognition.sourceUrl,
    "https://cognition.com/blog/practical-guide-to-security-november-2026",
  );
});

test("build emits /weekly/2026-11-06/", { timeout: 180000 }, () => {
  const htmlPath = path.join(root, "dist", "weekly", "2026-11-06", "index.html");
  execFileSync("npx", ["astro", "build"], {
    cwd: root,
    stdio: "pipe",
    timeout: 170000,
  });
  const html = fs.readFileSync(htmlPath, "utf8");
  assert.match(html, /11 月 6 日 · AI Coding 周报/);
  assert.match(html, /本周主线/);
  assert.match(html, /落地实践/);
  assert.match(html, /Cursor Marketplace 恶意 Claude Code 扩展：先查再清/);
  for (const id of STORY_IDS) {
    assert.match(html, new RegExp(`id="story-${id}"`));
  }
  assert.match(html, /href="https:\/\/cursor\.com\/blog\/claude-code-extension-security-notice"/);
  const archive = fs.readFileSync(path.join(root, "dist", "archive", "index.html"), "utf8");
  assert.match(archive, /\/weekly\/2026-11-06\//);
});
