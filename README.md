# Visular AI Terms / Concepts — Iteration 3 (v0.4.0)

A mobile-first multimedia AI reference for senior leaders and knowledge workers.

## Run on Windows 11

1. Extract the complete `VisularAITerms_v0.4.0.zip` to a normal local folder.
2. Double-click `start-server.bat`.
3. Your default browser opens to `http://localhost:4173/`.
4. Keep the PowerShell window open while using the site. Press `Ctrl+C` to stop it.

The runnable build is already included in `dist/`. **No Node.js, Python, npm, framework, or separate web-server installation is required simply to run the application.**

The v0.4.0 local server also suppresses expected browser-aborted connection messages (for example, when media requests are cancelled or replaced) while still surfacing real server failures.

## Iteration 3 highlights

- Added Quick View and Deep Dive concept modes.
- Added simple explanations, executive takeaways, knowledge-worker takeaways, key takeaways, and primary-risk summaries.
- Added structured concept relationships, prerequisites, Learn Next, and optional comparison/confusion metadata.
- Added metadata-driven Learning Paths and a compact Glossary view.
- Added structured examples, business-impact fields, Questions to Ask, and optional source/evidence metadata.
- Added media duration/page information to learning choices.
- Added Copy Link, Copy Definition, and print-friendly concept briefs.
- Added transcript-search behavior when source-accurate transcripts are supplied.
- Expanded content validation for relationship targets, prerequisite cycles, learning-path references, source URLs, and Iteration 3 learning fields.
- Expanded media preparation with best-effort technical metadata extraction and file-size capture.
- Removed redundant user-facing accessibility/remediation banners while retaining accessibility metadata, validation warnings, and useful readable alternatives.
- Translation work proposed previously for Iteration 3 was intentionally excluded at the user's request.

## Adding a concept

### Option A — start from a title

```text
npm run concept:new -- "Large Language Models"
```

### Option B — import a source folder safely

```text
npm run concept:import -- "C:\path\to\Large Language Models"
```

Then complete the draft metadata and run:

```text
npm run content:prepare -- --concept large-language-models
npm run validate
npm run build
```

`content:prepare` creates/updates image derivatives, thumbnails, a branded video poster when needed, DOCX web HTML, file sizes, and technical media metadata when local tooling can determine it. Source files remain preserved.

## Complete publishing gate

```text
npm run content:publish
```

This runs preparation -> validation -> production build. It stops safely on structural validation errors. Human visual/content/accessibility review remains required before release.

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

The original supplied videos do not include source-accurate captions/transcripts and the original supplied audio does not include transcripts. Validation continues to report those six gaps. The application no longer repeats those known remediation messages in prominent user-facing banners. The supplied untagged PDFs retain readable concept-level alternatives.

## Handoff

`HANDOFF.md` is the authoritative cross-chat continuation summary. A separate complete handoff ZIP is produced with every major development handoff so a new ChatGPT conversation can resume without relying on inaccessible prior-chat context.

## Delivery standard

Every development release is a complete standalone project ZIP named `VisularAITerms_v<version>.zip`, contains a prebuilt `dist/`, and includes root-level `start-server.bat`. A newer version never depends on files from an older ZIP.
