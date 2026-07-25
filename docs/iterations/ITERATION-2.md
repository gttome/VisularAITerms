# Iteration 2 — Scalable Catalog and Safe Publishing (v0.3.0)

## Objective
Scale Visular AI Terms / Concepts from a two-concept reference into an architecture that can support dozens or hundreds of changing concepts while making routine content additions safer and easier.

## Pre-Iteration 2 improvement included
The content publishing process is now operational rather than advisory:
- safe draft scaffolding (`concept:new`);
- safe source-folder import (`concept:import`);
- no-overwrite behavior;
- derivative generation (`content:prepare`);
- draft exclusion from public catalog;
- end-to-end preparation/validation/build command (`content:publish`).

Normal additions still require a human/AI editor to complete semantic metadata and accessibility information. Automation does not invent unsupported content.

## Delivered catalog capabilities
- configurable categories/topic filtering;
- A–Z navigation;
- ranked search with exact title/acronym/alias priority;
- active-filter display/clearing;
- improved scalable catalog cards;
- concept statuses and replacement metadata;
- curated related concepts;
- shareable category route;
- generated compact catalog loading full metadata on selection only.

## Delivered maintenance capabilities
- schema version 3;
- category configuration validation;
- related/replacement reference validation and cycle detection;
- freshness and review metadata/reporting;
- media-size/build-size reporting;
- external source-media base URL readiness;
- content template;
- 50/100/250-concept scale tests.

## Explicitly not included
Backend/database/CMS, user accounts, analytics, favorites, recently viewed, AI chatbot, runtime AI generation, translations, learning paths, quizzes, custom PDF engine, service worker/offline mode, or framework migration.

## Acceptance criteria
1. Existing two concepts and all five media types remain usable.
2. Existing concept/media URLs remain valid.
3. Supplied logo and product name remain intact.
4. Category filters and A–Z navigation are metadata/configuration driven.
5. Search prioritizes exact title/acronym/alias matches.
6. Related/replacement references are stable-ID based and validated.
7. Draft imports cannot enter the public catalog accidentally.
8. Import refuses to overwrite an existing concept.
9. Content preparation creates required web derivatives without altering originals.
10. Normal new concepts do not require HTML/CSS/JavaScript edits.
11. Storage/freshness reports run deterministically.
12. 50/100/250 concept scale tests pass.
13. Validation, accessibility structure checks, unit tests, and production build pass.
14. GitHub workflows install dependencies deterministically with `npm ci` (currently dependency-free runtime/build package).
15. Complete v0.3.0 ZIP contains prebuilt `dist/` and root `start-server.bat`.
16. Clean extraction can be validated/built independently.
