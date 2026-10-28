import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { FINE_POINTER_QUERY } from "../src/lib/reader-gesture.mjs";

const root = path.resolve(import.meta.dirname, "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

test("desktop and coarse modes share the locked pointer query", () => {
  assert.equal(FINE_POINTER_QUERY, "(hover: hover) and (pointer: fine)");
  const reader = read("src/components/DailyReader.astro");
  const base = read("src/layouts/Base.astro");
  const css = read("src/styles/reader.css");
  assert.match(reader, /matchMedia\("\(hover: hover\) and \(pointer: fine\)"\)/);
  assert.match(reader, /FINE_POINTER_QUERY/);
  assert.match(base, /matchMedia\("\(hover: hover\) and \(pointer: fine\)"\)/);
  assert.match(reader, /下一篇 · /);
  assert.match(reader, /上滑 · /);
  assert.match(reader, /role="feed"/);
  assert.match(reader, /aria-live="polite"/);
  assert.match(css, /transform:\s*none !important/);
  assert.match(css, /scroll-snap-type:\s*none/);
  assert.match(css, /cursor:\s*text/);
  assert.match(css, /-webkit-line-clamp:\s*2/);
  assert.doesNotMatch(css, /scroll-snap-type:\s*y/);
  assert.match(read("src/components/StoryPattern.astro"), /story-lead/);
  assert.doesNotMatch(read("src/components/StoryPattern.astro"), />\s*(practice|benchmark|advice|framework|experiment|essay)\s*</);
});

test("story issues are an immersive full-viewport reader", () => {
  const index = read("src/pages/index.astro");
  const daily = read("src/pages/daily/[date].astro");
  const base = read("src/layouts/Base.astro");
  const css = read("src/styles/reader.css");
  const global = read("src/styles/global.css");
  const reader = read("src/components/DailyReader.astro");
  const mast = read("src/components/Masthead.astro");

  assert.match(base, /chrome\?: "site" \| "immersive"/);
  assert.match(base, /chrome-immersive/);
  assert.match(index, /chrome="immersive"/);
  assert.match(daily, /chrome="immersive"/);
  assert.match(css, /100dvh/);
  assert.doesNotMatch(css, /82dvh/);
  assert.doesNotMatch(css, /issue-reader/);
  assert.match(reader, /class="reader-exit"/);
  assert.match(reader, />归档</);
  assert.match(reader, /过往刊期/);
  assert.doesNotMatch(reader, /class="pager"/);

  function immersiveBranch(source) {
    const start = source.indexOf('chrome="immersive"');
    const end = source.indexOf(") : (", start);
    assert.ok(start > 0 && end > start);
    return source.slice(start, end);
  }

  const homeReader = immersiveBranch(index);
  assert.match(homeReader, /DailyReader/);
  assert.doesNotMatch(homeReader, /Masthead|Footer|过往刊期|class="pager"/);

  const issueReader = immersiveBranch(daily);
  assert.match(issueReader, /DailyReader/);
  assert.doesNotMatch(issueReader, /Masthead|Footer|section-nav|<Toc|class="pager"/);

  assert.doesNotMatch(mast, /class="seal"/);
  assert.match(global, /#fafafa/i);
  assert.match(global, /-apple-system/);
  assert.doesNotMatch(global, /Palatino|Songti|#f7f3ea|#9f2d22/);
  assert.match(global, /chrome-immersive/);
});
