import fs from "node:fs";

export function readEntryMarkdown(entry) {
  if (typeof entry.body === "string" && entry.body.includes("今天动向")) return entry.body;
  if (entry.filePath && fs.existsSync(entry.filePath)) {
    const raw = fs.readFileSync(entry.filePath, "utf8");
    return raw.replace(/^---[\s\S]*?---\s*/, "");
  }
  return entry.body || "";
}
