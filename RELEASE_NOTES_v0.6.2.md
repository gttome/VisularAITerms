# Visular AI Terms / Concepts v0.6.2

## Maintenance correction
v0.6.2 corrects Learning Path coverage after the six engineering concepts were added under Iteration 5.

### Added Learning Paths
- **Generative AI Engineering Foundations**: Generative AI Engineering Ecosystem -> Prompt Engineering -> Context Engineering.
- **Agentic Systems Engineering**: Harness Engineering -> Loop Engineering -> Graph Engineering.
- The existing **AI Agents and Governance** path is preserved.

The result is 3 curated Learning Paths covering all 8 browsable concepts.

## Future import protection
- The Windows importer now reports Learning Path coverage after every 1-n concept import.
- `5-CHECK-LEARNING-PATHS.bat` provides an on-demand coverage check.
- `3-PREPARE-GITHUB-UPDATE.bat` blocks publishing when a browsable concept is outside all Learning Paths.
- An optional `concept-import/learning-path-plan.json` can create or revise curated Learning Paths during the same one-click import batch.
- GitHub update packages always include the current small `content/learning-paths/` definition set.

## Preserved behavior
No concept media, Quick View/Deep Dive behavior, search, categories, A-Z, Glossary, Saved/Recent, Compare, or accessibility source facts were removed or fabricated.
