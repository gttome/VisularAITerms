# Visular AI Terms / Concepts — Cross-Chat Development Handoff

## Read this first in a new ChatGPT conversation
This file is designed so development can continue even when the prior chat is unavailable. Treat the files in this project as the current source of truth. Do not assume details from an inaccessible earlier conversation that conflict with these files.

## Current release
- Application: **Visular AI Terms / Concepts**
- Short package name: **VisularAITerms**
- Current version: **0.4.0**
- Completed development milestone: **Iteration 3 — Learning Effectiveness**
- Next approved development milestone: **Iteration 4 — Content Operations, Editorial Control, Release Reliability, and Handoff Automation** (planned for v0.5.0; not yet implemented)
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
- Therefore validation currently reports **6 expected warnings** plus PDF information messages.

Iteration 3 intentionally removed redundant visible warnings such as:
- concept-level banner saying the MP4 has no subtitle stream / PDF is untagged;
- "Transcript not yet available for the supplied source audio/video" blocks;
- normal media-status accessibility warning text.

The underlying metadata/validation remains.

## Windows local-server reliability fix in v0.4.0
The v0.3.0 PowerShell server could print repeated warnings such as:
`Unable to write data to the transport connection` / `connection was forcibly closed` when browsers cancelled media/network requests.

v0.4.0 adds `Test-ExpectedClientDisconnect` in `scripts/serve.ps1` to suppress expected connection reset/abort/disposed-stream cases while retaining real warnings. HTTP byte-range support remains.

## Architecture authority
Read in this order when implementing:
1. current explicit user request;
2. `docs/PRODUCT.md` for product behavior;
3. `docs/ARCHITECTURE.md` for technical structure;
4. `docs/CONTENT.md` and `content/schema/*.json` for data/content rules;
5. `docs/QUALITY.md` for acceptance/quality;
6. current iteration specification under `docs/iterations/`;
7. `AGENTS.md` for coding-agent workflow and repository rules.

## Current v0.4.0 product capabilities
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

## Iteration 3 translation decision
The user explicitly instructed: **Leave Translation-Ready, But Limited (18, 19, 20) out of the iteration.**

Therefore v0.4.0 does NOT include:
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

## Key files
- `src/index.html` — application shell/views.
- `src/js/app.js` — top-level navigation/state/data orchestration.
- `src/js/concept/concept-view.js` — Quick/Deep concept renderer.
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

## Current environment-verified state before packaging
The v0.4.0 working tree was required to pass:
- content validation with the 6 expected source-media warnings only;
- deterministic accessibility structure checks;
- UI static-integrity checks;
- unit tests including 50/100/250 concept scale tests and Iteration 3 data tests;
- production build;
- HTTP application/data/media smoke test;
- clean ZIP extraction and revalidation before final delivery.

Automated Chromium/Playwright navigation to localhost may be blocked by the ChatGPT execution environment with `ERR_BLOCKED_BY_ADMINISTRATOR`; this is an environment limitation rather than an application HTTP failure. Record it honestly when it occurs.

## Approved Iteration 4 planning state
The user has approved moving into Iteration 4 in a new ChatGPT conversation. The full approved planning scope is authoritative in:

`docs/iterations/ITERATION-4.md`

Iteration 4 is **planned, not implemented** in this v0.4.0 baseline. The new chat should begin from the current known-good v0.4.0 application, implement Iteration 4 incrementally, and target **VisularAITerms v0.5.0**.

The iteration emphasizes:
- publishing inbox + batch import;
- dry-run/import preview;
- safe existing-concept update detection and content diff reporting;
- content/source/freshness/media health reporting;
- unified `release:check`;
- automated complete application ZIP packaging;
- automated complete handoff ZIP packaging;
- Windows server regression + port-conflict handling;
- version consistency/release manifest/project-doctor support;
- storage planning and external-media export preparation where it fits safely.

Translation functionality remains explicitly excluded unless the user later requests it.

## GitHub repository and Pages deployment
The user also wants to place the project and assets in a GitHub repository and share a public test link. The current repository already includes GitHub Actions validation and Pages deployment workflows. Detailed current setup instructions are included in:

- `handoff/GITHUB_SETUP_AND_DEPLOYMENT.md`
- `handoff/VisularAITerms_GitHub_Setup_and_Deployment_Guide_v1.0.docx`

Recommended repository name: `VisularAITerms`. The existing workflow expects GitHub Pages to use **GitHub Actions** as the publishing source and deploys generated `dist/`.

## Recommended next-development workflow
When the user begins the approved Iteration 4 development:
1. inspect `HANDOFF.md`, `AGENTS.md`, the authoritative docs, and the actual current project;
2. start from this complete v0.4.0 project rather than reconstructing earlier versions;
3. define the requested scope and update the iteration spec;
4. make changes incrementally;
5. run deterministic validation/tests/build/smoke checks;
6. visually verify where the environment permits and explicitly state limitations otherwise;
7. update all affected docs and `HANDOFF.md`;
8. create a new complete app ZIP and a new complete handoff ZIP with the new version.
