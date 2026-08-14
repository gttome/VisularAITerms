import {renderImage} from './image-renderer.js';
import {renderVideo} from './video-renderer.js';
import {renderAudio} from './audio-renderer.js';
import {renderPdf} from './pdf-renderer.js';
import {renderDocument} from './document-renderer.js';
import {resolveUrl} from '../shared/urls.js';

const renderers={image:renderImage,video:renderVideo,audio:renderAudio,pdf:renderPdf,docx:renderDocument,text:renderDocument};
export async function renderMedia(container,item,baseUrl,status,originalLink){
  container.replaceChildren();container.className='media-viewer';status.textContent='Loading resource…';
  originalLink.hidden=false;originalLink.href=resolveUrl(item.src,baseUrl);originalLink.textContent=`Open original ${item.label}`;
  const renderer=renderers[item.type];
  if(!renderer){status.textContent='This media type is not supported.';return;}
  try{await renderer(container,item,baseUrl);status.textContent='';}
  catch(error){console.error(error);status.textContent='Resource load failed.';container.innerHTML='<div class="error-panel"><strong>This resource could not be displayed.</strong><p>Use “Open original” to view the source file.</p></div>';}
}
