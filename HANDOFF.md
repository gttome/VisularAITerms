# Visular AI Terms / Concepts — Cross-Chat Development Handoff

## Read this first in a new ChatGPT conversation
This file is designed so development can continue even when the prior chat is unavailable. Treat the files in this project as the current source of truth. Do not assume details from an inaccessible earlier conversation that conflict with these files.

## Current release
- Application: **Visular AI Terms / Concepts**
- Short package name: **VisularAITerms**
- Current version: **0.5.1**
- Completed development milestone: **Iteration 4 — Local Workspace and Concept Comparison**
- Runtime: static HTML5 + CSS + vanilla JavaScript ES modules
- Hosting target: GitHub Pages
- Windows 11 local launch: double-click root `start-server.bat`
- Production build: root `dist/`

## Permanent user requirements
1. Every development request/iteration must return a **complete standalone project ZIP**, never only changed files or a patch.
2. Application ZIP naming: `VisularAITerms_v<version>.zip`.
3. Every ZIP must contain root-level `start-server.bat`.
4. Every ZIP must contain prebuilt `dist/` so the application can be run on Windows 11 by extracting and double-clicking `start-server.bat`.
5. A new release must not depend on any previous ZIP.
6. For major continuation handoffs, provide `VisularAITerms_Handoff_v<version>.zip` containing the complete project and this handoff material.
7. Preserve the official application name exactly: **Visular AI Terms / Concepts**.
8. Preserve the user-supplied Visular logo unless the user requests a change.
9. Normal new terms/concepts must be content/metadata changes and must not require edits to application HTML/CSS/JavaScript.

## Current source content
Two supplied concepts are included with their original media:
1. AI Agents and Agentic Workflows
2. AI Governance, Risk Management, and Compliance

Each supplied concept includes image, MP4 video, M4A audio, PDF, and DOCX source material. Originals are preserved under each concept's `media/` directory. Web derivatives are under `derived/`.

## Known source-content accessibility facts
Do not fabricate missing accessibility content to make warnings disappear.
- 2 supplied videos: no source-accurate captions and no source-accurate transcripts.
- 2 supplied audio files: no source-accurate transcripts.
- 2 supplied PDFs: untagged; readable concept-level alternatives are provided.
- Therefore validation currently reports **6 expected warnings** plus **2 PDF information messages**.

Iteration 3 intentionally removed redundant visible warnings such as concept-level remediation banners and missing-transcript placeholder blocks. The underlying metadata/validation remains.

## Windows local-server reliability fix retained
The v0.4.0 server fix remains in v0.5.1: `scripts/serve.ps1` suppresses expected client reset/abort/disposed-stream cases while retaining real warnings. HTTP byte-range support remains for MP4/M4A seeking.


## v0.5.1 GitHub Pages cache-fix maintenance release
A deployed Iteration 4 site could show the new Save/Compare HTML while a browser/CDN reused v0.4.0 frontend files with the same URLs (`js/app.js`, `js/concept/concept-view.js`, and `css/components.css`). That mixed-version state leaves the new buttons visible but unbound and without their pressed-state styling.

v0.5.1 fixes this by publishing the JavaScript and CSS under a release-specific path such as `static/0.5.1/js/` and `static/0.5.1/css/`. Every release therefore gets a new frontend URL namespace while source development remains unchanged. The production smoke test now verifies both root hosting and a GitHub Pages project subdirectory (`/VisularAITerms/`), including the complete ES-module graph and versioned stylesheets.

## Architecture authority
Read in this order when implementing:
1. current explicit user request;
2. `docs/PRODUCT.md` for product behavior;
3. `docs/ARCHITECTURE.md` for technical structure;
4. `docs/CONTENT.md` and `content/schema/*.json` for data/content rules;
5. `docs/QUALITY.md` for acceptance/quality;
6. current iteration specification under `docs/iterations/`;
7. `AGENTS.md` for coding-agent workflow and repository rules.

## Current v0.5.1 product capabilities
### Catalog/discovery
- ranked search;
- metadata/config-driven categories;
- A–Z navigation;
- active filters and counts;
- Glossary view;
- JSON-driven Learning Paths.

### Concept experience
- Quick View and Deep Dive;
- simple explanation;
- senior-leader and knowledge-worker takeaways;
- key takeaway and primary risk;
- full definition/audience detail;
- structured examples;
- business-impact fields;
- Questions to Ask;
- opportunities, risks, misconception, and monitoring;
- typed concept relationships;
- prerequisites and Learn Next;
- optional comparisons/common-confusion/source metadata;
- Copy Link, Copy Definition, and print-friendly brief.

### Iteration 4 local workspace
- Save/unsave concept control.
- Saved & Recent view.
- Saved concept IDs persist in browser localStorage.
- Recent concept IDs persist in browser localStorage, de-duplicated and limited to 12.
- Clear recent control.
- No accounts, synchronization, analytics, cookies, telemetry, or remote user-state service.

