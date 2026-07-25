import {resolveUrl} from '../shared/urls.js';
export function renderImage(container, item, baseUrl) {
  const img = document.createElement('img');
  img.src = resolveUrl(item.webSrc || item.src, baseUrl);
  img.alt = item.alt || '';
  img.width = item.width || 1200;
  img.height = item.height || 675;
  img.decoding = 'async';
  container.append(img);
}
