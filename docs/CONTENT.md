# Content and Publishing

## Authority
- Concept contract: `content/schema/concept.schema.json`
- Learning-path contract: `content/schema/learning-path.schema.json`
- Category vocabulary/order: `content/config/categories.json`
- Per-concept truth: `content/concepts/<id>/concept.json`
- Learning paths: `content/learning-paths/<id>.json`

## Stable concept IDs
IDs are lowercase ASCII hyphenated identifiers. Display titles may change without changing IDs or bookmarks.

## Concept schema version 4
Core fields remain `id`, `title`, `summary`, `definition`, `status`, categories, review metadata, and `media[]`.

Iteration 3 adds optional structured learning fields:
- `simpleExplanation`
- `executiveTakeaway`
- `knowledgeWorkerTakeaway`
- `keyTakeaway`
- `primaryRisk`
- `examples[]`
- `businessImpact`
- `questionsToAsk[]`
- `relationships[]`
- `prerequisites[]`
- `learnNext[]`
- `commonlyConfusedWith[]`
- `comparisons[]`
- `sources[]`

Translation/locale fields remain intentionally absent.

Iteration 4 does not change the concept schema. Saved/recent/comparison state stores only stable concept IDs in the browser and derives all display content from the existing catalog/concept metadata.

## Relationship types
Configured/validated types include:
- foundation
- prerequisite
- related
- enables
- uses
- governs
- governed-by
- contrasts-with
- next-concept

Targets use stable concept IDs. Prerequisite cycles are rejected.

## Learning paths
A learning path is a small ordered list of stable concept IDs. Example:

```json
{
  "schemaVersion": 1,
  "id": "ai-agents-and-governance",
  "title": "AI Agents and Governance",
  "description": "Understand agents, then the controls needed to govern them.",
  "audience": "all",
  "concepts": [
    "ai-agents-agentic-workflows",
    "ai-governance-risk-management-compliance"
  ]
}
```

Learning paths are validated for missing/duplicate concept references.

## Media
Each media item explicitly declares `id`, `type`, `label`, `src`, `mime`, and `accessibility.status`. Supported types remain image, video, audio, PDF, and DOCX.

Iteration 3 media metadata may also include `durationSeconds`, `pages`, `width`, `height`, and `sizeBytes`. `content:prepare` fills technical metadata on a best-effort basis where local tooling supports it; missing technical metadata does not authorize invented values.

## Adding a new concept

### Import an existing source folder

```text
npm run concept:import -- "C:\path\to\Concept Folder"
```

The importer refuses to overwrite existing content and creates a safe schema-v4 `draft`.

### Or scaffold from a title

```text
npm run concept:new -- "Large Language Models"
```

Then add source media and complete metadata.

### Prepare

```text
npm run content:prepare -- --concept large-language-models
```

Preparation may create/refresh:
- web-sized image derivative;
- thumbnail;
- branded video poster if missing;
- browser-readable DOCX HTML;
- file-size metadata;
- video/audio duration when `ffprobe` is available;
- video dimensions when `ffprobe` is available;
- PDF page count when `pdfinfo` is available;
- image dimensions when `identify` is available.

The original media remain preserved.

## Review and activate
Before changing `draft` to a browsable status:
- complete summary, definition, and Quick View fields;
- complete senior-leader and knowledge-worker relevance;
- assign valid categories;
- add aliases/keywords as useful;
- add relationships/prerequisites/next concepts only when supported;
- add meaningful image alt text;
- provide source-accurate captions/transcripts when available/required;
- review PDF accessibility and supply a readable alternative when needed;
- set review/freshness metadata;
- validate and visually inspect.

## Validation and build

```text
npm run validate
npm run report
npm run build
```

Or:

```text
npm run content:publish
```

The publishing command prepares -> validates -> builds and stops safely on structural errors.

## Publishing checklist
- [ ] Summary/definition and Quick View fields reviewed.
- [ ] Senior-leader and knowledge-worker relevance reviewed.
- [ ] Categories/aliases/acronyms reviewed.
- [ ] Relationship/prerequisite/Learn Next IDs valid.
- [ ] Learning-path references valid if changed.
- [ ] Examples/Questions to Ask/business impact supported by the source content.
- [ ] Source/evidence entries, when used, are accurate and URLs valid.
- [ ] Image alt text meaningful.
- [ ] Video captions/transcript supplied when available/required.
- [ ] Audio transcript supplied when available/required.
- [ ] PDF accessibility reviewed; readable alternative supplied if needed.
- [ ] DOCX web version generated/reviewed.
- [ ] Review dates/content version updated.
- [ ] `npm run validate` passes.
- [ ] `npm run build` passes.
- [ ] Phone/tablet/desktop behavior reviewed.
