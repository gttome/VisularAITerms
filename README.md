# Visular AI Terms / Concepts — Iteration 4 (v0.5.1)

A mobile-first multimedia AI reference for senior leaders and knowledge workers.

## Run on Windows 11

1. Extract the complete `VisularAITerms_v0.5.1.zip` to a normal local folder.
2. Double-click `start-server.bat`.
3. Your default browser opens to `http://localhost:4173/`.
4. Keep the PowerShell window open while using the site. Press `Ctrl+C` to stop it.

The runnable build is already included in `dist/`. **No Node.js, Python, npm, framework, or separate web-server installation is required simply to run the application.**

## v0.5.1 GitHub Pages fix

v0.5.1 gives each production release a version-specific JavaScript/CSS path (for example `static/0.5.1/`). This prevents GitHub Pages/browser caches from combining the new Iteration 4 HTML with older Iteration 3 frontend files, which could make Save and Compare appear but not respond.

## Iteration 4 highlights

- Added Save concept / Saved state on concept pages.
- Added a browser-local Saved & Recent workspace.
- Added de-duplicated recent concept history limited to 12 entries with Clear recent.
- Added Add to compare / Remove from compare controls.
- Added a side-by-side comparison view for up to three concepts.
- Added shareable comparison URLs using `?view=compare&compare=<concept-ids>`.
- Added Copy comparison link, remove, and clear comparison controls.
- Comparison uses existing concept metadata and does not load large media merely to render the table.
- Saved/recent/comparison state stays in the local browser; no account, backend, analytics, cookies, or telemetry were added.
- Existing Quick View, Deep Dive, Learning Paths, Glossary, catalog/search, relationships, multimedia, publishing tools, and Windows server reliability behavior remain intact.
- Translation/localization remains intentionally excluded unless explicitly requested.

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

The original supplied videos do not include source-accurate captions/transcripts and the original supplied audio does not include transcripts. Validation continues to report those six gaps. The supplied untagged PDFs retain readable concept-level alternatives.

## Handoff

`HANDOFF.md` is the authoritative cross-chat continuation summary. A separate complete handoff ZIP is produced with every major development handoff so a new ChatGPT conversation can resume without relying on inaccessible prior-chat context.

## Delivery standard

Every development release is a complete standalone project ZIP named `VisularAITerms_v<version>.zip`, contains a prebuilt `dist/`, and includes root-level `start-server.bat`. A newer version never depends on files from an older ZIP.
