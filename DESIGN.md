# Design

Light-only site. Story issues fill the viewport. Home and archive share the same tokens and a one-line masthead.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#FAFAFA` | Page background |
| `--surface` | `#FFFFFF` | List cards, reader chip |
| `--ink` | `#171717` | Titles and body |
| `--muted` | `#737373` | Column, byline, hints |
| `--hairline` | `#E5E5E5` | Dividers, chip edge |
| `--accent` | `#2563EB` | 读原文, focus, current nav, primary button |
| `--accent-ink` | `#1D4ED8` | Link hover |
| `--link` | `var(--accent)` | Text links |
| `--focus` | `#2563EB` | 2px outline, 3px offset |

Type is the system sans stack. Selection is `#DBEAFE` with `--ink` text. `theme-color` is `#FAFAFA`.

Company colors stay on the 3px rail, the company name, and list or pull edges. They do not paint the page and they do not replace `--accent`.

## Reader

`body[data-surface=reader]` is `100dvh`. There is no paper card, masthead, footer, or persistent pager. A fixed date chip links home. 上一期 / 下一期 appear only after the last story.

`(hover: hover) and (pointer: fine)` scrolls continuously. Anything else uses the magazine session: inner scroll first, 10px hysteresis, cancel settles with `y * 0.72`, and a page springs to ±`clientHeight`. `prefers-reduced-motion` fades the page change instead of springing.
