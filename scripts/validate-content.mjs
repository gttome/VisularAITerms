import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {slugPattern,isExternalUrl,validHttpUrl,daysSince,findReplacementCycles,formatBytes} from './lib/content-utils.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const conceptsDir=path.join(root,'content','concepts');const learningPathsDir=path.join(root,'content','learning-paths');
const config=JSON.parse(await fs.readFile(path.join(root,'config','app.config.json'),'utf8'));
const categoriesConfig=JSON.parse(await fs.readFile(path.join(root,'content','config','categories.json'),'utf8'));
const categoryIds=new Set((categoriesConfig.categories||[]).map(c=>c.id));
const allowedMedia=new Set(['image','video','audio','pdf','docx','text']);
const accessibilityStatuses=new Set(['complete','needs-review','needs-remediation','alternative-provided']);
const reviewStatuses=new Set(['reviewed','draft','needs-review']);
const statuses=new Set(['active','emerging','updated','deprecated','archived','draft']);
const relationshipTypes=new Set(config.learning?.relationshipTypes||['foundation','prerequisite','related','enables','uses','governs','governed-by','contrasts-with','next-concept']);
const errors=[];const warnings=[];const infos=[];const ids=new Set();const aliases=new Map();const concepts=[];
const dirs=(await fs.readdir(conceptsDir,{withFileTypes:true})).filter(x=>x.isDirectory()).sort((a,b)=>a.name.localeCompare(b.name));

function addAlias(value,conceptId){const key=String(value||'').toLocaleLowerCase().trim();if(!key)return;if(aliases.has(key)&&aliases.get(key)!==conceptId)errors.push(`${conceptId}: alias/title “${value}” conflicts with ${aliases.get(key)}`);else aliases.set(key,conceptId);}
function localFile(conceptFile,value){return path.resolve(path.dirname(conceptFile),value);}
async function checkReference(conceptId,mediaId,conceptFile,field,value){if(!value)return;if(isExternalUrl(value)){if(!validHttpUrl(value))errors.push(`${conceptId}/${mediaId}: malformed ${field} URL`);return;}const target=localFile(conceptFile,value);try{const stat=await fs.stat(target);if(stat.isFile()&&stat.size>50*1024*1024)warnings.push(`${conceptId}/${mediaId}: ${field} is large (${formatBytes(stat.size)})`);}catch{errors.push(`${conceptId}/${mediaId}: missing ${field} -> ${value}`);}}
function severityForDraft(isDraft,kind,message){if(isDraft){warnings.push(`${message} (draft)`);return;}if(kind==='error')errors.push(message);else warnings.push(message);}
function detectCycles(graph,label){const state=new Map();const stack=[];function visit(id){if(state.get(id)===1){const at=stack.indexOf(id);errors.push(`${label} cycle detected: ${[...stack.slice(at),id].join(' -> ')}`);return;}if(state.get(id)===2)return;state.set(id,1);stack.push(id);for(const next of graph.get(id)||[])if(graph.has(next))visit(next);stack.pop();state.set(id,2);}for(const id of graph.keys())visit(id);}

