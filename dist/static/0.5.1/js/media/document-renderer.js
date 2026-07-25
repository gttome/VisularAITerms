import {resolveUrl} from '../shared/urls.js';
export async function renderDocument(container, item, baseUrl) {
  container.classList.add('media-viewer--document');
  const response=await fetch(resolveUrl(item.webVersion,baseUrl));
  if(!response.ok) throw new Error('Readable document version could not be loaded.');
  const text=await response.text();
  const parsed=new DOMParser().parseFromString(text,'text/html');
  const article=parsed.querySelector('article');
  const wrapper=document.createElement('div'); wrapper.className='document-frame';
  if(article) wrapper.append(article.cloneNode(true)); else wrapper.textContent='Readable document content is unavailable.';
  container.append(wrapper);
}
