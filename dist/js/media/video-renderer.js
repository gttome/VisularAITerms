
import {resolveUrl} from '../shared/urls.js';
import {appendResourceExtras} from './resource-extras.js';
export async function renderVideo(container, item, baseUrl) {
  const wrap=document.createElement('div'); wrap.className='video-wrap';
  const video=document.createElement('video');
  video.controls=true; video.playsInline=true; video.preload='metadata';
  video.src=resolveUrl(item.src,baseUrl);
  if(item.poster) video.poster=resolveUrl(item.poster,baseUrl);
  const captions=item.accessibility?.captions || item.captions;
  if(captions){
    const track=document.createElement('track'); track.kind='captions'; track.label='English'; track.srclang='en'; track.default=true; track.src=resolveUrl(captions,baseUrl); video.append(track);
  }
  wrap.append(video); container.append(wrap);
  await appendResourceExtras(container,item,baseUrl);
}
