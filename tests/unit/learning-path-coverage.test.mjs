import test from 'node:test';
import assert from 'node:assert/strict';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
async function readJson(rel){return JSON.parse(await fs.readFile(path.join(root,rel),'utf8'));}
async function read(rel){return fs.readFile(path.join(root,rel),'utf8');}

test('v0.6.2 ships three curated Learning Paths covering all eight browsable concepts',async()=>{
  const config=await readJson('config/app.config.json');
  const conceptDirs=(await fs.readdir(path.join(root,'content','concepts'),{withFileTypes:true})).filter(x=>x.isDirectory());
  const concepts=[];
  for(const dir of conceptDirs)concepts.push(await readJson(`content/concepts/${dir.name}/concept.json`));
  const pathFiles=(await fs.readdir(path.join(root,'content','learning-paths'))).filter(x=>x.endsWith('.json'));
  assert.equal(pathFiles.length,3);
  const covered=new Set();
  for(const name of pathFiles){const lp=await readJson(`content/learning-paths/${name}`);for(const id of lp.concepts)covered.add(id);}
  const browsable=concepts.filter(c=>config.catalog.browseStatuses.includes(c.status));
  assert.equal(browsable.length,8);
  assert.deepEqual(browsable.filter(c=>!covered.has(c.id)).map(c=>c.id),[]);
});

test('engineering Learning Paths preserve the curated sequence',async()=>{
  const foundations=await readJson('content/learning-paths/generative-ai-engineering-foundations.json');
  assert.deepEqual(foundations.concepts,[
    'generative-ai-engineering-ecosystem',
    'prompt-engineering',
    'context-engineering'
  ]);
  const agentic=await readJson('content/learning-paths/agentic-systems-engineering.json');
  assert.deepEqual(agentic.concepts,[
    'harness-engineering',
    'loop-engineering',
    'graph-engineering'
  ]);
});

test('Windows import reports Learning Path coverage and GitHub packaging enforces it',async()=>{
  const importer=await read('scripts/Import-ConceptPackages.ps1');
  assert.match(importer,/learning-path-plan\.json/);
  assert.match(importer,/Check-LearningPathCoverage\.ps1/);
  assert.match(importer,/GitHub packaging will be blocked/);
  const github=await read('scripts/Prepare-GitHubUpdate.ps1');
  assert.match(github,/Checking Learning Path coverage/);
  assert.match(github,/GitHub update NOT prepared/);
  assert.match(github,/content\\learning-paths/);
  const launcher=await fs.stat(path.join(root,'5-CHECK-LEARNING-PATHS.bat'));
  assert.equal(launcher.isFile(),true);
});
