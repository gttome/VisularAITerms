import {clear,el} from '../shared/dom.js';

const rows=[
  ['Explain it simply',c=>c.simpleExplanation||c.summary||''],
  ['Key takeaway',c=>c.keyTakeaway||c.summary||''],
  ['Primary risk',c=>c.primaryRisk||c.risks?.[0]||''],
  ['Senior-leader takeaway',c=>c.executiveTakeaway||c.audiences?.seniorLeaders||''],
  ['Knowledge-worker takeaway',c=>c.knowledgeWorkerTakeaway||c.audiences?.knowledgeWorkers||''],
  ['Potential value',c=>c.businessImpact?.potentialValue||''],
  ['Operational impact',c=>c.businessImpact?.operationalImpact||''],
  ['Categories',c=>(c.__categoryLabels||[]).join(' • ')]
];
async function copyText(value){try{await navigator.clipboard.writeText(value);return true;}catch{return false;}}
export function renderComparison(container,concepts,{onOpen,onRemove,onClear,onCopyLink}={}){
  clear(container);
  const controls=el('div',{className:'comparison-controls'});const count=el('p',{className:'muted',text:`${concepts.length} of 3 concepts selected`});controls.append(count);
  const actions=el('div',{className:'comparison-controls__actions'});
  if(concepts.length){const clearButton=el('button',{className:'small-button',text:'Clear comparison',attrs:{type:'button'}});clearButton.addEventListener('click',onClear);actions.append(clearButton);}
  if(concepts.length>=2){const copy=el('button',{className:'small-button',text:'Copy comparison link',attrs:{type:'button'}});copy.addEventListener('click',async()=>{const ok=onCopyLink?await onCopyLink():await copyText(location.href);const original='Copy comparison link';copy.textContent=ok?'Copied':'Copy failed';setTimeout(()=>copy.textContent=original,1400);});actions.append(copy);}controls.append(actions);container.append(controls);
  if(concepts.length<2){const empty=el('div',{className:'comparison-empty'});empty.append(el('p',{className:'muted',text:'Add at least two concepts using the “Add to compare” button on a concept page.'}));container.append(empty);return;}
  const selected=el('div',{className:'comparison-selected'});for(const concept of concepts){const chip=el('div',{className:'comparison-chip'});const open=el('button',{className:'inline-link-button',text:concept.shortTitle||concept.title,attrs:{type:'button'}});open.addEventListener('click',()=>onOpen(concept.id));const remove=el('button',{className:'comparison-chip__remove',text:'Remove',attrs:{type:'button','aria-label':`Remove ${concept.title} from comparison`}});remove.addEventListener('click',()=>onRemove(concept.id));chip.append(open,remove);selected.append(chip);}container.append(selected);
  const wrap=el('div',{className:'compare-table-wrap'});const table=el('table',{className:'compare-table'});const head=el('thead');const hr=el('tr');hr.append(el('th',{text:'Aspect',attrs:{scope:'col'}}));for(const concept of concepts)hr.append(el('th',{text:concept.shortTitle||concept.title,attrs:{scope:'col'}}));head.append(hr);table.append(head);
  const body=el('tbody');for(const [label,getValue] of rows){const tr=el('tr');tr.append(el('th',{text:label,attrs:{scope:'row'}}));for(const concept of concepts)tr.append(el('td',{text:getValue(concept)||'—'}));body.append(tr);}table.append(body);wrap.append(table);container.append(wrap);
}
