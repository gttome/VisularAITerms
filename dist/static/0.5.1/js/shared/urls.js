export function resolveUrl(path, baseUrl) {
  return new URL(path, baseUrl).href;
}
