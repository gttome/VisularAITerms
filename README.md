# Visular AI Terms / Concepts — Iteration 5 (v0.6.2)

A mobile-first multimedia AI reference for senior leaders and knowledge workers.

## Run on Windows 11

1. Extract the complete v0.6.2 project to a normal local folder.
2. Double-click `start-server.bat` or `2-TEST-APP.bat`.
3. Your default browser opens to `http://localhost:4173/`.
4. Keep the PowerShell window open while using the site. Press `Ctrl+C` to stop it.

The runnable build is already included in `dist/`. No Node.js, Python, npm, framework, or separate web-server installation is required simply to run the application.

## Current content and Learning Paths

v0.6.2 contains 8 browsable concepts and 3 curated Learning Paths:

- **AI Agents and Governance** — AI Agents and Agentic Workflows -> AI Governance, Risk Management, and Compliance.
- **Generative AI Engineering Foundations** — Generative AI Engineering Ecosystem -> Prompt Engineering -> Context Engineering.
- **Agentic Systems Engineering** — Harness Engineering -> Loop Engineering -> Graph Engineering.

Every browsable concept is represented in at least one Learning Path.

## One-click concept import on Windows 11

1. Copy 1-n new concept ZIPs into `concept-import/`.
2. Optional: place a curated `learning-path-plan.json` beside the ZIPs when the batch creates or changes Learning Paths.
3. Double-click `1-IMPORT-CONCEPTS.bat`.
4. The script validates the complete batch before commit, imports the concepts, updates local `dist/`, synchronizes Learning Paths, archives successful ZIPs, reports Learning Path coverage, and opens the app.
5. Test the concepts and Learning Paths locally.
6. After acceptance, double-click `3-PREPARE-GITHUB-UPDATE.bat`.

Each concept ZIP should contain one image, one MP4, one audio file, one PDF, and one TXT **or** DOCX briefing. TXT and DOCX both become a browser-readable **Read** resource. The routine importer refuses to overwrite an existing concept.

### Learning Path quality gate

Learning Paths are curated instructional sequences, so the importer does not invent a path or sequence when no path plan is supplied.

After every import, `learning-path-review/latest.txt` reports whether every browsable concept is represented in at least one Learning Path. `3-PREPARE-GITHUB-UPDATE.bat` will **not** create a GitHub package while any browsable concept remains unassigned.

Use `5-CHECK-LEARNING-PATHS.bat` at any time to run the same coverage check.

An optional batch plan uses this structure:

```json
{
  "schemaVersion": 1,
  "learningPaths": [
    {
      "schemaVersion": 1,
      "id": "example-learning-path",
      "title": "Example Learning Path",
      "description": "A curated sequence describing why these concepts should be learned in this order.",
      "audience": "all",
      "concepts": ["concept-one", "concept-two"]
    }
  ]
}
```

A plan can create a new path or replace an existing path definition by using the same path ID. It may reference concepts already in the app and concepts being imported in the same batch.

## Windows launchers

- `1-IMPORT-CONCEPTS.bat` — validate/import 1-n concept ZIPs and report Learning Path coverage.
- `2-TEST-APP.bat` — launch the current local build without changing content.
- `3-PREPARE-GITHUB-UPDATE.bat` — package the most recent import and current Learning Paths after all quality gates pass.
- `4-REPAIR-MEDIA-METADATA.bat` — repair missing video/audio duration and PDF page-count metadata.
- `5-CHECK-LEARNING-PATHS.bat` — verify Learning Path coverage for all browsable concepts.

## Development commands

```text
npm run concept:new -- "Concept Title"
npm run concept:import -- "C:\path\to\source-folder"
npm run content:prepare
npm run validate
npm run report
npm run paths
npm test
npm run build
npm run check
npm run content:publish
```

## Known source-content accessibility items

Do not fabricate missing accessibility material. Source videos/audio without authentic captions or transcripts continue to produce source-content warnings. Untagged PDFs use readable concept-level alternatives when supplied.

## Handoff and delivery standard

`HANDOFF.md` is the authoritative cross-chat continuation summary. Every development release remains a complete standalone project with root-level `start-server.bat` and prebuilt `dist/`. When the complete media project is too large for a single download, it is delivered as multiple ZIP parts that merge into the same project folder; small desktop maintenance updates may also be supplied for convenience.
