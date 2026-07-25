# Iteration 0 — Foundation Vertical Slice

Version: 0.1.0

## Objective
Deliver a complete deployed-ready vertical slice showing the full content-to-viewer workflow using both supplied concepts and all five supplied media formats.

## Required delivery package
Iteration 0 is delivered as `VisualAITerms_v0.1.0.zip`.

The ZIP is a complete project replacement containing:
- the full repository structure;
- all source HTML/CSS/JavaScript;
- project documentation and agent instructions;
- both concept metadata files;
- all ten supplied original multimedia assets;
- web derivatives required by Iteration 0;
- validation/build scripts and tests;
- a prebuilt `dist/` directory;
- GitHub Actions workflow files;
- a root-level `start-server.bat`;
- an included PowerShell static server used by the batch file.

A Windows 11 user must be able to extract the ZIP and launch the application by double-clicking `start-server.bat`, without reconstructing files from previous versions.

## Functional scope
- responsive catalog and search;
- audience-specific concept summaries;
- query-string navigation;
- image, video, audio, PDF, and document reading renderers;
- original-file links;
- content validation and generated catalog;
- accessibility and performance baselines;
- GitHub Pages-ready output.

## Acceptance
1. Both supplied concepts appear.
2. All five source media types work for both concepts.
3. Normal concept additions require metadata/media changes only.
4. Direct URLs and Back/Forward navigation work.
5. Portrait and landscape video both fit the viewer.
6. The package validates and builds.
7. `start-server.bat` launches the prebuilt application on Windows 11.
8. The version is visible in the application and present in the ZIP filename.
