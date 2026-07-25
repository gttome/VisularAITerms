# Iteration 3 — Learning Effectiveness (v0.4.0)

## Objective
Evolve Visular AI Terms / Concepts from a scalable multimedia glossary into a more effective visual learning reference without turning it into an LMS, chatbot, backend application, or complex knowledge graph.

## Pre-Iteration 3 reliability and UI fixes
Before adding new learning capabilities:
- hardened `scripts/serve.ps1` so expected browser-aborted/reset media connections do not flood the Windows console with warning messages;
- retained HTTP byte-range support for MP4/M4A seeking;
- removed the redundant concept-level accessibility/remediation banner from the visible interface;
- removed the visible "Transcript not yet available" placeholders for media without transcripts;
- removed post-load accessibility warning text from the normal media status area;
- retained accessibility metadata, validation warnings, and readable PDF alternatives.

## Delivered Iteration 3 capabilities
### Learning depth
- Quick View (default direct concept view).
- Deep Dive for full reference/media detail.
- Explain it simply.
- Senior-leader takeaway.
- Knowledge-worker takeaway.
- Key takeaway.
- Primary risk.

### Structured learning
- stable-ID relationship model with typed relationships;
- prerequisites and Learn Next;
- curated Learning Paths from JSON;
- Glossary view generated from catalog metadata;
- optional commonly-confused and comparison models;
- structured examples;
- business-impact fields;
- Questions to Ask;
- optional source/evidence metadata.

### Learning/resource utility
- known video/audio duration and PDF page-count labels;
- format choices in Quick View;
- Copy Link;
- Copy Definition;
- print-friendly Deep Dive concept brief;
- transcript search when a source-accurate transcript exists.

### Publishing/quality
- concept schema version 4;
- learning-path schema and generator;
- learning-path/reference validation;
- relationship/reference validation;
- prerequisite-cycle detection;
- optional source URL validation;
- best-effort media technical metadata extraction and source file-size capture;
- expanded deterministic tests.

## Explicitly excluded by user request
The proposed Translation-Ready items 18, 19, and 20 were removed from Iteration 3:
- multilingual schema/translation architecture;
- language-aware routing/search;
- a demonstration translated concept/language selector.

No translation fields were added to the supplied concept metadata.

## Deliberately not added
User accounts, progress tracking, quizzes, certificates, analytics, runtime AI/chatbot, personalized recommendations, CMS/database/backend, complex graph engine, or framework migration.

## Acceptance criteria
1. Existing two concepts and all five media types remain available.
2. Existing `?concept=` and `?concept=&media=` URLs remain supported.
3. Quick View displays concise learning content without loading large media.
4. Deep Dive exposes full media and structured concept detail.
5. Direct media URLs open Deep Dive to the requested resource.
6. Learning Paths are JSON-driven and validate stable concept IDs.
7. Glossary entries are generated from catalog metadata.
8. Relationship, prerequisite, Learn Next, comparison/confusion, and source references are schema/validator controlled.
9. Prerequisite cycles are rejected.
10. Media duration/page metadata is displayed only when known.
11. Transcript search appears only when a transcript exists.
12. Copy Link, Copy Definition, and print stylesheet are present.
13. Redundant source-remediation banners shown in the user's screenshots are removed from the visible app.
14. Accessibility/source-content warnings continue to be reported by validation rather than fabricated away.
15. `start-server.bat` remains root-level and the PowerShell server suppresses expected disconnect noise.
16. 50/100/250 concept scale tests remain passing.
17. Deterministic validation, accessibility structure, UI integrity, unit tests, build, and HTTP smoke tests pass.
18. Translation functionality is absent.
19. Complete v0.4.0 ZIP contains prebuilt `dist/` and runs independently from earlier ZIPs.
20. Handoff documentation is sufficient for a new ChatGPT conversation to continue the project from the complete handoff ZIP.
