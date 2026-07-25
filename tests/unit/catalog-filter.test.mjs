import test from 'node:test';import assert from 'node:assert/strict';
import {applyCatalogFilters,availableLetters,filterByCategory,firstLetter} from '../../src/js/catalog/catalog-filter.js';
const concepts=[
  {title:'AI Agents',categories:['agents'],summary:'',definition:'',aliases:[],keywords:[],categoryLabels:['Agents']},
  {title:'Governance',categories:['governance'],summary:'',definition:'',aliases:[],keywords:[],categoryLabels:['Governance']},
  {title:'Generative AI',categories:['generative'],summary:'',definition:'',aliases:[],keywords:[],categoryLabels:['Generative AI']}
];
test('category filtering is metadata driven',()=>assert.deepEqual(filterByCategory(concepts,'governance').map(x=>x.title),['Governance']));
test('alphabetical helpers expose available initials',()=>{assert.equal(firstLetter(concepts[0]),'A');assert.deepEqual(availableLetters(concepts),['A','G']);});
test('combined category, letter and search filters work',()=>assert.equal(applyCatalogFilters(concepts,{categoryId:'generative',letter:'G',query:'AI'})[0].title,'Generative AI'));
