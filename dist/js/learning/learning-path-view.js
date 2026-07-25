import {clear,el} from '../shared/dom.js';

function audienceLabel(value){return ({all:'All audiences','senior-leader':'Senior leaders','knowledge-worker':'Knowledge workers'})[value]||value||'All audiences';}

export function renderLearningPathCards(container,paths,onSelect){
  clear(container);
  if(!paths.length){container.append(el('p',{className:'empty-state',text:'No learning paths are available yet.'}));return;}
  for(const path of paths){
    const button=el('button',{className:'learning-path-card',attrs:{type:'button'}});
    button.append(el('span',{className:'eyebrow',text:audienceLabel(path.audience)}),el('strong',{text:path.title}),el('p',{text:path.description}),el('span',{className:'learning-path-card__count',text:`${path.concepts.length} concept${path.concepts.length===1?'':'s'}`}));
    button.addEventListener('click',()=>onSelect(path));container.append(button);
  }
}

export function renderLearningPathDetail(container,path,catalog,onSelectConcept){
  clear(container);if(!path){container.hidden=true;return;}container.hidden=false;
  const back=el('button',{className:'text-button',text:'← All learning paths',attrs:{type:'button'}});container.append(back);
  const head=el('header',{className:'learning-path-detail__header'});head.append(el('p',{className:'eyebrow',text:audienceLabel(path.audience)}),el('h2',{text:path.title}),el('p',{className:'lede',text:path.description}));container.append(head);
  const list=el('ol',{className:'learning-path-steps'});
  for(const id of path.concepts){const entry=catalog.find(item=>item.id===id);if(!entry)continue;const li=el('li');const button=el('button',{className:'learning-path-step',attrs:{type:'button'}});button.append(el('strong',{text:entry.title}),el('span',{text:entry.simpleExplanation||entry.summary||''}));button.addEventListener('click',()=>onSelectConcept(entry.id));li.append(button);list.append(li);}container.append(list);
  return back;
}
