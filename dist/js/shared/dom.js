export function clear(element){element.replaceChildren();}
export function el(tag,options={}){
  const node=document.createElement(tag);
  if(options.className)node.className=options.className;
  if(options.text!==undefined)node.textContent=options.text;
  if(options.attrs)Object.entries(options.attrs).forEach(([k,v])=>{if(v===null||v===undefined||v===false)return;if(v===true)node.setAttribute(k,'');else node.setAttribute(k,String(v));});
  return node;
}
export function fillList(element,items=[]){clear(element);items.forEach(item=>element.append(el('li',{text:item})));}