### Iteration 4 concept comparison
- Add/remove concept from comparison from concept page.
- Maximum 3 comparison concepts.
- Compare view uses existing concept metadata and avoids loading large media.
- Comparison selection persists in browser localStorage.
- Shareable route `?view=compare&compare=<id1>,<id2>,<id3>`.
- Routed comparison IDs are validated against the published catalog before use.
- Copy comparison link, remove individual concept, and clear comparison controls.

### Multimedia
- PNG/image;
- MP4/video;
- M4A/audio;
- PDF;
- DOCX shown via generated HTML plus original access;
- duration/page metadata when known;
- transcript search only when a source transcript exists.

### Publishing
- `concept:new` safely scaffolds a draft;
- `concept:import` safely imports a source folder and refuses overwrite;
- `content:prepare` creates derivatives and technical metadata where possible;
- `validate` checks content/relationships/learning paths/media;
- `build` generates the complete static site;
- `content:publish` runs preparation -> validation -> build.

## Translation decision remains binding
The user explicitly instructed during Iteration 3: **Leave Translation-Ready, But Limited (18, 19, 20) out of the iteration.**

v0.5.1 still does NOT include:
- translation schema/locales;
- language-aware routing/search;
- language selector;
- translated demonstration concept.

Do not add these in a future iteration unless the user requests them again.

## Current routing
- `?concept=<concept-id>` — direct concept Quick View.
- `?concept=<concept-id>&media=<media-id>` — direct concept Deep Dive/media.
- `?category=<category-id>` — category browse state.
- `?view=glossary` — glossary.
- `?view=paths` — learning paths.
- `?view=paths&path=<path-id>` — individual learning path.
- `?view=saved` — local Saved & Recent workspace.
- `?view=compare&compare=<id1>,<id2>,<id3>` — shareable comparison.

## Iteration 4 state files
- `src/js/workspace/personal-store.js` — versioned localStorage ID lists and limits.
- `src/js/workspace/workspace-view.js` — Saved & Recent presentation.
- `src/js/compare/compare-view.js` — comparison table/presentation.

Browser-local keys:
- `visular.savedConcepts.v1`
- `visular.recentConcepts.v1`
- `visular.compareConcepts.v1`

## Key existing files
- `src/index.html` — application shell/views.
- `src/js/app.js` — top-level navigation/state/data orchestration.
- `src/js/concept/concept-view.js` — Quick/Deep concept renderer and Save/Compare controls.
- `src/js/media/*` — format-specific media rendering.
- `src/js/learning/*` — learning paths.
- `src/js/glossary/*` — glossary.
- `content/concepts/*/concept.json` — concept truth.
- `content/learning-paths/*.json` — learning sequences.
- `content/config/categories.json` — categories.
- `scripts/serve.ps1` — Windows local HTTP server.
- `scripts/validate-content.mjs` — content/relationship/path validation.
- `scripts/prepare-content.mjs` — derivatives/technical media metadata.
- `scripts/build.mjs` — production build.

## Validation commands
From a Node.js 20+ development environment:

```text
npm run content:prepare
npm run validate
npm run a11y
npm run ui
npm test
npm run build
npm run smoke
npm run check
```

`npm run check` is the main deterministic gate.

## v0.5.1 environment-verified state before packaging
Required/verified deterministic state:
- content validation passes with the 6 expected source-media warnings and 2 PDF information messages only;
- deterministic accessibility structure checks include Iteration 4 controls;
- UI static-integrity checks pass;
- 29 unit tests pass, including 50/100/250 concept scale tests and Iteration 4 local-state tests;
- production build passes with release-versioned JavaScript/CSS paths;
- HTTP/GitHub Pages smoke test passes with 98 requests at both site root and `/VisularAITerms/`, including the complete ES-module graph and media paths;
- clean ZIP extraction is revalidated before final delivery.

Automated headless Chromium navigation to the v0.5.1 localhost GitHub-Pages-style path was attempted but blocked by the ChatGPT execution environment with `ERR_BLOCKED_BY_ADMINISTRATOR`. Deterministic HTTP/module/path smoke testing succeeded; perform the documented Windows/GitHub Pages visual review after deployment.

## Recommended next-development workflow
When the user asks for Iteration 5 or another change:
1. inspect `HANDOFF.md`, `AGENTS.md`, the authoritative docs, and the actual current project;
2. start from this complete v0.5.1 project rather than reconstructing earlier versions;
3. define the requested scope and update the iteration spec;
4. make changes incrementally;
5. run deterministic validation/tests/build/smoke checks;
6. visually verify where the environment permits and explicitly state limitations otherwise;
7. update all affected docs and `HANDOFF.md`;
8. create a new complete app ZIP and a new complete handoff ZIP with the new version.
