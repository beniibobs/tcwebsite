/* Overview Loot: source data in assets/data/overview-loot.json. */
(async()=>{
'use strict';
const $=id=>document.getElementById(id),body=$('loot-stats'),input=$('piece-search'),results=$('piece-results');
const prob=n=>{
 const v=Math.min(100,Math.max(0,n)),p=v>99.99&&v<100?'99.99+%':v.toFixed(2)+'%',h=v*1.28,s=76-Math.abs(v-50)*.16,l=49-Math.abs(v-50)*.36;
 return '<div class="maze-probability" style="--prob-color:hsl('+h+' '+s+'% '+l+'%);--prob-text:hsl('+h+' '+s+'% '+Math.max(56,l+13)+'%)"><strong>'+p+'</strong><div class="maze-probability-track" aria-hidden="true"><i style="width:'+v+'%"></i></div></div>';
};
const normalize=s=>s.toLowerCase().replace(/^minecraft:trial_chambers\//,'').replace(/\.nbt$/,'').replace(/[_\-:]+/g,' ').trim().replace(/\s+/g,' ');
function ranked(pieces,query){
 const q=normalize(query),terms=q.split(' ').filter(Boolean);
 return pieces.map((p,i)=>{
 const name=normalize(p.name),file=normalize(p.file),stem=normalize(p.file.split('/').pop()),all=name+' '+file;
 const score=!q?0:name===q?100:stem===q||file===q?99:name.startsWith(q)?80:stem.startsWith(q)?75:name.includes(q)?60:file.includes(q)?50:terms.every(t=>all.includes(t))?30:-1;
 return {p,i,score};
 }).filter(x=>x.score>=0).sort((a,b)=>b.score-a.score||a.i-b.i).map(x=>x.p);
}
try{
 const res=await fetch('assets/data/overview-loot.json?v=5');if(!res.ok)throw Error('Loot data unavailable');const D=await res.json();
 // Reuse the chamber comparison dialog, including the native modal and backdrop.
 const allRows=new Map(D.categories.flatMap(c=>c[2]).map(r=>[r[0],r]));
 const detail=D.lootDetails;
 const dialog=document.createElement('dialog');dialog.className='resource-compare loot-detail';
 dialog.setAttribute('aria-labelledby','loot-detail-title');
 dialog.innerHTML='<div class="resource-compare-inner"><header class="resource-compare-header"><div class="resource-compare-heading"><h2 id="loot-detail-title"></h2></div><button type="button" class="resource-compare-close" aria-label="Close details" autofocus>×</button></header><p class="loot-detail-description"></p><div class="loot-detail-controls"></div><div class="resource-compare-table-wrap"><table class="resource-compare-table"><thead><tr><th scope="col">Item</th><th scope="col" class="num">Expected</th><th scope="col" class="num">Chance of ≥1</th></tr></thead><tbody></tbody></table></div><p class="loot-detail-note"></p></div>';
 document.body.append(dialog);
 const title=dialog.querySelector('h2'),description=dialog.querySelector('.loot-detail-description'),controls=dialog.querySelector('.loot-detail-controls'),tableWrap=dialog.querySelector('.resource-compare-table-wrap'),detailBody=dialog.querySelector('tbody'),note=dialog.querySelector('.loot-detail-note'),closeDialog=dialog.querySelector('.resource-compare-close');
 let trigger=null;
 function iconFor(icon){
  const img=document.createElement('span');img.className='loot-icon';img.setAttribute('aria-hidden','true');
  if(typeof icon==='string'){img.style.backgroundImage='url(data:image/png;base64,'+D.potionIcons[icon]+')';img.style.backgroundSize='32px 32px';img.style.backgroundPosition='0 0'}
  else img.style.backgroundPosition=(-32*(icon%5))+'px '+(-32*Math.floor(icon/5))+'px';
  return img;
 }
 function statRow(label,icon,mean,p){
  const tr=document.createElement('tr'),th=document.createElement('th'),wrap=document.createElement('span'),e=document.createElement('td'),chance=document.createElement('td');
  th.scope='row';wrap.className='mc-stat-label';if(icon!==null)wrap.append(iconFor(icon));const name=document.createElement('span');name.textContent=label;wrap.append(name);th.append(wrap);
  e.className='num';e.textContent=mean.toFixed(3);chance.className='num';chance.innerHTML=prob(p);tr.append(th,e,chance);return tr;
 }
 function calc(mean,p,counts){
  let q=1-p/100;for(const [n,pair] of counts){if(!pair||!n)continue;mean+=n*pair[0];q*=pair[1]**n}
  return [mean,100*(1-q)];
 }
 function openDetail(name,button){
  const cfg=detail[name],row=allRows.get(name);if(!cfg||!row||dialog.open)return;
  trigger=button;title.textContent=name;description.textContent=cfg.description;controls.replaceChildren();detailBody.replaceChildren();note.textContent='';tableWrap.hidden=cfg.mode==='text';note.hidden=true;
  if(cfg.link){const a=document.createElement('a');a.href=cfg.link.href;a.textContent=cfg.link.label;description.append(a,document.createTextNode('.'))}
  let v=0,o=0,s=0;
  function render(){
   const counts=[[v,cfg.vault],[o,cfg.ominous],[s,cfg.spawner]];
   if(cfg.mode==='text')return;
   if(cfg.mode==='honeycomb'){detailBody.replaceChildren(statRow('Entrance only',row[1],...cfg.entrance),statRow('Whole Trial Chamber',row[1],row[2],row[3]));return}
   if(cfg.mode==='discs'){
    const pre=allRows.get('Precipice'),creator=allRows.get('Creator (Music Box)'),either=D.detailStatistics.eitherMusicDisc;
    detailBody.replaceChildren(statRow(pre[0],pre[1],...calc(pre[2],pre[3],counts)),statRow(creator[0],creator[1],creator[2],creator[3]),statRow('Either music disc',null,...calc(either.expected,either.chanceAtLeastOne,counts)));return;
   }
   detailBody.replaceChildren(statRow(name,row[1],...calc(row[2],row[3],counts)));
  }
  function slider(label,max,onInput){
   const group=document.createElement('div'),head=document.createElement('div'),lab=document.createElement('label'),out=document.createElement('output'),range=document.createElement('input'),ticks=document.createElement('div');
   group.className='loot-detail-slider';head.className='loot-detail-slider-head';range.type='range';range.min='0';range.max=String(max);range.step='1';range.value='0';range.id='loot-slider-'+controls.children.length;lab.htmlFor=range.id;lab.textContent=label;out.htmlFor=range.id;out.textContent='0';head.append(lab,out);ticks.className='loot-detail-ticks';ticks.setAttribute('aria-hidden','true');
   for(let i=0;i<=max;i++){const t=document.createElement('span');t.textContent=String(i);ticks.append(t)}
   range.addEventListener('input',()=>{out.textContent=range.value;onInput(Number(range.value));render()});
   group.append(head,range,ticks);controls.append(group);
  }
  if(cfg.mode==='vault'||cfg.mode==='discs'){
   slider('Vaults Opened',5,n=>v=n);if(cfg.ominous)slider('Ominous Vaults Opened',5,n=>o=n);
   note.textContent='Totals include generated loot and the selected vault rewards, assuming the vaults and keys are available. Mineral blocks count as nine items.';
   if(!['Diamond','Iron Ingot','Emerald'].includes(name))note.textContent='Totals include generated loot and the selected vault rewards, assuming the vaults and keys are available.';
   note.hidden=false;
  }else if(cfg.mode==='spawner'){
   slider('Trial Spawners Defeated',10,n=>s=n);note.textContent='Normal trial spawners, one player, one completion reward per spawner. Keys spent opening vaults are not deducted.';if(name==='Potion of Swiftness')note.textContent='Normal trial spawners, one player, one completion reward per spawner.';note.hidden=false;
  }
  controls.hidden=!controls.children.length;render();document.documentElement.classList.add('resource-compare-open');dialog.showModal();closeDialog.focus();
 }
 closeDialog.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
 dialog.addEventListener('close',()=>{document.documentElement.classList.remove('resource-compare-open');trigger?.focus({preventScroll:true});trigger=null});

 const tabs=[...document.querySelectorAll('[data-loot-category]')];let active='materials';
 function category(id){
 const c=D.categories.find(x=>x[0]===id);if(!c)return;
 active=id;
 tabs.forEach(t=>{const on=t.dataset.lootCategory===id;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1});
 $('loot-table-panel').setAttribute('aria-labelledby','loot-tab-'+id);
 body.replaceChildren(...c[2].map(([name,icon,mean,p])=>{
  const tr=document.createElement('tr'),label=document.createElement('td'),wrap=document.createElement('span'),img=document.createElement('span'),text=document.createElement('span');wrap.className='mc-stat-label';img.className='loot-icon';if(typeof icon==='string'){img.style.backgroundImage='url(data:image/png;base64,'+D.potionIcons[icon]+')';img.style.backgroundSize='32px 32px';img.style.backgroundPosition='0 0'}else img.style.backgroundPosition=(-32*(icon%5))+'px '+(-32*Math.floor(icon/5))+'px';img.setAttribute('aria-hidden','true');text.textContent=name;if(detail[name]){const button=document.createElement('button');button.type='button';button.className='resource-compare-trigger';button.textContent=name;button.setAttribute('aria-haspopup','dialog');button.addEventListener('click',()=>openDetail(name,button));wrap.append(img,button)}else wrap.append(img,text);label.append(wrap);tr.append(label);
  const e=document.createElement('td');e.className='num';e.textContent=mean.toFixed(3);tr.append(e);
  const chance=document.createElement('td');chance.className='num';chance.innerHTML=prob(p);tr.append(chance);return tr;
 }));
 }
 tabs.forEach((t,i)=>{t.onclick=()=>category(t.dataset.lootCategory);t.addEventListener('keydown',e=>{let j=e.key==='ArrowRight'?(i+1)%tabs.length:e.key==='ArrowLeft'?(i+tabs.length-1)%tabs.length:e.key==='Home'?0:e.key==='End'?tabs.length-1:-1;if(j>=0){e.preventDefault();category(tabs[j].dataset.lootCategory);tabs[j].focus()}})});
 category(active);
 let matches=[],selectedIndex=0,shown=0,selectedPiece=D.pieces.find(p=>p.file==='corridor/atrium_1');
 function close(){results.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant')}
 function select(p){if(!p)return;selectedPiece=p;$('piece-selected-name').textContent=p.name;$('piece-selected-file').textContent=p.file+'.nbt';input.value='';input.placeholder=p.name+' — search pieces';window.PieceViewer?.select(p.file);close()}
 function highlight(){const opts=[...results.querySelectorAll('[role="option"]')];opts.forEach((o,i)=>o.setAttribute('aria-selected',String(i===selectedIndex)));if(opts[selectedIndex]){input.setAttribute('aria-activedescendant',opts[selectedIndex].id);opts[selectedIndex].scrollIntoView({block:'nearest'})}}
 function appendBatch(){
 const stop=Math.min(matches.length,shown+20);
 for(let i=shown;i<stop;i++){const p=matches[i],b=document.createElement('button');b.type='button';b.id='piece-option-'+i;b.setAttribute('role','option');b.tabIndex=-1;b.setAttribute('aria-selected',String(i===selectedIndex));const name=document.createElement('span'),file=document.createElement('small');name.textContent=p.name;file.textContent=p.file+'.nbt';b.append(name,file);b.addEventListener('pointerdown',e=>e.preventDefault());b.onclick=()=>select(p);results.append(b)}
 shown=stop;
 }
 function search(){
 matches=ranked(D.pieces,input.value);selectedIndex=0;shown=0;results.replaceChildren();results.scrollTop=0;
 if(!matches.length){const p=document.createElement('div');p.className='piece-no-results';p.textContent='No matching pieces';results.append(p)}
 else appendBatch();
 results.hidden=false;input.setAttribute('aria-expanded','true');if(matches.length)input.setAttribute('aria-activedescendant','piece-option-0');else input.removeAttribute('aria-activedescendant');
 }
 results.addEventListener('scroll',()=>{if(!results.hidden&&shown<matches.length&&results.scrollTop+results.clientHeight>=results.scrollHeight-60)appendBatch()});
 input.addEventListener('input',search);input.addEventListener('focus',search);input.addEventListener('click',()=>{if(results.hidden)search()});
 input.addEventListener('keydown',e=>{
 if(e.key==='Enter'){e.preventDefault();if(results.hidden)search();if(matches.length)select(matches[selectedIndex]);}
 else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(results.hidden)search();if(matches.length){selectedIndex=Math.max(0,Math.min(matches.length-1,selectedIndex+(e.key==='ArrowDown'?1:-1)));while(selectedIndex>=shown&&shown<matches.length)appendBatch();highlight()}}
 else if(e.key==='Escape')close();
 });
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('.piece-search-wrap'))close()});
 input.addEventListener('blur',()=>close());
 // Start with the implemented Atrium example.
 select(selectedPiece);input.value='';
}catch(e){console.error(e);body.innerHTML='<tr><td colspan="3">Loot statistics unavailable.</td></tr>';input.disabled=true;}
})();
