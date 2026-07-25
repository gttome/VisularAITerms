import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {slugify,safeFilename,mediaMimeFromExtension,defaultMediaLabel,defaultDisplayLabel} from './lib/content-utils.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
const sourceArg=args.find(x=>!x.startsWith('--'));
const titleArg=args.find(x=>x.startsWith('--title='))?.slice('--title='.length);
if(!sourceArg){
  console.error('Usage: npm run concept:import -- "C:\\path\\to\\source-folder" [--title="Concept Title"]');
  process.exit(1);
}
const source=path.resolve(sourceArg);
let stat; try{stat=await fs.stat(source);}catch{console.error(`Source folder not found: ${source}`);process.exit(1);}
if(!stat.isDirectory()){console.error('Source must be a folder.');process.exit(1);}
const title=(titleArg||path.basename(source)).trim();
const id=slugify(title);
if(!id){console.error('Unable to create a valid concept ID.');process.exit(1);}
const dest=path.join(root,'content','concepts',id);
try{await fs.access(dest);console.error(`Concept already exists: ${id}. Import never overwrites an existing concept.`);process.exit(1);}catch{}
await fs.mkdir(path.join(dest,'media'),{recursive:true});
await fs.mkdir(path.join(dest,'derived'),{recursive:true});
const files=(await fs.readdir(source,{withFileTypes:true})).filter(x=>x.isFile());
const supported=files.map(entry=>({entry,info:mediaMimeFromExtension(path.extname(entry.name))})).filter(x=>x.info);
if(!supported.length){console.error('No supported files found. Supported: PNG/JPG/JPEG/WEBP, MP4, M4A/MP3/WAV, PDF, DOCX.');await fs.rm(dest,{recursive:true,force:true});process.exit(1);}
const typeCounts=new Map(); const media=[];
for(const {entry,info:[type,mime]} of supported){
  const n=(typeCounts.get(type)||0)+1; typeCounts.set(type,n);
  const mediaId=n===1?type:`${type}-${n}`;
  const filename=safeFilename(entry.name);
  await fs.copyFile(path.join(source,entry.name),path.join(dest,'media',filename));
  const item={
    id:mediaId,type,label:defaultMediaLabel(type),displayLabel:defaultDisplayLabel(type),
    src:`./media/${filename}`,mime,
    accessibility:{status:'needs-review'}
  };
  if(type==='image'){item.alt='';item.accessibility.alt='';}
  if(type==='video'){item.accessibility.captions=null;item.accessibility.transcript=null;}
  if(type==='audio'){item.accessibility.transcript=null;}
  if(type==='pdf'){item.accessibility.sourceTagged=null;item.accessibility.accessibleAlternative=null;}
  media.push(item);
}
const concept={
  schemaVersion:4,id,title,shortTitle:title,
  summary:'[DRAFT] Add a concise plain-language summary before publication.',status:'draft',
  definition:'[DRAFT] Add a complete plain-language definition before publication.',
  simpleExplanation:'',executiveTakeaway:'',knowledgeWorkerTakeaway:'',keyTakeaway:'',primaryRisk:'',
  audiences:{seniorLeaders:'',knowledgeWorkers:''},
  aliases:[],keywords:[],categories:[],relatedConcepts:[],relationships:[],prerequisites:[],learnNext:[],commonlyConfusedWith:[],comparisons:[],examples:[],businessImpact:{},questionsToAsk:[],sources:[],contentVersion:'0.1',reviewStatus:'draft',media
};
await fs.writeFile(path.join(dest,'concept.json'),JSON.stringify(concept,null,2)+'\n');
await fs.writeFile(path.join(dest,'README.md'),`# ${title}\n\nImported as a safe draft. Source filenames were copied into \`media/\`; runtime behavior is still controlled by \`concept.json\`.\n\nNext:\n1. Complete the draft metadata and accessibility fields.\n2. Run \`npm run content:prepare -- --concept ${id}\`.\n3. Run \`npm run validate\`.\n4. Change status from \`draft\` only after review.\n`);
console.log(`Imported ${supported.length} supported source file(s) into draft concept: ${id}`);
console.log('Nothing was published and no existing concept was modified.');
