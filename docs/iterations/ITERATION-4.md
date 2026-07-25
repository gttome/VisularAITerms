# Iteration 4 — Content Operations, Editorial Control, Release Reliability, and Handoff Automation

**Planned application version:** 0.5.0  
**Status:** Approved planning scope for the next development chat. **Not yet implemented in v0.4.0.**

## Objective
Move Visular AI Terms / Concepts from a scalable learning application with a good publishing pipeline into a sustainable AI knowledge publishing system that can safely manage a continuously changing library of concepts over years.

Iteration 4 prioritizes content operations, editorial control, release reliability, GitHub deployment readiness, and repeatable cross-chat handoff. It should strengthen the existing static architecture rather than introduce a backend or CMS.

## Governing principle
Frequent content change belongs in the content/publishing layer. Application runtime architecture should remain stable unless evidence proves a change is necessary.

The intended flow is:

```text
New / updated content
        ↓
Publishing inbox
        ↓
Import preview / dry run
        ↓
Prepare + validate
        ↓
Editorial / accessibility review
        ↓
Content + media health reports
        ↓
Release check
        ↓
Build
        ↓
Application ZIP + Handoff ZIP
        ↓
GitHub Pages
```

# Must-Have Scope

## 1. Publishing inbox
Add a simple root-level or clearly documented staging area such as `incoming/` where a maintainer can place one or more new/updated concept folders without understanding the internal repository structure.

Example:

```text
incoming/
├── AI Hallucinations/
├── Embeddings/
└── Context Window/
```

The inbox is staging only. Its contents must never become public catalog content until explicitly imported and validated.

## 2. Batch concept import
Add a batch import command that can inspect and process multiple folders in one run. One invalid concept must not corrupt or overwrite other concepts.

Target command shape:

```text
npm run concepts:import
```

The report should distinguish imported, warning, skipped, and failed concepts.

## 3. Dry-run / import preview
Before any import changes the project, support a preview mode that reports:
- proposed concept ID/slug;
- detected source files and mapped media types;
- generated derivatives that would be created;
- existing-concept collisions;
- accessibility/content warnings;
- files that would be copied, replaced, or left unchanged.

Target command shape:

```text
npm run concepts:import -- --preview
```

A preview must make **no project changes**.

## 4. Automatic file recognition
Recognize supported incoming formats without requiring identical filenames:
- `.docx` -> document source;
- `.png`, `.jpg`, `.jpeg`, `.webp` -> image;
- `.mp4` -> video;
- `.m4a`, `.mp3` -> audio;
- `.pdf` -> presentation/document;
- `.vtt` -> captions;
- approved text/HTML transcript formats -> transcript.

Automation must not invent semantic content that the source does not support.

## 5. Existing-concept detection and no-silent-overwrite
If an incoming folder maps to an existing concept ID, the default behavior must be safe refusal or preview rather than replacement.

Supported explicit operations may include:
- update;
- replace selected media;
- cancel.

Ambiguity defaults to **cancel/no change**.

## 6. Safe update workflow
Support updates to existing concepts while preserving unchanged assets and stable concept IDs. Rebuild only derivatives affected by the source change where practical.

## 7. Content difference report
Before publishing an existing-concept update, generate a meaningful report such as:
- metadata fields changed;
- media replaced/added/removed;
- content version changed;
- last-reviewed information changed;
- derivatives regenerated.

The report must compare actual project state rather than rely only on filenames.

## 8. Editorial/content health dashboard
Generate a static report summarizing concept readiness, including at minimum:
- production ready;
- needs review;
- accessibility remediation;
- stale/review overdue;
- draft.

The report should name affected concepts and specific reasons.

## 9. Source/evidence audit
Operationalize the source metadata added in Iteration 3. Provide checks for malformed URLs, duplicate sources, missing titles/publishers where required, and unreachable URLs when network access is available.

Network failures should usually produce review warnings rather than silently deleting or blocking otherwise valid content unless the project explicitly marks the source as required.

## 10. Review and freshness management
Support per-concept review cadence and next-review information rather than relying only on one global age threshold.

Example:

```json
"review": {
  "frequencyDays": 90,
  "lastReviewed": "2026-07-24",
  "nextReview": "2026-10-22"
}
```

Generate prioritized overdue/review-soon reports.

## 11. Media health audit
Generate a deterministic media report covering:
- file count and total size;
- missing/broken references;
- unsupported files;
- unusually large media;
- missing posters/derivatives;
- missing image alt text;
- missing captions/transcripts;
- PDF accessibility status where metadata is available.

## 12. Unified release gate
Create one authoritative release command, target shape:

```text
npm run release:check
```

It should run the relevant deterministic gates, including preparation, schema/content/relationship validation, learning-path validation, media/content audits, build, unit tests, static accessibility checks, UI integrity, scale regression, and HTTP smoke testing.

It must end with an unambiguous PASS/FAIL summary and blocking-error count.

## 13. Automated complete application packaging
Automate the permanent delivery requirement so packaging is not dependent on manual ZIP assembly.

Target command shape:

```text
npm run package
```

Expected output:

```text
VisularAITerms_v0.5.0.zip
```

The package must include the entire current project, all current content/media, prebuilt `dist/`, documentation, tests, scripts, and root-level `start-server.bat`. It must run independently of earlier ZIPs.

## 14. Automated complete handoff packaging
Add:

```text
npm run package:handoff
```

Expected output:

```text
VisularAITerms_Handoff_v0.5.0.zip
```

The handoff ZIP is also a complete runnable project and additionally contains the current handoff summary, new-chat instructions, authoritative planning material, known issues, validation state, and current GitHub/deployment guidance.

