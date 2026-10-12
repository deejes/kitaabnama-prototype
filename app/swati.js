const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const SW=Object.assign({side:'right',state:'closed',top:90},KN.get('swati',{}));function swSave(){KN.set('swati',SW)}
let BOOKTITLE='this book';
function swatiInit(){
// ---- Swati content ----
const dict={curiosity:["kyoor-ee-OSS-i-tee","cu·ri·os·i·ty","noun","Wanting very much to know or learn something.","Alice's curiosity made her chase the rabbit!"],remarkable:["ri-MAR-kuh-bul","re·mark·a·ble","adjective","Unusual or special enough to be noticed.","A rabbit with a watch is very remarkable!"],waistcoat:["WESS-kut","waist·coat","noun","A short jacket with no sleeves, like a vest.","The Rabbit keeps his watch in his waistcoat pocket."],marmalade:["MAR-muh-layd","mar·ma·lade","noun","A sweet jam made from oranges.","Alice found an empty jar of orange marmalade while falling!"],curiouser:["KYOOR-ee-er-ser","cu·ri·ous·er","adjective (made-up!)","Alice's silly way of saying 'more and more curious'. The right word is 'more curious'.","She was so surprised she forgot good English!"],antipathies:["an-TIP-uh-theez","an·tip·a·thies","noun","Alice means 'Antipodes', the other side of the world. She mixed up the word!","Even Alice gets words wrong sometimes, and that's okay."],latitude:["LAT-i-tood","lat·i·tude","noun","A line on a map that tells how far north or south a place is.","Alice says it to sound clever, but she doesn't know what it means!"]};
const sb=$('#sbody');function say(h,w){const m=document.createElement('div');m.className='m '+w;m.innerHTML=h;sb.appendChild(m);sb.scrollTop=1e6}
const ART={"curiosity": "<svg viewBox=\"0 0 120 96\"><circle cx=\"50\" cy=\"44\" r=\"24\" fill=\"#fff\" stroke=\"#3a3a3c\" stroke-width=\"3\"/><path d=\"M68 62l20 20\" stroke=\"#3a3a3c\" stroke-width=\"6\" stroke-linecap=\"round\"/><path d=\"M44 38c0-6 12-6 12 0 0 5-6 5-6 10M50 55v1\" stroke=\"#ff8a3d\" stroke-width=\"3.5\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M96 18l2 6 6 2-6 2-2 6-2-6-6-2 6-2z\" fill=\"#a37bff\"/><path d=\"M18 70l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z\" fill=\"#5ac8fa\"/></svg>"},GEN="<svg viewBox=\"0 0 120 96\"><path d=\"M30 72V30c10-6 20-6 30 0 10-6 20-6 30 0v42c-10-6-20-6-30 0-10-6-20-6-30 0z\" fill=\"#fff\" stroke=\"#3a3a3c\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M60 30v42\" stroke=\"#3a3a3c\" stroke-width=\"3\"/><path d=\"M96 16l2 6 6 2-6 2-2 6-2-6-6-2 6-2z\" fill=\"#a37bff\"/></svg>";
function define(t){seg('words');const k=t.toLowerCase().replace(/[^a-z\-]/g,'');const d=dict[k]||[k,k,'word','Let\'s figure it out together. Read the sentence around it out loud. What could it mean?','Try using it in your own sentence!'];
 const ex=d[4].replace(new RegExp('('+k+')','i'),'<b>$1</b>');const c=document.createElement('div');c.className='wc';
 c.innerHTML='<div class="art">'+(ART[k]||GEN)+'<span class="lbl2">Picture it</span></div><div class="in"><div class="top"><div><h3>'+k+'</h3><div class="pos">'+d[2]+'</div></div><button class="play" onclick="speak(\''+k+'\')" title="Hear it"><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 010 7" fill="none"/></svg></button></div><div class="ph">/ '+d[0]+' /</div><div class="syl">'+d[1].split('·').map(x=>'<span onclick="speak(this.textContent)">'+x+'</span>').join('<em>·</em>')+'</div><div class="sec">Meaning</div><p class="mean">'+d[3]+'</p><div class="sec">In the story</div><p class="ex">'+ex+'</p><div class="acts"><button onclick="speak(\''+k+'\')">Say it slowly</button><button>Add to My Words</button></div></div>';
 sb.appendChild(c);c.scrollIntoView({block:'start',behavior:'smooth'})}
function seg(p){$$('#segc button').forEach(b=>b.classList.toggle('on',b.dataset.p==p))}
function speak(t){try{speechSynthesis.speak(Object.assign(new SpeechSynthesisUtterance(t),{rate:.8}))}catch(e){}}
function askQuote(t){say('<blockquote>“'+esc(t.slice(0,140))+(t.length>140?'…':'')+'”</blockquote>What does this mean?','u');setTimeout(()=>say("Good pick! Let's read it slowly together. Who is talking here, and how do you think they <b>feel</b>? Try saying it in your own words, and I'll help with any tricky part.",'s'),500)}
const replies={"Summarize this page":"In short: something surprising has just happened, and our hero has to decide what to do next. What would <b>you</b> do?","Who is in this chapter?":"Let's find out! Look for names with capital letters on this page. Who do you see? ","What happens next?":"No spoilers! But keep an eye on that little door…","Listen to me read":"Yay! Tap the mic and read this page out loud. I'll listen and tell you if a word gets tricky.","What should I read next?":"Since you like magic and talking animals: <b>The Wonderful Wizard of Oz</b>  or <b>The Velveteen Rabbit</b> . Want me to add one to your shelf?"};
$('#chips').innerHTML=Object.keys(replies).map(k=>'<button>'+k+'</button>').join('');$$('#chips button').forEach(b=>b.onclick=()=>{say(b.textContent,'u');setTimeout(()=>say(replies[b.textContent],'s'),450)});
$('#ask').onsubmit=e=>{e.preventDefault();const v=$('#q').value.trim();if(!v)return;say(v,'u');$('#q').value='';setTimeout(()=>say("Great question! Let's look at the page together. Can you find the sentence that tells us? ",'s'),500)};
sb.innerHTML='<div class="meta"><span class="orb sm"></span>Swati · now</div>';say("Hi Radha. I'm reading <i>"+esc(BOOKTITLE)+"</i> along with you. Select any word to <b>Define</b> it, or ask me about this page. Drag me to the edge to tuck me away.",'s');
$$('#segc button').forEach(b=>b.onclick=()=>{seg(b.dataset.p);if(b.dataset.p=='words')define('curiosity')});
// ---- Slide Over ----
const sw=$('#swati'),tab=$('#tab');
function placeSwati(){const w=sw.offsetWidth,vw=innerWidth;SW.top=Math.max(60,Math.min(innerHeight-sw.offsetHeight-12,SW.top));sw.style.top=SW.top+'px';
 if(SW.state=='open'){sw.classList.remove('hidden');sw.style.left=(SW.side=='right'?vw-w-12:12)+'px';tab.classList.remove('show')}
 else if(SW.state=='stashed'){sw.style.left=(SW.side=='right'?vw+40:-w-40)+'px';tab.className='show '+(SW.side=='right'?'r':'l');tab.style.top=Math.min(innerHeight-120,SW.top+120)+'px'}
 else{sw.classList.add('hidden');tab.classList.remove('show')}}
function swOpen(){if(SW.state=='closed')sw.classList.add('drag'),sw.style.left=(SW.side=='right'?innerWidth+20:-sw.offsetWidth-20)+'px',sw.offsetWidth,sw.classList.remove('drag','hidden');SW.state='open';swSave();placeSwati()}
function swStash(){SW.state='stashed';swSave();placeSwati()}
$('#stash').onclick=e=>{e.stopPropagation();swStash()};
function drag(handle,fromTab){let ox,oy,x0,y0,moved;handle.addEventListener('pointerdown',e=>{if(e.target.closest('button')&&!fromTab)return;handle.setPointerCapture(e.pointerId);moved=false;ox=e.clientX;oy=e.clientY;
 if(fromTab){SW.state='open';sw.classList.remove('hidden');}x0=sw.offsetLeft;y0=sw.offsetTop;sw.classList.add('drag');
 if(fromTab){x0=SW.side=='right'?innerWidth:-sw.offsetWidth;sw.style.left=x0+'px'}});
 handle.addEventListener('pointermove',e=>{if(ox==null)return;const dx=e.clientX-ox,dy=e.clientY-oy;if(Math.abs(dx)+Math.abs(dy)>4)moved=true;sw.style.left=(x0+dx)+'px';if(!fromTab)sw.style.top=(y0+dy)+'px'});
 handle.addEventListener('pointerup',e=>{if(ox==null)return;sw.classList.remove('drag');const w=sw.offsetWidth,l=sw.offsetLeft,vw=innerWidth;ox=null;
  if(fromTab&&!moved){SW.state='open';swSave();return placeSwati()}
  if(!fromTab)SW.top=sw.offsetTop;
  const over=l+w-vw,under=-l;
  if(over>w*.3){SW.side='right';SW.state='stashed'}else if(under>w*.3){SW.side='left';SW.state='stashed'}
  else{SW.state='open';SW.side=(l+w/2)>vw/2?'right':'left'}swSave();placeSwati()})}
drag($('#grab'));drag($('#sh'));drag(tab,true);

addEventListener('resize',placeSwati);placeSwati();window.swOpen=swOpen;window.define=define;window.askQuote=askQuote;window.speak=speak;window.seg=seg;window.swStash=swStash;}
