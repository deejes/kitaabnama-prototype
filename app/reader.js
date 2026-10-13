// Kitaabnama reader (epub.js)
const P=new URLSearchParams(location.search);const BID=P.get('book')||'alice';
const DEF={theme:'white',font:'Literata',size:20,lh:'1.6',mx:'m',just:'justify',spread:'auto'};
if(innerWidth<700){DEF.size=18;DEF.just='left'}
const ST=Object.assign({},DEF,KN.get('settings',{}));
let DATA=KN.book(BID);DATA.marks=DATA.marks||[];DATA.hls=DATA.hls||[];
let book,rend,LOC=null,META={},TOCFLAT=[],selCfi=null,selText='',selHl=null;
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),1600)};
function saveData(){KN.saveBook(BID,DATA)}
const MX={s:{w:24,n:14},m:{w:56,n:18},l:{w:110,n:30}};
function readerCSS(){const dark=ST.theme=='dark'||ST.theme=='gray';const fg=getComputedStyle(document.documentElement).getPropertyValue('--fg').trim();
 return `html,body{background:transparent!important;color:${fg}!important}
 body{font-family:'${ST.font.split(',')[0]}',${ST.font.includes(',')?ST.font.split(',').slice(1).join(','):''}Georgia,serif!important;font-size:${ST.size}px!important;line-height:${ST.lh}!important;-webkit-text-size-adjust:100%}
 p,div,li,blockquote,dd{font-family:inherit!important;line-height:inherit!important;text-align:${ST.just}!important;hyphens:${ST.just=='justify'?'auto':'manual'};color:inherit!important}
 h1,h2,h3,h4{font-family:'Literata',Georgia,serif!important;color:inherit!important;text-align:center!important;line-height:1.25!important}
 a{color:${dark?'#e0a84e':'#a8641a'}!important}img{max-width:100%!important;max-height:90vh!important;object-fit:contain;${dark?'filter:brightness(.85)':''}}
 ::selection{background:#c8862a55}
 ${innerWidth<700?'p,blockquote,div{margin-left:0!important;margin-right:0!important;padding-left:0!important;padding-right:0!important}':''}
 body *{background-color:transparent!important}
 .pg-boilerplate,#pg-header,#pg-footer,section.pg-boilerplate{font-size:.8em}`}
