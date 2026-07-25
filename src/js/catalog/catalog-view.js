import {clear,el} from '../shared/dom.js';
import {searchTokens} from './catalog-search.js';
import {availableLetters} from './catalog-filter.js';

function appendHighlightedText(container,text,query){
  const tokens=searchTokens(query).filter(t=>t.length>1);
  if(!tokens.length){container.textContent=text||'';return;}
  const pattern=new RegExp(`(${tokens.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')})`,'ig');
  String(text||'').split(pattern).forEach(part=>{if(tokens.some(t=>part.toLocaleLowerCase()===t))container.append(el('mark',{text:part}));else container.append(document.createTextNode(part));});
}
function statusLabel(status){return ({emerging:'Emerging',updated:'Updated',deprecated:'Deprecated',archived:'Archived'})[status]||'';}
function formatDate(value){if(!value)return'';const d=new Date(`${value}T00:00:00`);return Number.isNaN(d.getTime())?value:new Intl.DateTimeFormat(undefined,{year:'numeric',month:'short',day:'numeric'}).format(d);}
function categoryText(item){return (item.categoryLabels||[]).join(' • ');}

export function renderCategoryFilters(container,categories,selectedId,onSelect,totalCount){
  clear(container);
  const all=el('button',{className:'category-filter',text:`All (${totalCount})`,attrs:{type:'button','aria-pressed':String(!selectedId)}});all.addEventListener('click',()=>onSelect(null));container.append(all);
  for(const category of categories.filter(c=>c.count>0)){
    const b=el('button',{className:'category-filter',text:`${category.label} (${category.count})`,attrs:{type:'button','aria-pressed':String(category.id===selectedId)}});
    b.addEventListener('click',()=>onSelect(category.id));container.append(b);
  }
}
export function renderAlphaNav(container,concepts,selectedLetter,onSelect){
  clear(container);const letters=availableLetters(concepts);const all=el('button',{className:'alpha-button',text:'All',attrs:{type:'button','aria-pressed':String(!selectedLetter)}});all.addEventListener('click',()=>onSelect(null));container.append(all);
  for(const char of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')){const available=letters.includes(char);const b=el('button',{className:'alpha-button',text:char,attrs:{type:'button','aria-pressed':String(selectedLetter===char),disabled:available?null:''}});if(available)b.addEventListener('click',()=>onSelect(char));container.append(b);}
}
export function renderActiveFilters(container,{query,category,letter,onClearSearch,onClearCategory,onClearLetter,onClearAll}){
  clear(container);const active=[];
  if(category)active.push(['Topic',category.label,onClearCategory]);if(letter)active.push(['Letter',letter,onClearLetter]);if(query)active.push(['Search',`“${query}”`,onClearSearch]);
  container.hidden=!active.length;if(!active.length)return;
  for(const [kind,value,handler] of active){const b=el('button',{className:'filter-chip',text:`${kind}: ${value} ×`,attrs:{type:'button'}});b.addEventListener('click',handler);container.append(b);}
  if(active.length>1){const b=el('button',{className:'clear-all-filters',text:'Clear all',attrs:{type:'button'}});b.addEventListener('click',onClearAll);container.append(b);}
}
export function renderCatalog(container,concepts,selectedId,onSelect,{query='',onClearSearch}={}){
  clear(container);
  if(!concepts.length){const box=el('div',{className:'catalog-empty'});box.append(el('p',{text:query?`No concepts match “${query}” with the current filters.`:'No concepts are available for the current filters.'}));if(query&&onClearSearch){const b=el('button',{className:'small-button',text:'Clear search',attrs:{type:'button'}});b.addEventListener('click',onClearSearch);box.append(b);}container.append(box);return;}
  for(const item of concepts){
    const button=el('button',{className:'concept-list__item',attrs:{type:'button'}});if(item.id===selectedId)button.setAttribute('aria-current','page');
    const header=el('span',{className:'concept-list__header'});const title=el('span',{className:'concept-list__title'});appendHighlightedText(title,item.shortTitle||item.title,query);header.append(title);
    const status=statusLabel(item.status);if(status)header.append(el('span',{className:`status-badge status-badge--${item.status}`,text:status}));button.append(header);
    const summary=el('span',{className:'concept-list__summary'});appendHighlightedText(summary,item.summary,query);button.append(summary);
    const cats=categoryText(item);if(cats)button.append(el('span',{className:'concept-list__meta',text:cats}));
    if(item.lastReviewed)button.append(el('span',{className:'concept-list__date',text:`Reviewed ${formatDate(item.lastReviewed)}`}));
    button.addEventListener('click',()=>onSelect(item));container.append(button);
  }
}
export function renderWelcomeCards(container,concepts,onSelect,{limit=8}={}){
  clear(container);for(const item of concepts.slice(0,limit)){const button=el('button',{className:'welcome-card',attrs:{type:'button'}});const img=el('img',{attrs:{src:item.thumbnail||'./assets/visular-ai-terms-logo.webp',alt:'',loading:'lazy',width:'104',height:'82'}});const copy=el('div');const titleRow=el('div',{className:'welcome-card__title-row'});titleRow.append(el('h2',{text:item.shortTitle||item.title}));const status=statusLabel(item.status);if(status)titleRow.append(el('span',{className:`status-badge status-badge--${item.status}`,text:status}));copy.append(titleRow,el('p',{text:item.summary}));const cats=categoryText(item);if(cats)copy.append(el('span',{className:'welcome-card__meta',text:cats}));button.append(img,copy);button.addEventListener('click',()=>onSelect(item));container.append(button);}
}