## 15. Windows server reliability regression tests
Protect the v0.4.0 client-disconnect fix permanently. Test the server contract for:
- byte-range responses;
- MP4/M4A seek compatibility;
- missing files;
- expected client disconnect/abort handling;
- continued service after a cancelled connection.

## 16. Port-conflict handling
Improve `start-server.bat` / `serve.ps1` so if port 4173 is already in use, the launcher selects the next acceptable port (for example 4174) and opens/displays the actual URL.

The user should not need to manually edit a script to recover from a normal port conflict.

## 17. Version consistency validation
A release must fail if the version disagrees across authoritative release surfaces such as:
- `package.json`;
- application configuration/UI where applicable;
- release manifest;
- README/release notes/handoff metadata where machine-checkable;
- ZIP package name.

# Should-Have Scope

## 18. Duplicate media detection
Hash source media and report exact duplicate assets across concepts. Report only; do not automatically delete or deduplicate files.

## 19. Storage planning dashboard
Expand current storage reporting into a clear breakdown of application, images, video, audio, PDF, document, and generated deployment size. Continue using a project planning threshold below the GitHub Pages hard limit.

## 20. External-media export preparation
Provide a controlled export command such as:

```text
npm run media:export
```

that produces a static media bundle and manifest for a future external host. It must not automatically upload content or rewrite production URLs without explicit approval.

## 21. Release manifest/build provenance
Generate a release manifest with application version, build timestamp, schema version, concept count, media count, validation status, and other useful machine-known release facts.

## 22. Project doctor
Add:

```text
npm run doctor
```

for development-environment/project checks such as Node version, required files, dependencies, schemas, build directory, startup files, workflow files, and version consistency.

## 23. Recently Updated and Emerging Concepts
Use existing metadata to add modest discovery sections for recently updated and emerging concepts. Keep the home experience focused and avoid turning it into a marketing portal.

## 24. Learning-path overview refinements
Show useful path metadata such as concept count, approximate known media/reading time where reliable, intended audience, and concise sequence.

## 25. Improved startup console
Make the Windows launch output clean and informative, showing product/version, actual URL, browser launch status, and Ctrl+C stop instruction while keeping expected network noise silent and real errors visible.

# Later / Explicitly Not Required in Iteration 4
Do not add these merely because they are possible:
- browser-based CMS/admin UI;
- user accounts/authentication;
- database/backend;
- ratings/comments;
- favorites or synchronized user history;
- progress tracking/certificates/quizzes;
- runtime AI/chatbot/API calls;
- analytics/tracking;
- automatic AI-generated concept content;
- automatic translation/multilingual support;
- complex ontology/knowledge-graph engine;
- React/Vue/Svelte or other framework migration.

The earlier user instruction excluding translation functionality remains in force unless explicitly reversed.

# GitHub / Deployment Work During Iteration 4
The repository already contains GitHub Actions workflows for validation and Pages deployment. Iteration 4 should preserve and, where useful, strengthen them rather than replace them without evidence.

The separate `handoff/VisularAITerms_GitHub_Setup_and_Deployment_Guide_v1.0.docx` and `handoff/GITHUB_SETUP_AND_DEPLOYMENT.md` documents describe the recommended initial GitHub repository setup for the current v0.4.0 baseline. Iteration 4 should assume that GitHub Pages may be used as the public test/review environment.

# Proposed Implementation Sequence
1. Establish Iteration 4 spec and test baseline from v0.4.0.
2. Add publishing inbox + preview/dry-run model.
3. Add batch import and existing-concept update safety.
4. Add content diff, content health, source, freshness, and media audits.
5. Add unified `release:check`.
6. Add version consistency, release manifest, and project doctor.
7. Add automated application and handoff packaging.
8. Add server port-conflict handling and permanent server regression coverage.
9. Add should-have storage/duplicate/export/discovery refinements that fit without destabilizing the release.
10. Run clean extraction, rebuild, HTTP smoke, and package integrity checks.
11. Update all authoritative documentation and cross-chat handoff.

# Iteration 4 Acceptance Criteria
Iteration 4 is complete only when:

1. v0.4.0 functionality and all original multimedia remain available.
2. A maintainer can stage multiple new concept folders in a simple publishing inbox.
3. Batch import supports a true no-change preview/dry run.
4. Invalid or conflicting concepts cannot silently overwrite production content.
5. Existing concepts can be intentionally updated with a meaningful change report.
6. Content health, freshness/review, source/evidence, and media health reports are available.
7. Duplicate exact media can be reported without automatic deletion.
8. The unified release gate returns clear blocking errors/warnings and prevents packaging on blocking failure.
9. Application version consistency is machine-validated.
10. A release manifest/build provenance record is generated.
11. `npm run package` creates the complete standalone `VisularAITerms_v0.5.0.zip`.
12. `npm run package:handoff` creates the complete standalone `VisularAITerms_Handoff_v0.5.0.zip` with current continuation materials.
13. Both generated ZIPs contain root-level `start-server.bat` and prebuilt `dist/`.
14. The Windows local server preserves byte-range support and expected-disconnect suppression.
15. Port 4173 conflict handling works without requiring the user to edit a script.
16. Existing deterministic unit, accessibility, UI, scale, build, and HTTP smoke tests remain passing.
17. New Iteration 4 deterministic tests pass.
18. Clean extraction of each package can be independently validated.
19. GitHub Pages workflow remains functional for the static application.
20. Translation functionality remains absent unless the user explicitly changes that requirement.

# Definition of Done
The next development chat should implement Iteration 4 as **VisularAITerms v0.5.0**, not merely create prototypes. The final output must be a complete validated v0.5.0 application ZIP and complete validated v0.5.0 handoff ZIP.
