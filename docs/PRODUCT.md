# Product Specification

## Product
**Visular AI Terms / Concepts** is a multimedia learning/reference viewer for senior leaders and knowledge workers.

## Core journey
Find or browse a concept -> understand it quickly -> choose the depth/format -> save or compare it when useful -> see how it connects -> continue learning or return to the catalog.

## Discovery
- Ranked search across titles, short titles, acronyms/aliases, keywords, category labels, summaries, definitions, and classification.
- Topic/category filters driven by content configuration.
- A–Z navigation and active-filter controls.
- Glossary view for compact scanning.
- Learning Paths for short curated sequences where concept order matters.

## Concept learning experience
### Quick View
Designed for rapid comprehension:
- Explain it simply.
- Senior-leader takeaway.
- Knowledge-worker takeaway.
- Key takeaway.
- Primary risk.
- Available learning formats with known duration/page metadata.

### Deep Dive
Provides the full reference experience:
- complete definition and audience relevance;
- business impact;
- multimedia resources;
- structured examples;
- misconception, opportunities, risks, Questions to Ask, and monitoring guidance;
- relationships, prerequisites, Learn Next, optional comparisons/confusions, related concepts, and optional sources.

## Learning paths
Learning paths are curated JSON content, not algorithmic recommendations. The initial path connects AI Agents to AI Governance. Adding/reordering paths does not require application code changes.

## Saved & Recent
Iteration 4 adds a lightweight local workspace:
- Save/unsave concepts for quick return.
- Show up to 12 recently viewed concepts, newest first.
- Clear recent history from the application.
- Saved and recent state exists only in browser localStorage; it is not synchronized, transmitted, or used as analytics.

## Concept comparison
- Add up to three concepts to a comparison set.
- Compare existing learning/decision fields side by side without loading large media.
- Persist the working comparison locally.
- Share a comparison with `?view=compare&compare=<id1>,<id2>,<id3>`.
- Routed comparison IDs are validated against the published catalog before use.

## Sharing/utility
- Concept and media URLs remain shareable.
- Comparison URLs are shareable.
- Copy Link and Copy Definition are available.
- Browser print produces a clean concept brief and can be saved as PDF.

## Accessibility presentation
Known source-media remediation issues remain in metadata/validation. Redundant user-facing warning banners are intentionally removed. Useful alternatives, such as readable text for untagged PDFs, remain available.

## Deliberately out of scope in v0.5.0
Accounts, authentication, cross-device synchronization, analytics/telemetry, progress scoring/tracking, quizzes, certificates, runtime AI answers, algorithmic/personalized recommendations, CMS/database/backend, complex knowledge graph, framework migration, and translation/localization functionality.
