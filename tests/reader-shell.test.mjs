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
  assert.match(css, /scroll-snap-type:\s*y mandatory/);
  assert.match(css, /scroll-snap-align:\s*start/);
  assert.match(css, /scroll-snap-stop:\s*always/);
  assert.match(css, /overscroll-behavior-y:\s*auto/);
  assert.match(css, /\.reader-unit\.is-fit/);
  assert.match(css, /cursor:\s*text/);
  assert.match(css, /-webkit-line-clamp:\s*2/);
  assert.doesNotMatch(css, /\.story-head\s*\{[^}]*position:\s*(sticky|fixed)/);
  const desktopStage = css.match(/\.reader\[data-mode="desktop"\] \.reader-stage,[\s\S]*?\}/);
  assert.ok(desktopStage);
  assert.match(desktopStage[0], /scroll-snap-type:\s*none/);
  assert.doesNotMatch(desktopStage[0], /scroll-snap-type:\s*y/);
  const pattern = read("src/components/StoryPattern.astro");
  assert.match(pattern, /story-quote/);
  assert.match(pattern, /story-steps/);
  assert.match(pattern, /story-pull/);
  assert.match(pattern, /story-aside/);
  assert.doesNotMatch(pattern, /story-lead|story-numbers|story-accents|story-tracks/);
  assert.doesNotMatch(read("src/components/StoryPattern.astro"), />\s*(practice|benchmark|advice|framework|experiment|essay)\s*</);
  assert.match(reader, /IntersectionObserver/);
  assert.match(reader, /scrollend/);
  assert.doesNotMatch(reader, /settleImmediately|displayY|pointerDown|pointerMove|pointerUp|rubberband|translateY\(/);
  assert.match(css, /margin-top:\s*auto/);
  assert.match(css, /min-height:\s*100%/);
  assert.match(css, /\.story-next \{[^}]*margin:\s*40px 0 28px;/);
  assert.match(css, /\.story-next \{[^}]*border-top:\s*1px solid var\(--hairline\)/);
});
