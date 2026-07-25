const KEYS={saved:'visular.savedConcepts.v1',recent:'visular.recentConcepts.v1',compare:'visular.compareConcepts.v1'};
const LIMITS={saved:250,recent:12,compare:3};
const fallback=new Map();

function uniqueIds(value,limit=250){
  const source=Array.isArray(value)?value:[];const seen=new Set();const out=[];
  for(const item of source){const id=String(item||'').trim();if(!id||seen.has(id))continue;seen.add(id);out.push(id);if(out.length>=limit)break;}
  return out;
}
function getStorage(){try{return window.localStorage;}catch{return null;}}
function read(key,limit){
  const storage=getStorage();
  try{const raw=storage?.getItem(key);if(raw)return uniqueIds(JSON.parse(raw),limit);}catch{}
  return uniqueIds(fallback.get(key)||[],limit);
}
function write(key,ids,limit){
  const clean=uniqueIds(ids,limit);fallback.set(key,clean);
  const storage=getStorage();try{storage?.setItem(key,JSON.stringify(clean));}catch{}
  return clean;
}
function toggle(key,id,limit){const ids=read(key,limit);const exists=ids.includes(id);return write(key,exists?ids.filter(x=>x!==id):[...ids,id],limit);}

export function getSaved(){return read(KEYS.saved,LIMITS.saved);}
export function isSaved(id){return getSaved().includes(id);}
export function toggleSaved(id){return toggle(KEYS.saved,id,LIMITS.saved);}

export function getRecent(){return read(KEYS.recent,LIMITS.recent);}
export function recordRecent(id){return write(KEYS.recent,[id,...getRecent().filter(x=>x!==id)],LIMITS.recent);}
export function clearRecent(){return write(KEYS.recent,[],LIMITS.recent);}

export function getCompare(){return read(KEYS.compare,LIMITS.compare);}
export function isCompared(id){return getCompare().includes(id);}
export function setCompare(ids){return write(KEYS.compare,ids,LIMITS.compare);}
export function toggleCompare(id){
  const ids=getCompare();
  if(ids.includes(id))return {ids:setCompare(ids.filter(x=>x!==id)),changed:true,added:false};
  if(ids.length>=LIMITS.compare)return {ids,changed:false,added:false,reason:'limit'};
  return {ids:setCompare([...ids,id]),changed:true,added:true};
}
export function removeCompared(id){return setCompare(getCompare().filter(x=>x!==id));}
export function clearCompare(){return setCompare([]);}
export const comparisonLimit=LIMITS.compare;
