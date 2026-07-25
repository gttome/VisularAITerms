# Quality Standard

## Accessibility
Target WCAG 2.2 AA for the application. Source-media accessibility remains a content-quality requirement and is reported honestly.

Redundant remediation banners remain removed from the normal user experience; validation warnings and useful readable alternatives remain.

Iteration 4 controls must expose meaningful labels and pressed state. Comparison tables use table headers and remain horizontally scrollable rather than forcing page overflow.

## Deterministic validation
Checks include:
- JSON/core schema version and stable IDs;
- duplicate titles/aliases;
- status/review/category validity;
- relationship/prerequisite/Learn Next/confusion/comparison targets;
- prerequisite and replacement cycles;
- learning-path IDs, duplicates, missing references, and non-current references;
- valid optional source URLs;
- media IDs/types/paths/URLs;
- accessibility status and image alt text;
- missing captions/transcripts as warnings rather than fabricated content;
- untagged-PDF alternative status;
- content freshness and unusually large source files.

## Iteration 4 local-state tests
Deterministic tests verify:
- saved concept toggle behavior;
- recent history de-duplication/order;
- three-concept comparison limit;
- replaceable comparison state for shareable URLs;
- additive comparison route convention;
- unchanged 50/100/250 concept filtering performance tests.

## Privacy
Saved, recent, and comparison state must remain browser-local. No analytics, tracking pixel, telemetry endpoint, account identifier, cookie, or remote persistence may be introduced without an approved requirement.

## Windows local-server reliability
Normal browser behaviour can cancel requests during media seeking, tab closing, navigation, or replacement loads. `scripts/serve.ps1` must silently treat expected connection reset/abort/disposed-stream cases as normal. Unexpected server exceptions remain warnings.

## Content freshness
Configured in `config/app.config.json`:
- 0–90 days: current
- 91–180 days: review recommended
- over 180 days: stale warning

## Scale testing
Synthetic deterministic tests continue to exercise 50, 100, and 250 concept catalogs. Saved/recent/compare behavior must remain ID-based and must not require changes to ordinary concept metadata.

## GitHub Pages deployment integrity
The production smoke test must verify:
- release-versioned JavaScript and CSS URLs in the built `index.html`;
- the complete ES-module import graph resolves from the versioned JavaScript namespace;
- catalog, learning-path, concept, and media URLs resolve when hosted at `/`;
- the same paths resolve when hosted below a GitHub Pages project prefix such as `/VisularAITerms/`.

This specifically guards against mixed-version deployments where new HTML is paired with cached older JavaScript/CSS.

## Visual checks
Review at 390×844, 768×1024, 1440×900, and for material changes at 1920×1080. Verify:
- Quick View / Deep Dive switching;
- Save/unsave and Add/Remove Compare states;
- Saved & Recent view and Clear recent;
- two- and three-column comparison behavior, removal, clearing, and share URL;
- comparison horizontal scrolling on small screens;
- copy/print controls;
- Learning Paths and Glossary;
- category/A–Z/search behavior;
- relationship/learning sections;
- media duration/page labels;
- transcript search when transcript fixtures exist;
- portrait/landscape video sizing;
- no horizontal page overflow outside intended comparison-table scrolling.

If the execution environment blocks browser navigation to localhost, record that limitation and rely on deterministic static/build/smoke checks plus human Windows review after extraction.

## Definition of Done
Implementation complete + acceptance criteria pass + content/a11y/UI/unit/scale checks pass + production build passes + HTTP smoke passes + docs/handoff updated + browser/visual review completed where possible + complete replacement ZIP produced with root-level `start-server.bat` and prebuilt `dist/` + clean extraction revalidated.
