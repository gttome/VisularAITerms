# Architecture

## Runtime
Semantic HTML5 + CSS + vanilla JavaScript ES modules. No runtime framework and no runtime JavaScript dependency.

## Data flow
`generated catalog.json -> selected concept metadata -> concept view -> explicit media renderer`

Additional Iteration 3 data flow:
`content/learning-paths/*.json -> generated learning-paths.json -> Learning Paths view`

The generated catalog contains discovery/search/filter/glossary information. Full concept metadata loads only when a concept is selected.

## Routing
Backward-compatible query-string routes:
- `?concept=<stable-id>`
- `?concept=<stable-id>&media=<media-id>`
- `?category=<category-id>`

Iteration 3 additive routes:
- `?view=glossary`
- `?view=paths`
- `?view=paths&path=<learning-path-id>`

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
Root-level `start-server.bat` invokes `scripts/serve.ps1` with HTTP byte-range support. Iteration 3 adds expected-disconnect detection so normal browser-cancelled media/network writes do not generate repeated warnings. Unexpected server errors still warn.

## External media readiness
`config/app.config.json -> mediaStorage.baseUrl` remains blank by default. Original media may move to an external static origin later without changing runtime renderers.

## Build
The Node build:
1. copies `src/` into `dist/`;
2. stages concept metadata/derivatives/media or rewrites original-media URLs for an external origin;
3. generates `dist/data/catalog.json`;
4. generates `dist/data/learning-paths.json`;
5. prints content, accessibility, freshness, relationship, learning-path, and storage summaries.
