import {rankConcepts} from './catalog-search.js';
export function firstLetter(item){
  const text=String(item.shortTitle||item.title||'').trim();const match=text.match(/[A-Za-z0-9]/);return match?match[0].toUpperCase():'#';
}
export function filterByCategory(concepts,categoryId){return categoryId?concepts.filter(item=>(item.categories||[]).includes(categoryId)):concepts;}
export function availableLetters(concepts){return [...new Set(concepts.map(firstLetter))].sort();}
export function applyCatalogFilters(concepts,{query='',categoryId=null,letter=null}={}){
  let result=filterByCategory(concepts,categoryId);
  if(letter)result=result.filter(item=>firstLetter(item)===letter);
  return rankConcepts(result,query);
}