function styleContents(c){const d=c.document;let s=d.getElementById('kn-style');if(!s){s=d.createElement('style');s.id='kn-style';d.head.appendChild(s);
 const l=d.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400&display=swap';d.head.appendChild(l)}s.textContent=readerCSS()}
function applySettings(relayout){document.documentElement.dataset.theme=ST.theme;const narrow=innerWidth<700;document.documentElement.style.setProperty('--mx',(narrow?MX[ST.mx].n:MX[ST.mx].w)+'px');
 $$('.th').forEach(b=>b.classList.toggle('on',b.dataset.t==ST.theme));
 [['#sfont','font'],['#slh','lh'],['#smx','mx'],['#sjust','just'],['#sspread','spread']].forEach(([s,k])=>$$(s+' button').forEach(b=>b.classList.toggle('on',b.dataset.v==ST[k])));$('#vsize').textContent=ST.size+'px';
 KN.set('settings',ST);if(!rend)return;rend.getContents().forEach(styleContents);
 if(relayout){const cfi=LOC&&LOC.start.cfi;rend.spread(ST.spread,900);const v=$('#viewer');rend.resize(v.clientWidth,v.clientHeight);if(cfi)rend.display(cfi)}}
async function loadSource(){
 if(BID.startsWith('idb:')){const r=await IDB.get(BID.slice(4));if(!r)throw new Error('Imported book not found on this device');META={title:r.title,author:r.author};return r.data}
 const c=CATALOG.find(b=>b.id==BID);if(!c)throw new Error('Unknown book');META={title:c.title,author:c.author};const res=await fetch(c.file);if(!res.ok)throw new Error('Could not load '+c.file);return res.arrayBuffer()}
function flatten(items,lvl=0,out=[]){(items||[]).forEach(i=>{out.push({label:(i.label||'').trim(),href:i.href,lvl});flatten(i.subitems,lvl+1,out)});return out}
function chapterFor(href){if(!href)return null;const base=href.split('#')[0];let best=null;for(const t of TOCFLAT){if(t.href.split('#')[0].endsWith(base)||base.endsWith(t.href.split('#')[0]))best=best||t}
 if(best)return best;const idx=book.spine.get(href)?.index;let cand=null;for(const t of TOCFLAT){const s=book.spine.get(t.href);if(s&&s.index<=idx&&(!cand||s.index>=book.spine.get(cand.href).index))cand=t}return cand}
async function main(){
 applySettings();
 const buf=await loadSource();book=ePub(buf);
 await book.ready;const md=book.packaging.metadata;META.title=META.title||md.title;META.author=META.author||md.creator;BOOKTITLE=META.title;
 document.title=META.title+' · Kitaabnama';$('#ttl').innerHTML='<b>'+esc(META.title)+'</b>'+(META.author?' · '+esc(META.author):'');
 const nav=await book.loaded.navigation;TOCFLAT=flatten(nav.toc);
 rend=book.renderTo('viewer',{width:'100%',height:'100%',flow:'paginated',spread:ST.spread,minSpreadWidth:900,allowScriptedContent:false,gap:72});
 rend.hooks.content.register(c=>{styleContents(c);wireDoc(c)});
 rend.on('relocated',onReloc);rend.on('selected',onSelected);
 await rend.display(DATA.cfi||undefined);$('#loading').remove();
 DATA.hls.forEach(addHlAnno);
 const lk='loc:'+BID;const cached=localStorage.getItem('kn:'+lk);
 if(cached){book.locations.load(cached);window.__locs=true;onReloc(rend.currentLocation())}else setTimeout(()=>book.locations.generate(1600).then(()=>{try{localStorage.setItem('kn:'+lk,book.locations.save())}catch(e){}window.__locs=true;onReloc(rend.currentLocation())}),300);
 KN.touchRecent(BID,{title:META.title,author:META.author,pct:DATA.pct||0});
 swatiInit();setTimeout(()=>$('body').classList.add('immersive'),2500);$('body').classList.remove('immersive');window.__ready=true}
function onReloc(l){if(!l||!l.start)return;if(!LOC||LOC.start.cfi!=l.start.cfi)window.__reloc=(window.__reloc||0)+1;LOC=l;const ch=chapterFor(l.start.href);const lbl=ch?ch.label:'';
 $('#runhead').textContent=lbl;$('#pchap').textContent=lbl;
 let pct=null;if(book.locations.length()){pct=l.start.percentage;if(l.atEnd)pct=1}
 const pg=l.start.displayed;const left=pg?Math.max(0,pg.total-pg.page):0;
 let txt=pg?'Page '+pg.page+' of '+pg.total+' in chapter':'';
 if(pct!=null){const remLocs=book.locations.length()*(1-pct);const mins=Math.max(1,Math.round(remLocs*1600/5.5/200));
  const ptxt=Math.round(pct*100)+'%';$('#ppct').textContent=ptxt+' · '+(mins>=60?Math.floor(mins/60)+' h '+mins%60+' min':mins+' min')+' left in book';$('#prog').value=Math.round(pct*1000);
  $('#mini').textContent=ptxt+' · '+(left?left+' page'+(left>1?'s':'')+' left in chapter':'last page of chapter');DATA.pct=pct}
 else{$('#ppct').textContent=txt;$('#mini').textContent=txt}
 DATA.cfi=l.start.cfi;saveData();KN.touchRecent(BID,{title:META.title,author:META.author,pct:DATA.pct||0,chapter:lbl});
 $('#swsub')&&($('#swsub').textContent='Reading coach · '+(lbl||'Reading'));updateMark();hideSel()}
// ----- navigation & input
const next=()=>rend&&rend.next(),prev=()=>rend&&rend.prev();
function toggleChrome(force){const b=document.body;const imm=force!=null?force:!b.classList.contains('immersive');b.classList.toggle('immersive',imm);if(imm)closePops()}
function closePops(){$$('#aa,#side').forEach(p=>p.classList.remove('show'));$('#baa').classList.remove('on');$('#btoc').classList.remove('on');$('#bsearch').classList.remove('on')}
function zoneTap(x){const v=$('#viewer').getBoundingClientRect();const rel=(x-v.left)/v.width;if(rel<.28)prev();else if(rel>.72)next();else toggleChrome()}
function wireDoc(c){const d=c.document,win=c.window;let sx=0,sy=0,st=0;
 d.addEventListener('click',e=>{if(Swipe.eat()){e.preventDefault();e.stopPropagation();return}if(e.target.closest('a'))return;if(win.getSelection().toString())return;if(e.target.closest('[data-hl]'))return;if($('#sel').classList.contains('show')){hideSel();return}
  if($('#aa').classList.contains('show')||$('#side').classList.contains('show')){closePops();return}const fr=win.frameElement.getBoundingClientRect();zoneTap(fr.left+e.clientX)});
 Swipe.attach(d,win);
 d.addEventListener('keydown',onKey)}
function onKey(e){if(e.target.closest&&e.target.closest('input,textarea'))return;
 if(e.key=='ArrowRight'||e.key=='PageDown'||(e.key==' '&&!e.shiftKey)){e.preventDefault();next()}else if(e.key=='ArrowLeft'||e.key=='PageUp'||(e.key==' '&&e.shiftKey)){e.preventDefault();prev()}
 else if(e.key=='Escape'){hideSel();closePops()}}

// ----- swipe / drag / trackpad page turns
const Swipe=(()=>{const TH=40,V=()=>$('#viewer');let g=null,busy=false,suppressUntil=0,wAcc=0,wLock=false,wTimer=0,wReset=0;
 const eat=()=>Date.now()<suppressUntil;
 function setX(x,anim){const v=V();v.style.transition=anim?'transform .22s cubic-bezier(.2,.8,.2,1),opacity .22s':'none';v.style.transform=x?'translate3d('+x+'px,0,0)':'';}
 function selActive(){try{return rend.getContents().some(c=>{const s=c.window.getSelection();return s&&!s.isCollapsed&&s.toString().trim()})}catch(e){return false}}
 function atEdge(dir){return LOC&&((dir>0&&LOC.atEnd)||(dir<0&&LOC.atStart))}
 async function turn(dir){if(busy)return;busy=true;hideSel();const w=V().clientWidth;
  if(atEdge(dir)){setX(0,true);busy=false;return}
  setX(-dir*Math.min(w*.35,160),true);V().style.opacity='0';await new Promise(r=>setTimeout(r,170));
  try{await (dir>0?rend.next():rend.prev())}catch(e){}
  setX(dir*Math.min(w*.2,90),false);V().offsetWidth;V().style.opacity='1';setX(0,true);setTimeout(()=>{busy=false},230);window.__turns=(window.__turns||0)+1}
 // gesture start/move/end in parent coordinates (stable while the iframe is translated)
 function start(x,y,kind){if(busy||selActive())return false;g={x0:x,y0:y,t0:Date.now(),kind,mode:null,dx:0};return true}
 function move(x,y,ev){if(!g)return;const dx=x-g.x0,dy=y-g.y0;
  if(!g.mode){if(Math.abs(dx)<8&&Math.abs(dy)<8)return;if(Math.abs(dx)>Math.abs(dy)*1.2&&!selActive())g.mode='h';else{g.mode='v';}}
  if(g.mode!='h')return;if(ev&&ev.cancelable)ev.preventDefault();
  if(g.kind=='mouse'&&selActive()){cancel();return}
  const edge=atEdge(dx<0?1:-1);g.dx=dx;setX(edge?dx*.25:dx*.9,false)}
 function end(){if(!g)return;const G=g;g=null;if(G.mode!='h'){if(G.mode)setX(0,true);return}
  suppressUntil=Date.now()+400;const fast=Math.abs(G.dx)>20&&Date.now()-G.t0<250;
  if(Math.abs(G.dx)>=TH||fast)turn(G.dx<0?1:-1);else setX(0,true)}
 function cancel(){if(g){g=null;setX(0,true)}}
 function frameOff(win){try{const r=win.frameElement.getBoundingClientRect();return [r.left,r.top]}catch(e){return [0,0]}}
 function attach(d,win){
  d.addEventListener('touchstart',e=>{if(e.touches.length!=1)return cancel();const t=e.touches[0],[ox,oy]=frameOff(win);start(t.clientX+ox,t.clientY+oy,'touch')},{passive:true});
  d.addEventListener('touchmove',e=>{if(!g)return;if(e.touches.length!=1)return cancel();const t=e.touches[0],[ox,oy]=frameOff(win);move(t.clientX+ox,t.clientY+oy,e)},{passive:false});
  d.addEventListener('touchend',e=>{end()},{passive:true});d.addEventListener('touchcancel',cancel,{passive:true});
  // mouse drag: only when started on non-text area (so text selection still works)
  d.addEventListener('mousedown',e=>{if(e.button!==0)return;if(onText(d,e))return;const [ox,oy]=frameOff(win);if(start(e.clientX+ox,e.clientY+oy,'mouse'))e.preventDefault()});
  d.addEventListener('mousemove',e=>{if(g&&g.kind=='mouse'){const [ox,oy]=frameOff(win);move(e.clientX+ox,e.clientY+oy,e)}});
  d.addEventListener('mouseup',()=>{if(g&&g.kind=='mouse')end()});
  d.addEventListener('wheel',wheel,{passive:false})}
 function onText(d,e){if(e.target.closest&&e.target.closest('a,img,[data-hl]'))return e.target.tagName!='IMG';let r=null;
  if(d.caretRangeFromPoint)r=d.caretRangeFromPoint(e.clientX,e.clientY);else if(d.caretPositionFromPoint){const p=d.caretPositionFromPoint(e.clientX,e.clientY);if(p){r=d.createRange();r.setStart(p.offsetNode,p.offset)}}
  if(!r||r.startContainer.nodeType!=3)return false;const rr=d.createRange();rr.selectNodeContents(r.startContainer);
  return [...rr.getClientRects()].some(b=>e.clientX>=b.left-2&&e.clientX<=b.right+2&&e.clientY>=b.top-2&&e.clientY<=b.bottom+2)}
 // trackpad: one gesture (until wheel quiet for 300ms) = one page
 function wheel(e){const ax=Math.abs(e.deltaX),ay=Math.abs(e.deltaY);if(ax<=ay||e.ctrlKey)return;e.preventDefault();
  clearTimeout(wTimer);wTimer=setTimeout(()=>{wLock=false;wAcc=0},300);
  if(wLock)return;wAcc+=e.deltaX*(e.deltaMode==1?16:1);if(Math.abs(wAcc)>=60){wLock=true;turn(wAcc>0?1:-1);wAcc=0}}
 // parent-level: page margins / edge buttons / desktop mouse
 function attachParent(){addEventListener('wheel',e=>{if(e.target.closest&&e.target.closest('.pop,#swati,#side,#aa'))return;wheel(e)},{passive:false});
  const zone=e=>!e.target.closest('header,footer,.pop,#swati,#tab,#sel,input');
  addEventListener('touchstart',e=>{if(!zone(e)||e.touches.length!=1)return;start(e.touches[0].clientX,e.touches[0].clientY,'touch')},{passive:true});
  addEventListener('touchmove',e=>{if(g&&g.kind=='touch')move(e.touches[0].clientX,e.touches[0].clientY,e)},{passive:false});
  addEventListener('touchend',()=>{if(g&&g.kind=='touch')end()},{passive:true});
  addEventListener('mousedown',e=>{if(e.button!==0||!zone(e))return;start(e.clientX,e.clientY,'mouse')});
  addEventListener('mousemove',e=>{if(g&&g.kind=='mouse')move(e.clientX,e.clientY,e)});
  addEventListener('mouseup',()=>{if(g&&g.kind=='mouse')end()});
  addEventListener('click',e=>{if(eat()&&e.target.closest('.edge')){e.preventDefault();e.stopPropagation()}},true)}
 return {attach,attachParent,turn,eat}})();
Swipe.attachParent();
document.addEventListener('keydown',onKey);$('#pv').onclick=prev;$('#nx').onclick=next;
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>applySettings(false),150)});
document.addEventListener('mousemove',e=>{if(e.clientY<40&&document.body.classList.contains('immersive'))toggleChrome(false)});
$('#prog').oninput=e=>{if(!book.locations.length())return;$('#ppct').textContent=Math.round(e.target.value/10)+'%'};
$('#prog').onchange=e=>{if(!book.locations.length())return toast('Still counting pages…');rend.display(book.locations.cfiFromPercentage(e.target.value/1000))};
$('#back').onclick=()=>location.href='index.html';
// ----- Aa panel
$('#baa').onclick=e=>{e.stopPropagation();const o=!$('#aa').classList.contains('show');closePops();$('#aa').classList.toggle('show',o);$('#baa').classList.toggle('on',o)};
$$('.th').forEach(b=>b.onclick=()=>{ST.theme=b.dataset.t;applySettings(false)});
[['#sfont','font',1],['#slh','lh',1],['#smx','mx',1],['#sjust','just',0],['#sspread','spread',1]].forEach(([s,k,r])=>$$(s+' button').forEach(b=>b.onclick=()=>{ST[k]=b.dataset.v;applySettings(r)}));
$$('.stp button').forEach(b=>b.onclick=()=>{ST.size=Math.max(14,Math.min(32,ST.size+ +b.dataset.d*2));applySettings(true)});
// ----- side panel: toc / marks / highlights / search
let tab='toc';
function openSide(p){closePops();tab=p;$('#side').classList.add('show');(p=='search'?$('#bsearch'):$('#btoc')).classList.add('on');renderSide();if(p=='search')setTimeout(()=>$('#sq').focus(),50)}
$('#btoc').onclick=e=>{e.stopPropagation();$('#side').classList.contains('show')&&tab!='search'?closePops():openSide('toc')};
$('#bsearch').onclick=e=>{e.stopPropagation();$('#side').classList.contains('show')&&tab=='search'?closePops():openSide('search')};
$$('#stabs button').forEach(b=>b.onclick=()=>{tab=b.dataset.p;renderSide();if(tab=='search')$('#sq').focus()});
function go(t){rend.display(t);if(innerWidth<700)closePops()}
function renderSide(){$$('#stabs button').forEach(b=>b.classList.toggle('on',b.dataset.p==tab));$('#search').style.display=tab=='search'?'block':'none';const L=$('#slist');
 if(tab=='toc'){const cur=LOC&&chapterFor(LOC.start.href);L.innerHTML=TOCFLAT.map((t,i)=>'<button class="it'+(t.lvl?' l2':'')+(cur===t?' cur':'')+'" data-i="'+i+'">'+esc(t.label)+'</button>').join('')||'<div class="empty">No table of contents</div>';
  $$('#slist .it').forEach(b=>b.onclick=()=>go(TOCFLAT[b.dataset.i].href));const c=L.querySelector('.cur');c&&c.scrollIntoView({block:'center'})}
 else if(tab=='marks'){L.innerHTML=DATA.marks.map((m,i)=>'<button class="it" data-i="'+i+'">'+esc(m.label||'Bookmark')+'<small>'+(m.pct!=null?Math.round(m.pct*100)+'% · ':'')+new Date(m.ts).toLocaleDateString()+'</small></button>').join('')||'<div class="empty">No bookmarks yet. Tap the ribbon icon to add one.</div>';$$('#slist .it').forEach(b=>b.onclick=()=>go(DATA.marks[b.dataset.i].cfi))}
 else if(tab=='hls'){L.innerHTML=DATA.hls.map((h,i)=>'<button class="it" data-i="'+i+'"><div class="q" style="--hc:'+h.color+'">'+esc(h.text.slice(0,180))+'</div><small>'+esc(h.chapter||'')+'</small></button>').join('')||'<div class="empty">No highlights yet. Select text to highlight it.</div>';$$('#slist .it').forEach(b=>b.onclick=()=>go(DATA.hls[b.dataset.i].cfi))}
 else{L.innerHTML=SR.html||'<div class="empty">Type a word and press Enter</div>';wireSR()}}
