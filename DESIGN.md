# Design

Light-only site. Story issues fill the viewport. Home and archive share the same tokens and a one-line masthead.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#FFFFFF` | Page background on reader and browse |
| `--surface` | `#F5F5F5` | List cards, reader chip, comfort sheet |
| `--ink` | `#171717` | Titles and body |
| `--muted` | `#737373` | Column, byline, hints |
| `--hairline` | `#E5E5E5` | Dividers, chip edge |
| `--accent` | `#2563EB` | 读原文, focus, current nav, primary button |
| `--accent-ink` | `#1D4ED8` | Link hover |
| `--link` | `var(--accent)` | Text links |
| `--focus` | `#2563EB` | 2px outline, 3px offset |

Type is the system sans stack. Selection is `#DBEAFE` with `--ink` text. `theme-color` is `#FFFFFF`.

Company color is the company name, a short 3×10px mark on the first line of the title, and number text. It does not paint the page, and it does not draw a full-height rail or a left edge on lists or pull quotes. It does not replace `--accent`.

## Reader

`body[data-surface=reader]` is `100dvh`. Persistent chrome is the date chip, a light「Aa」control,「读原文」, the desktop「下一篇」seam or the mobile bottom hint, and adjacent issue links after the last story.

`(hover: hover) and (pointer: fine)` scrolls continuously: about 40px, a 1px hairline, and a muted「下一篇 · 标题」between stories. Anything else is one story per viewport. Inner scroll comes first, then a page at the edge. Cancel settles with `y * 0.72`, and a page springs to ±`clientHeight`. `prefers-reduced-motion` fades the page change instead of springing.

`data-comfort` is `tight`, `standard`, or `loose`. The default is `standard`, stored as `ai-coding-reader-comfort`. It sets `--body-size`, `--body-leading`, `--measure`, and the story padding. Titles stay on the existing clamp.