for(const dir of dirs){
  const file=path.join(conceptsDir,dir.name,'concept.json');let c;
  try{c=JSON.parse(await fs.readFile(file,'utf8'));}catch(e){errors.push(`${dir.name}: invalid concept.json (${e.message})`);continue;}
  concepts.push(c);const isDraft=c.status==='draft';
  if(c.schemaVersion!==4)errors.push(`${dir.name}: schemaVersion must be 4 for Iteration 3`);
  if(!slugPattern.test(c.id||''))errors.push(`${dir.name}: invalid id ${c.id}`);if(c.id!==dir.name)errors.push(`${dir.name}: folder name must equal concept id ${c.id}`);if(ids.has(c.id))errors.push(`${dir.name}: duplicate concept id ${c.id}`);ids.add(c.id);
  if(!statuses.has(c.status))errors.push(`${c.id}: invalid status ${c.status}`);addAlias(c.title,c.id);addAlias(c.shortTitle,c.id);for(const a of c.aliases||[])addAlias(a,c.id);
  if(!c.definition||c.definition.trim().length<80)severityForDraft(isDraft,'warning',`${c.id}: definition is missing or unusually short`);if(!c.summary||c.summary.trim().length<50)severityForDraft(isDraft,'warning',`${c.id}: summary is unusually short`);
  for(const [field,label] of [['simpleExplanation','simple explanation'],['executiveTakeaway','executive takeaway'],['knowledgeWorkerTakeaway','knowledge-worker takeaway'],['keyTakeaway','key takeaway'],['primaryRisk','primary risk']])if(!String(c[field]||'').trim())severityForDraft(isDraft,'warning',`${c.id}: ${label} is not supplied`);
  if(!c.contentVersion)warnings.push(`${c.id}: contentVersion is not supplied`);if(!reviewStatuses.has(c.reviewStatus))warnings.push(`${c.id}: reviewStatus should be reviewed, draft, or needs-review`);if(!isDraft&&c.reviewStatus==='draft')errors.push(`${c.id}: publishable status cannot use reviewStatus=draft`);
  if(!isDraft&&(String(c.summary||'').includes('[DRAFT]')||String(c.definition||'').includes('[DRAFT]')))errors.push(`${c.id}: draft placeholder text must be completed before publication`);
  if(config.catalog.browseStatuses.includes(c.status)&&!(c.categories||[]).length)errors.push(`${c.id}: browsable concepts require at least one configured category`);if(c.status==='deprecated'&&!c.replacedBy)warnings.push(`${c.id}: deprecated concept should identify replacedBy when a current replacement exists`);if(c.replacedBy===c.id)errors.push(`${c.id}: replacedBy cannot reference itself`);
  for(const category of c.categories||[])if(!categoryIds.has(category))errors.push(`${c.id}: unknown category ${category}`);
  if(!c.lastReviewed){if(!isDraft)warnings.push(`${c.id}: lastReviewed is not supplied`);}else{const age=daysSince(c.lastReviewed);if(age===null)errors.push(`${c.id}: lastReviewed is not a valid YYYY-MM-DD date`);else if(age>config.contentFreshness.staleAfterDays)warnings.push(`${c.id}: content is stale (${age} days since review)`);else if(age>config.contentFreshness.reviewRecommendedAfterDays)infos.push(`${c.id}: review recommended (${age} days since review)`);}
  if(c.review?.nextReviewDate){const next=new Date(`${c.review.nextReviewDate}T00:00:00Z`);if(Number.isNaN(next.getTime()))errors.push(`${c.id}: review.nextReviewDate is invalid`);}
  for(const source of c.sources||[])if(source.url&&!validHttpUrl(source.url))errors.push(`${c.id}: invalid source URL ${source.url}`);
  for(const relationship of c.relationships||[])if(!relationshipTypes.has(relationship.type))errors.push(`${c.id}: unsupported relationship type ${relationship.type}`);
  const mediaIds=new Set();
  for(const m of c.media||[]){
    if(mediaIds.has(m.id))errors.push(`${c.id}: duplicate media id ${m.id}`);mediaIds.add(m.id);if(!allowedMedia.has(m.type))errors.push(`${c.id}/${m.id}: unsupported type ${m.type}`);if(!m.src)errors.push(`${c.id}/${m.id}: missing src`);if(m.src&&isExternalUrl(m.src)&&!validHttpUrl(m.src))errors.push(`${c.id}/${m.id}: malformed external src URL`);
    const a=m.accessibility||{};if(!accessibilityStatuses.has(a.status))errors.push(`${c.id}/${m.id}: accessibility.status is required and must be valid`);for(const field of ['src','webSrc','thumbnail','poster','webVersion'])await checkReference(c.id,m.id,file,field,m[field]);for(const field of ['captions','transcript','accessibleAlternative'])await checkReference(c.id,m.id,file,field,a[field]||m[field]);
    if(m.type==='image'&&!String(m.alt||a.alt||'').trim())severityForDraft(isDraft,'error',`${c.id}/${m.id}: image requires meaningful alt text`);
    if(m.type==='video'){if(!a.captions)warnings.push(`${c.id}/${m.id}: captions not supplied`);if(!a.transcript)warnings.push(`${c.id}/${m.id}: transcript not supplied`);if(!m.poster)warnings.push(`${c.id}/${m.id}: video poster is not supplied; content:prepare can generate one`);}
    if(m.type==='audio'&&!a.transcript)warnings.push(`${c.id}/${m.id}: transcript not supplied`);
    if(m.type==='pdf'&&a.sourceTagged===false){if(a.accessibleAlternative)infos.push(`${c.id}/${m.id}: source PDF is untagged; readable alternative is provided`);else warnings.push(`${c.id}/${m.id}: supplied PDF is untagged and has no readable alternative`);}
    if((m.type==='docx'||m.type==='text')&&!m.webVersion)warnings.push(`${c.id}/${m.id}: readable webVersion is not supplied; content:prepare can generate one`);
  }
}

