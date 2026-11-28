/* Copper Doors: measured per-door outcomes and NBT-aligned first-piece examples. */
(async()=>{
'use strict';
const prob=n=>{const v=Math.min(100,Math.max(0,n)),h=v*1.28,s=76-Math.abs(v-50)*.16,l=49-Math.abs(v-50)*.36;return '<div class="maze-probability" style="--prob-color:hsl('+h+' '+s+'% '+l+'%);--prob-text:hsl('+h+' '+s+'% '+Math.max(56,l+13)+'%)"><strong>'+v.toFixed(2)+'%</strong><div class="maze-probability-track" aria-hidden="true"><i style="width:'+v+'%"></i></div></div>'};
const pct=(n,d)=>100*n/d,cap=s=>s[0].toUpperCase()+s.slice(1);
const dialog=document.getElementById('door-chamber-dialog'),close=dialog.querySelector('.resource-compare-close'),title=dialog.querySelector('h2'),tbody=dialog.querySelector('tbody');let trigger=null;
function openChambers(height,data,button){trigger=button;title.textContent='Chambers per '+cap(height)+' Door';tbody.innerHTML=data.chambers.map(c=>'<tr><th scope="row">'+c.name+'</th><td class="num">'+prob(pct(c.count,data.denominator))+'</td></tr>').join('');document.documentElement.classList.add('resource-compare-open');dialog.showModal();close.focus()}
close.onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()});dialog.addEventListener('close',()=>{document.documentElement.classList.remove('resource-compare-open');trigger?.focus({preventScroll:true});trigger=null});
try{
 const response=await fetch('assets/data/copper-doors.json?v=1');if(!response.ok)throw Error('Door data unavailable');const data=await response.json();
 for(const [height,d] of Object.entries(data.heights)){
  const section=document.querySelector('[data-door-height="'+height+'"]'),root=section.querySelector('.door-viewer'),tabs=section.querySelector('.door-tabs'),stats=section.querySelector('tbody'),viewer=window.PieceViewerFactory(root);let selected=-1;
  for(const row of d.stats){const tr=document.createElement('tr'),label=document.createElement('td'),p=document.createElement('td');if(row.name==='Chamber'){const b=document.createElement('button');b.type='button';b.className='resource-compare-trigger';b.textContent=row.name;b.setAttribute('aria-haspopup','dialog');b.onclick=()=>openChambers(height,d,b);label.append(b)}else label.textContent=row.name;p.className='num';p.innerHTML=prob(pct(row.count,d.denominator));tr.append(label,p);stats.append(tr)}
  const buttons=d.variants.map((v,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.id=height+'-tab-'+i;b.setAttribute('aria-controls',height+'-view');b.innerHTML='<span>'+v.name+'</span><strong>'+pct(v.count,d.firstDenominator).toFixed(2)+'%</strong>';b.addEventListener('click',()=>choose(i));tabs.append(b);return b});
  function choose(i){if(selected===i)return;selected=i;buttons.forEach((b,j)=>{b.setAttribute('aria-selected',String(j===i));b.tabIndex=j===i?0:-1});root.querySelector('[data-view="piece-render-shell"]').setAttribute('aria-labelledby',buttons[i].id);const v=d.variants[i];viewer.select(height+'-'+i,{...v,doorY:d.doorY,tag:v.blocked?v.parts[0].file.split('/').pop():v.parts[1].file.split('/').pop(),tagTitle:v.parts.map(p=>'minecraft:trial_chambers/'+p.file).join(' + ')});}
  tabs.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const i=e.key==='Home'?0:e.key==='End'?buttons.length-1:(selected+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;choose(i);buttons[i].focus()});
  buttons.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===0));b.tabIndex=i===0?0:-1});
  if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();if(selected<0)choose(0)}},{rootMargin:'250px'});observer.observe(root)}else choose(0);
 }
}catch(e){console.error(e);document.querySelectorAll('.door-viewer .piece-render-status').forEach(s=>s.textContent='Unable to initialise door viewer: '+e.message)}
})();
