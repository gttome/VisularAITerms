# New concept template

1. Replace the concept ID/title or use `npm run concept:new -- "Concept Title"`.
2. Put source files in `media/`.
3. Declare each media item in `concept.json`, or use `npm run concept:import -- "path-to-source-folder"` to create a draft from a folder of supported files.
4. Complete summary, definition, audience text, categories, accessibility metadata, and review metadata.
5. Run `npm run content:prepare -- --concept <id>`.
6. Run `npm run validate`, `npm run build`, then review locally.

Draft concepts are excluded from the public catalog.
