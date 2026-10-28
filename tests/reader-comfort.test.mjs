import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { COMFORT_KEY, COMFORT_TIERS, DEFAULT_COMFORT, normalizeComfort } from "../src/lib/reader-comfort.mjs";

const root = path.resolve(import.meta.dirname, "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

test("comfort storage normalizes to the three tiers", () => {
  assert.equal(COMFORT_KEY, "ai-coding-reader-comfort");
  assert.deepEqual(COMFORT_TIERS, ["tight", "standard", "loose"]);
  assert.equal(DEFAULT_COMFORT, "standard");
  assert.equal(normalizeComfort("tight"), "tight");
  assert.equal(normalizeComfort("standard"), "standard");
  assert.equal(normalizeComfort("loose"), "loose");
  assert.equal(normalizeComfort(null), "standard");
  assert.equal(normalizeComfort("serif"), "standard");
  assert.equal(normalizeComfort(""), "standard");
});

test("the reader boots the stored comfort tier before paint", () => {
  const base = read("src/layouts/Base.astro");
  const reader = read("src/components/DailyReader.astro");
  assert.match(base, /data-comfort="standard"/);
  assert.match(base, /localStorage\.getItem\("ai-coding-reader-comfort"\)/);
  assert.match(base, /stored === "tight" \|\| stored === "standard" \|\| stored === "loose"/);
  assert.match(reader, /reader-comfort\.mjs/);
  assert.match(reader, /localStorage\.setItem\(COMFORT_KEY, next\)/);
  assert.match(reader, /normalizeComfort/);
  assert.match(reader, /value="tight"/);
  assert.match(reader, /value="standard"/);
  assert.match(reader, /value="loose"/);
  assert.match(reader, /紧凑/);
  assert.match(reader, /标准/);
  assert.match(reader, /宽松/);
  assert.match(reader, /class="comfort-entry"/);
  assert.match(reader, /aria-label="版式"/);
  assert.match(reader, /event\.key !== "Escape"/);
  assert.match(reader, /tools\.contains\(target\)/);
  assert.match(reader, /entry\.focus\(\{ preventScroll: true \}\)/);
  assert.doesNotMatch(reader, /reader-progress|chapter-rail|reader-dock/);
});

test("comfort tiers set body size, leading, measure, and padding", () => {
  const css = read("src/styles/reader.css");
  const tiers = [
    ["tight", "1rem", "1.6", "36rem", "44px", "18px"],
    ["standard", "1.0625rem", "1.7", "40rem", "52px", "22px"],
    ["loose", "1.125rem", "1.8", "34rem", "60px", "22px"],
  ];
  for (const [name, size, leading, measure, pad, narrow] of tiers) {
    const block = css.match(new RegExp(`html\\[data-comfort="${name}"\\] \\.reader \\{[^}]*\\}`));
    assert.ok(block, name);
    assert.match(block[0], new RegExp(`--body-size:\\s*${size};`));
    assert.match(block[0], new RegExp(`--body-leading:\\s*${leading};`));
    assert.match(block[0], new RegExp(`--measure:\\s*${measure};`));
    assert.match(block[0], new RegExp(`--pad-desktop:\\s*${pad};`));
    assert.match(block[0], new RegExp(`--pad-narrow:\\s*${narrow};`));
  }
  assert.match(css, /font-size:\s*clamp\(1\.5rem, 2\.4vw, 1\.85rem\)/);
  assert.match(css, /\.story-quote\s*\{[^}]*font-size:\s*calc\(var\(--body-size\) \+ 0\.05rem\)/);
  assert.match(css, /\.story-pull\s*\{[^}]*font-size:\s*calc\(var\(--body-size\) \+ 0\.03rem\)/);
  assert.match(css, /\.story \.story-body > p\s*\{[^}]*font-size:\s*var\(--body-size\)/);
  assert.match(css, /\.story h2::before \{[^}]*width:\s*3px;/);
  assert.match(css, /\.story h2::before \{[^}]*height:\s*10px;/);
  assert.match(css, /\.story h2::before \{[^}]*background:\s*var\(--company\);/);
  assert.match(css, /\.comfort-sheet \{[^}]*transition:\s*opacity 120ms linear;/);
  assert.match(css, /\.comfort-sheet \{[^}]*border:\s*1px solid var\(--hairline\);/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\.comfort-sheet \{[^}]*transition:\s*none;/);
  assert.doesNotMatch(css, /comfort-sheet[^}]*transform:/);
  assert.doesNotMatch(css, /border-left:/);
});
