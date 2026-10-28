import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { normalizeScope, readerUnits, SCOPE_KEY, storyGroup } from "../src/lib/reader-scope.mjs";
import { SHEET_DAMPING, SHEET_RESPONSE, stepSheetSpring } from "../src/lib/reader-sheet.mjs";

const root = path.resolve(import.meta.dirname, "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

test("scope storage and the Morning / 选读 break", () => {
  assert.equal(SCOPE_KEY, "ai-coding-reader-scope");
  assert.equal(normalizeScope("morning"), "morning");
  assert.equal(normalizeScope("all"), "all");
  assert.equal(normalizeScope("picks"), "all");
  assert.equal(normalizeScope(null), "all");
  assert.equal(normalizeScope(""), "all");
  assert.equal(storyGroup("选读"), "picks");
  assert.equal(storyGroup("工程化实践"), "morning");
  const units = readerUnits([
    { column: "工程化实践" },
    { column: "社区热点" },
    { column: "选读" },
    { column: "选读" },
  ]);
  assert.deepEqual(
    units.map((unit) => unit.kind),
    ["story", "story", "break", "story", "story"],
  );
  assert.equal(units[2].group, "picks");
  assert.equal(units[3].index, 2);
  assert.deepEqual(
    readerUnits([{ column: "行业动向" }]).map((unit) => unit.kind),
    ["story"],
  );
  assert.equal(readerUnits([{ column: "选读" }])[0].kind, "break");
});

test("directory sheet spring uses damping 0.8 and response 0.3", () => {
  assert.equal(SHEET_DAMPING, 0.8);
  assert.equal(SHEET_RESPONSE, 0.3);
  let state = { value: 0, velocity: 0 };
  let peak = 0;
  for (let i = 0; i < 240; i += 1) {
    state = stepSheetSpring(state, 1, 0.016);
    peak = Math.max(peak, state.value);
    if (state.settled) break;
  }
  assert.equal(state.settled, true);
  assert.equal(state.value, 1);
  assert.ok(peak > 1.005 && peak < 1.05);
});

test("the reader keeps a transient directory and a 选读 break", () => {
  const reader = read("src/components/DailyReader.astro");
  const css = read("src/styles/reader.css");
  const base = read("src/layouts/Base.astro");
  assert.match(reader, /class:list=\{\["section-break", "reader-unit"/);
  assert.match(reader, /section-break-label">选读</);
  assert.match(reader, /class="toc-entry"/);
  assert.match(reader, /aria-label="目录"/);
  assert.match(reader, /aria-modal="true"/);
  assert.match(reader, /只看 Morning/);
  assert.match(reader, /data-scope-choice="all"/);
  assert.match(reader, /data-scope-choice="morning"/);
  assert.match(reader, />Morning</);
  assert.match(reader, /reader-scope\.mjs/);
  assert.match(reader, /stepSheetSpring/);
  assert.match(reader, /SCOPE_KEY/);
  assert.match(reader, /event\.key !== "Tab"/);
  assert.match(reader, /entry\.focus\(\{ preventScroll: true \}\)/);
  assert.match(base, /localStorage\.getItem\("ai-coding-reader-scope"\)/);
  assert.match(base, /scope === "morning" \? "morning" : "all"/);
  assert.match(css, /\.section-break \{[^}]*padding:\s*28px var\(--pad-desktop\);/);
  assert.match(css, /\.section-break-label \{[^}]*border-top:\s*1px solid var\(--hairline\)/);
  assert.match(css, /\.section-break-label \{[^}]*border-bottom:\s*1px solid var\(--hairline\)/);
  assert.match(css, /\.section-break-label \{[^}]*font-size:\s*0\.8125rem;/);
  assert.match(css, /\.section-break-label \{[^}]*color:\s*var\(--muted\);/);
  assert.match(css, /\.story-next \{[^}]*color:\s*var\(--muted\);/);
  assert.match(css, /\.story-next \{[^}]*font-weight:\s*500;/);
  assert.match(css, /\.toc-panel \{[^}]*background:\s*var\(--surface\);/);
  assert.match(css, /\.toc-panel \{[^}]*border:\s*1px solid var\(--hairline\);/);
  assert.match(css, /\.toc-panel \{[^}]*width:\s*min\(32rem,/);
  assert.match(css, /translateY\(calc\(\(1 - var\(--sheet-p\)\) \* 100%\)\)/);
  assert.match(css, /html\[data-scope="morning"\] \[data-group="picks"\]/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*\.toc-panel \{[^}]*opacity:/);
  assert.doesNotMatch(reader, /reader-progress|chapter-rail|reader-dock/);
  assert.doesNotMatch(css, /border-left:/);
});
