import {loadCatalog,loadConcept} from './catalog/catalog-service.js';
import {applyCatalogFilters,filterByCategory} from './catalog/catalog-filter.js';
import {renderCatalog,renderWelcomeCards,renderCategoryFilters,renderAlphaNav,renderActiveFilters} from './catalog/catalog-view.js';
import {createConceptView} from './concept/concept-view.js';
import {loadLearningPaths} from './learning/learning-path-service.js';
import {renderLearningPathCards,renderLearningPathDetail} from './learning/learning-path-view.js';
import {renderGlossary} from './glossary/glossary-view.js';
import {renderWorkspace} from './workspace/workspace-view.js';
import {getSaved,toggleSaved,getRecent,recordRecent,clearRecent,getCompare,setCompare,toggleCompare,removeCompared,clearCompare,isSaved,isCompared} from './workspace/personal-store.js';
import {renderComparison} from './compare/compare-view.js';
import {readRoute,writeRoute} from './navigation/router.js';

const APP_NAME='Visular AI Terms / Concepts';
const state={allCatalog:[],catalog:[],categories:[],learningPaths:[],browseStatuses:['active','emerging','updated'],selectedConceptId:null,selectedMediaId:null,selectedCategoryId:null,selectedLetter:null,selectedPathId:null,activeView:'concepts',searchQuery:''};
const refs={
  list:document.querySelector('#concept-list'),search:document.querySelector('#concept-search'),clearSearch:document.querySelector('#clear-search'),count:document.querySelector('#catalog-count'),
  categoryList:document.querySelector('#category-list'),alphaNav:document.querySelector('#alpha-nav'),activeFilters:document.querySelector('#active-filters'),
  welcome:document.querySelector('#welcome-view'),cards:document.querySelector('#welcome-cards'),welcomeNote:document.querySelector('#welcome-card-note'),conceptView:document.querySelector('#concept-view'),back:document.querySelector('#back-to-catalog'),
  learningPathsView:document.querySelector('#learning-paths-view'),learningPathsList:document.querySelector('#learning-paths-list'),learningPathDetail:document.querySelector('#learning-path-detail'),glossaryView:document.querySelector('#glossary-view'),glossaryList:document.querySelector('#glossary-list'),
  savedView:document.querySelector('#saved-view'),savedWorkspace:document.querySelector('#saved-workspace'),compareView:document.querySelector('#compare-view'),comparisonWorkspace:document.querySelector('#comparison-workspace'),compareCount:document.querySelector('#compare-count'),
  navConcepts:document.querySelector('#show-concepts'),navLearningPaths:document.querySelector('#show-learning-paths'),navGlossary:document.querySelector('#show-glossary'),navSaved:document.querySelector('#show-saved'),navCompare:document.querySelector('#show-compare')
};
const view=createConceptView({
  onMediaChange:id=>state.selectedMediaId=id,
  onConceptNavigate:navigateConceptById,
  getConceptEntry:id=>state.allCatalog.find(x=>x.id===id),
  isSaved,
  isCompared,
  onToggleSaved:id=>{const ids=toggleSaved(id);updateWorkspaceNav();if(state.activeView==='saved')renderSavedView();return ids.includes(id);},
  onToggleCompare:id=>{const result=toggleCompare(id);updateWorkspaceNav();if(state.activeView==='compare')renderCompareView();return {...result,selected:result.ids.includes(id)};}
});

