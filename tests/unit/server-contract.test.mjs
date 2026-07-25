import test from 'node:test';
import assert from 'node:assert/strict';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');

test('Windows server retains byte-range support and expected disconnect handling',async()=>{
  const text=await fs.readFile(path.join(root,'scripts','serve.ps1'),'utf8');
  assert.match(text,/Accept-Ranges: bytes/);assert.match(text,/206 Partial Content/);assert.match(text,/Test-ExpectedClientDisconnect/);assert.match(text,/ConnectionReset/);assert.match(text,/ConnectionAborted/);assert.match(text,/if \(-not \(Test-ExpectedClientDisconnect \$_\.Exception\)\)/);
});
