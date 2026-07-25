export function readRoute(){
  const p=new URLSearchParams(location.search);
  return{conceptId:p.get('concept'),mediaId:p.get('media'),categoryId:p.get('category'),view:p.get('view'),pathId:p.get('path')};
}
export function writeRoute({conceptId,mediaId,categoryId,view,pathId}={}, {replace=false}={}){
  const url=new URL(location.href);
  const apply=(key,value)=>{if(value!==undefined){if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);}};
  apply('concept',conceptId);apply('media',mediaId);apply('category',categoryId);apply('view',view);apply('path',pathId);
  history[replace?'replaceState':'pushState']({},'',url);
}
export function clearRoute({preserveCategory=false}={}){
  const url=new URL(location.href);const category=preserveCategory?url.searchParams.get('category'):null;url.search='';if(category)url.searchParams.set('category',category);history.pushState({},'',url);
}
