import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=await fs.readFile(path.join(root,'src','index.html'),'utf8');
const checks=[
  ['skip link',/class="skip-link"[^>]+href="#main-content"/],
  ['main landmark',/<main\b[^>]*id="main-content"/],
  ['search label',/<label\s+for="concept-search"/],
  ['search status live region',/id="catalog-count"[^>]+aria-live="polite"/],
  ['concept catalog navigation label',/<nav\b[^>]+id="concept-list"[^>]+aria-label="Concept catalog"/],
  ['category navigation label',/<nav\b[^>]+id="category-list"[^>]+aria-label="Concept categories"/],
  ['alphabetical navigation label',/<nav\b[^>]+id="alpha-nav"[^>]+aria-label="Alphabetical concept navigation"/],
  ['active filter label',/id="active-filters"[^>]+aria-label="Active catalog filters"/],
  ['media tablist label',/id="media-selector"[^>]+role="tablist"[^>]+aria-label=/],
  ['media status live region',/id="media-status"[^>]+aria-live="polite"/],
  ['media viewer tabpanel',/id="media-viewer"[^>]+role="tabpanel"/],
  ['related concepts heading',/id="related-title"/],
  ['brand home label',/class="brand brand--logo"[^>]+aria-label="Visular AI Terms \/ Concepts home"/],
  ['visible brand image alt',/alt="Visular AI Terms \/ Concepts"/],
  ['explore navigation label',/class="explore-nav"[^>]+aria-label="Explore Visular AI Terms"/],
  ['quick/deep tablist',/class="view-mode"[^>]+role="tablist"/],
  ['quick view tabpanel',/id="quick-view-panel"[^>]+role="tabpanel"/],
  ['deep view tabpanel',/id="deep-view-panel"[^>]+role="tabpanel"/],
  ['saved workspace navigation',/id="show-saved"[^>]+aria-pressed=/],
  ['comparison navigation',/id="show-compare"[^>]+aria-pressed=/],
  ['save concept state',/id="save-concept"[^>]+aria-pressed=/],
  ['compare concept state',/id="compare-concept"[^>]+aria-pressed=/]
];
const failures=checks.filter(([,pattern])=>!pattern.test(html)).map(([name])=>name);
if(failures.length){for(const failure of failures)console.error(`ERROR: accessibility baseline missing ${failure}`);process.exit(1);}
console.log(`Accessibility static baseline: PASS — ${checks.length} structural checks.`);
console.log('Note: this deterministic audit does not replace browser, screen-reader, contrast, caption, transcript, or manual WCAG testing.');
