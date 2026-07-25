---
description: "Use when writing or editing web page files (HTML, CSS, JS) that will be deployed via GitHub Pages, or when discussing links, asset paths, base URLs, or domain configuration for this site."
applyTo: "**/*.html,**/*.css,**/*.js,**/*.mdx"
---

# GitHub Pages Deployment (Custom Domain)

This repo (`rsv-public`) is a GitHub **Project Page** (repo name is not `quarterbit.github.io`), served via GitHub Pages with a **custom domain**: `radschnellverbindung-tennenlohe.de`.

## Key implication: no repo-name prefix in paths

Without a custom domain, a Project Page would be served at `https://quarterbit.github.io/rsv-public/`. Because a custom domain is configured (via the `CNAME` file + DNS at United Domains), the site is served at the **domain root** instead — the `/rsv-public/` prefix does **not** exist in production.

- Do **not** hardcode absolute paths with the repo name, e.g. `/rsv-public/style.css`.
- Use paths relative to the domain root instead:
  - Relative paths: `style.css`, `./assets/img/logo.png`
  - Root-relative paths: `/style.css`, `/assets/img/logo.png`
- If a static site generator is introduced later (Jekyll, Hugo, Next.js export, etc.), its `baseurl` / `basePath` config must stay **empty** — not `/rsv-public`.

## Domain setup facts

- Primary domain: `radschnellverbindung-tennenlohe.de` (custom domain for this repo's Pages site)
- `radschnellweg-tennenlohe.de` and `rsv-tennenlohe.de` are registrar-level (United Domains) redirects to the primary domain — they are not served by this repo and need no path handling here.
- The `CNAME` file at the repo root (created by GitHub when the custom domain is set in Settings → Pages) must contain exactly `radschnellverbindung-tennenlohe.de`. Do not delete or repurpose it.
