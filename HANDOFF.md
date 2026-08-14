# Visular AI Terms / Concepts — Cross-Chat Development Handoff

## Current release
- Application: **Visular AI Terms / Concepts**
- Short package name: **VisularAITerms**
- Current version: **0.6.2**
- Completed milestone: **Iteration 5 — One-Click Batch Concept Import**, with v0.6.1 media-metadata and v0.6.2 Learning-Path maintenance corrections
- Runtime: static HTML5 + CSS + vanilla JavaScript ES modules
- Hosting target: GitHub Pages
- Windows normal launch: `start-server.bat` or `2-TEST-APP.bat`
- Windows concept import: `1-IMPORT-CONCEPTS.bat`
- Production build: `dist/`

## Permanent delivery requirements
1. Development releases must preserve a complete standalone current project, not rely on an older project.
2. Root `start-server.bat` and prebuilt `dist/` are mandatory.
3. When the complete project is too large for one downloadable ZIP, use multiple mergeable ZIP parts and also provide a small desktop updater when appropriate.
4. Preserve the official application name and supplied Visular logo unless explicitly changed.
5. Routine concepts remain content/metadata operations; they must not require routine HTML/CSS/JavaScript edits.
6. Translation/localization remains excluded unless explicitly requested.

## Current browsable concepts — 8
1. AI Agents and Agentic Workflows
2. AI Governance, Risk Management, and Compliance
3. Generative AI Engineering Ecosystem
4. Prompt Engineering
5. Context Engineering
6. Harness Engineering
7. Loop Engineering
8. Graph Engineering

## Current curated Learning Paths — 3
### AI Agents and Governance
AI Agents and Agentic Workflows -> AI Governance, Risk Management, and Compliance

### Generative AI Engineering Foundations
Generative AI Engineering Ecosystem -> Prompt Engineering -> Context Engineering

### Agentic Systems Engineering
Harness Engineering -> Loop Engineering -> Graph Engineering

All 8 browsable concepts are represented in at least one path.

## v0.6.2 Learning Path publishing rule
Learning Paths are curated instructional content and must not be invented from categories or keywords. The Windows workflow now enforces a separation between **local import/testing** and **publishing approval**:

- `1-IMPORT-CONCEPTS.bat` imports 1-n valid concept ZIPs and then reports Learning Path coverage.
- If a new concept is not yet assigned to a Learning Path, local testing is allowed and `learning-path-review/latest.txt` identifies it.
- `3-PREPARE-GITHUB-UPDATE.bat` blocks GitHub packaging until every browsable concept belongs to at least one Learning Path.
- `5-CHECK-LEARNING-PATHS.bat` runs the same coverage check on demand.
- `content/learning-paths/*.json` remains the authoritative path definition set.

### Optional one-click Learning Path plan
A batch may also include `concept-import/learning-path-plan.json`. The plan contains complete Learning Path definitions to create or replace during the same import. This lets a curated batch remain one-click without asking the importer to infer instructional sequencing.

## Routine concept package contract
Each concept ZIP contains:
- one PNG/JPG/JPEG/WEBP image;
- one MP4 video;
- one M4A/MP3/WAV audio file;
- one PDF;
- one TXT or DOCX briefing.

The importer validates all ZIPs before commit, refuses to overwrite existing concept IDs/titles, generates derivatives/readable HTML, captures media duration/page metadata, updates the local catalog, archives successful inputs, and records the most recent import for GitHub packaging.

## Accessibility rule
Do not fabricate captions, transcripts, tagged-PDF status, sources, or other accessibility/evidence content merely to clear warnings. Preserve authentic source limitations and provide readable alternatives where available.

## Architecture authority
Implement in this order:
1. current explicit user request;
2. `docs/PRODUCT.md`;
3. `docs/ARCHITECTURE.md`;
4. `docs/CONTENT.md` and `content/schema/*.json`;
5. `docs/QUALITY.md`;
6. current iteration spec;
7. `AGENTS.md`.

## Validation gate
From Node.js 20+ development/CI environments:

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

The complete v0.6.2 source package must pass this gate before packaging. Windows `.bat`/PowerShell execution requires final user-side Windows 11 verification.

## Next normal workflow
For the next 1-n concepts:
1. validate the concept ZIPs;
2. decide whether they belong in an existing Learning Path or require a new/changed path;
3. if path definitions change, provide `learning-path-plan.json` with the batch;
4. place ZIPs (and optional plan) in `concept-import/`;
5. run `1-IMPORT-CONCEPTS.bat`;
6. test concepts and Learning Paths locally;
7. run `5-CHECK-LEARNING-PATHS.bat` if desired;
8. run `3-PREPARE-GITHUB-UPDATE.bat` only after coverage and local testing pass.
