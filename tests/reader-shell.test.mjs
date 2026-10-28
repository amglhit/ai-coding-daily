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
