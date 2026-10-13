// Kitaabnama service worker: precache shell + books; network-first for code (updates on reload), cache-first for books/fonts
const V='kn-v1';
const SHELL=['./','index.html','reader.html','common.js','reader.js','swati.js','manifest.webmanifest','vendor/epub.min.js','vendor/jszip.min.js','icons/icon-180.png','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png',
 'books/alice.epub','books/peter-pan.epub','books/wizard-of-oz.epub','books/secret-garden.epub','books/jungle-book.epub','books/treasure-island.epub'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!=V&&k.startsWith('kn-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!='GET')return;const u=new URL(r.url);
 const font=/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);if(u.origin!=location.origin&&!font)return;
 const book=u.pathname.endsWith('.epub')||u.pathname.includes('/icons/')||font;
 if(book){e.respondWith(caches.match(r,{ignoreSearch:!font}).then(h=>h||fetch(r).then(res=>{if(res.ok||res.type=='opaque'){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res})));return}
 // network-first so a reload picks up new code; fall back to cache offline
 e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(h=>h||(r.mode=='navigate'?caches.match(u.pathname.endsWith('reader.html')?'reader.html':'index.html'):undefined))))});
