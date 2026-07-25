import {clear,el,fillList} from '../shared/dom.js';
import {renderMedia} from '../media/media-viewer.js';
import {writeRoute} from '../navigation/router.js';

function formatReviewed(value){
  if(!value)return'';
  const d=new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime())?value:new Intl.DateTimeFormat(undefined,{year:'numeric',month:'long',day:'numeric'}).format(d);
}
function mediaLabel(item){const defaults={image:'Infographic',video:'Watch video',audio:'Listen',pdf:'Presentation',docx:'Read'};return item.displayLabel||defaults[item.type]||item.label;}
function mediaIcon(type){return({image:'▧',video:'▶',audio:'◉',pdf:'▤',docx:'▥'})[type]||'•';}
function statusText(status){return({emerging:'Emerging concept — terminology and practices may still be evolving.',updated:'Recently updated concept — review the latest definition and guidance below.',deprecated:'Deprecated terminology — this page is preserved for historical links.',archived:'Archived concept — this page is preserved for reference.'})[status]||'';}
function statusLabel(status){return({emerging:'Emerging',updated:'Updated',deprecated:'Deprecated',archived:'Archived'})[status]||'';}
function relationshipLabel(type){return({foundation:'Built on',prerequisite:'Requires',related:'Related to',enables:'Enables',uses:'Uses',governs:'Governs','governed-by':'Governed by','contrasts-with':'Contrasts with','next-concept':'Continue with'})[type]||type;}
function formatDuration(seconds){
  if(!Number.isFinite(Number(seconds)))return'';
  const total=Math.max(0,Math.round(Number(seconds)));const minutes=Math.floor(total/60);const secs=total%60;
  if(minutes===0)return `${secs} sec`;
  if(secs===0)return `${minutes} min`;
  return `${minutes} min ${secs} sec`;
}
function mediaMeta(item){
  if(item.type==='video'||item.type==='audio')return formatDuration(item.durationSeconds);
  if(item.type==='pdf'&&item.pages)return `${item.pages} page${item.pages===1?'':'s'}`;
  if(item.type==='image')return 'Visual overview';
  if(item.type==='docx')return 'Full briefing';
  return '';
}
function readingTime(text=''){const words=String(text).trim().split(/\s+/).filter(Boolean).length;return Math.max(1,Math.ceil(words/220));}
async function copyText(value){
  try{await navigator.clipboard.writeText(value);return true;}
  catch{
    const area=document.createElement('textarea');area.value=value;area.setAttribute('readonly','');area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();const ok=document.execCommand('copy');area.remove();return ok;
  }
}