const SR={html:'',res:[]};let searchTok=0;
$('#sq').onkeydown=e=>{if(e.key=='Enter')doSearch(e.target.value.trim())};
async function doSearch(q){if(!q)return;const tok=++searchTok;SR.res=[];SR.html='<div class="empty">Searching…</div>';renderSide();
 for(const item of book.spine.spineItems){if(tok!=searchTok)return;try{await item.load(book.load.bind(book));const r=item.find(q);const ch=chapterFor(item.href);r.forEach(x=>SR.res.push(Object.assign(x,{chapter:ch?ch.label:''})));item.unload()}catch(e){}if(SR.res.length>300)break}
 const re=new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig');
 SR.html=SR.res.length?'<div class="empty" style="padding:6px 12px;text-align:left">'+SR.res.length+' result'+(SR.res.length>1?'s':'')+'</div>'+SR.res.map((r,i)=>'<button class="it sr" data-i="'+i+'">'+esc(r.excerpt.trim()).replace(re,'<mark>$1</mark>')+'<small>'+esc(r.chapter)+'</small></button>').join(''):'<div class="empty">No results for “'+esc(q)+'”</div>';if(tab=='search')renderSide()}
function wireSR(){$$('#slist .sr').forEach(b=>b.onclick=()=>{const r=SR.res[b.dataset.i];go(r.cfi);setTimeout(()=>{try{rend.annotations.remove(r.cfi,'highlight');rend.annotations.highlight(r.cfi,{},null,'sr',{fill:'#ff9f0a','fill-opacity':'0.45'});setTimeout(()=>rend.annotations.remove(r.cfi,'highlight'),2500)}catch(e){}},400)})}
// ----- bookmarks
function curMark(){if(!LOC)return -1;const s=LOC.start.cfi,e=LOC.end.cfi;const C=new ePub.CFI();return DATA.marks.findIndex(m=>{try{return C.compare(m.cfi,s)>=0&&C.compare(m.cfi,e)<=0}catch(x){return m.cfi==s}})}
function updateMark(){const on=curMark()>=0;$('#bm').classList.toggle('show',on);$('#bmark').classList.toggle('on',on);$('#bmark svg').style.fill=on?'currentColor':'none'}
$('#bmark').onclick=()=>{const i=curMark();if(i>=0){DATA.marks.splice(i,1);toast('Bookmark removed')}else{const ch=chapterFor(LOC.start.href);DATA.marks.push({cfi:LOC.start.cfi,label:ch?ch.label:'Page',pct:DATA.pct,ts:Date.now()});toast('Bookmarked')}saveData();updateMark();if($('#side').classList.contains('show'))renderSide()};
// ----- selection & highlights
function addHlAnno(h){try{rend.annotations.highlight(h.cfi,{},()=>showSelForHl(h),'kn-hl',{fill:h.color,'fill-opacity':'0.4','mix-blend-mode':ST.theme=='white'||ST.theme=='sepia'?'multiply':'screen'})}catch(e){}}
function placePop(rect,frame){const s=$('#sel');s.classList.add('show');const fr=frame.getBoundingClientRect();const x=fr.left+rect.left+rect.width/2,y=fr.top+rect.top;const w=s.offsetWidth,h=s.offsetHeight;
 s.style.left=Math.max(8,Math.min(innerWidth-w-8,x-w/2))+'px';s.style.top=(y-h-12>8?y-h-12:fr.top+rect.bottom+12)+'px'}
