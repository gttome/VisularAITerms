# Iteration 4 — Local Workspace and Concept Comparison (v0.5.0; maintenance fix v0.5.1)

## Objective
Make Visular AI Terms / Concepts more useful for repeated reference and decision support without introducing accounts, a backend, analytics, an LMS, or runtime AI.

## Delivered capabilities
### Saved & Recent workspace
- Users can save/unsave a concept from its concept page.
- A Saved & Recent view shows saved concepts and the 12 most recently viewed concepts.
- Recent history can be cleared from the UI.
- Saved/recent data is stored only in browser localStorage and is never sent to a server.
- Invalid/missing concept IDs are ignored when rendered.

### Concept comparison
- Users can add/remove concepts from a comparison set from a concept page.
- Up to three concepts may be compared at once.
- The Compare view uses concise existing concept metadata and does not load large media files.
- Comparison rows include plain-language explanation, key takeaway, primary risk, audience takeaways, business impact, and categories.
- Comparison selection persists locally.
- `?view=compare&compare=<id1>,<id2>,<id3>` is a shareable comparison route; routed IDs replace the local comparison selection after validation.
- The Compare view can copy its shareable URL and clear/remove selections.

### Navigation and usability
- Explore navigation now includes Saved and Compare.
- The Compare navigation control exposes the current comparison count.
- Save and Compare controls expose pressed state to assistive technology.
- Responsive layouts support the new workspace cards and horizontally scrollable comparison table.

## Architecture constraints retained
- Static HTML5, CSS, and vanilla JavaScript ES modules.
- No runtime dependencies.
- Normal concept additions remain metadata/content-only changes.
- No account, authentication, backend, database, cookies, analytics, telemetry, progress scoring, quizzes, certificates, or runtime AI.
- Translation/localization remains excluded unless explicitly requested.
- Existing concept/media/category/glossary/learning-path routes remain backward compatible.

## Acceptance criteria
1. Existing two supplied concepts and all five media types remain usable.
2. Existing routes remain valid.
3. Saving a concept persists in the same browser and can be removed.
4. Recent concepts are de-duplicated, newest-first, limited to 12, and clearable.
5. Comparison selection persists locally and is limited to three concepts.
6. A shareable comparison URL can reconstruct a valid comparison selection.
7. Compare does not require concept-specific application code and works from existing metadata.
8. Comparison does not load large media assets merely to render the table.
9. Save/Compare buttons expose accessible pressed state.
10. No analytics, network user-state storage, account system, or tracking service is introduced.
11. The six known source-media accessibility warnings and two PDF information messages remain unchanged and honest.
12. 50/100/250 concept catalog scale tests remain passing.
13. Deterministic validation, accessibility structure, UI integrity, unit tests, build, and HTTP smoke tests pass.
14. Translation functionality remains absent.
15. Complete release ZIP contains prebuilt `dist/`, root `start-server.bat`, and runs independently from earlier ZIPs.
16. Handoff documentation is updated for the current release.
17. Production JavaScript/CSS use release-versioned URLs so GitHub Pages cannot mix the Iteration 4 HTML shell with stale Iteration 3 frontend files.
18. Smoke validation covers both root hosting and a GitHub Pages project subdirectory.


## v0.5.1 maintenance fix — GitHub Pages frontend cache safety
The v0.5.0 production build kept the same JavaScript and CSS URLs used by v0.4.0. Because the Iteration 4 HTML added Save/Compare controls but the v0.4.0 JavaScript and CSS did not contain their handlers or pressed-state styling, a cached mixed-version deployment could display the controls without making them functional.

v0.5.1 publishes the complete frontend under a version-specific `static/<version>/` path and extends smoke coverage to a GitHub Pages project-path deployment. No Iteration 4 product behavior or local-storage model changed.
