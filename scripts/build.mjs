import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {generateCatalog} from './generate-catalog.mjs';
import {generateLearningPaths} from './generate-learning-paths.mjs';
import {contentReport,printReport} from './report-content.mjs';
import {isExternalUrl} from './lib/content-utils.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const config=JSON.parse(await fs.readFile(path.join(root,'config','app.config.json'),'utf8'));
const conceptsDir=path.join(root,'content','concepts');

function joinExternal(base,id,relative){
  const cleanBase=base.replace(/\/$/,'');const clean=String(relative).replace(/^\.\//,'');
  return `${cleanBase}/${encodeURIComponent(id)}/${clean.split('/').map(encodeURIComponent).join('/')}`;
}
async function stageConcepts(){
  const targetRoot=path.join(dist,'data','concepts');await fs.mkdir(targetRoot,{recursive:true});
  const dirs=(await fs.readdir(conceptsDir,{withFileTypes:true})).filter(x=>x.isDirectory());
  for(const dir of dirs){
    const source=path.join(conceptsDir,dir.name);const target=path.join(targetRoot,dir.name);await fs.mkdir(target,{recursive:true});
    const concept=JSON.parse(await fs.readFile(path.join(source,'concept.json'),'utf8'));
    const externalBase=String(config.mediaStorage?.baseUrl||'').trim();
    if(externalBase){
      for(const item of concept.media||[]){if(item.src&&!isExternalUrl(item.src)&&String(item.src).startsWith('./media/'))item.src=joinExternal(externalBase,concept.id,item.src);}
      try{await fs.cp(path.join(source,'derived'),path.join(target,'derived'),{recursive:true});}catch{}
    } else await fs.cp(source,target,{recursive:true});
    await fs.writeFile(path.join(target,'concept.json'),JSON.stringify(concept,null,2)+'\n');
  }
}

await fs.rm(dist,{recursive:true,force:true});await fs.mkdir(dist,{recursive:true});
await fs.cp(path.join(root,'src'),dist,{recursive:true});
await stageConcepts();
const {concepts}=await generateCatalog(path.join(dist,'data','catalog.json'));
const learningPathsPayload=await generateLearningPaths(path.join(dist,'data','learning-paths.json'));
let mediaCount=0;const types={image:0,video:0,audio:0,pdf:0,docx:0};const accessibility={complete:0,'needs-review':0,'needs-remediation':0,'alternative-provided':0,unknown:0};
for(const c of concepts){const data=JSON.parse(await fs.readFile(path.join(root,'content','concepts',c.id,'concept.json'),'utf8'));for(const m of data.media||[]){mediaCount++;if(types[m.type]!==undefined)types[m.type]++;const s=m.accessibility?.status||'unknown';accessibility[s]=(accessibility[s]||0)+1;}}
console.log('\nVisular AI Terms / Concepts — Build summary');
console.log(`Version: ${config.application.version}`);console.log(`Published concepts: ${concepts.length}`);console.log(`Learning paths: ${learningPathsPayload.learningPaths.length}`);console.log(`Media assets: ${mediaCount}`);
console.log(`Images: ${types.image} | Videos: ${types.video} | Audio: ${types.audio} | PDFs: ${types.pdf} | Documents: ${types.docx}`);
console.log(`Accessibility metadata — complete: ${accessibility.complete||0}, alternative-provided: ${accessibility['alternative-provided']||0}, needs-remediation: ${accessibility['needs-remediation']||0}, needs-review: ${accessibility['needs-review']||0}`);
console.log(`Media base URL: ${config.mediaStorage.baseUrl||'(local GitHub Pages media)'}`);console.log('Build: PASS');
printReport(await contentReport());
