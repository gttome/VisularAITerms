import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {freshnessFor} from './lib/content-utils.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const conceptsDir=path.join(root,'content','concepts');
const config=JSON.parse(await fs.readFile(path.join(root,'config','app.config.json'),'utf8'));
const categoryConfig=JSON.parse(await fs.readFile(path.join(root,'content','config','categories.json'),'utf8'));
const categoryMap=new Map((categoryConfig.categories||[]).map(c=>[c.id,c]));

export async function generateCatalog(outputPath=path.join(root,'dist','data','catalog.json')){
  const names=(await fs.readdir(conceptsDir,{withFileTypes:true})).filter(x=>x.isDirectory()).map(x=>x.name).sort();
  const concepts=[];
  for(const name of names){
    const data=JSON.parse(await fs.readFile(path.join(conceptsDir,name,'concept.json'),'utf8'));
    if(data.status==='draft')continue;
    const thumb=data.media?.find(m=>m.thumbnail)?.thumbnail||data.media?.find(m=>m.type==='image')?.webSrc||'';
    const fresh=freshnessFor(data.lastReviewed,config.contentFreshness);
    const categoryLabels=(data.categories||[]).map(id=>categoryMap.get(id)?.label||id);
    concepts.push({
      id:data.id,title:data.title,shortTitle:data.shortTitle,summary:data.summary,definition:data.definition,simpleExplanation:data.simpleExplanation||data.summary,status:data.status,
      aliases:data.aliases||[],keywords:data.keywords||[],categories:data.categories||[],categoryLabels,classificationType:data.classification?.type||'',
      lastReviewed:data.lastReviewed,reviewStatus:data.reviewStatus,contentVersion:data.contentVersion,freshnessStatus:fresh.status,reviewAgeDays:fresh.ageDays,
      relatedConcepts:data.relatedConcepts||[],relationships:data.relationships||[],prerequisites:data.prerequisites||[],learnNext:data.learnNext||[],replacedBy:data.replacedBy||null,created:data.created||null,lastUpdated:data.lastUpdated||null,
      thumbnail:thumb?`./data/concepts/${data.id}/${String(thumb).replace(/^\.\//,'')}`:'',metadata:`./data/concepts/${data.id}/concept.json`
    });
  }
  concepts.sort((a,b)=>a.title.localeCompare(b.title));
  const counts={};for(const category of categoryConfig.categories||[])counts[category.id]=concepts.filter(c=>c.categories.includes(category.id)&&config.catalog.browseStatuses.includes(c.status)).length;
  const categories=(categoryConfig.categories||[]).slice().sort((a,b)=>(a.order||0)-(b.order||0)||a.label.localeCompare(b.label)).map(c=>({...c,count:counts[c.id]||0}));
  const payload={schemaVersion:4,application:config.application,browseStatuses:config.catalog.browseStatuses,generatedAt:new Date().toISOString(),categories,concepts};
  await fs.mkdir(path.dirname(outputPath),{recursive:true});
  await fs.writeFile(outputPath,JSON.stringify(payload,null,2));
  return {concepts,categories,payload};
}
if(process.argv[1]===fileURLToPath(import.meta.url))generateCatalog().then(({concepts})=>console.log(`Generated catalog with ${concepts.length} published concepts.`));
