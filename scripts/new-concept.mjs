import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {slugify} from './lib/content-utils.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const title=process.argv.slice(2).filter(x=>!x.startsWith('--')).join(' ').trim();
if(!title){
  console.error('Usage: npm run concept:new -- "Concept Title"');
  process.exit(1);
}
const id=slugify(title);
if(!id){console.error('Unable to create a valid concept ID from the title.');process.exit(1);}
const dest=path.join(root,'content','concepts',id);
try{await fs.access(dest);console.error(`Concept already exists: ${id}`);process.exit(1);}catch{}
await fs.mkdir(path.join(dest,'media'),{recursive:true});
await fs.mkdir(path.join(dest,'derived'),{recursive:true});
const template=JSON.parse(await fs.readFile(path.join(root,'content','templates','concept-template','concept.json'),'utf8'));
template.id=id; template.title=title; template.shortTitle=title;
await fs.writeFile(path.join(dest,'concept.json'),JSON.stringify(template,null,2)+'\n');
await fs.writeFile(path.join(dest,'README.md'),`# ${title}\n\nDraft concept ID: \`${id}\`.\n\nComplete \`concept.json\`, add source files to \`media/\`, then run:\n\n\`npm run content:prepare -- --concept ${id}\`\n\n\`npm run validate\`\n\nDraft concepts are excluded from the public catalog.\n`);
console.log(`Created draft concept: ${id}`);
console.log(`Folder: content/concepts/${id}`);
