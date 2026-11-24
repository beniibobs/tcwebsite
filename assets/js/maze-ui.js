// Minecraft 26.3 textures (representative spawn eggs, block faces, and composited potion sprites).
(()=>{
 const icons={"breeze":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAM1BMVEUAAADz9f/a3OrCtMy1pcqrnMuVjdN6gsRsdqtocqNXbJ1bZI8+XodLU3U3VHgtRGEoPFRm3YFHAAAAAXRSTlMAQObYZgAAAG5JREFUeNp1jzsSwyAMBRFC6INic//TRoBSeCbeAmaX11BeGMHDmYjHw1vLko6NetfxC4RIAX/SFRFbTFh3AaDjXRVglQpQe7Dusri9AoiE+n2CuLtZHDJzIcxiJnLNksVsL8IP8/LgvGfZ/P/3F/LkBFRzg888AAAAAElFTkSuQmCC","melee":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAM1BMVEUAAAB9oWhyk14Ar69ph1YAf39KaS0iWo04UiZBN5kAW1sxRyIwKHIAR0cnOBomIVscGyaVAnXMAAAAAXRSTlMAQObYZgAAAGZJREFUeNp1j1sOgCAMBG3ZLdYHev/TKoVoSHT+Zro/nX4oN4PPZnMZPcrrUMVbCkQUCuthNREB8EzWGEDV+mSBSnWY7S2kpKiQLRxMAbmcLXhmeN5qiOJO0r16cG7ume3eS/D99wXbkwPSNxALPgAAAABJRU5ErkJggg==","ranged":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAG1BMVEUAAADa2trKysq8vLypqamTk5N5dnZXVVVAQEBMRAqqAAAAAXRSTlMAQObYZgAAAFpJREFUeNp1j0EKwEAIxKpxxv3/iwuyCy20uU3MxeuH7u7XFla/dhn1824l7iMQItA6QUagQF47iEiUSEdkAA+RxaDawlOQeIuyVSV7ijEgwexheZi9zfD99w09KwJ9qf4s8AAAAABJRU5ErkJggg==","small":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAARVBMVEUAAAClpaWOlIWNk4SJiYl4jpt3jpp+g496fot7e3tuc2dra2tZWVlTYT5MWWFDSVlISEhBQUEzMzMrKysfHx8XFxcAAACOwMG3AAAAAXRSTlMAQObYZgAAAG1JREFUeNqNj8EShDAIQ+k2xdWgy4r2/z/VGcvBo++WQBgir1GpT1l98/UxFCcaXSWZVpYCmMuUjpeZNO468uI2FzSY7XljQ/kAbeGv6kigkWbk2NB6GoFG867jmTP+X3CJo0vSj4hInc7Ny5YXEEYEpRfM59gAAAAASUVORK5CYII=","vault":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAANlBMVEUAAAD/wZX/mVH/agBscWu/TQBYYFhAYnhFSkIqRFU3OzUyNUAsLTsqJDUYLDklHy4QHSUMChWveULRAAAAAXRSTlMAQObYZgAAAI1JREFUeNo1jgEOxCAIBKm1LmCh+v/PHkhuY8Jk4orURx9qgIhpYCfmoSYp0jATq+ry5nFWIJOviBnELMlJFhEt39sPCInHtBRWAu4Ck73FIL5AyJslAlKcCvZGiao4vg+eFflvAbyg3vD6Qq0NyhYkRtreh15Xa+1+Hh2902DWdt/HKPOgmXnnm5lzzh8AxAkmmAqlywAAAABJRU5ErkJggg==","ominous":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAP1BMVEUAAAAz//8nzMxvgoLeQFhscWsAmZxYYFhAYngCenlFSkIqRFV/HjM3OzUyNUAsLTspKCgYLDklHy4QHSUMChWXTndOAAAAAXRSTlMAQObYZgAAAJpJREFUeNo1zFESgzAIBFBqikTixkVy/7NWnOn+bOYFEDU1QtUMNDUVdyOtoNpdHFSeX+B7UgmXSDpINRLODBnJ0xNrIf1kDhlRPwV0FPRIgraWEczs0pP4A1gQksm2VmOmvBCjo913Qx9RR1NEEq3hfYT06sgnUVATGbXVx1OlqobPZ9u2/ThgqmLu2Pb9FbibzMo1r8qcc/4AXXULwDk2VwMAAAAASUVORK5CYII=","dispenser":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAKlBMVEVQTk5oaGh3d3ddW1uRkZGdnZ2oqKiwsLDFxcUhISEQEBB/f3+FhYU8OzvEJDKrAAAAjUlEQVR42k2PQRIEMQgC0YA6k/H/392Y01JFF3ADox53H09bZm6fHx6vGZxr2fo4kwOw76ta7pcG4KTMcr9cjXarRJodlJ0BxqSxihMW0F6hSjJLUd5oOyH5vpGhMgCRt79P5YkApEg97zOD1GgFlXu6GASaCimqJEoEsClSQR5yA7ivfO895wz/9xsAfoleBPNaM0/rAAAAAElFTkSuQmCC","lingering":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA+ElEQVR42mNgGAW0BVdyPf8j09gAEz4DDp86y3Dl6ff/h0+dJd32zeff/MfHhwFGrE5/+v3/q/rbDF+zpRj2505iYGBgYLj+6jJD1srZDL6GIox4vXDl6ff/pY5RDF+zpRi4pz5jUBBUYVAQVGHQFNNlmBaeyhDbfwjFJSzYXKAppgtnv/n6ikGEW4xBQVCFgYGBgeE1oUC8/+orhK7bxnDl5QWGDz/eMjAwMDD8TNBj4GTlIhwLqw5cY7j+6jLDg/d3GBgYGBh42fnh7HNPTxIXiLH9h/6/md4P94pkYRDDvspGBpHMQobFhXaMBA2AGYIuhq6ZKgAAuZdaehRh/R0AAAAASUVORK5CYII=","weakness":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA+UlEQVR42mNgGFLgSq7n/yu5nv+RxZhI0czAwMBw9dYdFHEWYjTH9h/6f3hFCIOQAD/pzt58/g3cydPNxf5PNxf7T5bmzeffkKb5ytPv/3EZRpRmD1+P/5vPv/mvraf9X1tP+7+0rPR/ogy58vQ7XLGHr8d/c2vz/+bW5nBDYvsP/ScYCwKCAnD2zx8/Gdg52Bl4eHmwWoiRDu6/+srAwMDA0JLjzfD+3XuGnz9/MjAwMDCEFM1kYGZhJmwAAwMDw4f3Hxi+fP7CwMDAwMDKxgpnv339lrhAjO0/9F9aVhoegN1rL2D1PwMDAwMjPkPQxRYX2jFSPYMBAIwLdYzOgnykAAAAAElFTkSuQmCC","poison":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABC0lEQVR42mNgGFLgSq7n/yu5nv+RxZhI0czAwMBw9dYdFHEWYjTH9h/6f3hFCIOQAD/pzt58/g3cydPNxf5PNxf7T5bmzeffkKb5ytPv/3EZRpRmv8mG/zeff/NfP0L2v36E7H85S+H/2AxhwqbZK0SGIdVmN8PsI64MvJIcDLySHAyC8lwM2VnqDLH9h/4TjAVBeS44+8fH3wwc/KwMvJIcWF2L4YL7r74yMDAwMHQusmR4d+8Lw8/PfxgYGBgY/G1WMzCzMxE2gIGBgeH9w28Mn5//YGBgYGBg5WKGs9/c+kJcIMb2H/ovZykMD8DutRf+y1kK/0f3PwMDAwMjPkPQxRYX2jFSPYMBAJSobvVMPSXUAAAAAElFTkSuQmCC","healing":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA3ElEQVR42mNgGAW0BVdyPf8j09gAEz4DDp86y3Dl6ff/h0+dJd32zeff/MfHx+/0p9///1BR/r/5/Jv/U0VF/08VFf2fwMv7nyhDrjz9Dlf8Q0X5/35p6f/7paXhhsT2H/pPMAxMOTjg7Gd//zAwMDAwaLGxoYjjNOD+q68MDAwMDDw++gzHv/9gePXnLwMDAwPDmUlbGXiYGDEMYEEXWHXgGgPzjx9wW4WYmRiu/frFwMDAwLD/23fiAjG2/9D/BF5eeAB2r72A1f8MDAwMjPgMQRdbXGjHSPXUCgBylmYav6Ad6gAAAABJRU5ErkJggg=="};
 const rows=[
 ['breeze','Breeze spawner','1.000','100.00%'],
 ['melee','Melee spawner','1.963','92.35%'],
 ['ranged','Ranged spawner','0.750','57.81%'],
 ['small','Small melee spawner','0.000','0.00%'],
 ['vault','Vault','6.907','99.91%'],
 ['ominous','Ominous vault','1.000','100.00%'],
 ['dispenser','Dispenser','3.926','67.67%'],
 ['lingering','Any lingering potion','0.542','36.43%'],
 ['weakness','Any weakness potion','0.271','21.97%'],
 ['poison','Any poison potion','0.271','21.97%'],
 ['healing','Any healing potion','0.135','12.16%']
 ];
 const icon=k=>icons[k]?'<img class="mc-stat-icon" width="28" height="28" alt="" src="data:image/png;base64,'+icons[k]+'">':'';
 const tb=document.getElementById('tb'),card=document.getElementById('maze-hover-card');
 tb.innerHTML=rows.map(([k,name,mean,p])=>'<tr><td><span class="mc-stat-label">'+icon(k)+'<span>'+name+'</span></span></td><td class="num">'+mean+'</td><td class="num">'+p+'</td></tr>').join('');
 const q=[['Q1',25/216*100],['Q2',23/72*100],['Q3',23/72*100],['Q4',53/216*100]];
 const halls=[['Hallway 1',100/3],['Hallway 2',100/3],['Hallway 3',100/3]];
 const ramps=[['Ramp 1',25],['Ramp 2',25],['Ramp 3',25],['Ramp 4',25]];
 const esc=x=>String(x).replace(/[&<>"']/g,v=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[v]));
 const bars=(data,selected)=>'<div class="maze-hover-bars">'+data.map(([label,p])=>'<div class="maze-hover-row'+(selected===label?' selected':'')+'"><span>'+esc(label)+'</span><strong>'+p.toFixed(2)+'%</strong><div class="maze-hover-track"><i style="width:'+p+'%"></i></div></div>').join('')+'</div>';
 let key='';
 function show(state){
   const next=state?JSON.stringify(state):'';
   if(next===key)return;key=next;
   if(!state){card.hidden=true;return}
   let title='',sub='',content='',foot='',img='';
   if(state.kind==='exit'){
      title='Maze exits';sub='Chance of being the connected entrance';
      content=bars([['Lower exit · Y +3',57.67],['Upper exit · Y +8',42.33]]);
      foot='Both arrows are possible exits. Only one connects to the parent branch. · 100k structure emulator';
   }else if(state.kind==='marker'){
      const k=state.type;
      if(k==='dispenser'){
        title='Wall dispenser';img=icon('dispenser');sub='50% placement chance at each eligible Q4 slot';
        content=bars([['Water bucket',4/29*100],['Arrows',4/29*100],['Snowballs',6/29*100],['Eggs',2/29*100],['Fire charges',6/29*100],['Splash potion',3/29*100],['Lingering potion',4/29*100]]);
        foot='Loot odds per generated dispenser · one stack from the chamber dispenser loot table.';
      }else{
        const opts={breeze:['Breeze'],melee:['Zombie','Husk','Spider'],ranged:['Skeleton','Stray','Bogged'],small_melee:['Slime','Cave spider','Silverfish','Baby zombie']}[k]||[];
        const names={breeze:'Breeze spawner',melee:'Melee spawner',ranged:'Ranged spawner',small_melee:'Small melee spawner'};
        title=names[k]||'Trial spawner';img=icon(k==='small_melee'?'small':k);
        sub=k==='breeze'?'Fixed centre spawner':'Example mob: '+(state.label.split(' · ')[2]||'').replace(/ \(matching melee category\)/,'');
        content=bars(opts.map(m=>[m,100/opts.length]),opts.find(m=>sub.toLowerCase().includes(m.toLowerCase())));
        foot=k==='breeze'?'Breeze is fixed in this centre piece.':'Mob choice is shared by the category across the Trial Chamber, not rolled independently for every spawner.';
      }
   }else{
      const label=state.label;const quad=label.match(/quadrant_(\d)/),hall=label.match(/hallway_(\d)/),ramp=label.match(/ramp_(\d)/);
      if(quad){
        title='Quadrant: Q'+quad[1];sub='Chance at one corner';content=bars(q,'Q'+quad[1]);
        foot='Q1: one vault + melee spawner. Q2/Q3: two vaults. Q4: eight possible dispenser slots. Corners are correlated.';
      }else if(hall){
        title='Lower arm: Hallway '+hall[1];sub='Chance at each lower arm';content=bars(halls,'Hallway '+hall[1]);
        foot='Hallway 2 has a regular vault connector.';
      }else if(ramp){
        title='Upper arm: Ramp '+ramp[1];sub='Chance at each non-ominous upper arm';content=bars(ramps,'Ramp '+ramp[1]);
        foot='Ramps 1 and 2: melee. Ramp 3: ranged. Ramp 4: no spawner.';
      }else if(label==='Ominous upper arm'){
        title='Ominous upper arm';sub='Fixed upper arm';content=bars([['Ominous arm',100]],'Ominous arm');foot='Contains one ominous vault connector.';
      }else{
        title='Centre';sub='Fixed central assembly';content=bars([['Centre',100]],'Centre');foot='Contains the Breeze spawner connector.';
      }
   }
   card.innerHTML='<div class="maze-hover-title">'+img+'<h3>'+esc(title)+'</h3></div><p class="maze-hover-sub">'+esc(sub)+'</p>'+content+'<p class="maze-hover-note">'+esc(foot)+'</p>';
   card.hidden=false;
 }
 window.MazeUI={show};
})();