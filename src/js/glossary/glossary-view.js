import {clear,el} from '../shared/dom.js';

export function renderGlossary(container,concepts,onSelect){
  clear(container);
  if(!concepts.length){container.append(el('p',{className:'empty-state',text:'No glossary entries match the current filters.'}));return;}
  const dl=el('dl',{className:'glossary-definition-list'});
  for(const item of concepts){
    const term=el('div',{className:'glossary-entry'});const dt=el('dt');const b=el('button',{className:'glossary-term',attrs:{type:'button'}});b.append(el('strong',{text:item.shortTitle||item.title}));if(item.shortTitle&&item.shortTitle!==item.title)b.append(el('span',{text:item.title}));b.addEventListener('click',()=>onSelect(item));dt.append(b);const dd=el('dd',{text:item.simpleExplanation||item.summary||item.definition||''});term.append(dt,dd);
    if(item.aliases?.length){const aliases=el('p',{className:'glossary-aliases',text:`Also known as: ${item.aliases.join(', ')}`});term.append(aliases);}dl.append(term);
  }
  container.append(dl);
}
