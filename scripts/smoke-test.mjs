import {promises as fs} from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const config=JSON.parse(await fs.readFile(path.join(root,'config','app.config.json'),'utf8'));
const version=config.application.version;
const repoMount='/VisularAITerms/';

function typeFor(file){
  return ({'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.mp4':'video/mp4','.m4a':'audio/mp4','.pdf':'application/pdf','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}[path.extname(file).toLowerCase()]||'application/octet-stream');
}
function stripMount(pathname){
  if(pathname.startsWith(repoMount))return '/'+pathname.slice(repoMount.length);
  return pathname;
}
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    const pathname=stripMount(url.pathname);
    const rel=decodeURIComponent(pathname==='/'?'/index.html':pathname).replace(/^\/+/, '');
    const target=path.resolve(dist,rel);
    if(!target.startsWith(path.resolve(dist))){res.writeHead(403);return res.end();}
    const body=await fs.readFile(target);
    res.writeHead(200,{'content-type':typeFor(target),'content-length':body.length});
    if(req.method==='HEAD')res.end();else res.end(body);
  }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const {port}=server.address();
const origin=`http://127.0.0.1:${port}`;
const checked=[];

async function check(url,{method='GET'}={}){
  const r=await fetch(url,{method});
  if(!r.ok)throw new Error(`${url} -> ${r.status}`);
  checked.push(`${method} ${new URL(url).pathname}`);
  return r;
}
function extractRefs(html,pattern){return [...html.matchAll(pattern)].map(m=>m[1]);}
async function checkModuleGraph(entryUrl,seen=new Set()){
  if(seen.has(entryUrl))return;
  seen.add(entryUrl);
  const response=await check(entryUrl);
  const text=await response.text();
  const imports=[...text.matchAll(/(?:import|export)\s+(?:[^'\"]*?\s+from\s+)?['\"]([^'\"]+)['\"]/g)].map(m=>m[1]).filter(x=>x.startsWith('.'));
  for(const specifier of imports)await checkModuleGraph(new URL(specifier,entryUrl).href,seen);
}
async function verifyMount(prefix){
  const indexUrl=origin+prefix;
  const html=await (await check(indexUrl)).text();
  const cssRefs=extractRefs(html,/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi);
  const moduleRefs=extractRefs(html,/<script\b[^>]*type=["']module["'][^>]*src=["']([^"']+)["']/gi);
  if(!moduleRefs.length)throw new Error(`${prefix} missing module script`);
  if(!cssRefs.length)throw new Error(`${prefix} missing stylesheets`);
  const cacheKey=`./static/${version}/`;
  if(!cssRefs.every(ref=>ref.startsWith(cacheKey)))throw new Error(`${prefix} stylesheet cache key mismatch`);
  if(!moduleRefs.every(ref=>ref.startsWith(cacheKey)))throw new Error(`${prefix} JavaScript cache key mismatch`);
  for(const ref of cssRefs)await check(new URL(ref,indexUrl).href);
  for(const ref of moduleRefs)await checkModuleGraph(new URL(ref,indexUrl).href);

  const catalogUrl=new URL('./data/catalog.json',indexUrl).href;
  const pathsUrl=new URL('./data/learning-paths.json',indexUrl).href;
  const catalog=await (await check(catalogUrl)).json();
  const learningPaths=await (await check(pathsUrl)).json();
  if(!Array.isArray(learningPaths.learningPaths))throw new Error('learning paths payload missing');
  if(catalog.application?.version!==version)throw new Error(`catalog version mismatch: expected ${version}`);
  if((catalog.concepts||[]).length<2)throw new Error('expected supplied concepts');

  for(const entry of catalog.concepts){
    const metadataUrl=new URL(entry.metadata,indexUrl).href;
    const concept=await (await check(metadataUrl)).json();
    for(const item of concept.media||[]){
      for(const field of ['src','webSrc','thumbnail','poster','webVersion']){
        const value=item[field];
        if(!value||/^https?:\/\//i.test(value))continue;
        await check(new URL(value,metadataUrl).href,{method:'HEAD'});
      }
    }
  }
}

try{
  await verifyMount('/');
  await verifyMount(repoMount);
  console.log(`HTTP/GitHub Pages smoke test: PASS — ${checked.length} application, versioned frontend, data, module, and media-path requests succeeded at root and ${repoMount}.`);
}finally{
  await new Promise(resolve=>server.close(resolve));
}
