// Kitaabnama shared: catalog, storage, covers
const CATALOG=[
 {id:'alice',file:'books/alice.epub',title:"Alice's Adventures in Wonderland",author:'Lewis Carroll',c1:'#b8323f',c2:'#f2a65a',v:0,blurb:'Alice tumbles down a rabbit-hole into a world of talking animals, shrinking potions and a very mad tea-party.'},
 {id:'peter-pan',file:'books/peter-pan.epub',title:'Peter Pan',author:'J. M. Barrie',c1:'#1f5f8b',c2:'#7cc6e8',v:1,blurb:'The boy who never grows up whisks Wendy and her brothers away to Neverland.'},
 {id:'wizard-of-oz',file:'books/wizard-of-oz.epub',title:'The Wonderful Wizard of Oz',author:'L. Frank Baum',c1:'#1e7a4c',c2:'#e8d34a',v:2,blurb:'A cyclone carries Dorothy to the magical Land of Oz.'},
 {id:'secret-garden',file:'books/secret-garden.epub',title:'The Secret Garden',author:'Frances Hodgson Burnett',c1:'#4d7a3a',c2:'#f0c7d6',v:3,blurb:'Mary finds a hidden key to a locked garden, and brings it back to life.'},
 {id:'jungle-book',file:'books/jungle-book.epub',title:'The Jungle Book',author:'Rudyard Kipling',c1:'#c2621f',c2:'#2f4a2a',v:1,blurb:'Mowgli grows up in the jungle, raised by wolves and taught by Baloo and Bagheera.'},
 {id:'treasure-island',file:'books/treasure-island.epub',title:'Treasure Island',author:'Robert Louis Stevenson',c1:'#13324b',c2:'#e0b04f',v:0,blurb:'Young Jim Hawkins sets sail with a treasure map and a crew of pirates.'}];
const KN={
 get(k,d){try{return JSON.parse(localStorage.getItem('kn:'+k))??d}catch(e){return d}},
 set(k,v){localStorage.setItem('kn:'+k,JSON.stringify(v))},
 book(id){return KN.get('book:'+id,{cfi:null,pct:0,marks:[],hls:[]})},
 saveBook(id,o){KN.set('book:'+id,o)},
 touchRecent(id,meta){const r=KN.get('recent',[]).filter(x=>x.id!=id);r.unshift(Object.assign({id,ts:Date.now()},meta));KN.set('recent',r.slice(0,20))}
};
// IndexedDB for imported EPUBs
const IDB={db:null,open(){return this.db||(this.db=new Promise((res,rej)=>{const q=indexedDB.open('kitaabnama',1);q.onupgradeneeded=()=>q.result.createObjectStore('books',{keyPath:'id'});q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)}))},
 async tx(mode,fn){const db=await this.open();return new Promise((res,rej)=>{const t=db.transaction('books',mode);const r=fn(t.objectStore('books'));t.oncomplete=()=>res(r&&r.result);t.onerror=()=>rej(t.error)})},
 put(o){return this.tx('readwrite',s=>s.put(o))},get(id){return this.tx('readonly',s=>s.get(id))},all(){return this.tx('readonly',s=>s.getAll())},del(id){return this.tx('readwrite',s=>s.delete(id))}};
function hashColor(s){let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))%360;return ['hsl('+h+' 45% 38%)','hsl('+((h+40)%360)+' 70% 70%)']}
function esc(s){return String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function coverHTML(b,size){const z=size||14;return '<div class="cover v'+(b.v||0)+(z<9?' tiny':z<11?' small':'')+'" style="--c1:'+b.c1+';--c2:'+b.c2+';font-size:'+z+'px"><div class="d"></div><div class="t">'+esc(b.title)+'</div><div class="a">'+esc(b.author)+'</div></div>'}
const COVER_CSS=`.cover{position:relative;aspect-ratio:2/3;border-radius:4px 8px 8px 4px;overflow:hidden;background:var(--c1);box-shadow:0 1px 1px rgba(0,0,0,.08),0 10px 24px rgba(0,0,0,.16);color:#fff;display:flex;flex-direction:column;justify-content:space-between;padding:1em .8em .8em;min-width:0}
.cover:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.18) 0,rgba(255,255,255,.12) 3%,rgba(0,0,0,0) 7%),linear-gradient(180deg,rgba(255,255,255,.12),rgba(0,0,0,.12));pointer-events:none;z-index:2}
.cover .t{position:relative;z-index:1;font:600 1.1em/1.12 'Literata',Georgia,serif;text-wrap:balance;overflow-wrap:break-word}.cover .a{position:relative;z-index:1;font:500 .62em -apple-system,'Inter',sans-serif;letter-spacing:.12em;text-transform:uppercase;opacity:.85}
.cover.tiny .t,.cover.tiny .a{display:none}.cover.small .a{display:none}.cover .d{position:absolute;z-index:0}
.v0 .d{width:80%;aspect-ratio:1;border-radius:50%;background:var(--c2);right:-25%;bottom:12%;opacity:.9}.v1 .d{left:0;right:0;bottom:22%;height:28%;background:repeating-linear-gradient(0deg,var(--c2) 0 3px,transparent 3px 9px);opacity:.75}
.v2 .d{width:110%;height:46%;left:-5%;bottom:-8%;background:var(--c2);border-radius:50% 50% 0 0;opacity:.95}.v3 .d{inset:10%;border:2px solid var(--c2);border-radius:999px 999px 6px 6px;opacity:.85}
.cover img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1}`;
