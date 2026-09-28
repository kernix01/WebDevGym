# WebDevGym curriculum audit 2026

## Scope

This audit compares the RU and EN curricula with current primary learning and
reference material from MDN, W3C WAI, React, TypeScript, Node.js, Git,
PostgreSQL, Docker, and Vite. It checks learning coverage and sequence, not just
the number of cards on screen.

The baseline contained 222 lessons per locale. The audited curriculum contains
255 lessons per locale and keeps identical lesson IDs and ordering in RU and EN.

## What was added

- HTML: browser request flow, semantic accessibility, keyboard interaction,
  accessible forms, validation, and error communication.
- CSS: cascade layers, inheritance and specificity, values and units,
  responsive sizing, typography and web fonts, overflow, form controls, and
  DevTools debugging.
- JavaScript: coercion and strict comparison, nullish values, JSON, Map and Set,
  breakpoints, browser APIs and feature detection, FormData, safe DOM output,
  XSS boundaries, and test fundamentals.
- TypeScript: module resolution, type-only imports, declaration files, and
  consuming library types.
- React: render snapshots, queued state updates, state structure, derived state,
  state preservation and reset with keys, and avoiding unnecessary Effects.
- Git: clone/fetch/pull, merge versus rebase, and safe restore/revert/reset use.
- Node.js: ESM versus CommonJS, package metadata and lockfiles, event loop,
  Buffer and streams, HTTP boundaries, node:test, and graceful shutdown.
- SQL and PostgreSQL: data types, constraints, normalization, EXPLAIN and query
  plans, keyset pagination, roles, least privilege, backups, and restore drills.
- Delivery: DNS, TLS, reverse proxy basics, observability, health checks,
  rollback, Vite production builds, base paths, environment variables, and
  static deployment.

Every added lesson contains a worked example, detailed explanation, practice
task, mastery checklist, and links to official documentation.

Six existing lessons were also fact-checked without changing their IDs or
stored progress: heading hierarchy, the visible `main` landmark, strict
equality and debugging, `z-index`, event listener cleanup, and `fetch`/`await`
error handling.

## Quality gates

`tools/validate-curriculum-depth.cjs` verifies:

- 255 lessons in each locale;
- identical RU and EN IDs and ordering;
- valid per-section learning order;
- frontend and backend route order;
- complete calendar route;
- examples, explanations, checklists, and official links in audited lessons.

`tools/audit-curriculum-coverage.cjs` reports section density and flags lessons
that may need more explanation, examples, checks, or documentation.

## Remaining maintenance

No finite curriculum can permanently contain every browser API, framework
feature, database extension, or deployment platform. WebDevGym should instead
keep a stable foundation and review fast-changing sections periodically:

1. React and TypeScript behavior after major releases.
2. Node.js supported releases and built-in APIs.
3. Browser compatibility, accessibility guidance, and performance metrics.
4. Vite build and deployment behavior.
5. Security guidance and platform defaults.

Utility sections such as resources, calendar, links, and career do not need the
same code density as language lessons. The audit therefore treats missing core
concepts as higher priority than raw text length.

## Primary references

- MDN Curriculum: https://developer.mozilla.org/en-US/curriculum/core/
- W3C WAI Tutorials: https://www.w3.org/WAI/tutorials/
- React Learn: https://react.dev/learn
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/intro.html
- Node.js API: https://nodejs.org/api/
- Pro Git: https://git-scm.com/book/en/v2.html
- PostgreSQL documentation: https://www.postgresql.org/docs/current/
- Docker documentation: https://docs.docker.com/
- Vite guide: https://vite.dev/guide/
