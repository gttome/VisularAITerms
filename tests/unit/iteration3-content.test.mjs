import test from 'node:test';
import assert from 'node:assert/strict';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
async function concept(id){return JSON.parse(await fs.readFile(path.join(root,'content','concepts',id,'concept.json'),'utf8'));}

test('Iteration 3 concepts expose quick-view learning fields',async()=>{
  for(const id of ['ai-agents-agentic-workflows','ai-governance-risk-management-compliance']){
    const c=await concept(id);assert.equal(c.schemaVersion,4);for(const field of ['simpleExplanation','executiveTakeaway','knowledgeWorkerTakeaway','keyTakeaway','primaryRisk'])assert.ok(String(c[field]||'').length>20,`${id} ${field}`);
  }
});

test('structured concept relationships reference supplied concepts',async()=>{
  const agents=await concept('ai-agents-agentic-workflows');const governance=await concept('ai-governance-risk-management-compliance');
  assert.deepEqual(agents.relationships,[{conceptId:'ai-governance-risk-management-compliance',type:'governed-by'}]);
  assert.deepEqual(governance.relationships,[{conceptId:'ai-agents-agentic-workflows',type:'governs'}]);
});

test('learning path is metadata driven and references both supplied concepts',async()=>{
  const p=JSON.parse(await fs.readFile(path.join(root,'content','learning-paths','ai-agents-and-governance.json'),'utf8'));
  assert.equal(p.schemaVersion,1);assert.equal(p.id,'ai-agents-and-governance');assert.deepEqual(p.concepts,['ai-agents-agentic-workflows','ai-governance-risk-management-compliance']);
});

test('Iteration 3 intentionally excludes translation fields',async()=>{
  const agents=await concept('ai-agents-agentic-workflows');assert.equal('translations' in agents,false);assert.equal('locale' in agents,false);
});
