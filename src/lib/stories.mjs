const LEAD = {
  practice: "scene",
  benchmark: "motive",
  advice: "conclusion",
  framework: "claim",
  experiment: "result",
  essay: "observe",
};

export function accentColor(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(String(color || "")) ? color : "#2563EB";
}

export function formatChipDate(date) {
  const value = new Date(date);
  return `${value.getUTCMonth() + 1}月${value.getUTCDate()}日`;
}

export function storyLead(body) {
  if (!body) return "";
  const key = LEAD[body.pattern];
  return key ? String(body[key] || "") : "";
}

export function storyDescription(stories) {
  const first = stories?.[0];
  if (!first) return "AI Coding 日报，一份关于人工智能编程的每日杂志。";
  const text = `${first.title}。${storyLead(first.body)}`.replace(/\s+/g, " ").trim();
  if (text.length <= 110) return text;
  return `${text.slice(0, 108)}…`;
}

export function formatMasthead(date) {
  const value = new Date(date);
  return `${value.getUTCMonth() + 1} 月 ${value.getUTCDate()} 日 · AI Coding 日报`;
}
