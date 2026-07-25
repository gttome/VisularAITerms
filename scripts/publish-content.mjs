import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const steps=[
  ['Prepare content','scripts/prepare-content.mjs'],
  ['Validate content','scripts/validate-content.mjs'],
  ['Build application','scripts/build.mjs']
];
for(const [label,script] of steps){
  console.log(`\n=== ${label} ===`);
  const result=spawnSync(process.execPath,[path.join(root,script)],{cwd:root,stdio:'inherit'});
  if(result.status!==0){console.error(`\nPublishing pipeline stopped safely during: ${label}`);process.exit(result.status||1);}
}
console.log('\nContent publishing pipeline: PASS — build is ready for human visual/accessibility review before release.');
