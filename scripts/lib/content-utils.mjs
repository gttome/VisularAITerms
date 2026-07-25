import {promises as fs} from 'node:fs';
import path from 'node:path';

export const slugPattern=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(value=''){
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/&/g,' and ')
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'')
    .replace(/-{2,}/g,'-');
}

export function safeFilename(value='file'){
  const ext=path.extname(value).toLowerCase();
  const stem=path.basename(value,ext);
  const clean=slugify(stem)||'file';
  return `${clean}${ext}`;
}

export function isExternalUrl(value=''){
  return /^https?:\/\//i.test(String(value));
}

export function validHttpUrl(value=''){
  try {
    const url=new URL(value);
    return url.protocol==='http:' || url.protocol==='https:';
  } catch { return false; }
}

export function formatBytes(bytes=0){
  const units=['B','KB','MB','GB','TB'];
  let value=Number(bytes)||0; let index=0;
  while(value>=1024 && index<units.length-1){value/=1024;index++;}
  return `${value.toFixed(index===0?0:value>=100?0:value>=10?1:2)} ${units[index]}`;
}

export function daysSince(dateString, now=Date.now()){
  if(!dateString) return null;
  const d=new Date(`${dateString}T00:00:00Z`);
  if(Number.isNaN(d.getTime())) return null;
  return Math.max(0,Math.floor((now-d.getTime())/86400000));
}

export function freshnessFor(lastReviewed, thresholds, now=Date.now()){
  const ageDays=daysSince(lastReviewed,now);
  if(ageDays===null) return {status:'unknown',ageDays:null};
  const {reviewRecommendedAfterDays,staleAfterDays}=thresholds;
  return {
    status: ageDays>staleAfterDays ? 'stale' : ageDays>reviewRecommendedAfterDays ? 'review-recommended' : 'current',
    ageDays
  };
}

export function findReplacementCycles(concepts){
  const byId=new Map(concepts.map(c=>[c.id,c]));
  const cycles=[]; const globallyDone=new Set();
  for(const concept of concepts){
    if(globallyDone.has(concept.id)) continue;
    const seen=new Map(); const chain=[]; let current=concept;
    while(current?.replacedBy && byId.has(current.replacedBy)){
      if(seen.has(current.id)){
        const start=seen.get(current.id);
        cycles.push([...chain.slice(start),current.id]);
        break;
      }
      seen.set(current.id,chain.length); chain.push(current.id); current=byId.get(current.replacedBy);
    }
    for(const id of chain) globallyDone.add(id);
  }
  return cycles;
}

export async function fileSize(target){
  try { const stat=await fs.stat(target); return stat.isFile()?stat.size:0; }
  catch { return 0; }
}

export function mediaMimeFromExtension(ext){
  const map={
    '.png':['image','image/png'], '.jpg':['image','image/jpeg'], '.jpeg':['image','image/jpeg'], '.webp':['image','image/webp'],
    '.mp4':['video','video/mp4'], '.m4a':['audio','audio/mp4'], '.mp3':['audio','audio/mpeg'], '.wav':['audio','audio/wav'],
    '.pdf':['pdf','application/pdf'], '.docx':['docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };
  return map[String(ext).toLowerCase()]||null;
}

export function defaultMediaLabel(type){
  return ({image:'Infographic',video:'Video',audio:'Audio',pdf:'Presentation',docx:'Read'})[type]||'Resource';
}

export function defaultDisplayLabel(type){
  return ({image:'Infographic',video:'Watch video',audio:'Listen',pdf:'Presentation',docx:'Read'})[type]||'Open';
}
