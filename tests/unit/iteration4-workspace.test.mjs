import test from 'node:test';
import assert from 'node:assert/strict';
import {clearCompare,getCompare,toggleCompare,setCompare,getRecent,recordRecent,clearRecent,isSaved,toggleSaved} from '../../src/js/workspace/personal-store.js';

test('saved concepts toggle without server state',()=>{
  const id='workspace-test-saved';if(isSaved(id))toggleSaved(id);assert.equal(isSaved(id),false);toggleSaved(id);assert.equal(isSaved(id),true);toggleSaved(id);assert.equal(isSaved(id),false);
});

test('recent concepts are de-duplicated and newest first',()=>{
  clearRecent();recordRecent('a');recordRecent('b');recordRecent('a');assert.deepEqual(getRecent().slice(0,2),['a','b']);clearRecent();
});

test('comparison selection is limited to three concepts',()=>{
  clearCompare();assert.equal(toggleCompare('a').added,true);toggleCompare('b');toggleCompare('c');const result=toggleCompare('d');assert.equal(result.changed,false);assert.equal(result.reason,'limit');assert.deepEqual(getCompare(),['a','b','c']);clearCompare();
});

test('shareable comparison state can replace local selection',()=>{
  setCompare(['x','y']);assert.deepEqual(getCompare(),['x','y']);clearCompare();
});
