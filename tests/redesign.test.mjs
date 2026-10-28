import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { accentColor, formatChipDate } from "../src/lib/stories.mjs";

const root = path.resolve(import.meta.dirname, "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

test("tokens drop the newspaper palette and use the locked accent", () => {
  const css = read("src/styles/global.css");
  assert.match(css, /--bg:\s*#FFFFFF/);
  assert.match(css, /--surface:\s*#F5F5F5/);
  assert.match(css, /--ink:\s*#171717/);
  assert.match(css, /--muted:\s*#737373/);
  assert.match(css, /--hairline:\s*#E5E5E5/);
  assert.match(css, /--accent:\s*#2563EB/);
  assert.match(css, /--accent-ink:\s*#1D4ED8/);
  assert.match(css, /--link:\s*var\(--accent\)/);
  assert.match(css, /--focus:\s*#2563EB/);
  assert.match(css, /--sans:\s*system-ui,\s*"PingFang SC"/);
  assert.match(css, /#DBEAFE/);
  assert.match(css, /outline:\s*2px solid var\(--focus\)/);
  assert.match(css, /outline-offset:\s*3px/);
  assert.match(css, /data-surface="reader"/);
  assert.match(css, /100dvh/);
  assert.doesNotMatch(css, /--serif|--paper|--ground|--cinnabar|--gold/);
  assert.equal(accentColor("not-a-color"), "#2563EB");
  assert.equal(formatChipDate("2026-10-28T00:00:00.000Z"), "10月28日");
});

test("story routes are a full-viewport reader without the paper shell", () => {
  const base = read("src/layouts/Base.astro");
  const daily = read("src/pages/daily/[date].astro");
  const reader = read("src/components/DailyReader.astro");
  const css = read("src/styles/reader.css");
  const home = read("src/pages/index.astro");
  assert.match(base, /theme-color" content="#FFFFFF"/);
  assert.match(base, /data-surface=\{surface\}/);
  assert.doesNotMatch(base, /class="sheet"/);
  assert.match(daily, /surface=\{reader \? "reader" : "browse"\}/);
  assert.match(daily, /chipHref=\{sitePath\(\)\}/);
  assert.doesNotMatch(daily, /<DailyReader[\s\S]*masthead=/);
  assert.match(reader, /class="reader-chip"/);
  assert.match(reader, /--company:/);
  assert.doesNotMatch(reader, /--accent:\$\{/);
  const issues = read("src/components/IssueNav.astro");
  assert.match(issues, /上一期/);
  assert.match(issues, /下一期/);
  assert.match(reader, /IssueNav/);
  assert.match(css, /height:\s*100dvh/);
  assert.match(css, /var\(--company\)/);
  assert.match(css, /var\(--link\)/);
  assert.doesNotMatch(css, /story-rail|reader-rail/);
  assert.doesNotMatch(reader, /story-rail|reader-rail/);
  assert.doesNotMatch(css, /border-left:/);
  assert.doesNotMatch(css, /82dvh|min-height:\s*560|var\(--paper\)|var\(--cinnabar\)/);
  assert.match(home, /开始阅读/);
  assert.doesNotMatch(home, /DailyReader|class="seal"|Toc /);
  assert.doesNotMatch(read("src/components/Masthead.astro"), /class="seal"/);
});
