import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const issuePath = path.join(root, "src/content/weekly/2026-10-30.json");
const issue = JSON.parse(fs.readFileSync(issuePath, "utf8"));

const STORY_IDS = ["ms-trust", "anth-scion", "dave-egm", "manus", "nikolas-10h", "thorsten"];

test("2026-10-30 weekly keeps the source issue", () => {
  const uploadPath = "/home/ubuntu/.cursor/projects/workspace/uploads/2026-10-30_850d.json";
  if (fs.existsSync(uploadPath)) {
    assert.equal(fs.readFileSync(issuePath, "utf8"), fs.readFileSync(uploadPath, "utf8"));
  }
  assert.equal(issue.date, "2026-10-30");
  assert.equal(issue.type, "weekly");
  assert.equal(issue.masthead, "10 月 30 日 · AI Coding 周报");
  assert.equal(issue.title, "AI Coding 周报 · 2026-10-30（周五）");
  assert.deepEqual(issue.must_read, ["dave-egm", "nikolas-10h"]);
  assert.deepEqual(
    issue.stories.map((story) => story.id),
    STORY_IDS,
  );
  assert.equal(issue.themes.length, 5);
  assert.equal(issue.themes[0].title, "设计文档与 Spec 成了新的源码");
  assert.equal(issue.practices.length, 5);
  assert.match(issue.practices[0], /Elephant|Goldfish|设计文档/);
  const dave = issue.stories.find((story) => story.id === "dave-egm");
  assert.equal(dave.title, "大象与金鱼：设计文档才是新的源码");
  assert.equal(
    dave.sourceUrl,
    "https://drensin.medium.com/elephants-goldfish-and-the-new-golden-age-of-software-engineering-c33641a48874",
  );
});

test("weekly route reuses the daily reader and archive lists both collections", () => {
  const page = fs.readFileSync(path.join(root, "src/pages/weekly/[date].astro"), "utf8");
  assert.match(page, /getCollection\("weekly"\)/);
  assert.match(page, /getStaticPaths/);
  assert.match(page, /params:\s*\{ date: entry\.id \}/);
  assert.match(page, /DailyReader/);
  assert.match(page, /surface="reader"/);
  const archive = fs.readFileSync(path.join(root, "src/pages/archive.astro"), "utf8");
  assert.match(archive, /getCollection\("daily"\)/);
  assert.match(archive, /getCollection\("weekly"\)/);
  const home = fs.readFileSync(path.join(root, "src/pages/index.astro"), "utf8");
  assert.match(home, /getCollection\("daily"\)/);
  assert.doesNotMatch(home, /getCollection\("weekly"\)/);
});

test("build emits /weekly/2026-10-30/", { timeout: 180000 }, () => {
  const htmlPath = path.join(root, "dist", "weekly", "2026-10-30", "index.html");
  execFileSync("npx", ["astro", "build"], {
    cwd: root,
    stdio: "pipe",
    timeout: 170000,
  });
  const html = fs.readFileSync(htmlPath, "utf8");
  assert.match(html, /10 月 30 日 · AI Coding 周报/);
  assert.match(html, /本周主线/);
  assert.match(html, /落地实践/);
  assert.match(html, /大象与金鱼：设计文档才是新的源码/);
  for (const id of STORY_IDS) {
    assert.match(html, new RegExp(`id="story-${id}"`));
  }
  assert.match(html, /href="https:\/\/www\.anthropic\.com\/research\/redesigning-source-control"/);
  const archive = fs.readFileSync(path.join(root, "dist", "archive", "index.html"), "utf8");
  assert.match(archive, /\/weekly\/2026-10-30\//);
  assert.match(archive, /\/daily\/2026-11-02\//);
  const home = fs.readFileSync(path.join(root, "dist", "index.html"), "utf8");
  assert.match(home, /\/daily\/2026-11-02\//);
  assert.match(home, /\/weekly\/2026-10-30\//);
});