const byId=new Map(concepts.map(c=>[c.id,c]));
for(const c of concepts){
  const directRefs=[...(c.relatedConcepts||[]),...(c.prerequisites||[]),...(c.learnNext||[]),...(c.relationships||[]).map(x=>x.conceptId),...(c.commonlyConfusedWith||[]).map(x=>x.conceptId),...(c.comparisons||[]).map(x=>x.conceptId)];
  for(const ref of directRefs){if(ref===c.id)errors.push(`${c.id}: concept relationship cannot reference itself (${ref})`);else if(!byId.has(ref))errors.push(`${c.id}: referenced concept does not exist: ${ref}`);}
  if(c.replacedBy&&!byId.has(c.replacedBy))errors.push(`${c.id}: replacedBy concept does not exist: ${c.replacedBy}`);
}
for(const cycle of findReplacementCycles(concepts))errors.push(`replacement cycle detected: ${cycle.join(' -> ')}`);
const prerequisiteGraph=new Map(concepts.map(c=>[c.id,c.prerequisites||[]]));detectCycles(prerequisiteGraph,'prerequisite');

const learningPathIds=new Set();const learningPathConceptIds=new Set();let learningPathCount=0;
try{
  const files=(await fs.readdir(learningPathsDir,{withFileTypes:true})).filter(x=>x.isFile()&&x.name.endsWith('.json')).sort((a,b)=>a.name.localeCompare(b.name));
  for(const entry of files){
    const file=path.join(learningPathsDir,entry.name);let lp;try{lp=JSON.parse(await fs.readFile(file,'utf8'));}catch(e){errors.push(`learning path ${entry.name}: invalid JSON (${e.message})`);continue;}learningPathCount++;
    if(lp.schemaVersion!==1)errors.push(`${entry.name}: learning path schemaVersion must be 1`);if(!slugPattern.test(lp.id||''))errors.push(`${entry.name}: invalid learning path id ${lp.id}`);if(path.basename(entry.name,'.json')!==lp.id)errors.push(`${entry.name}: filename must equal learning path id ${lp.id}`);if(learningPathIds.has(lp.id))errors.push(`${entry.name}: duplicate learning path id ${lp.id}`);learningPathIds.add(lp.id);
    if(!['all','senior-leader','knowledge-worker'].includes(lp.audience))errors.push(`${lp.id}: invalid learning path audience ${lp.audience}`);if(!Array.isArray(lp.concepts)||lp.concepts.length<1)errors.push(`${lp.id}: learning path requires at least one concept`);if(new Set(lp.concepts||[]).size!==(lp.concepts||[]).length)errors.push(`${lp.id}: learning path contains duplicate concepts`);if((lp.concepts||[]).length<2)warnings.push(`${lp.id}: learning path contains fewer than two concepts`);
    for(const id of lp.concepts||[]){if(!byId.has(id))errors.push(`${lp.id}: learning path references missing concept ${id}`);else if(['archived','deprecated','draft'].includes(byId.get(id).status))warnings.push(`${lp.id}: learning path references non-current concept ${id}`);learningPathConceptIds.add(id);}
  }
}catch(e){warnings.push(`learning paths directory could not be read: ${e.message}`);}

for(const c of concepts){
  if(config.catalog.browseStatuses.includes(c.status)&&!learningPathConceptIds.has(c.id))warnings.push(`${c.id}: browsable concept is not represented in any learning path`);
}

if(config.mediaStorage?.baseUrl&&!validHttpUrl(config.mediaStorage.baseUrl))errors.push('config.mediaStorage.baseUrl must be blank or a valid http(s) URL');
for(const i of infos)console.log(`INFORMATION: ${i}`);for(const w of warnings)console.warn(`WARNING: ${w}`);
if(errors.length){for(const e of errors)console.error(`ERROR: ${e}`);console.error(`Validation: FAIL — ${errors.length} error(s), ${warnings.length} warning(s).`);process.exit(1);}
console.log(`Validation: PASS — ${concepts.length} concepts, ${learningPathCount} learning path(s), ${warnings.length} warning(s), ${infos.length} information message(s).`);