function onSelected(cfi,contents){selCfi=cfi;selHl=null;try{const r=contents.range(cfi);selText=r.toString();$('#srm').style.display='none';placePop(r.getBoundingClientRect(),contents.window.frameElement)}catch(e){}}
function showSelForHl(h){selHl=h;selCfi=h.cfi;selText=h.text;$('#srm').style.display='';const c=rend.getContents()[0];try{const r=rend.getRange(h.cfi);const fr=r.startContainer.ownerDocument.defaultView.frameElement;placePop(r.getBoundingClientRect(),fr)}catch(e){}}
function hideSel(){$('#sel').classList.remove('show');selHl=null;rend&&rend.getContents().forEach(c=>{try{c.window.getSelection().removeAllRanges()}catch(e){}})}
$$('#sel .dot').forEach(b=>b.onclick=()=>{const color=b.dataset.c;if(selHl){rend.annotations.remove(selHl.cfi,'highlight');selHl.color=color;addHlAnno(selHl)}else if(selCfi){const ch=LOC&&chapterFor(LOC.start.href);const h={cfi:selCfi,text:selText,color,chapter:ch?ch.label:'',ts:Date.now()};DATA.hls.push(h);addHlAnno(h)}saveData();hideSel();toast('Highlighted')});
$('#srm').onclick=()=>{if(selHl){rend.annotations.remove(selHl.cfi,'highlight');DATA.hls=DATA.hls.filter(h=>h!==selHl);saveData();toast('Highlight removed')}hideSel()};
$('#scopy').onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(selText).catch(()=>{});toast('Copied');hideSel()};
$('#sdef').onclick=()=>{const w=(selText.trim().split(/\s+/)[0]||'');hideSel();swOpen();define(w)};
$('#sask').onclick=()=>{const t=selText.trim();hideSel();swOpen();seg('chat');askQuote(t)};
$('#bsw').onclick=()=>{SW.state=='open'?swStash():swOpen()};
main().catch(e=>{$('#loading').innerHTML='<div style="text-align:center">Could not open this book.<br><small>'+esc(e.message)+'</small><br><br><a href="index.html" style="color:var(--accent)">Back to library</a></div>';console.error(e)});
