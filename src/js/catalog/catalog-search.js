export function normalizeSearch(value=''){
  return String(value).toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
}
export function searchTokens(query=''){return [...new Set(normalizeSearch(query).split(' ').filter(Boolean))];}
function normalizedArray(values=[]){return values.map(normalizeSearch).filter(Boolean);}
export function scoreConcept(item,query){
  const q=normalizeSearch(query);if(!q)return 0;
  const tokens=searchTokens(q);
  const title=normalizeSearch(item.title);const short=normalizeSearch(item.shortTitle);
  const aliases=normalizedArray(item.aliases||[]);const keywords=normalizedArray(item.keywords||[]);const categories=normalizedArray(item.categoryLabels||item.categories||[]);
  const combined=normalizeSearch([item.title,item.shortTitle,item.summary,item.definition,item.classificationType,...(item.aliases||[]),...(item.keywords||[]),...(item.categoryLabels||[]),...(item.categories||[])].filter(Boolean).join(' '));
  if(!tokens.every(token=>combined.includes(token)))return -1;
  if(title===q||short===q)return 1000;
  if(aliases.includes(q))return 950;
  if(title.startsWith(q)||short.startsWith(q))return 850;
  if(aliases.some(a=>a.startsWith(q)))return 800;
  if(keywords.includes(q))return 750;
  if(title.includes(q)||short.includes(q))return 700;
  if(categories.includes(q))return 600;
  let score=300;
  for(const token of tokens){
    if(title.includes(token)||short.includes(token))score+=50;
    if(aliases.some(a=>a.includes(token)))score+=40;
    if(keywords.some(k=>k.includes(token)))score+=30;
    if(categories.some(c=>c.includes(token)))score+=20;
  }
  return score;
}
export function rankConcepts(concepts,query){
  const q=normalizeSearch(query);if(!q)return [...concepts];
  return concepts.map(item=>({item,score:scoreConcept(item,q)})).filter(x=>x.score>=0).sort((a,b)=>b.score-a.score||a.item.title.localeCompare(b.item.title)).map(x=>x.item);
}
export function filterConcepts(concepts,query){return rankConcepts(concepts,query);}
