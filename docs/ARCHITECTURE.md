# Architecture

## Runtime
Semantic HTML5 + CSS + vanilla JavaScript ES modules. No runtime framework and no runtime JavaScript dependency.

## Data flow
`generated catalog.json -> selected concept metadata -> concept view -> explicit media renderer`

Learning data flow:
`content/learning-paths/*.json -> generated learning-paths.json -> Learning Paths view`

Iteration 4 local utility flow:
`catalog/concept IDs <-> browser localStorage -> Saved & Recent / Compare views`

The generated catalog contains discovery/search/filter/glossary information. Full concept metadata loads only when a concept is selected or when the user opens a comparison containing that concept. Large media is not loaded for comparison.

## Routing
Backward-compatible query-string routes:
- `?concept=<stable-id>`
- `?concept=<stable-id>&media=<media-id>`
- `?category=<category-id>`
- `?view=glossary`
- `?view=paths`
- `?view=paths&path=<learning-path-id>`

Iteration 4 additive routes:
- `?view=saved` — local Saved & Recent workspace.
- `?view=compare&compare=<id1>,<id2>,<id3>` — shareable concept comparison.

No synthetic path routing or GitHub Pages rewrite rules are required.

## Catalog and learning architecture
- One `concept.json` per concept.
- `content/config/categories.json` governs topic labels/order.
- `content/learning-paths/*.json` governs curated learning sequences.
- `scripts/generate-catalog.mjs` creates compact discovery data.
- `scripts/generate-learning-paths.mjs` creates the public learning-path payload.
- Draft concepts are excluded from the public catalog.

## Concept relationships
Schema version 4 supports stable-ID relationships, prerequisites, Learn Next, commonly-confused references, and optional comparison data. Relationships are metadata; the runtime renders them without embedding concept IDs in application code.

## Local workspace state
`src/js/workspace/personal-store.js` owns three versioned browser-local ID lists:
- `visular.savedConcepts.v1`
- `visular.recentConcepts.v1`
- `visular.compareConcepts.v1`

Rules:
- storage failures degrade to in-memory state for the current page session;
- recent entries are de-duplicated and limited to 12;
- comparison is limited to 3;
- comparison IDs from the URL are validated against the published catalog;
- no content bodies, notes, credentials, or sensitive information are stored;
- no local workspace state is transmitted to a service.

## Quick View / Deep Dive
The concept renderer owns presentation depth. Quick View is default for a direct concept URL without a media parameter. A direct URL containing `media=` opens Deep Dive to preserve existing shareable media behavior.

## Publishing architecture
Routine source content belongs in `content/`, not application source.

Safe content path:
`source folder -> draft import/scaffold -> metadata review -> content preparation -> validation -> catalog/path generation -> visual/accessibility review -> release`

`content:prepare` creates/refreshes derivatives and records file-size/technical media metadata where available. It never fabricates semantic content, captions, transcripts, translations, or evidence.

## Media
The five established types remain independent renderers: image, video, audio, PDF, and DOCX-derived HTML. Video/audio use native browser controls. PDF uses the browser viewer plus a readable alternative when supplied. Transcript search is activated only when a transcript exists.

## Windows local server
Root-level `start-server.bat` invokes `scripts/serve.ps1` with HTTP byte-range support and expected-disconnect detection so normal browser-cancelled media/network writes do not generate repeated warnings. Unexpected server errors still warn.

## External media readiness
`config/app.config.json -> mediaStorage.baseUrl` remains blank by default. Original media may move to an external static origin later without changing runtime renderers.

## Build
The Node build:
1. copies `src/` into `dist/`;
2. moves JavaScript and CSS into a release-versioned frontend namespace such as `dist/static/0.5.1/js/` and `dist/static/0.5.1/css/`, then rewrites `dist/index.html` to those URLs;
3. stages concept metadata/derivatives/media or rewrites original-media URLs for an external origin;
4. generates `dist/data/catalog.json`;
5. generates `dist/data/learning-paths.json`;
6. prints content, accessibility, freshness, relationship, learning-path, and storage summaries.

### GitHub Pages cache safety
Release-versioned frontend paths are required because GitHub Pages and browsers may legitimately reuse same-URL JavaScript/CSS across deployments. A new application version must therefore produce new frontend URLs. This prevents a new HTML shell from running stale JavaScript or stale component styling. Relative ES-module imports remain valid because the complete `js/` tree moves together under the versioned namespace.
