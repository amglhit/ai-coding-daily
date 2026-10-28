# AI Coding 日报

面向 AI Coding 的中文静态站，按日归档。带故事数据的刊期是全屏阅读；更早的 Markdown 刊期仍按栏目正文排。

线上地址：[https://amglhit.github.io/ai-coding-daily/](https://amglhit.github.io/ai-coding-daily/)

技术栈是 [Astro](https://astro.build/)（内容集合）加 Markdown。没有 CMS，也没有登录。

## 本地预览

需要 Node.js 22 或更新版本。

```bash
npm install
npm run dev
```

开发服务器地址是 [http://localhost:4321/ai-coding-daily/](http://localhost:4321/ai-coding-daily/)。`base` 配成了 `/ai-coding-daily/`，和 GitHub 项目 Pages 的路径一致，本地和线上的链接都从这里起。

构建并预览静态结果：

```bash
npm test
npm run build
npm run preview
```

## 阅读

首页和归档是同一套浅色站点壳（文字标 +「本期」「归档」）。点「开始阅读」或某一期进入阅读页。

`stories` 刊期占满视口：桌面连续滚动，触控一屏一篇。左上角只有日期，回到首页。公司色只出现在左轨、公司名和摘录边线。

没有 `stories` 的旧刊仍走 Markdown 正文和轻量页眉页脚。

## 新增一期

1. 在 `src/content/daily/` 放一份 `YYYY-MM-DD.md`。文件名会变成地址，例如 `2026-10-20.md` 对应 `/daily/2026-10-20/`。
2. 写好 frontmatter。`date` 用同一天。
3. 正文保持这四段结构，站点会按标题自动排版：
   - `## 今天动向`：开篇若干条
   - `## 一、行业动向`
   - `## 二、工程化实践`
   - `## 三、社区热点`
4. 栏内长文用 `### 深读｜...`，短讯用 `### 可扫一眼`。导语里写上 `**必读原文**` 的条目会显示红色徽章。
5. 提交并推到 `main`。GitHub Actions 会构建，并发布到 GitHub Pages。

```yaml
---
title: "AI Coding 日报 · 2026-10-20（周二）"
date: 2026-10-20
type: daily
columns: [行业动向, 工程化实践, 社区热点]
must_read:
  - TestJack
  - Claude Code 审查
---
```

`title` 用在首页和浏览器标题。正文可以自己再写一次一级标题，刊期页会把它当作文章标题。

`columns` 决定归档页的栏目筛选。一期如果只覆盖其中几栏，就只写下那几栏的名字。

## GitHub Pages

工作流在 `.github/workflows/pages.yml`。

- 推到 `main` 时安装依赖、跑测试、执行 `npm run build`，再用官方的 `actions/deploy-pages` 发布 `dist/`。
- 拉取请求只会构建和测试，不会发布。
- 源码留在 `main`，构建产物不进仓库。

请在仓库里打开 Pages，否则工作流无法发布：

**Settings → Pages → Build and deployment → Source：GitHub Actions**

如果第一次部署因为还没选这个来源而失败，改好设置后在 Actions 里重跑即可。

发布完成后的地址是 [https://amglhit.github.io/ai-coding-daily/](https://amglhit.github.io/ai-coding-daily/)。
