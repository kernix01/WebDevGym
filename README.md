Frontend Developer Roadmap

An interactive learning platform built as a single HTML file. Study topics, take mini-tests, solve practice tasks, and track your progress — all without any server or installation.

Live Demo

Open on GitHub Pages after you deploy it — the URL will be:
```
https://kernix01.github.io/WebDevGym/
```

What's inside

The roadmap is split into three groups:

**Frontend** — HTML, CSS, JavaScript, TypeScript, React, Git

**Backend & Extra** — Node.js, SQL, Servers, Linux, Vite

**Other** — Guides, Practice, Common mistakes, Resources, Career path, Figma basics, Playground, Cheatsheets, GitHub

Each topic has a theory block with code examples, a mini-test (2–3 questions), and a practice task. Checkboxes unlock only after you pass both the test and the task.

Features

- Progress dashboard with per-language bars and percentages
- Dark and light mode
- Bookmarks for topics you want to revisit
- Full-text search across all topics
- Built-in code playground (HTML/CSS/JS)
- GitHub tab — search repos and push files directly to your repository via API

How to deploy

Option 1 — GitHub Pages (recommended)

1. Create a new repository on GitHub
2. Upload `index.html` to the root of the `main` branch
3. Go to Settings → Pages → Source: main branch, / (root)
4. Your site will be live in about a minute

**Option 2 — Push from the app itself**

Open the GitHub tab inside the roadmap, fill in your username, repository name, and a Personal Access Token (with `repo` scope), select the file and click Push. The token is never saved anywhere — it only lives in the current browser tab.

Option 3 — Local use

Just double-click `index.html`. No server needed.

Resetting progress

Click the Reset button in the top bar. This clears localStorage so all checkboxes go back to zero. Your bookmarks are also cleared.

Notes

- Progress is saved in `localStorage` and persists between sessions in the same browser
- Locked checkboxes (🔒) unlock only after passing the mini-test and practice task for that topic
- The file is self-contained — no CDN dependencies for core functionality
