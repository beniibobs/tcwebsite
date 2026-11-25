/* Shared room-resource comparison. Room rows mirror the published room UI values.
Overall: v4 100k spawner/plain-pot counts; v5 100k dispenser counts and loot
probabilities (any dispenser uses the per-structure union, not summed chances).
Potion expectations count qualifying dispenser stacks, not bottles.
Vaults: 10,000 whole-structure NBT emulator runs, RNG seeds 200000–209999.
180526 regular and 65456 ominous vaults counted directly in placed reward templates.
Both occurred in every run. Not validated against actual Minecraft world seeds.
See assets/data/vault-audit-10000.json for methodology, category totals and caveats.
Maze's earlier room-only audit is retained pending reconciliation. */
(()=>{
'use strict';
const current=document.currentScript?.dataset.roomId;
const rooms=[["chamber_1","Overhang"],["chamber_2","Snoverhang"],["pedestal","Pedestal"],["chamber_4","Infestation"],["eruption","Eruption"],["assembly","Assembly"],["chamber_8","Hotel"],["maze","Maze"]];
const stats={"chamber_1":{"breeze":["1.000","100.00%"],"melee":["0.000","0.00%"],"ranged":["1.520","100.00%"],"small":["0.000","0.00%"],"vault":["0.763","63.02%"],"ominous":["0.718","71.81%"],"dispenser":["9.099","100.00%"],"lingering":["1.255","72.68%"],"weakness":["0.628","47.16%"],"poison":["0.628","47.16%"],"healing":["0.314","27.12%"]},"chamber_2":{"breeze":["0.000","0.00%"],"melee":["0.000","0.00%"],"ranged":["2.414","100.00%"],"small":["0.000","0.00%"],"vault":["0.707","58.72%"],"ominous":["1.000","100.00%"],"dispenser":["7.541","99.9962%"],"lingering":["1.040","65.86%"],"weakness":["0.520","41.05%"],"poison":["0.520","41.05%"],"healing":["0.260","23.06%"]},"pedestal":{"breeze":["1.000","100.00%"],"melee":["1.303","77.76%"],"ranged":["0.667","55.56%"],"small":["0.667","55.56%"],"vault":["12.230","100.00%"],"ominous":["1.000","100.00%"],"dispenser":["14.991","100.00%"],"lingering":["2.068","88.27%"],"weakness":["1.034","65.09%"],"poison":["1.034","65.09%"],"healing":["0.517","40.64%"]},"chamber_4":{"breeze":["0.000","0.00%"],"melee":["0.000","0.00%"],"ranged":["0.000","0.00%"],"small":["2.000","100.00%"],"vault":["2.000","100.00%"],"ominous":["1.000","100.00%"],"dispenser":["0.000","0.00%"],"pot":["2.800","95.60%"],"lingering":["0.000","0.00%"],"weakness":["0.000","0.00%"],"poison":["0.000","0.00%"],"healing":["0.000","0.00%"]},"eruption":{"breeze":["1.000","100.00%"],"melee":["1.027","70.73%"],"ranged":["1.596","86.23%"],"small":["0.000","0.00%"],"vault":["2.562","95.70%"],"ominous":["1.000","100.00%"],"dispenser":["0.000","0.00%"],"other_dispenser":["1.000","100.00%"],"lingering":["0.000","0.00%"],"weakness":["0.000","0.00%"],"poison":["0.000","0.00%"],"healing":["0.000","0.00%"]},"assembly":{"breeze":["1.000","100.00%"],"melee":["0.139","13.43%"],"ranged":["1.139","100.00%"],"small":["0.139","13.43%"],"vault":["4.000","100.00%"],"ominous":["1.000","100.00%"],"dispenser":["5.800","99.95%"],"lingering":["0.800","56.13%"],"weakness":["0.400","33.36%"],"poison":["0.400","33.36%"],"healing":["0.200","18.25%"]},"chamber_8":{"breeze":["0.000","0.00%"],"melee":["0.000","0.00%"],"ranged":["4.000","100.00%"],"small":["0.000","0.00%"],"vault":["3.000","100.00%"],"ominous":["1.000","100.00%"],"dispenser":["8.000","99.9985%"],"lingering":["1.103","68.1248%"],"weakness":["0.552","42.9625%"],"poison":["0.552","42.9625%"],"healing":["0.276","24.2906%"]},"maze":{"breeze":["1.000","100.00%"],"melee":["1.963","92.35%"],"ranged":["0.750","57.81%"],"small":["0.000","0.00%"],"vault":["6.907","99.91%"],"ominous":["1.000","100.00%"],"dispenser":["3.926","67.67%"],"lingering":["0.542","36.43%"],"weakness":["0.271","21.97%"],"poison":["0.271","21.97%"],"healing":["0.135","12.16%"]}};
const overall={"breeze":["2.578","100.00%"],"melee":["3.504","94.76%"],"ranged":["8.481","99.93%"],"small":["2.462","88.65%"],"vault":["≈18.053","100.00%"],"ominous":["≈6.546","100.00%"],"dispenser":["22.110","98.04%"],"other_dispenser":["22.859","99.76%"],"pot":["33.381","100.00%"],"lingering":["3.050","89.31%"],"weakness":["1.525","72.99%"],"poison":["1.525","72.99%"],"healing":["0.762","50.69%"]};
const table=document.getElementById('tb');
if(!table||!stats[current])return;
const zero=['0.000','0.00%'];
function values(id,k){
 const s=stats[id];
 // These dispenser types are mutually exclusive within the eight room types.
 if(k==='other_dispenser')return id==='eruption'?(s.other_dispenser||zero):(s.dispenser||zero);
 return s[k]||zero;
}
const dialog=document.createElement('dialog');
dialog.className='resource-compare';
dialog.setAttribute('aria-labelledby','resource-compare-title');
dialog.innerHTML='<div class="resource-compare-inner"><header class="resource-compare-header"><div class="resource-compare-heading"><span id="resource-compare-icon"></span><h2 id="resource-compare-title"></h2></div><button type="button" class="resource-compare-close" aria-label="Close comparison" autofocus>×</button></header><div class="resource-compare-table-wrap"><table class="resource-compare-table"><thead><tr><th scope="col">Chamber</th><th scope="col" class="num">Expected</th><th scope="col" class="num">Chance of ≥1</th></tr></thead><tbody id="resource-compare-overall"></tbody><tbody class="resource-compare-gap" aria-hidden="true"><tr><td colspan="3"></td></tr></tbody><tbody id="resource-compare-rooms"></tbody></table></div></div>';
document.body.append(dialog);
const title=dialog.querySelector('#resource-compare-title'),icon=dialog.querySelector('#resource-compare-icon'),top=dialog.querySelector('#resource-compare-overall'),body=dialog.querySelector('#resource-compare-rooms'),close=dialog.querySelector('.resource-compare-close');
let trigger=null;
function row(name,pair,selected=false,isOverall=false,scope=''){
 const tr=document.createElement('tr');if(selected){tr.classList.add('is-current');tr.setAttribute('aria-current','true')}if(isOverall)tr.classList.add('is-overall');
 const th=document.createElement('th');th.scope='row';th.textContent=name;if(scope){const small=document.createElement('small');small.textContent=scope;th.append(small)}tr.append(th);
 const expected=document.createElement('td');expected.className='num';expected.textContent=pair[0];tr.append(expected);
 const chance=document.createElement('td');chance.className='num';chance.innerHTML=window.MazeUI.probability(pair[1]);tr.append(chance);return tr;
}
function open(k,label,button,sourceIcon){
 if(!overall[k]||dialog.open)return;
 trigger=button;title.textContent=label;icon.replaceChildren();if(sourceIcon)icon.append(sourceIcon.cloneNode(true));
 const vault=k==='vault'||k==='ominous';
 const whole=row('Whole Trial Chamber',overall[k],false,true);
 if(vault){
  const explanation='10,000 whole-structure NBT emulator runs, counting actual placed vault templates, including combat rooms, entrances, end room, atrium, intersections, corridors and encounters. Both vault types occurred in every run. Not validated against vanilla world seeds.';
  whole.title=explanation;
  whole.children[1].setAttribute('aria-label',overall[k][0].replace('≈','Approximately ')+'. '+explanation);
 }
 top.replaceChildren(whole);
 body.replaceChildren(...rooms.map(([id,name])=>row(name,values(id,k),id===current)));

 document.documentElement.classList.add('resource-compare-open');dialog.showModal();close.focus();
}
close.addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
dialog.addEventListener('close',()=>{document.documentElement.classList.remove('resource-compare-open');trigger?.focus({preventScroll:true});trigger=null});
for(const tr of table.querySelectorAll('tr[data-feature]')){
 const k=tr.dataset.feature, label=tr.querySelector('.mc-stat-label > span');if(!label||!overall[k])continue;
 const name=label.textContent;const button=document.createElement('button');button.type='button';button.className='resource-compare-trigger';button.textContent=name;button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-label','Compare '+name+' across chambers');button.addEventListener('click',()=>open(k,name,button,tr.querySelector('.mc-stat-icon')));label.replaceWith(button);
}
})();