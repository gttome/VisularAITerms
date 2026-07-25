# AGENTS.md — Visular AI Terms / Concepts

## Purpose
Build and maintain a simple, data-driven multimedia AI reference for senior leaders and knowledge workers.

## Read first
- Cross-chat state/handoff: `HANDOFF.md`
- Product behavior: `docs/PRODUCT.md`
- Technical architecture: `docs/ARCHITECTURE.md`
- Content and publishing: `docs/CONTENT.md`
- Quality requirements: `docs/QUALITY.md`
- Active completed iteration: `docs/iterations/ITERATION-4.md`

## Architecture rules
1. Runtime is semantic HTML, CSS, and vanilla JavaScript ES modules.
2. Ordinary concept additions/updates must not require HTML/CSS/JS changes.
3. Runtime concept/media discovery comes from metadata, never filename inference.
4. The publishing importer may inspect file extensions only to create a safe draft; metadata becomes authoritative before runtime.
5. Query-string routing is authoritative for shareable concept/media/category/glossary/learning-path/comparison URLs.
6. Categories come from `content/config/categories.json`, not hard-coded UI lists.
7. Learning paths come from `content/learning-paths/*.json`, not hard-coded UI lists.
8. Relationships use stable concept IDs and validated relationship types.
9. Iteration 4 local workspace state stores stable concept IDs only in browser localStorage; do not introduce accounts, remote persistence, analytics, cookies, or telemetry without an approved requirement.
10. Comparison is limited to three concepts, and shareable comparison IDs must be validated against the published catalog.
11. No backend, authentication, analytics, cookies, or tracking without an approved requirement.
12. Keep runtime dependencies at zero unless a demonstrated requirement justifies one.
13. Large source media may move to external static hosting through configuration/absolute metadata URLs without changing media renderers.
14. Do not fabricate captions, transcripts, accessibility status, source evidence, translations, or source-file content.
15. Translation architecture/features 18–20 from the proposed Iteration 3 scope were explicitly excluded and must not be added unless the user later requests them.

## Product identity
- Application name: `Visular AI Terms / Concepts`
- Short package name: `VisularAITerms`
- Current version: `0.5.0`
- User-supplied logo: `src/assets/visular-ai-terms-logo-original.png`
- Optimized runtime logo: `src/assets/visular-ai-terms-logo.webp`

## New-concept workflow
Prefer the safe publishing tools rather than hand-building directories:
- `npm run concept:new -- "Concept Title"`
- `npm run concept:import -- "path-to-source-folder"`
- complete/review metadata;
- `npm run content:prepare -- --concept <id>`;
- `npm run validate`;
- `npm run build`;
- visually/accessibility review the result.

Draft concepts must remain excluded from the public catalog. Import must never overwrite an existing concept.

## Windows local-server requirement
`start-server.bat` must remain at the project root in every release. The included PowerShell server supports HTTP byte ranges and must treat expected client disconnects (browser-cancelled/aborted media requests) as normal rather than flooding the console with warnings. Real server errors must still be surfaced.

## Delivery rule for every development request
Every accepted development iteration must be packaged as a complete replacement ZIP, not a patch-only ZIP.
- ZIP filename: `VisularAITerms_v<version>.zip`.
- The ZIP contains the entire runnable project for that version.
- Root-level `start-server.bat` is mandatory in every iteration.
- `dist/` must be prebuilt so a Windows 11 user can extract the ZIP and run the app by double-clicking `start-server.bat`.
- New iterations update the visible application version and package version.
- Never require reconstruction from prior iteration ZIPs.
- For major handoffs, also provide a complete `VisularAITerms_Handoff_v<version>.zip` containing the full project plus continuation documentation.

## Validation before handoff
1. `npm run content:prepare`
2. `npm run validate`
3. `npm run a11y`
4. `npm run ui`
5. `npm test`
6. `npm run build`
7. HTTP smoke test from `dist/`
8. Visual/browser inspection at phone, tablet, and desktop widths when the execution environment permits browser navigation.
9. Extract the final ZIP into a clean directory and rerun deterministic checks/build.

## Scope control
Do not introduce frameworks, routers, state libraries, databases, build platforms, or external services simply for convenience. Major architecture changes require an ADR and corresponding authoritative-document updates.
