# Changelog

## v0.5.1 — Iteration 4 maintenance fix

- Fixed a GitHub Pages/browser cache compatibility issue that could display the new Iteration 4 Save/Compare controls while reusing stale v0.4.0 JavaScript/CSS, leaving the buttons inactive and without pressed-state styling.
- Production builds now publish JavaScript and CSS beneath a release-versioned `static/<version>/` namespace so each release receives distinct frontend URLs.
- Extended HTTP smoke validation to verify the complete ES-module graph, versioned stylesheets, application data, and media paths at both `/` and a GitHub Pages project prefix (`/VisularAITerms/`).
- Preserved all Iteration 4 localStorage behavior, static architecture, existing content/media, and known accessibility reporting.

## v0.5.0 — Iteration 4

- Added browser-local Save/unsave concept behavior and a Saved & Recent workspace.
- Added de-duplicated recent history limited to 12 concepts with Clear recent.
- Added local comparison selection limited to three concepts.
- Added a side-by-side comparison view using existing concept learning and business-impact metadata without loading large media.
- Added shareable comparison routing with validated concept IDs plus copy-link/remove/clear controls.
- Added comparison count navigation and accessible pressed state for Save/Compare controls.
- Added deterministic Iteration 4 workspace/comparison tests and additive routing/accessibility checks.
- Preserved the static vanilla-JavaScript architecture, existing media/content schema, GitHub Pages target, Windows server behavior, known accessibility warnings, and explicit translation exclusion.

## v0.4.0 — Iteration 3

- Hardened the Windows PowerShell static server to ignore expected browser-cancelled/reset connections while preserving real warnings and byte-range media support.
- Removed redundant visible remediation banners and missing-transcript placeholders while retaining validation warnings and readable alternatives.
- Added Quick View and Deep Dive concept modes.
- Added simple explanations, executive and knowledge-worker takeaways, key takeaways, and primary-risk summaries.
- Added schema-v4 structured examples, business impact, Questions to Ask, relationships, prerequisites, Learn Next, commonly-confused/comparison support, and optional sources.
- Added JSON-driven Learning Paths and a generated Glossary view.
- Added media duration/page labels, Copy Link, Copy Definition, print-friendly briefs, and transcript search when transcripts exist.
- Added learning-path generation/validation, prerequisite-cycle checks, expanded relationship/source validation, and best-effort media metadata extraction.
- Expanded automated unit coverage while retaining 50/100/250 concept scale tests.
- Explicitly excluded proposed Translation-Ready items 18–20 at the user's request.
- Added complete cross-chat handoff documentation.

### Known source-content accessibility gaps

The original supplied videos still lack source-accurate captions/transcripts and the original supplied audio still lacks transcripts. These six issues remain validation warnings. The two untagged PDFs retain readable concept-level alternatives.

## v0.3.0 — Iteration 2

- Added a safe new-concept publishing workflow before catalog scaling:
  - `concept:new` scaffolds a draft concept.
  - `concept:import` imports a folder of supported source media into a new draft and never overwrites existing content.
  - `content:prepare` creates image derivatives/thumbnails, branded video posters when absent, and safe browser-readable DOCX HTML.
  - `content:publish` runs preparation -> validation -> build and stops safely on errors.
- Added configurable topic categories in `content/config/categories.json`.
- Added category filtering, A–Z navigation, active-filter chips, and contextual result counts.
- Added ranked search prioritizing exact titles, acronyms/aliases, title prefixes, keywords, and other matching content.
- Added concept statuses (`emerging`, `updated`, `deprecated`, `archived`) plus replacement/supersession handling.
- Added curated related-concept navigation.
- Added schema version 3 with category, relationship, status, version, and review metadata.
- Added relationship validation including missing targets and replacement-cycle detection.
- Added content freshness and storage-health reports.
- Added external original-media base URL readiness without changing media renderers.
- Added synthetic 50/100/250-concept scale tests.
- Updated GitHub validation/deployment workflows and all authoritative project documentation.
- Preserved the user-supplied Visular logo, all original supplied media, backward-compatible concept/media routes, the complete-ZIP delivery rule, prebuilt `dist/`, and root-level `start-server.bat`.

### Known source-content accessibility gaps

The original supplied videos have no source-accurate captions/transcripts, and the original supplied audio files have no source-accurate transcripts. These remain explicit warnings. The two supplied untagged PDFs retain accessible concept-level alternatives.

## v0.2.0 — Iteration 1

- Renamed the application to **Visular AI Terms / Concepts**.
- Added the user-supplied Visular logo to the UI; original and optimized files are included.
- Expanded search across titles, definitions, aliases, keywords, and categories with match highlighting and clear-search behavior.
- Added content version, review status, freshness metadata, user-centered media labels, and structured accessibility metadata.
- Added accessible concept-briefing alternatives for the supplied untagged PDFs.
- Added deterministic accessibility structure checks and build summary reporting.
