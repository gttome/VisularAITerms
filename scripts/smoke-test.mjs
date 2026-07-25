import {promises as fs} from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const dist=path.join(root,'dist');
function typeFor(file){return ({'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.mp4':'video/mp4','.m4a':'audio/mp4','.pdf':'application/pdf','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}[path.extname(file).toLowerCase()]||'application/octet-stream');}
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');const rel=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname).replace(/^\/+/, '');const target=path.resolve(dist,rel);if(!target.startsWith(path.resolve(dist))){res.writeHead(403);return res.end();}const body=await fs.readFile(target);res.writeHead(200,{'content-type':typeFor(target),'content-length':body.length});if(req.method==='HEAD')res.end();else res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const {port}=server.address();const base=`http://127.0.0.1:${port}`;
const checked=[];async function check(url){const r=await fetch(base+url);if(!r.ok)throw new Error(`${url} -> ${r.status}`);checked.push(url);return r;}
try{
  await check('/');const catalog=await (await check('/data/catalog.json')).json();const learningPaths=await (await check('/data/learning-paths.json')).json();if(!Array.isArray(learningPaths.learningPaths))throw new Error('learning paths payload missing');if(catalog.application?.version!=='0.4.0')throw new Error('catalog version mismatch');if((catalog.concepts||[]).length<2)throw new Error('expected supplied concepts');
  for(const entry of catalog.concepts){const concept=await (await check('/'+entry.metadata.replace(/^\.\//,''))).json();for(const item of concept.media||[]){for(const field of ['src','webSrc','thumbnail','poster','webVersion']){const value=item[field];if(!value||/^https?:\/\//i.test(value))continue;const metadataDir=path.posix.dirname('/'+entry.metadata.replace(/^\.\//,''));const target=path.posix.normalize(path.posix.join(metadataDir,value));await check(target);}}}
  console.log(`HTTP smoke test: PASS — ${checked.length} application/data/media requests succeeded.`);
}finally{await new Promise(resolve=>server.close(resolve));}
