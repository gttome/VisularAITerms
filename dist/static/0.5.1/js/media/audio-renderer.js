
import {resolveUrl} from '../shared/urls.js';
import {appendResourceExtras} from './resource-extras.js';
export async function renderAudio(container, item, baseUrl) {
  const wrap=document.createElement('div'); wrap.className='audio-wrap';
  const audio=document.createElement('audio'); audio.controls=true; audio.preload='metadata'; audio.src=resolveUrl(item.src,baseUrl);
  wrap.append(audio); container.append(wrap);
  await appendResourceExtras(container,item,baseUrl);
}
