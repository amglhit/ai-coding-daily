import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { extractDigest, formatLongDate, metaDescription, padIssue, renderInline } from "../src/lib/digest.mjs";

const issuePath = new URL("../src/content/daily/2026-10-20.md", import.meta.url);
const uploadPath = "/home/ubuntu/.cursor/projects/workspace/uploads/2026-10-20_e6ac.md";
const markdown = fs.readFileSync(issuePath, "utf8");

test("first issue matches the source digest", () => {
  if (fs.existsSync(uploadPath)) {
    assert.equal(markdown, fs.readFileSync(uploadPath, "utf8"));
  }
  assert.match(markdown, /# AI Coding 日报 · 2026-10-20（周二）/);
  assert.match(markdown, /## 今天动向/);
  assert.match(markdown, /## 一、行业动向/);
  assert.match(markdown, /## 二、工程化实践/);
  assert.match(markdown, /## 三、社区热点/);
});

test("digest keeps the lead, three sections, deep reads, and scans", () => {
  const digest = extractDigest(markdown);
  assert.equal(digest.today.length, 5);
  assert.deepEqual(
    digest.sections.map((section) => section.label),
    ["行业动向", "工程化实践", "社区热点"],
  );
  assert.deepEqual(
    digest.sections.map((section) => section.deep.length),
    [2, 2, 2],
  );
  assert.deepEqual(
    digest.sections.map((section) => section.scan.length),
    [2, 2, 2],
  );
  assert.deepEqual(
    digest.sections.flatMap((section) => section.deep.map((item) => item.anchor)),
    ["read-1", "read-2", "read-3", "read-4", "read-5", "read-6"],
  );
  const must = digest.sections.flatMap((section) => section.deep.filter((item) => item.mustRead).map((item) => item.title));
  assert.deepEqual(must, [
    "TestJack: Should you trust the results in coding benchmarks?",
    "How the Claude Code team does code review",
  ]);
  const debate = digest.sections[2].deep[1];
  assert.match(debate.title, /手写代码已死/);
  assert.match(debate.href, /^https:\/\/blog\.pragmaticengineer\.com\//);
  assert.equal(digest.sections[0].scan[0].title, "Building Git infrastructure for agent-scale development");
});

test("inline renderer keeps links and escapes markup", () => {
  const html = renderInline("**标题。** 见（[原文](https://example.com/a)）<script>");
  assert.match(html, /<strong>标题。<\/strong>/);
  assert.match(html, /<a href="https:\/\/example.com\/a"/);
  assert.match(html, /&lt;script&gt;/);
  assert.equal(formatLongDate("2026-10-20T00:00:00.000Z"), "2026年10月20日 周二");
  assert.equal(padIssue(1), "001");
  assert.match(metaDescription(markdown), /Agent 的提交量/);
});
