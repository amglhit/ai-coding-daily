/** Issue length filter. Morning hides 选读; default is the full issue. */
export const SCOPE_KEY = "ai-coding-reader-scope";

export const PICKS_COLUMN = "选读";

export function normalizeScope(value) {
  return value === "morning" ? "morning" : "all";
}

export function storyGroup(column) {
  return column === PICKS_COLUMN ? "picks" : "morning";
}

/** Stories in reading order, with one break inserted before the first 选读. */
export function readerUnits(stories) {
  const units = [];
  let seenPick = false;
  (stories || []).forEach((story, index) => {
    const group = storyGroup(story?.column);
    if (group === "picks" && !seenPick) {
      units.push({ kind: "break", group: "picks" });
      seenPick = true;
    }
    units.push({ kind: "story", group, index });
  });
  return units;
}
