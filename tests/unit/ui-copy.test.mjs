import test from 'node:test';
import assert from 'node:assert/strict';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');

test('redundant remediation banners are not rendered in the v0.4.0 UI',async()=>{
  const files=['src/index.html','src/js/media/resource-extras.js','src/js/media/media-viewer.js'];const text=(await Promise.all(files.map(f=>fs.readFile(path.join(root,f),'utf8')))).join('\n');
  assert.doesNotMatch(text,/Transcript not yet available for the supplied source audio/i);assert.doesNotMatch(text,/Transcript not yet available for the supplied source video/i);assert.doesNotMatch(text,/The supplied MP4 has no embedded subtitle stream/i);
});
