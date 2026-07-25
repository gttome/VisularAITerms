import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pathsDir=path.join(root,'content','learning-paths');

export async function generateLearningPaths(outputPath=path.join(root,'dist','data','learning-paths.json')){
  let entries=[];
  try{entries=(await fs.readdir(pathsDir,{withFileTypes:true})).filter(x=>x.isFile()&&x.name.endsWith('.json')).map(x=>x.name).sort();}catch{}
  const learningPaths=[];
  for(const name of entries){const data=JSON.parse(await fs.readFile(path.join(pathsDir,name),'utf8'));learningPaths.push(data);}
  learningPaths.sort((a,b)=>a.title.localeCompare(b.title));
  const payload={schemaVersion:1,generatedAt:new Date().toISOString(),learningPaths};
  await fs.mkdir(path.dirname(outputPath),{recursive:true});
  await fs.writeFile(outputPath,JSON.stringify(payload,null,2)+'\n');
  return payload;
}
if(process.argv[1]===fileURLToPath(import.meta.url))generateLearningPaths().then(p=>console.log(`Generated ${p.learningPaths.length} learning path(s).`));
