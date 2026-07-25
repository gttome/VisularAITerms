import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {freshnessFor,formatBytes,isExternalUrl} from './lib/content-utils.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const conceptsDir=path.join(root,'content','concepts');
const config=JSON.parse(await fs.readFile(path.join(root,'config','app.config.json'),'utf8'));

async function dirSize(dir){
  let total=0;try{for(const entry of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);total+=entry.isDirectory()?await dirSize(p):(await fs.stat(p)).size;}}catch{}return total;
}
export async function contentReport(){
  const names=(await fs.readdir(conceptsDir,{withFileTypes:true})).filter(x=>x.isDirectory()).map(x=>x.name).sort();
  const status={};const freshness={current:0,'review-recommended':0,stale:0,unknown:0};const types={image:0,video:0,audio:0,pdf:0,docx:0};
  let mediaBytes=0;let mediaAssets=0;let relationshipCount=0;let sourceCount=0;let largestAsset={bytes:0,label:'none'};let largestConcept={bytes:0,label:'none'};const concepts=[];
  for(const id of names){
    const file=path.join(conceptsDir,id,'concept.json');const c=JSON.parse(await fs.readFile(file,'utf8'));concepts.push(c);status[c.status]=(status[c.status]||0)+1;
    const fresh=freshnessFor(c.lastReviewed,config.contentFreshness);freshness[fresh.status]=(freshness[fresh.status]||0)+1;relationshipCount+=(c.relationships||[]).length;sourceCount+=(c.sources||[]).length;
    let conceptBytes=0;
    for(const m of c.media||[]){
      if(types[m.type]!==undefined)types[m.type]++;mediaAssets++;
      if(!m.src||isExternalUrl(m.src))continue;
      const target=path.resolve(path.dirname(file),m.src);try{const s=await fs.stat(target);mediaBytes+=s.size;conceptBytes+=s.size;if(s.size>largestAsset.bytes)largestAsset={bytes:s.size,label:`${id}/${path.basename(target)}`};}catch{}
    }
    if(conceptBytes>largestConcept.bytes)largestConcept={bytes:conceptBytes,label:id};
  }
  const distBytes=await dirSize(path.join(root,'dist'));let learningPaths=0;try{learningPaths=(await fs.readdir(path.join(root,'content','learning-paths'),{withFileTypes:true})).filter(x=>x.isFile()&&x.name.endsWith('.json')).length;}catch{}
  return {concepts:concepts.length,status,freshness,types,mediaAssets,mediaBytes,distBytes,largestAsset,largestConcept,threshold:config.mediaStorage.pagesWarningThresholdBytes,learningPaths,relationshipCount,sourceCount};
}
export function printReport(r){
  console.log('\nVisular AI Terms / Concepts — Content health');
  console.log(`Concepts: ${r.concepts} | active: ${r.status.active||0} | emerging: ${r.status.emerging||0} | updated: ${r.status.updated||0} | deprecated: ${r.status.deprecated||0} | archived: ${r.status.archived||0} | draft: ${r.status.draft||0}`);
  console.log(`Learning paths: ${r.learningPaths} | structured relationships: ${r.relationshipCount} | sources: ${r.sourceCount}`);
  console.log(`Freshness: current ${r.freshness.current||0} | review recommended ${r.freshness['review-recommended']||0} | stale ${r.freshness.stale||0} | unknown ${r.freshness.unknown||0}`);
  console.log(`Media: ${r.mediaAssets} | images ${r.types.image} | videos ${r.types.video} | audio ${r.types.audio} | PDFs ${r.types.pdf} | documents ${r.types.docx}`);
  console.log(`Local source media: ${formatBytes(r.mediaBytes)} | built site: ${formatBytes(r.distBytes)}`);
  console.log(`Largest concept source media: ${r.largestConcept.label} (${formatBytes(r.largestConcept.bytes)})`);
  console.log(`Largest source asset: ${r.largestAsset.label} (${formatBytes(r.largestAsset.bytes)})`);
  if(r.distBytes>=r.threshold)console.warn(`WARNING: built site has reached the project media-migration threshold (${formatBytes(r.threshold)}).`);
  else console.log(`Storage status: below project migration threshold (${formatBytes(r.threshold)}).`);
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const r=await contentReport();printReport(r);}