export function createConceptView({onMediaChange,onConceptNavigate,getConceptEntry,isSaved,isCompared,onToggleSaved,onToggleCompare}){
  const refs={
    title:document.querySelector('#concept-title'),definition:document.querySelector('#concept-definition'),classification:document.querySelector('#concept-classification'),meta:document.querySelector('#concept-meta'),
    simple:document.querySelector('#simple-explanation'),executiveTakeaway:document.querySelector('#executive-takeaway'),workerTakeaway:document.querySelector('#worker-takeaway'),keyTakeaway:document.querySelector('#key-takeaway'),primaryRisk:document.querySelector('#primary-risk'),learningChoices:document.querySelector('#learning-choices'),
    leaders:document.querySelector('#leaders-text'),workers:document.querySelector('#workers-text'),misconception:document.querySelector('#misconception-text'),opportunities:document.querySelector('#opportunities-list'),risks:document.querySelector('#risks-list'),monitor:document.querySelector('#monitor-text'),
    selector:document.querySelector('#media-selector'),viewer:document.querySelector('#media-viewer'),status:document.querySelector('#media-status'),original:document.querySelector('#open-original'),
    statusBanner:document.querySelector('#concept-status-banner'),relatedSection:document.querySelector('#related-section'),related:document.querySelector('#related-concepts'),
    quickButton:document.querySelector('#quick-view-button'),deepButton:document.querySelector('#deep-view-button'),quickPanel:document.querySelector('#quick-view-panel'),deepPanel:document.querySelector('#deep-view-panel'),
    save:document.querySelector('#save-concept'),compare:document.querySelector('#compare-concept'),copyLink:document.querySelector('#copy-link'),copyDefinition:document.querySelector('#copy-definition'),print:document.querySelector('#print-concept'),
    businessSection:document.querySelector('#business-impact-section'),business:document.querySelector('#business-impact'),examplesSection:document.querySelector('#examples-section'),examples:document.querySelector('#examples-list'),questionsCard:document.querySelector('#questions-card'),questions:document.querySelector('#questions-list'),
    connectionsSection:document.querySelector('#connections-section'),connections:document.querySelector('#connections-list'),prerequisitesSection:document.querySelector('#prerequisites-section'),prerequisites:document.querySelector('#prerequisites-list'),learnNextSection:document.querySelector('#learn-next-section'),learnNext:document.querySelector('#learn-next-list'),confusedSection:document.querySelector('#confused-section'),confused:document.querySelector('#confused-list'),comparisonsSection:document.querySelector('#comparisons-section'),comparisons:document.querySelector('#comparisons-list'),sourcesSection:document.querySelector('#sources-section'),sources:document.querySelector('#sources-list')
  };
  let current=null;let selectedId=null;let mediaRendered=false;let mode='quick';

  refs.quickButton.addEventListener('click',()=>setMode('quick',{clearMediaRoute:true}));
  refs.deepButton.addEventListener('click',()=>setMode('deep'));
  refs.save.addEventListener('click',()=>{if(!current)return;onToggleSaved?.(current.id);updatePersonalActions();});
  refs.compare.addEventListener('click',()=>{if(!current)return;const result=onToggleCompare?.(current.id);if(result?.reason==='limit'){refs.compare.textContent='Compare full (3)';setTimeout(updatePersonalActions,1400);return;}updatePersonalActions();});
  refs.copyLink.addEventListener('click',async()=>flashButton(refs.copyLink,await copyText(location.href)?'Copied':'Copy failed'));
  refs.copyDefinition.addEventListener('click',async()=>{if(!current)return;const text=`${current.title}\n\n${current.simpleExplanation||current.definition||current.summary}`;flashButton(refs.copyDefinition,await copyText(text)?'Copied':'Copy failed');});
  refs.print.addEventListener('click',()=>window.print());

  function flashButton(button,text){const original=button.dataset.originalText||button.textContent;button.dataset.originalText=original;button.textContent=text;setTimeout(()=>{button.textContent=original;},1400);}
  function updatePersonalActions(){
    if(!current)return;const saved=Boolean(isSaved?.(current.id));const compared=Boolean(isCompared?.(current.id));
    refs.save.setAttribute('aria-pressed',String(saved));refs.save.textContent=saved?'Saved':'Save concept';
    refs.compare.setAttribute('aria-pressed',String(compared));refs.compare.textContent=compared?'Remove from compare':'Add to compare';
  }

  async function show(concept,requestedMediaId){
    current=concept;mediaRendered=false;updatePersonalActions();
    refs.title.textContent=concept.title;refs.definition.textContent=concept.definition||concept.summary;refs.classification.textContent=concept.classification?.type||'AI concept';
    refs.simple.textContent=concept.simpleExplanation||concept.summary||concept.definition||'';
    refs.executiveTakeaway.textContent=concept.executiveTakeaway||concept.audiences?.seniorLeaders||'';
    refs.workerTakeaway.textContent=concept.knowledgeWorkerTakeaway||concept.audiences?.knowledgeWorkers||'';
    refs.keyTakeaway.textContent=concept.keyTakeaway||concept.summary||'';
    refs.primaryRisk.textContent=concept.primaryRisk||concept.risks?.[0]||'';
    refs.leaders.textContent=concept.audiences?.seniorLeaders||'';refs.workers.textContent=concept.audiences?.knowledgeWorkers||'';refs.misconception.textContent=concept.misconception||'';refs.monitor.textContent=concept.monitor||'';fillList(refs.opportunities,concept.opportunities);fillList(refs.risks,concept.risks);
    renderStatus(concept);renderMeta(concept);renderBusinessImpact(concept);renderExamples(concept);renderQuestions(concept);renderConnections(concept);renderConceptListSection(refs.prerequisitesSection,refs.prerequisites,concept.prerequisites||[]);renderConceptListSection(refs.learnNextSection,refs.learnNext,concept.learnNext||[]);renderConfused(concept);renderComparisons(concept);renderRelated(concept);renderSources(concept);
    const available=concept.media||[];const selected=available.find(x=>x.id===requestedMediaId)||available[0];selectedId=selected?.id||null;renderSelector(available);renderLearningChoices(concept,available);
    refs.viewer.replaceChildren();refs.viewer.className='media-viewer';refs.status.textContent='';refs.original.hidden=true;
    if(requestedMediaId&&selected){await setMode('deep',{renderMediaNow:false});await renderSelected(selected);}else await setMode('quick');
  }

  async function setMode(next,{clearMediaRoute=false,renderMediaNow=true}={}){
    mode=next;const quick=next==='quick';refs.quickPanel.hidden=!quick;refs.deepPanel.hidden=quick;refs.quickButton.setAttribute('aria-selected',String(quick));refs.deepButton.setAttribute('aria-selected',String(!quick));refs.quickButton.tabIndex=quick?0:-1;refs.deepButton.tabIndex=quick?-1:0;
    if(quick&&clearMediaRoute&&current)writeRoute({conceptId:current.id,mediaId:null},{replace:true});
    if(!quick&&renderMediaNow&&!mediaRendered&&current?.media?.length){const selected=current.media.find(x=>x.id===selectedId)||current.media[0];await renderSelected(selected);}
  }

  function renderStatus(concept){
    clear(refs.statusBanner);const text=statusText(concept.status);if(!text){refs.statusBanner.hidden=true;return;}refs.statusBanner.hidden=false;refs.statusBanner.className=`concept-status concept-status--${concept.status}`;refs.statusBanner.append(el('strong',{text}),document.createTextNode(' '));
    if((concept.status==='deprecated'||concept.status==='archived')&&concept.replacedBy){const replacement=getConceptEntry?.(concept.replacedBy);if(replacement){const b=el('button',{className:'inline-link-button',text:`See ${replacement.title}`,attrs:{type:'button'}});b.addEventListener('click',()=>onConceptNavigate?.(replacement.id));refs.statusBanner.append(b);}}
  }
  function renderMeta(concept){
    clear(refs.meta);const label=statusLabel(concept.status);if(label)refs.meta.append(el('span',{className:`meta-chip status-badge--${concept.status}`,text:label}));
    if(concept.classification?.confidence)refs.meta.append(el('span',{className:'meta-chip',text:`Confidence: ${concept.classification.confidence}`}));
    if(concept.lastReviewed)refs.meta.append(el('span',{className:`meta-chip ${concept.__freshnessStatus==='current'?'meta-chip--fresh':'meta-chip--review'}`,text:`Last reviewed: ${formatReviewed(concept.lastReviewed)}`}));
    if(concept.sources?.length)refs.meta.append(el('span',{className:'meta-chip',text:`Sources: ${concept.sources.length}`}));
    if(concept.contentVersion)refs.meta.append(el('span',{className:'meta-chip',text:`Content v${concept.contentVersion}`}));
    for(const labelText of concept.__categoryLabels||[])refs.meta.append(el('span',{className:'meta-chip meta-chip--category',text:labelText}));
  }
  function renderBusinessImpact(concept){
    clear(refs.business);const impact=concept.businessImpact||{};const items=[['Potential value',impact.potentialValue],['Operational impact',impact.operationalImpact],['Primary risk',impact.primaryRisk],['Leadership question',impact.leadershipQuestion]].filter(([,value])=>value);
    refs.businessSection.hidden=!items.length;for(const [label,value] of items){const card=el('div',{className:'business-impact-card'});card.append(el('span',{text:label}),el('p',{text:value}));refs.business.append(card);}
  }
  function renderExamples(concept){
    clear(refs.examples);const items=concept.examples?.length?concept.examples:(concept.example?[{title:'Practical example',audience:'all',summary:concept.example}]:[]);refs.examplesSection.hidden=!items.length;
    for(const item of items){const card=el('article',{className:'example-card'});const label=item.audience&&item.audience!=='all'?item.audience.replace('-',' '):'';card.append(el('h3',{text:item.title||'Example'}));if(label)card.append(el('p',{className:'eyebrow',text:label}));card.append(el('p',{text:item.summary||''}));refs.examples.append(card);}
  }
  function renderQuestions(concept){
    clear(refs.questions);const items=concept.questionsToAsk||[];refs.questionsCard.hidden=!items.length;if(!items.length)return;
    const list=el('ul');for(const item of items){const li=el('li');li.append(document.createTextNode(item.question));if(item.audience&&item.audience!=='all')li.append(el('span',{className:'question-audience',text:` ${item.audience==='senior-leader'?'Senior leaders':'Knowledge workers'}`}));list.append(li);}refs.questions.append(list);
  }
  function renderConnections(concept){
    clear(refs.connections);const items=concept.relationships||[];const valid=items.map(item=>({item,entry:getConceptEntry?.(item.conceptId)})).filter(x=>x.entry);refs.connectionsSection.hidden=!valid.length;
    for(const {item,entry} of valid){const row=el('div',{className:'connection-row'});row.append(el('span',{className:'connection-row__type',text:item.label||relationshipLabel(item.type)}));const b=el('button',{className:'inline-link-button',text:entry.title,attrs:{type:'button'}});b.addEventListener('click',()=>onConceptNavigate?.(entry.id));row.append(b);refs.connections.append(row);}
  }
  function conceptButton(entry,summary=''){
    const b=el('button',{className:'related-concept',attrs:{type:'button'}});b.append(el('strong',{text:entry.title}),el('span',{text:summary||entry.summary||''}));b.addEventListener('click',()=>onConceptNavigate?.(entry.id));return b;
  }
  function renderConceptListSection(section,container,ids){clear(container);const entries=ids.map(id=>getConceptEntry?.(id)).filter(Boolean);section.hidden=!entries.length;for(const entry of entries)container.append(conceptButton(entry));}
  function renderConfused(concept){
    clear(refs.confused);const items=(concept.commonlyConfusedWith||[]).map(item=>({item,entry:getConceptEntry?.(item.conceptId)})).filter(x=>x.entry);refs.confusedSection.hidden=!items.length;for(const {item,entry} of items)refs.confused.append(conceptButton(entry,item.summary));
  }
  function renderComparisons(concept){
    clear(refs.comparisons);const items=(concept.comparisons||[]).map(item=>({item,entry:getConceptEntry?.(item.conceptId)})).filter(x=>x.entry&&x.item.rows?.length);refs.comparisonsSection.hidden=!items.length;
    for(const {item,entry} of items){const wrap=el('div',{className:'comparison-wrap'});wrap.append(el('h3',{text:item.title||`${concept.shortTitle||concept.title} vs. ${entry.shortTitle||entry.title}`}));const table=el('table',{className:'comparison-table'});const head=el('thead');const hr=el('tr');for(const text of ['Aspect',concept.shortTitle||concept.title,entry.shortTitle||entry.title])hr.append(el('th',{text,attrs:{scope:'col'}}));head.append(hr);table.append(head);const body=el('tbody');for(const row of item.rows){const tr=el('tr');tr.append(el('th',{text:row.aspect,attrs:{scope:'row'}}),el('td',{text:row.current}),el('td',{text:row.other}));body.append(tr);}table.append(body);wrap.append(table);refs.comparisons.append(wrap);}
  }
  function renderRelated(concept){
    clear(refs.related);const explicit=new Set([...(concept.prerequisites||[]),...(concept.learnNext||[]),...(concept.relationships||[]).map(x=>x.conceptId)]);const ids=(concept.relatedConcepts||[]).filter(id=>!explicit.has(id));const entries=ids.map(id=>getConceptEntry?.(id)).filter(Boolean);refs.relatedSection.hidden=!entries.length;for(const entry of entries)refs.related.append(conceptButton(entry));
  }
  function renderSources(concept){
    clear(refs.sources);const items=concept.sources||[];refs.sourcesSection.hidden=!items.length;for(const source of items){const li=el('li');if(source.url){const link=el('a',{text:source.title,attrs:{href:source.url,target:'_blank',rel:'noopener'}});li.append(link);}else li.append(document.createTextNode(source.title));if(source.publisher)li.append(document.createTextNode(` — ${source.publisher}`));if(source.note)li.append(el('span',{className:'source-note',text:` ${source.note}`}));refs.sources.append(li);}
  }
  function renderLearningChoices(concept,available){
    clear(refs.learningChoices);const quick=el('button',{className:'learning-choice learning-choice--quick',attrs:{type:'button'}});quick.append(el('strong',{text:'Quick explanation'}),el('span',{text:`About ${readingTime(concept.simpleExplanation||concept.summary)} min read`}));quick.addEventListener('click',()=>refs.quickPanel.scrollIntoView({behavior:'smooth',block:'start'}));refs.learningChoices.append(quick);
    for(const item of available){const b=el('button',{className:'learning-choice',attrs:{type:'button'}});b.append(el('strong',{text:mediaLabel(item)}));const meta=mediaMeta(item);if(meta)b.append(el('span',{text:meta}));b.addEventListener('click',async()=>{selectedId=item.id;await setMode('deep',{renderMediaNow:false});await renderSelected(item);writeRoute({conceptId:current.id,mediaId:item.id});document.querySelector('.learning-section')?.scrollIntoView({behavior:'smooth',block:'start'});if(onMediaChange)onMediaChange(item.id);});refs.learningChoices.append(b);}
  }
  function renderSelector(available){
    clear(refs.selector);available.forEach((item,index)=>{const b=el('button',{className:'media-tab',attrs:{type:'button',role:'tab','aria-selected':String(item.id===selectedId),'aria-controls':'media-viewer',tabindex:item.id===selectedId?'0':'-1','data-media-id':item.id}});b.append(el('span',{className:'media-tab__icon',text:mediaIcon(item.type),attrs:{'aria-hidden':'true'}}),document.createTextNode(mediaLabel(item)));const meta=mediaMeta(item);if(meta)b.append(el('span',{className:'media-tab__meta',text:meta}));b.addEventListener('click',()=>selectMedia(item));b.addEventListener('keydown',event=>handleTabKey(event,available,index));refs.selector.append(b);});
  }
  function handleTabKey(event,available,index){if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;event.preventDefault();let next=index;if(event.key==='ArrowRight')next=(index+1)%available.length;if(event.key==='ArrowLeft')next=(index-1+available.length)%available.length;if(event.key==='Home')next=0;if(event.key==='End')next=available.length-1;const btn=refs.selector.querySelector(`[data-media-id="${available[next].id}"]`);if(btn)btn.focus();}
  async function renderSelected(item){selectedId=item.id;[...refs.selector.children].forEach(btn=>{const selected=btn.dataset.mediaId===item.id;btn.setAttribute('aria-selected',String(selected));btn.tabIndex=selected?0:-1;});await renderMedia(refs.viewer,item,current.__metadataUrl,refs.status,refs.original);mediaRendered=true;}
  async function selectMedia(item){await setMode('deep',{renderMediaNow:false});await renderSelected(item);writeRoute({conceptId:current.id,mediaId:item.id});if(onMediaChange)onMediaChange(item.id);}
  return{show,setMode};
}
