import test from 'node:test';import assert from 'node:assert/strict';
import {slugify,findReplacementCycles,formatBytes,mediaMimeFromExtension} from '../../scripts/lib/content-utils.mjs';
test('slugify creates stable lower-case identifiers',()=>assert.equal(slugify('Retrieval-Augmented Generation (RAG)'),'retrieval-augmented-generation-rag'));
test('replacement cycles are detected',()=>{const cycles=findReplacementCycles([{id:'a',replacedBy:'b'},{id:'b',replacedBy:'a'}]);assert.equal(cycles.length,1);});
test('media extension mapping supports publishing inputs',()=>{assert.deepEqual(mediaMimeFromExtension('.MP4'),['video','video/mp4']);assert.deepEqual(mediaMimeFromExtension('.docx'),['docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document']);});
test('byte formatting is human readable',()=>assert.match(formatBytes(1024*1024),/1\.00 MB/));
