import test from 'node:test';
import assert from 'node:assert/strict';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');

async function read(rel){return fs.readFile(path.join(root,rel),'utf8');}

 test('Iteration 5 maintenance ships the Windows one-click launchers',async()=>{
  for(const rel of ['1-IMPORT-CONCEPTS.bat','2-TEST-APP.bat','3-PREPARE-GITHUB-UPDATE.bat','4-REPAIR-MEDIA-METADATA.bat','5-CHECK-LEARNING-PATHS.bat']){
    const stat=await fs.stat(path.join(root,rel));
    assert.equal(stat.isFile(),true,rel);
  }
});

test('Iteration 5 supports TXT as a readable media source',async()=>{
  const schema=JSON.parse(await read('content/schema/concept.schema.json'));
  const typeEnum=schema.properties.media.items.properties.type.enum;
  assert.ok(typeEnum.includes('text'));
  const viewer=await read('src/js/media/media-viewer.js');
  assert.match(viewer,/text:renderDocument/);
  const prepare=await read('scripts/prepare-content.mjs');
  assert.match(prepare,/item\.type==='docx'\|\|item\.type==='text'/);
});

test('Iteration 5 batch importer is validation-first and non-overwriting',async()=>{
  const importer=await read('scripts/Import-ConceptPackages.ps1');
  assert.match(importer,/Concept already exists:/);
  assert.match(importer,/Validation failed\. No application files were changed\./);
  assert.match(importer,/Missing required briefing: supply one TXT or DOCX file\./);
  assert.match(importer,/concept-import\\imported/);
});


test('v0.6.1 importer writes learning-choice media metadata',async()=>{
  const importer=await read('scripts/Import-ConceptPackages.ps1');
  assert.match(importer,/Get-MediaDurationSeconds/);
  assert.match(importer,/durationSeconds=\$videoDuration/);
  assert.match(importer,/durationSeconds=\$audioDuration/);
  assert.match(importer,/pages=\$pdfPages/);
  const helper=await read('scripts/lib/Media-Metadata.ps1');
  assert.match(helper,/function Get-IsoBmffDurationSeconds/);
  assert.match(helper,/function Get-PdfPageCount/);
});

test('v0.6.1 provides in-place repair and update launchers',async()=>{
  const repair=await read('scripts/Repair-MediaMetadata.ps1');
  const updater=await read('scripts/Update-To-v0.6.1.ps1');
  assert.match(repair,/content\\concepts/);
  assert.match(repair,/dist\\data\\concepts/);
  assert.match(updater,/Existing imported concepts were repaired in place/);
});
