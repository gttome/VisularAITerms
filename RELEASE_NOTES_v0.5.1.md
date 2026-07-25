# Release Notes — Visular AI Terms / Concepts v0.5.1

## Iteration 4 maintenance fix — GitHub Pages frontend cache safety

v0.5.1 fixes a deployment-only issue reported after v0.5.0: Save concept and Add to compare worked on the local Windows server but could be inert on GitHub Pages.

### Root cause
The v0.5.0 HTML introduced the Iteration 4 controls, but the production JavaScript and CSS kept the same public filenames used by v0.4.0. A browser or intermediary cache could therefore combine the new HTML with older frontend files. The older files did not contain the Save/Compare event handlers or pressed-state styling.

### Fixed
- JavaScript and CSS now deploy under a release-versioned path such as `static/0.5.1/js/` and `static/0.5.1/css/`.
- The complete ES-module tree moves together so relative module imports continue to work.
- GitHub Pages smoke validation now tests both root hosting and project-subdirectory hosting.
- Smoke validation confirms versioned CSS, the full module graph, data files, concepts, and media paths.

### Unchanged
- Saved, Recent, and Compare state remains browser-local.
- No backend, accounts, analytics, telemetry, cookies, or remote state service was added.
- Existing concept content, media, routing, learning paths, glossary, and translation exclusion remain unchanged.
