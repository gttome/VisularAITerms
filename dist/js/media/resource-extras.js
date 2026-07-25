import {resolveUrl} from '../shared/urls.js';

async function loadReadableContent(url){
  const response=await fetch(url);if(!response.ok)throw new Error('Readable alternative could not be loaded.');
  const text=await response.text();
  if(/\.html?(?:$|[?#])/i.test(url)){
    const parsed=new DOMParser().parseFromString(text,'text/html');const article=parsed.querySelector('article')||parsed.querySelector('main')||parsed.body;const wrapper=document.createElement('div');if(article)wrapper.append(...[...article.childNodes].map(n=>n.cloneNode(true)));return wrapper;
  }
  const pre=document.createElement('div');pre.style.whiteSpace='pre-wrap';pre.textContent=text;return pre;
}
function escapeRegExp(value){return value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function highlightTranscript(container,query){
  container.querySelectorAll('mark.transcript-match').forEach(mark=>mark.replaceWith(document.createTextNode(mark.textContent||'')));
  if(!query.trim())return 0;
  const regex=new RegExp(escapeRegExp(query.trim()),'gi');const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);let count=0;
  for(const node of nodes){if(node.parentElement?.closest('mark.transcript-match'))continue;const text=node.nodeValue||'';regex.lastIndex=0;if(!regex.test(text))continue;regex.lastIndex=0;const frag=document.createDocumentFragment();let last=0;for(const match of text.matchAll(regex)){frag.append(document.createTextNode(text.slice(last,match.index)));const mark=document.createElement('mark');mark.className='transcript-match';mark.textContent=match[0];frag.append(mark);last=match.index+match[0].length;count++;}frag.append(document.createTextNode(text.slice(last)));node.replaceWith(frag);}
  container.querySelector('mark.transcript-match')?.scrollIntoView({block:'nearest'});return count;
}

export async function appendResourceExtras(container,item,baseUrl){
  const a=item.accessibility||{};const transcript=a.transcript||item.transcript;const alternative=a.accessibleAlternative;
  if(transcript){
    const extra=document.createElement('div');extra.className='resource-extra';const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Show transcript';details.append(summary);const body=document.createElement('div');body.className='resource-extra__body';body.textContent='Loading transcript…';details.append(body);extra.append(details);container.append(extra);
    details.addEventListener('toggle',async()=>{if(!details.open||body.dataset.loaded)return;try{const content=await loadReadableContent(resolveUrl(transcript,baseUrl));body.replaceChildren();const search=document.createElement('div');search.className='transcript-search';const label=document.createElement('label');const inputId=`transcript-search-${item.id}`;label.htmlFor=inputId;label.textContent='Search transcript';const input=document.createElement('input');input.id=inputId;input.type='search';input.placeholder='Find a word or phrase';const status=document.createElement('span');status.className='muted';status.setAttribute('aria-live','polite');search.append(label,input,status);const transcriptBody=document.createElement('div');transcriptBody.className='transcript-content';transcriptBody.append(content);body.append(search,transcriptBody);input.addEventListener('input',()=>{const count=highlightTranscript(transcriptBody,input.value);status.textContent=input.value.trim()?`${count} match${count===1?'':'es'}`:'';});body.dataset.loaded='true';summary.textContent='Transcript';}catch{body.textContent='Transcript could not be loaded.';}});
  }
  if(alternative&&item.type==='pdf'){
    const extra=document.createElement('div');extra.className='resource-extra';const box=document.createElement('div');box.className='accessible-alternative';const p=document.createElement('p');p.textContent=a.alternativeLabel||'A readable concept briefing is available as an alternative to this source document.';const link=document.createElement('a');link.href=resolveUrl(alternative,baseUrl);link.target='_blank';link.rel='noopener';link.textContent='Open readable concept briefing';box.append(p,link);extra.append(box);container.append(extra);
  }
}
