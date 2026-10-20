const SECTION_LABELS = ["行业动向", "工程化实践", "社区热点"];

const SECTION_IDS = {
  行业动向: "industry",
  工程化实践: "engineering",
  社区热点: "community",
};

export function byDate(a, b) {
  const delta = new Date(a.data.date).valueOf() - new Date(b.data.date).valueOf();
  if (delta !== 0) return delta;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

export function decorateIssues(entries) {
  const asc = [...entries].sort(byDate);
  const numberById = new Map(asc.map((entry, index) => [entry.id, index + 1]));
  const newestFirst = [...asc].reverse();
  return { newestFirst, numberById };
}

export function padIssue(number) {
  return String(number).padStart(3, "0");
}

export function formatDotDate(date) {
  const value = new Date(date);
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

export function formatIsoDate(date) {
  const value = new Date(date);
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatLongDate(date) {
  const value = new Date(date);
  const weeks = ["日", "一", "二", "三", "四", "五", "六"];
  const year = value.getUTCFullYear();
  const month = value.getUTCMonth() + 1;
  const day = value.getUTCDate();
  const week = weeks[value.getUTCDay()];
  return `${year}年${month}月${day}日 周${week}`;
}

export function extractTodayItems(markdown) {
  const match = markdown.match(/##\s*今天动向\s*\n+([\s\S]*?)(?:\n---|\n##\s|$)/);
  if (!match) return [];
  return match[1]
    .trim()
    .split(/\n(?=\d+\.\s)/)
    .map((chunk) => chunk.replace(/^\d+\.\s+/, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export function plainText(markdown) {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/`/g, "");
}

export function metaDescription(markdown) {
  const first = plainText(extractTodayItems(markdown)[0] || "").replace(/\s+/g, " ").trim();
  if (!first) return "AI Coding 日报，一份关于人工智能编程的每日杂志。";
  if (first.length <= 110) return first;
  return `${first.slice(0, 108)}…`;
}

export function renderInline(markdown) {
  const escaped = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  return escaped
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

export function extractDigest(markdown) {
  const today = extractTodayItems(markdown);
  const sections = [];
  let readCount = 0;
  let glanceCount = 0;
  const chunks = markdown.split(/\n(?=## )/);

  for (const chunk of chunks) {
    const headingMatch = chunk.match(/^##\s+(.+)/);
    if (!headingMatch) continue;
    const heading = headingMatch[1].trim();
    const label = heading.replace(/^[一二三四五六七八九十]+、/, "");
    if (!SECTION_LABELS.includes(label)) continue;

    const deep = [];
    const scan = [];
    let glanceAnchor = "";
    const blocks = chunk.split(/\n(?=### )/);
    for (const block of blocks) {
      if (block.startsWith("### 深读")) {
        readCount += 1;
        const item = parseDeep(block);
        deep.push({ ...item, anchor: `read-${readCount}` });
      } else if (block.startsWith("### 可扫一眼")) {
        glanceCount += 1;
        glanceAnchor = `glance-${glanceCount}`;
        for (const item of parseScan(block)) scan.push(item);
      }
    }

    sections.push({
      id: SECTION_IDS[label],
      heading,
      label,
      deep,
      scan,
      glanceAnchor,
    });
  }

  return { today, sections };
}

function parseDeep(block) {
  const headingLine = block.split("\n")[0].replace(/^###\s*/, "");
  const linked = headingLine.match(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/);
  const mustRead = /\*\*必读原文\*\*/.test(block);
  if (linked) return { title: linked[1], href: linked[2], mustRead };
  const title = headingLine.replace(/^深读｜/, "").trim();
  const any = block.match(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/);
  return { title, href: any ? any[2] : "", mustRead };
}

function parseScan(block) {
  const items = [];
  const re = /^- \[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/gm;
  let match = re.exec(block);
  while (match) {
    items.push({ title: match[1], href: match[2], mustRead: false });
    match = re.exec(block);
  }
  return items;
}
