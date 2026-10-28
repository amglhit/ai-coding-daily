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

Company color is the company name and a short 3×10px mark on the first line of the title. Numbered steps use muted tabular figures. It does not paint the page, and it does not draw a full-height rail or a left edge on lists, quotes, or pull quotes. It does not replace `--accent`.

## Reader

`body[data-surface=reader]` is `100dvh`. The date,「目录」, and「Aa」sit once at the top of the opening story and scroll away with it. They are not fixed or sticky. 「读原文」, the desktop「下一篇」seam or the mobile bottom hint, and adjacent issue links stay in the story. The directory sheet is a transient dialog. Home and archive keep「归档」.

`(hover: hover) and (pointer: fine)` scrolls continuously: about 40px, a 1px hairline, and a muted「下一篇 · 标题」between stories. Anything else is one viewport per story, paged with CSS `scroll-snap` (`y mandatory`, `scroll-snap-stop: always`) on the stage. A long story scrolls inside that panel, and the next story snaps only after the panel reaches its end. A short story is not an inner scroller, so the swipe pages immediately. If a fling lands more than one story away, the reader steps back to the neighboring story after the scroll ends. There is no drag spring. Company, title, byline, and「读原文」sit in the story and scroll with it. There is no sticky title. `prefers-reduced-motion` keeps directory and hash jumps instant.

`data-comfort` is `tight`, `standard`, or `loose`. The default is `standard`, stored as `ai-coding-reader-comfort`. It sets `--body-size`, `--body-leading`, `--measure`, and the story padding. Titles stay on the existing clamp.
