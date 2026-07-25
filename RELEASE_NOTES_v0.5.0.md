# Release Notes — Visular AI Terms / Concepts v0.5.0

## Iteration 4 — Local Workspace and Concept Comparison

v0.5.0 adds lightweight repeat-use and decision-support tools while preserving the static, dependency-free application architecture.

### New
- Save/unsave concepts.
- Saved & Recent workspace stored only in the current browser.
- Up to 12 recent concepts, de-duplicated newest-first, with Clear recent.
- Add/remove concepts from a comparison selection.
- Compare up to three concepts side by side using existing concept learning and business-impact metadata.
- Shareable comparison route: `?view=compare&compare=<id1>,<id2>,<id3>`.
- Copy comparison link, remove individual concepts, and clear comparison.
- Comparison count in Explore navigation.
- Accessible pressed state for Save and Compare controls.

### Preserved
- Existing catalog/search/category/A–Z discovery.
- Quick View and Deep Dive.
- Learning Paths and Glossary.
- All five media types for both supplied concepts.
- Relationship/prerequisite/Learn Next and structured learning content.
- Safe publishing/validation/build tools.
- Root `start-server.bat`, prebuilt `dist/`, GitHub Pages deployment, HTTP byte-range support, and expected-client-disconnect handling.
- Six known source-media accessibility warnings plus two PDF information messages.
- Translation/localization remains excluded.

### Privacy and architecture
Saved, recent, and comparison state stores stable concept IDs in browser localStorage only. No accounts, backend, analytics, tracking, cookies, synchronization service, or runtime AI were introduced.
