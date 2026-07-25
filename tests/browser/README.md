# Browser and visual verification

Deterministic HTTP smoke coverage is available with `npm run smoke` after a build. It verifies the application shell, catalog, both supplied concept metadata files, and all local media/derived resource URLs.

For UI-affecting changes, also inspect real browser rendering at:
- 390 × 844
- 768 × 1024
- 1440 × 900
- 1920 × 1080 for material wide-screen changes

Verify category filters, A–Z controls, active-filter clearing, scroll behavior, concept status/related links, portrait and landscape video, PDF/document rendering, and keyboard focus. Automated code checks do not replace visual acceptance.
