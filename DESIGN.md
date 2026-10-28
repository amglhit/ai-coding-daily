# Design

Light-only site. Story issues fill the viewport. Home and archive share the same tokens and a one-line masthead.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#FFFFFF` | Page background on reader and browse |
| `--surface` | `#F5F5F5` | Home and archive list cards, reader chip |
| `--ink` | `#171717` | Titles and body |
| `--muted` | `#737373` | Column, byline, hints |
| `--hairline` | `#E5E5E5` | Dividers, chip edge |
| `--accent` | `#2563EB` | 读原文, focus, current nav, primary button |
| `--accent-ink` | `#1D4ED8` | Link hover |
| `--link` | `var(--accent)` | Text links |
| `--focus` | `#2563EB` | 2px outline, 3px offset |

Type is the system sans stack. Selection is `#DBEAFE` with `--ink` text. `theme-color` is `#FFFFFF`.

Company color is the company name and a short 3×10px mark on the first line of the title. Numbers may use it as text. It does not paint the page, and it does not draw a full-height rail or a left edge on lists or pull quotes. It does not replace `--accent`.

## Reader

`body[data-surface=reader]` is `100dvh`. There is no paper card, masthead, footer, or persistent pager. A fixed date chip links home. 上一期 / 下一期 appear only after the last story.

`(hover: hover) and (pointer: fine)` scrolls continuously. Anything else uses the magazine session: inner scroll first, 10px hysteresis, cancel settles with `y * 0.72`, and a page springs to ±`clientHeight`. `prefers-reduced-motion` fades the page change instead of springing.