async function init(){
  try{
    const [data,pathData]=await Promise.all([loadCatalog(),loadLearningPaths()]);
    state.allCatalog=data.concepts||[];state.categories=data.categories||[];state.browseStatuses=data.browseStatuses||state.browseStatuses;state.catalog=state.allCatalog.filter(x=>state.browseStatuses.includes(x.status));state.learningPaths=pathData.learningPaths||[];
    sanitizeWorkspace();bind();updateWorkspaceNav();await applyRoute(true);refreshCatalog();
  }catch(error){console.error(error);refs.welcome.innerHTML='<div class="error-panel"><h1>Content could not be loaded.</h1><p>Confirm that the application is running through start-server.bat rather than opening index.html directly.</p></div>';}
}
function sanitizeWorkspace(){const valid=new Set(state.allCatalog.map(x=>x.id));setCompare(getCompare().filter(id=>valid.has(id)).slice(0,3));}
function bind(){
  refs.search.addEventListener('input',()=>{state.searchQuery=refs.search.value;refreshCatalog();});refs.clearSearch.addEventListener('click',clearSearchQuery);window.addEventListener('popstate',()=>applyRoute(true));refs.back.addEventListener('click',goHome);
  refs.navConcepts.addEventListener('click',goHome);refs.navLearningPaths.addEventListener('click',()=>navigateView('paths'));refs.navGlossary.addEventListener('click',()=>navigateView('glossary'));refs.navSaved.addEventListener('click',()=>navigateView('saved'));refs.navCompare.addEventListener('click',()=>navigateView('compare'));
}
function currentCategory(){return state.categories.find(x=>x.id===state.selectedCategoryId)||null;}
function clearSearchQuery(){state.searchQuery='';refs.search.value='';refreshCatalog();refs.search.focus();}
function selectCategory(id){state.selectedCategoryId=id;state.selectedLetter=null;writeRoute({categoryId:id||null},{replace:false});refreshCatalog();}
function selectLetter(letter){state.selectedLetter=letter;refreshCatalog();}
function clearAllFilters(){state.searchQuery='';state.selectedCategoryId=null;state.selectedLetter=null;refs.search.value='';writeRoute({categoryId:null},{replace:false});refreshCatalog();}
function filteredCatalog(){return applyCatalogFilters(state.catalog,{query:state.searchQuery,categoryId:state.selectedCategoryId,letter:state.selectedLetter});}
function refreshCatalog(){
  const categoryBase=filterByCategory(state.catalog,state.selectedCategoryId);const filtered=filteredCatalog();
  const pieces=[];if(state.searchQuery)pieces.push(`matching “${state.searchQuery}”`);if(currentCategory())pieces.push(`in ${currentCategory().label}`);if(state.selectedLetter)pieces.push(`under ${state.selectedLetter}`);
  refs.count.textContent=`${filtered.length} concept${filtered.length===1?'':'s'}${pieces.length?' '+pieces.join(' '):''}`;refs.clearSearch.hidden=!state.searchQuery;
  renderCategoryFilters(refs.categoryList,state.categories,state.selectedCategoryId,selectCategory,state.catalog.length);renderAlphaNav(refs.alphaNav,categoryBase,state.selectedLetter,selectLetter);
  renderActiveFilters(refs.activeFilters,{query:state.searchQuery,category:currentCategory(),letter:state.selectedLetter,onClearSearch:clearSearchQuery,onClearCategory:()=>selectCategory(null),onClearLetter:()=>selectLetter(null),onClearAll:clearAllFilters});
  renderCatalog(refs.list,filtered,state.selectedConceptId,selectEntry,{query:state.searchQuery,onClearSearch:clearSearchQuery});
  renderWelcomeCards(refs.cards,filtered,selectEntry,{limit:8});refs.welcomeNote.textContent=filtered.length>8?`Showing 8 of ${filtered.length} matching concepts. Use the catalog to browse all results.`:'';refs.welcomeNote.hidden=filtered.length<=8;
  if(state.activeView==='glossary')renderGlossary(refs.glossaryList,filtered,selectEntry);
  if(state.activeView==='saved')renderSavedView();
}
function setExploreNav(active){
  state.activeView=active;const map={concepts:refs.navConcepts,paths:refs.navLearningPaths,glossary:refs.navGlossary,saved:refs.navSaved,compare:refs.navCompare};
  for(const [name,node] of Object.entries(map))node.setAttribute('aria-pressed',String(name===active));
}
function hideMainViews(){refs.welcome.hidden=true;refs.conceptView.hidden=true;refs.learningPathsView.hidden=true;refs.glossaryView.hidden=true;refs.savedView.hidden=true;refs.compareView.hidden=true;}
function goHome(){writeRoute({conceptId:null,mediaId:null,view:null,pathId:null,compareIds:[],categoryId:state.selectedCategoryId},{replace:false});showWelcome();refreshCatalog();}
function navigateView(name){writeRoute({conceptId:null,mediaId:null,view:name==='concepts'?null:name,pathId:null,compareIds:name==='compare'?getCompare():[]},{replace:false});showNamedView(name);}
function showWelcome(){hideMainViews();setExploreNav('concepts');refs.welcome.hidden=false;state.selectedConceptId=null;state.selectedMediaId=null;state.selectedPathId=null;document.title=APP_NAME;}
function showNamedView(name,pathId=null){
  hideMainViews();state.selectedConceptId=null;state.selectedMediaId=null;
  if(name==='paths'){setExploreNav('paths');refs.learningPathsView.hidden=false;state.selectedPathId=pathId||null;renderLearningPaths(pathId);document.title=`Learning Paths | ${APP_NAME}`;return;}
  if(name==='glossary'){setExploreNav('glossary');refs.glossaryView.hidden=false;state.selectedPathId=null;renderGlossary(refs.glossaryList,filteredCatalog(),selectEntry);document.title=`Glossary | ${APP_NAME}`;return;}
  if(name==='saved'){setExploreNav('saved');refs.savedView.hidden=false;state.selectedPathId=null;renderSavedView();document.title=`Saved & Recent | ${APP_NAME}`;return;}
  if(name==='compare'){setExploreNav('compare');refs.compareView.hidden=false;state.selectedPathId=null;renderCompareView();document.title=`Compare concepts | ${APP_NAME}`;return;}
  showWelcome();
}
function entriesFor(ids){const map=new Map(state.allCatalog.map(x=>[x.id,x]));return ids.map(id=>map.get(id)).filter(Boolean);}
function renderSavedView(){renderWorkspace(refs.savedWorkspace,{savedEntries:entriesFor(getSaved()),recentEntries:entriesFor(getRecent()),onOpen:selectEntry,onToggleSave:id=>{toggleSaved(id);updateWorkspaceNav();renderSavedView();},onClearRecent:()=>{clearRecent();renderSavedView();}});}
async function renderCompareView(){
  const ids=getCompare();writeRoute({compareIds:ids},{replace:true});const entries=entriesFor(ids);const concepts=await Promise.all(entries.map(loadConcept));
  renderComparison(refs.comparisonWorkspace,concepts,{onOpen:navigateConceptById,onRemove:id=>{removeCompared(id);updateWorkspaceNav();renderCompareView();},onClear:()=>{clearCompare();updateWorkspaceNav();renderCompareView();},onCopyLink:async()=>{try{await navigator.clipboard.writeText(location.href);return true;}catch{return false;}}});
}
function updateWorkspaceNav(){const count=getCompare().length;refs.compareCount.textContent=String(count);refs.compareCount.setAttribute('aria-label',`${count} concept${count===1?'':'s'} selected`);}
function renderLearningPaths(pathId){
  renderLearningPathCards(refs.learningPathsList,state.learningPaths,path=>{writeRoute({view:'paths',pathId:path.id,conceptId:null,mediaId:null,compareIds:[]});state.selectedPathId=path.id;renderLearningPaths(path.id);});
  const path=state.learningPaths.find(x=>x.id===pathId)||null;const back=renderLearningPathDetail(refs.learningPathDetail,path,state.allCatalog,navigateConceptById);refs.learningPathsList.hidden=Boolean(path);if(back)back.addEventListener('click',()=>{writeRoute({view:'paths',pathId:null,conceptId:null,mediaId:null,compareIds:[]});state.selectedPathId=null;renderLearningPaths(null);});
}
async function selectEntry(entry){writeRoute({conceptId:entry.id,mediaId:null,categoryId:state.selectedCategoryId,view:null,pathId:null,compareIds:[]});await openConcept(entry,null);refreshCatalog();if(innerWidth<800)document.querySelector('#main-content').focus({preventScroll:true});}
async function navigateConceptById(id){const entry=state.allCatalog.find(x=>x.id===id);if(!entry)return;await selectEntry(entry);}
async function openConcept(entry,mediaId){const concept=await loadConcept(entry);recordRecent(entry.id);hideMainViews();setExploreNav('concepts');state.selectedConceptId=entry.id;state.selectedMediaId=mediaId;refs.conceptView.hidden=false;await view.show(concept,mediaId);updateWorkspaceNav();document.title=`${concept.shortTitle||concept.title} | ${APP_NAME}`;}
async function applyRoute(replace=false){
  const route=readRoute();state.selectedCategoryId=state.categories.some(x=>x.id===route.categoryId)?route.categoryId:null;
  if(route.conceptId){const entry=state.allCatalog.find(x=>x.id===route.conceptId);if(!entry){showWelcome();refs.welcome.innerHTML='<div class="error-panel"><h1>Concept not found</h1><p>The requested concept is unavailable or has moved.</p></div>';return;}await openConcept(entry,route.mediaId);if(replace)refreshCatalog();return;}
  if(route.view==='paths'){showNamedView('paths',route.pathId);if(replace)refreshCatalog();return;}
  if(route.view==='glossary'){showNamedView('glossary');if(replace)refreshCatalog();return;}
  if(route.view==='saved'){showNamedView('saved');if(replace)refreshCatalog();return;}
  if(route.view==='compare'){const valid=new Set(state.allCatalog.map(x=>x.id));const routed=route.compareIds.filter(id=>valid.has(id)).slice(0,3);if(route.compareIds.length)setCompare(routed);updateWorkspaceNav();showNamedView('compare');if(replace)refreshCatalog();return;}
  showWelcome();if(replace)refreshCatalog();
}
init();
