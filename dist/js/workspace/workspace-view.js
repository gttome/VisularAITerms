import {clear,el} from '../shared/dom.js';

function conceptCard(entry,onOpen,{saved=false,onToggleSave}={}){
  const card=el('article',{className:'workspace-card'});const copy=el('div',{className:'workspace-card__copy'});
  const title=el('button',{className:'workspace-card__title',text:entry.shortTitle||entry.title,attrs:{type:'button'}});title.addEventListener('click',()=>onOpen(entry));
  copy.append(title,el('p',{text:entry.summary||''}));
  if(entry.categoryLabels?.length)copy.append(el('p',{className:'workspace-card__meta',text:entry.categoryLabels.join(' • ')}));
  const actions=el('div',{className:'workspace-card__actions'});const open=el('button',{className:'small-button',text:'Open',attrs:{type:'button'}});open.addEventListener('click',()=>onOpen(entry));actions.append(open);
  if(saved&&onToggleSave){const remove=el('button',{className:'small-button',text:'Remove saved',attrs:{type:'button'}});remove.addEventListener('click',()=>onToggleSave(entry.id));actions.append(remove);}
  card.append(copy,actions);return card;
}
function section(title,description,entries,onOpen,options={}){
  const wrap=el('section',{className:'workspace-section'});const header=el('div',{className:'section-heading section-heading--compact'});const text=el('div');text.append(el('p',{className:'eyebrow',text:options.eyebrow||'Your workspace'}),el('h2',{text:title}));header.append(text);
  if(options.actionLabel&&options.onAction){const action=el('button',{className:'small-button',text:options.actionLabel,attrs:{type:'button'}});action.addEventListener('click',options.onAction);header.append(action);}wrap.append(header);
  if(description)wrap.append(el('p',{className:'muted',text:description}));
  const list=el('div',{className:'workspace-grid'});if(entries.length){for(const entry of entries)list.append(conceptCard(entry,onOpen,options));}else list.append(el('p',{className:'empty-state',text:options.emptyText||'Nothing here yet.'}));wrap.append(list);return wrap;
}
export function renderWorkspace(container,{savedEntries,recentEntries,onOpen,onToggleSave,onClearRecent}){
  clear(container);
  container.append(section('Saved concepts','Keep important concepts easy to return to.',savedEntries,onOpen,{eyebrow:'Saved',saved:true,onToggleSave,emptyText:'No saved concepts yet. Open a concept and choose Save concept.'}));
  container.append(section('Recently viewed','Your most recent concept history is stored only in this browser.',recentEntries,onOpen,{eyebrow:'History',actionLabel:recentEntries.length?'Clear recent':null,onAction:onClearRecent,emptyText:'No recently viewed concepts yet.'}));
}
