import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=await fs.readFile(path.join(root,'src','index.html'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const duplicates=ids.filter((id,i)=>ids.indexOf(id)!==i);
const idSet=new Set(ids);const missing=[];
async function walk(dir){const out=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())out.push(...await walk(p));else if(e.name.endsWith('.js'))out.push(p);}return out;}
for(const file of await walk(path.join(root,'src','js'))){const text=await fs.readFile(file,'utf8');for(const m of text.matchAll(/querySelector\(['"]#([^'"]+)['"]\)/g))if(!idSet.has(m[1]))missing.push(path.relative(root,file)+' -> #'+m[1]);}
const problems=[];if(!html.includes('v0.4.0'))problems.push('src/index.html missing v0.4.0');const start=await fs.readFile(path.join(root,'start-server.bat'),'utf8');if(!start.includes('v0.4.0'))problems.push('start-server.bat missing v0.4.0');
if(duplicates.length||missing.length||problems.length){for(const x of duplicates)console.error('ERROR: duplicate HTML id #'+x);for(const x of missing)console.error('ERROR: missing HTML target '+x);for(const x of problems)console.error('ERROR: '+x);process.exit(1);}
console.log('UI static integrity: PASS — '+ids.length+' unique IDs; all querySelector ID targets exist; version markers match v0.4.0.');
