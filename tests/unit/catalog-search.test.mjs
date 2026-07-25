import test from 'node:test';import assert from 'node:assert/strict';
import {filterConcepts,normalizeSearch,searchTokens,scoreConcept} from '../../src/js/catalog/catalog-search.js';
const items=[
  {title:'AI Agents and Agentic Workflows',shortTitle:'AI Agents',summary:'goal-directed tools',definition:'systems that act through multiple steps',aliases:['agentic AI'],keywords:['workflow','autonomy'],categories:['ai-agents'],categoryLabels:['AI Agents']},
  {title:'AI Governance, Risk Management, and Compliance',shortTitle:'AI Governance',summary:'risk controls',definition:'policy and accountability',aliases:['AI GRC'],keywords:['compliance'],categories:['ai-governance-risk'],categoryLabels:['AI Governance & Risk']},
  {title:'Retrieval-Augmented Generation',shortTitle:'RAG',summary:'retrieval and generation',definition:'grounds generation with retrieved information',aliases:['RAG'],keywords:['retrieval'],categories:['data-rag'],categoryLabels:['Data & RAG']}
];
test('empty search returns all concepts',()=>assert.equal(filterConcepts(items,'').length,3));
test('search matches title aliases keywords and category labels',()=>{assert.equal(filterConcepts(items,'agents').length,1);assert.equal(filterConcepts(items,'GRC')[0].title.startsWith('AI Governance'),true);assert.equal(filterConcepts(items,'Data RAG')[0].shortTitle,'RAG');});
test('multi-token search requires all tokens but tolerates punctuation',()=>{assert.equal(filterConcepts(items,'AI-agentic').length,1);assert.equal(filterConcepts(items,'AI risk')[0].shortTitle,'AI Governance');});
test('exact acronym and alias matches rank first',()=>{assert.equal(filterConcepts(items,'RAG')[0].shortTitle,'RAG');assert.ok(scoreConcept(items[2],'RAG')>scoreConcept(items[0],'RAG'));});
test('normalization removes punctuation and duplicate spaces',()=>{assert.equal(normalizeSearch('  AI / Agentic—Workflows  '),'ai agentic workflows');assert.deepEqual(searchTokens('AI AI agents'),['ai','agents']);});
