
import {resolveUrl} from '../shared/urls.js';
import {appendResourceExtras} from './resource-extras.js';
export async function renderPdf(container, item, baseUrl) {
  const wrap=document.createElement('div'); wrap.className='pdf-wrap';
  const iframe=document.createElement('iframe'); iframe.title=`${item.label} viewer`; iframe.src=resolveUrl(item.src,baseUrl); iframe.loading='lazy';
  wrap.append(iframe); container.append(wrap);
  await appendResourceExtras(container,item,baseUrl);
}
