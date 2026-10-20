function textOf(node) {
  if (!node) return "";
  if (node.type === "text") return node.value || "";
  if (!node.children) return "";
  return node.children.map(textOf).join("");
}

function annotate(node, className, id) {
  node.properties = node.properties || {};
  node.properties.className = className.split(" ");
  if (id) node.properties.id = id;
}

/**
 * Marks the digest's fixed sections so the magazine CSS can style them
 * without rewriting the article Markdown.
 */
export function magazineRehype() {
  let readCount = 0;
  let glanceCount = 0;
  let seenH1 = false;

  return function transform(tree) {
    readCount = 0;
    glanceCount = 0;
    seenH1 = false;
    const removals = [];
    walk(tree, null, removals);
    for (const { parent, node } of removals) {
      parent.children = parent.children.filter((child) => child !== node);
    }
  };

  function walk(node, parent, removals) {
    if (!node || typeof node !== "object") return;
    if (node.type === "element") decorate(node, parent, removals);
    const children = node.children;
    if (!children) return;
    for (let i = 0; i < children.length; i += 1) walk(children[i], node, removals);
  }

  function decorate(node, parent, removals) {
    const text = textOf(node).trim();

    if (node.tagName === "h1" && !seenH1) {
      seenH1 = true;
      if (parent) removals.push({ parent, node });
      return;
    }

    if (node.tagName === "h2") {
      if (text.includes("今天动向")) annotate(node, "section-opener section-today", "today");
      else if (text.includes("行业动向")) annotate(node, "section-opener section-industry", "industry");
      else if (text.includes("工程化实践")) annotate(node, "section-opener section-engineering", "engineering");
      else if (text.includes("社区热点")) annotate(node, "section-opener section-community", "community");
      return;
    }

    if (node.tagName === "h3" && text.startsWith("深读")) {
      readCount += 1;
      const classes = ["deep-read"];
      if (nextText(parent, node).includes("必读原文")) classes.push("is-must");
      annotate(node, classes.join(" "), `read-${readCount}`);
      splitKicker(node);
      return;
    }

    if (node.tagName === "h3" && text.includes("可扫一眼")) {
      glanceCount += 1;
      annotate(node, "scan-head", `glance-${glanceCount}`);
      return;
    }

    if (node.tagName === "strong" && text === "必读原文") {
      node.properties = node.properties || {};
      node.properties.className = ["badge-must"];
      return;
    }

    if (node.tagName === "a") {
      const href = node.properties?.href;
      if (typeof href === "string" && /^https?:\/\//.test(href)) {
        node.properties.target = "_blank";
        node.properties.rel = "noreferrer noopener";
      }
    }
  }
}

function nextText(parent, node) {
  if (!parent?.children) return "";
  const siblings = parent.children.filter((child) => child.type === "element");
  const index = siblings.indexOf(node);
  if (index < 0) return "";
  return textOf(siblings[index + 1]);
}

function splitKicker(node) {
  const first = node.children?.find((child) => child.type === "text" && child.value);
  if (!first) return;
  const matched = first.value.match(/^深读｜?/);
  if (!matched) return;
  first.value = first.value.slice(matched[0].length);
  node.children.unshift({
    type: "element",
    tagName: "span",
    properties: { className: ["kicker"] },
    children: [{ type: "text", value: "深读" }],
  });
}
