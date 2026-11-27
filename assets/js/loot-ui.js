/* Overview Loot: source data in assets/data/overview-loot.json. */
(async()=>{
'use strict';
const $=id=>document.getElementById(id),body=$('loot-stats'),input=$('piece-search'),results=$('piece-results');
const prob=n=>{
 const v=Math.min(100,Math.max(0,n)),digits=v<100&&v.toFixed(2)==='100.00'?Math.max(4,Math.min(8,Math.ceil(-Math.log10(100-v))+1)):2,p=v.toFixed(digits)+'%',h=v*1.28,s=76-Math.abs(v-50)*.16,l=49-Math.abs(v-50)*.36;
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
 const res=await fetch('assets/data/overview-loot.json?v=1');if(!res.ok)throw Error('Loot data unavailable');const D=await res.json();
 const tabs=[...document.querySelectorAll('[data-loot-category]')];let active='materials';
 function category(id){
 const c=D.categories.find(x=>x[0]===id);if(!c)return;
 active=id;
 tabs.forEach(t=>{const on=t.dataset.lootCategory===id;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1});
 $('loot-table-panel').setAttribute('aria-labelledby','loot-tab-'+id);
 body.replaceChildren(...c[2].map(([name,icon,mean,p])=>{
  const tr=document.createElement('tr'),label=document.createElement('td'),wrap=document.createElement('span'),img=document.createElement('span'),text=document.createElement('span');wrap.className='mc-stat-label';img.className='loot-icon';img.style.backgroundPosition=(-32*(icon%5))+'px '+(-32*Math.floor(icon/5))+'px';img.setAttribute('aria-hidden','true');text.textContent=name;wrap.append(img,text);label.append(wrap);tr.append(label);
  const e=document.createElement('td');e.className='num';e.textContent=mean.toFixed(3);tr.append(e);
  const chance=document.createElement('td');chance.className='num';chance.innerHTML=prob(p);tr.append(chance);return tr;
 }));
 }
 tabs.forEach((t,i)=>{t.onclick=()=>category(t.dataset.lootCategory);t.addEventListener('keydown',e=>{let j=e.key==='ArrowRight'?(i+1)%tabs.length:e.key==='ArrowLeft'?(i+tabs.length-1)%tabs.length:e.key==='Home'?0:e.key==='End'?tabs.length-1:-1;if(j>=0){e.preventDefault();category(tabs[j].dataset.lootCategory);tabs[j].focus()}})});
 category(active);
 let matches=[],selectedIndex=0,selectedPiece=D.pieces.find(p=>p.file==='corridor/entrance_1');
 function close(){results.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant')}
 function select(p){if(!p)return;selectedPiece=p;$('piece-selected-name').textContent=p.name;$('piece-selected-file').textContent=p.file+'.nbt';input.value=p.name;close()}
 function highlight(){const opts=[...results.querySelectorAll('[role="option"]')];opts.forEach((o,i)=>o.setAttribute('aria-selected',String(i===selectedIndex)));if(opts[selectedIndex]){input.setAttribute('aria-activedescendant',opts[selectedIndex].id);opts[selectedIndex].scrollIntoView({block:'nearest'})}}
 function search(){
 matches=ranked(D.pieces,input.value).slice(0,30);selectedIndex=0;results.replaceChildren();
 if(!matches.length){const p=document.createElement('div');p.className='piece-no-results';p.textContent='No matching pieces';results.append(p)}
 else matches.forEach((p,i)=>{const b=document.createElement('button');b.type='button';b.id='piece-option-'+i;b.setAttribute('role','option');b.tabIndex=-1;b.setAttribute('aria-selected',String(i===0));const name=document.createElement('span'),file=document.createElement('small');name.textContent=p.name;file.textContent=p.file+'.nbt';b.append(name,file);b.addEventListener('mousedown',e=>e.preventDefault());b.onclick=()=>select(p);results.append(b)});
 results.hidden=false;input.setAttribute('aria-expanded','true');if(matches.length)input.setAttribute('aria-activedescendant','piece-option-0');else input.removeAttribute('aria-activedescendant');
 }
 input.addEventListener('input',search);input.addEventListener('focus',search);
 input.addEventListener('keydown',e=>{
 if(e.key==='Enter'){e.preventDefault();if(results.hidden)search();if(matches.length)select(matches[selectedIndex]);}
 else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(results.hidden)search();if(matches.length){selectedIndex=Math.max(0,Math.min(matches.length-1,selectedIndex+(e.key==='ArrowDown'?1:-1)));highlight()}}
 else if(e.key==='Escape')close();
 });
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('.piece-search-wrap'))close()});
 input.addEventListener('blur',()=>close());
 // Initial selected piece is deliberately a placeholder until the renderer is added.
 select(selectedPiece);input.value='';
}catch(e){console.error(e);body.innerHTML='<tr><td colspan="3">Loot statistics unavailable.</td></tr>';input.disabled=true;}
})();
