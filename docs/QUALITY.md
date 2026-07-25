# Quality Standard

## Accessibility
Target WCAG 2.2 AA for the application. Source-media accessibility remains a content-quality requirement and is reported honestly.

Iteration 3 removes redundant remediation banners from the user experience but does not suppress validation warnings or accessibility metadata. Readable alternatives remain available where useful.

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

## Windows local-server reliability
Normal browser behaviour can cancel requests during media seeking, tab closing, navigation, or replacement loads. `scripts/serve.ps1` must silently treat expected connection reset/abort/disposed-stream cases as normal. Unexpected server exceptions remain warnings.

## Content freshness
Configured in `config/app.config.json`:
- 0–90 days: current
- 91–180 days: review recommended
- over 180 days: stale warning

## Scale testing
Synthetic deterministic tests continue to exercise 50, 100, and 250 concept catalogs. Iteration 3 learning features must not require loading full concept/media content merely to browse.

## Visual checks
Review at 390×844, 768×1024, 1440×900, and for material changes at 1920×1080. Verify:
- Quick View / Deep Dive switching;
- copy/print controls;
- Learning Paths and Glossary;
- category/A–Z/search behavior;
- relationship/learning sections;
- media duration/page labels;
- transcript search when transcript fixtures exist;
- portrait/landscape video sizing;
- no horizontal page overflow.

If the execution environment blocks browser navigation to localhost, record that limitation and rely on deterministic static/build/smoke checks plus human Windows review after extraction.

## Definition of Done
Implementation complete + acceptance criteria pass + content/a11y/UI/unit/scale checks pass + production build passes + docs/handoff updated + browser/visual review completed where possible + complete replacement ZIP produced with root-level `start-server.bat` and prebuilt `dist/` + clean extraction revalidated.
