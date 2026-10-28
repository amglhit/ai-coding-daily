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
  const pattern = read("src/components/StoryPattern.astro");
  assert.match(pattern, /story-quote/);
  assert.match(pattern, /story-steps/);
  assert.match(pattern, /story-pull/);
  assert.match(pattern, /story-aside/);
  assert.doesNotMatch(pattern, /story-lead|story-numbers|story-accents|story-tracks/);
  assert.doesNotMatch(read("src/components/StoryPattern.astro"), />\s*(practice|benchmark|advice|framework|experiment|essay)\s*</);
  assert.match(reader, /if \(mq\.matches \|\| event\.pointerType === "mouse"\) return;/);
  assert.match(reader, /tick\(session, stageHeight\(stage\)\)/);
  assert.match(reader, /pointerUp\(session, stageHeight\(stage\)\)/);
  assert.match(reader, /displayY\(session, stageHeight\(stage\)\)/);
  assert.match(reader, /settleImmediately\(session\)/);
  assert.match(css, /margin-top:\s*auto/);
  assert.match(css, /min-height:\s*100%/);
  assert.match(css, /\.story-next \{[^}]*margin:\s*40px 0 28px;/);
  assert.match(css, /\.story-next \{[^}]*border-top:\s*1px solid var\(--hairline\)/);
});
