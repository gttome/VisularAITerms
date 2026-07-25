import {promises as fs} from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {isExternalUrl} from './lib/content-utils.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const conceptsDir=path.join(root,'content','concepts');const args=process.argv.slice(2);const ci=args.indexOf('--concept');const conceptId=ci>=0?args[ci+1]:null;const force=args.includes('--force');
function localPath(baseFile,value){return path.resolve(path.dirname(baseFile),value);}async function shouldGenerate(source,target){if(force)return true;try{const[s,t]=await Promise.all([fs.stat(source),fs.stat(target)]);return s.mtimeMs>t.mtimeMs;}catch{return true;}}async function ensureParent(file){await fs.mkdir(path.dirname(file),{recursive:true});}
function run(cmd,args){return new Promise((resolve,reject)=>{const child=spawn(cmd,args,{stdio:['ignore','pipe','pipe']});let out='',err='';child.stdout.on('data',d=>out+=d);child.stderr.on('data',d=>err+=d);child.on('error',reject);child.on('close',code=>code===0?resolve(out.trim()):reject(new Error(err.trim()||`${cmd} exited ${code}`)));});}
async function tryRun(cmd,args){try{return await run(cmd,args);}catch{return null;}}
function xmlEscape(value=''){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));}
function posterSvg(title){const safe=xmlEscape(title);return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#f5f7fb"/><circle cx="640" cy="285" r="92" fill="#171fa5"/><path d="M615 235 L615 335 L695 285 Z" fill="white"/><text x="640" y="445" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="42" font-weight="700" fill="#172033">${safe}</text><text x="640" y="505" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="28" fill="#171fa5">Visular AI Terms / Concepts</text></svg>`;}
async function helper(mode,params){
  if(process.platform==='win32'){
    const script=path.join(root,'scripts','helpers','Prepare-Media.ps1');const list=['-NoProfile','-ExecutionPolicy','Bypass','-File',script,'-Mode',mode];for(const[k,v]of Object.entries(params))if(v)list.push(`-${k}`,String(v));return run('powershell.exe',list);
  }
  const script=path.join(root,'scripts','helpers','prepare_media.py');const list=[script,mode];for(const[k,v]of Object.entries(params))if(v)list.push(`--${k.toLowerCase()}`,String(v));return run('python3',list);
}
async function enrichMetadata(item,source){
  let changed=false;
  try{const stat=await fs.stat(source);if(item.sizeBytes!==stat.size){item.sizeBytes=stat.size;changed=true;}}catch{}
  if((item.type==='video'||item.type==='audio')&&!Number.isFinite(Number(item.durationSeconds))){
    const out=await tryRun('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',source]);const value=Number(out);if(Number.isFinite(value)&&value>0){item.durationSeconds=Math.round(value*100)/100;changed=true;}
  }
  if(item.type==='video'&&(!item.width||!item.height)){
    const out=await tryRun('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','csv=s=x:p=0',source]);const match=String(out||'').trim().match(/^(\d+)x(\d+)$/);if(match){item.width=Number(match[1]);item.height=Number(match[2]);changed=true;}
  }
  if(item.type==='pdf'&&!item.pages){
    const out=await tryRun('pdfinfo',[source]);const match=String(out||'').match(/^Pages:\s+(\d+)/m);if(match){item.pages=Number(match[1]);changed=true;}
  }
  if(item.type==='image'&&(!item.width||!item.height)){
    const out=await tryRun('identify',['-format','%w,%h',source]);const match=String(out||'').trim().match(/^(\d+),(\d+)$/);if(match){item.width=Number(match[1]);item.height=Number(match[2]);changed=true;}
  }
  return changed;
}
export async function prepareConcept(id){
  const file=path.join(conceptsDir,id,'concept.json');const concept=JSON.parse(await fs.readFile(file,'utf8'));let changed=false;const outputs=[];
  for(const item of concept.media||[]){
    if(!item.src||isExternalUrl(item.src))continue;const source=localPath(file,item.src);try{await fs.access(source);}catch{outputs.push(`SKIP ${id}/${item.id}: source missing`);continue;}
    if(await enrichMetadata(item,source)){changed=true;outputs.push(`METADATA ${id}/${item.id}`);}
    if(item.type==='image'){
      const supportedDerivative=value=>/\.jpe?g$/i.test(String(value||''));const webRel=supportedDerivative(item.webSrc)?item.webSrc:`./derived/${item.id}-1600.jpg`;const thumbRel=supportedDerivative(item.thumbnail)?item.thumbnail:`./derived/${item.id}-thumbnail.jpg`;const web=localPath(file,webRel),thumb=localPath(file,thumbRel);await ensureParent(web);await ensureParent(thumb);
      if(await shouldGenerate(source,web)||await shouldGenerate(source,thumb)){await helper('image',{Src:source,Web:web,Thumb:thumb});outputs.push(`GENERATED ${id}/${path.basename(web)} and ${path.basename(thumb)}`);}
      if(item.webSrc!==webRel){item.webSrc=webRel;changed=true;}if(item.thumbnail!==thumbRel){item.thumbnail=thumbRel;changed=true;}
    }
    if(item.type==='video'){
      const hadPoster=Boolean(item.poster);const posterRel=item.poster||`./derived/${item.id}-poster.svg`;const poster=localPath(file,posterRel);await ensureParent(poster);const mayGenerate=!hadPoster || (/\.svg$/i.test(posterRel) && await shouldGenerate(source,poster));if(mayGenerate){await fs.writeFile(poster,posterSvg(concept.title));outputs.push(`GENERATED ${id}/${path.basename(poster)} (branded poster)`);}if(!item.poster){item.poster=posterRel;changed=true;}
    }
    if(item.type==='docx'){
      const htmlRel=item.webVersion||`./derived/${item.id}.html`;const target=localPath(file,htmlRel);await ensureParent(target);if(await shouldGenerate(source,target)){await helper('docx',{Src:source,Out:target,Title:concept.title});outputs.push(`GENERATED ${id}/${path.basename(target)}`);}if(!item.webVersion){item.webVersion=htmlRel;changed=true;}if(!item.accessibility)item.accessibility={status:'needs-review'};if(!item.accessibility.accessibleAlternative){item.accessibility.accessibleAlternative=htmlRel;changed=true;}
    }
  }
  if(changed)await fs.writeFile(file,JSON.stringify(concept,null,2)+'\n');return outputs;
}
export async function prepareAll(){const dirs=(await fs.readdir(conceptsDir,{withFileTypes:true})).filter(x=>x.isDirectory()).map(x=>x.name).sort();const targets=conceptId?[conceptId]:dirs;if(conceptId&&!dirs.includes(conceptId))throw new Error(`Unknown concept: ${conceptId}`);let generated=0;for(const id of targets){for(const line of await prepareConcept(id)){console.log(line);if(line.startsWith('GENERATED'))generated++;}}console.log(`Content preparation: PASS — ${targets.length} concept(s), ${generated} derivative operation(s).`);}
if(process.argv[1]===fileURLToPath(import.meta.url))prepareAll().catch(error=>{console.error(`ERROR: ${error.message}`);process.exit(1);});
