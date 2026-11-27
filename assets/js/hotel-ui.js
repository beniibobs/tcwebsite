// Minecraft 26.3 textures (representative spawn eggs, block faces, and composited potion sprites).
(()=>{
 const icons={"breeze":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAM1BMVEUAAADz9f/a3OrCtMy1pcqrnMuVjdN6gsRsdqtocqNXbJ1bZI8+XodLU3U3VHgtRGEoPFRm3YFHAAAAAXRSTlMAQObYZgAAAG5JREFUeNp1jzsSwyAMBRFC6INic//TRoBSeCbeAmaX11BeGMHDmYjHw1vLko6NetfxC4RIAX/SFRFbTFh3AaDjXRVglQpQe7Dusri9AoiE+n2CuLtZHDJzIcxiJnLNksVsL8IP8/LgvGfZ/P/3F/LkBFRzg888AAAAAElFTkSuQmCC","melee":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAM1BMVEUAAAB9oWhyk14Ar69ph1YAf39KaS0iWo04UiZBN5kAW1sxRyIwKHIAR0cnOBomIVscGyaVAnXMAAAAAXRSTlMAQObYZgAAAGZJREFUeNp1j1sOgCAMBG3ZLdYHev/TKoVoSHT+Zro/nX4oN4PPZnMZPcrrUMVbCkQUCuthNREB8EzWGEDV+mSBSnWY7S2kpKiQLRxMAbmcLXhmeN5qiOJO0r16cG7ume3eS/D99wXbkwPSNxALPgAAAABJRU5ErkJggg==","ranged":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAG1BMVEUAAADa2trKysq8vLypqamTk5N5dnZXVVVAQEBMRAqqAAAAAXRSTlMAQObYZgAAAFpJREFUeNp1j0EKwEAIxKpxxv3/iwuyCy20uU3MxeuH7u7XFla/dhn1824l7iMQItA6QUagQF47iEiUSEdkAA+RxaDawlOQeIuyVSV7ijEgwexheZi9zfD99w09KwJ9qf4s8AAAAABJRU5ErkJggg==","small":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAARVBMVEUAAAClpaWOlIWNk4SJiYl4jpt3jpp+g496fot7e3tuc2dra2tZWVlTYT5MWWFDSVlISEhBQUEzMzMrKysfHx8XFxcAAACOwMG3AAAAAXRSTlMAQObYZgAAAG1JREFUeNqNj8EShDAIQ+k2xdWgy4r2/z/VGcvBo++WQBgir1GpT1l98/UxFCcaXSWZVpYCmMuUjpeZNO468uI2FzSY7XljQ/kAbeGv6kigkWbk2NB6GoFG867jmTP+X3CJo0vSj4hInc7Ny5YXEEYEpRfM59gAAAAASUVORK5CYII=","vault":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAANlBMVEUAAAD/wZX/mVH/agBscWu/TQBYYFhAYnhFSkIqRFU3OzUyNUAsLTsqJDUYLDklHy4QHSUMChWveULRAAAAAXRSTlMAQObYZgAAAI1JREFUeNo1jgEOxCAIBKm1LmCh+v/PHkhuY8Jk4orURx9qgIhpYCfmoSYp0jATq+ry5nFWIJOviBnELMlJFhEt39sPCInHtBRWAu4Ck73FIL5AyJslAlKcCvZGiao4vg+eFflvAbyg3vD6Qq0NyhYkRtreh15Xa+1+Hh2902DWdt/HKPOgmXnnm5lzzh8AxAkmmAqlywAAAABJRU5ErkJggg==","ominous":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAP1BMVEUAAAAz//8nzMxvgoLeQFhscWsAmZxYYFhAYngCenlFSkIqRFV/HjM3OzUyNUAsLTspKCgYLDklHy4QHSUMChWXTndOAAAAAXRSTlMAQObYZgAAAJpJREFUeNo1zFESgzAIBFBqikTixkVy/7NWnOn+bOYFEDU1QtUMNDUVdyOtoNpdHFSeX+B7UgmXSDpINRLODBnJ0xNrIf1kDhlRPwV0FPRIgraWEczs0pP4A1gQksm2VmOmvBCjo913Qx9RR1NEEq3hfYT06sgnUVATGbXVx1OlqobPZ9u2/ThgqmLu2Pb9FbibzMo1r8qcc/4AXXULwDk2VwMAAAAASUVORK5CYII=","dispenser":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAKlBMVEVQTk5oaGh3d3ddW1uRkZGdnZ2oqKiwsLDFxcUhISEQEBB/f3+FhYU8OzvEJDKrAAAAjUlEQVR42k2PQRIEMQgC0YA6k/H/392Y01JFF3ADox53H09bZm6fHx6vGZxr2fo4kwOw76ta7pcG4KTMcr9cjXarRJodlJ0BxqSxihMW0F6hSjJLUd5oOyH5vpGhMgCRt79P5YkApEg97zOD1GgFlXu6GASaCimqJEoEsClSQR5yA7ivfO895wz/9xsAfoleBPNaM0/rAAAAAElFTkSuQmCC","lingering":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA5klEQVR42mNgGAW0BVdyPf8j09gAEz4DDp86y3Dl6ff/h0+dJd32zeff/MfHx+/0p9//W8Qe+7/5/Jv/ihbl/xUtyv+Lqvj8x2YIEzbNjvahDNVFagytfbcYuPgVGbj4FRl4RLQZkkITGGL7D6EYwoLNBTwi2nD2r+9vGNg4RRi4+BWJC8T7r74yMDAwMFRUrGH4/OoSw+/v7xgYGBgYEtIsGJhZOAkbsOrANYYvb64yfPt4H+JEdj44++OLM8QFYmz/of+iKj7wAOxee+G/qIrPf3T/MzAwMDDiMwRdbHGhHSPVUysA7pBhK6cRYf4AAAAASUVORK5CYII=","weakness":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABD0lEQVR42mNgGGjAiE/ySq7nfwYGBoart+4whO+8zUiSAVeefv//49Q6OP+5gjuDr6EIhnoWXAbcf/WV4duMBgYGBgaGdx8+MsjMuEa6/zaff/OfgYGBIbb/0H9caphoFrpXnn5HsRWfK7Bq9vD1+L/5/Jv/2nra/7X1tP9Ly0r/J8qQK0+//5eWlf6/+fyb/x6+Hv/Nrc3/m1ub4zQEaywICArA2T9//GRg52Bn4OHlIS4Q77/6ysDAwMDQkuPN8P7de4afP38yMDAwMIQUzWRgZmEmbMCqA9cYPrz/wPDl8xcGBgYGBlY2Vjj77eu3xAVibP+h/9Ky0vAA7F57AWcgMuIzBF1scaEdI9XTCwDmoHXa1DBLmgAAAABJRU5ErkJggg==","poison":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABFklEQVR42mNgGGjAiE/ySq7nfwYGBoart+4whO+8zUiSAVeefv//49Q6OP+5gjuDr6EIhnoWXAbcf/WV4duMBgYGBgaGdx8+MsjMuEa6/zaff/OfgYGBIbb/0H9caphoFrpXnn5HsRWfK7Bq9pts+H/z+Tf/9SNk/+tHyP6XsxT+j80QJmyavUJkGFJtdjPMPuLKwCvJwcArycEgKM/FcHBVIIZLsMaCoDwXnP3j428GDn5WBl5JDuIC8f6rrwwMDAwMnYssGd7d+8Lw8/MfBgYGBgZ/m9UMzOxMhA1YdeAaw/uH3xg+P//BwMDAwMDKxQxnv7n1hbhAjO0/9F/OUhgegN1rL+AMREZ8hqCLLS60Y6R6egEAIkdwAxyfT/oAAAAASUVORK5CYII=","healing":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABEUlEQVR42sWSsUvDQBSHv6RSOvQWMVMchHZyEQdXVxF0dirkH3DwP3B3KAiF7m6CLsHBKdJFECEOMYMKnaIQQtGhvVBanlugpgktKN509+7xvbuPH/z3Msoug+N9AXh+eePo9tVYChBEWtKH6+z8sbHH4fZarn+lCNCPh4y6pwAMPr9Y74bL/8/1EwFotXtS1GP+md0g0jNTy14xX2CzIa6fSMeypGNZ4iglC0GCSIujlLh+ImmzIZ5ti2fbhZC5DnZqtWz/Pp0AsFmtztQLAf14CED9YIt7nRJPpgA8nt9QN/OxyeXg8i6kkqbZ1NWKSTgeA+CN9GISW+2eOEplAs+ungolGmWQn7WLk13j1/PyDa0jdazFdqqWAAAAAElFTkSuQmCC"};
 const rows=[["breeze","Breeze spawner","0.000","0.00%"],["melee","Melee spawner","0.000","0.00%"],["ranged","Ranged spawner","4.000","100.00%"],["small","Small melee spawner","0.000","0.00%"],["vault","Vault","3.000","100.00%"],["ominous","Ominous vault","1.000","100.00%"],["dispenser","Chamber dispenser","8.000","99.9985%"],["lingering","Any lingering potion","1.103","68.12%"],["weakness","Any weakness potion","0.552","42.96%"],["poison","Any poison potion","0.552","42.96%"],["healing","Any healing potion","0.276","24.29%"]];
 const icon=k=>icons[k]?'<img class="mc-stat-icon" width="28" height="28" alt="" src="data:image/png;base64,'+icons[k]+'">':'';
 const tb=document.getElementById('tb'),card=document.getElementById('maze-hover-card');
 // Continuous red-yellow-green probability scale; slightly lighter text for dark-mode legibility.
 const probability=(p)=>{
   const value=Math.min(100,Math.max(0,parseFloat(p)));
   const hue=value*1.28;
   const saturation=76-Math.abs(value-50)*.16;
   const lightness=49-Math.abs(value-50)*.36;
   const fill='hsl('+hue+' '+saturation+'% '+lightness+'%)';
   const ink='hsl('+hue+' '+saturation+'% '+Math.max(56,lightness+13)+'%)';
   return '<div class="maze-probability" style="--prob-color:'+fill+';--prob-text:'+ink+'"><strong>'+(value>99.99&&value<100?'99.99+%':value.toFixed(2)+'%')+'</strong><div class="maze-probability-track" aria-hidden="true"><i style="width:'+value+'%"></i></div></div>';
 };
 tb.innerHTML=rows.map(([k,name,mean,p])=>'<tr data-feature="'+k+'" tabindex="0" title="'+(k==='lingering'||k==='weakness'||k==='poison'||k==='healing'?'Expected number of dispensers with a qualifying potion stack, not individual bottles.':name)+'"><td><span class="mc-stat-label">'+icon(k)+'<span>'+name+'</span></span></td><td class="num">'+mean+'</td><td class="num">'+probability(p)+'</td></tr>').join('');
 const q=[['Q1',25/216*100],['Q2',23/72*100],['Q3',23/72*100],['Q4',53/216*100]];
 const halls=[['Grate',100/3],['Open',100/3],['Vault',100/3]];
 const hallName={1:'Open',2:'Vault',3:'Grate'};
 const ramps=[['Melee',50],['Ranged',25],['Nothing',25]];
 const rampName={1:'Melee',2:'Melee',3:'Ranged',4:'Nothing'};
 const rotationNote='The centre can rotate, so the exits are not fixed relative to the ominous upper arm.';
 const esc=x=>String(x).replace(/[&<>"']/g,v=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[v]));
 const bars=(data,selected)=>'<div class="maze-hover-bars">'+data.map(([label,p])=>'<div class="maze-hover-row'+(selected===label?' selected':'')+'"><span>'+esc(label)+'</span><strong>'+p.toFixed(2)+'%</strong><div class="maze-hover-track"><i style="width:'+p+'%"></i></div></div>').join('')+'</div>';
 let key='';
 function selectFeature(feature){for(const row of tb.querySelectorAll('tr'))row.classList.toggle('is-selected',row.dataset.feature===feature)}
 function show(state){
   const next=state?JSON.stringify(state):'';
   if(next===key)return;key=next;
   selectFeature(state?.kind==='marker'?(state.type==='small_melee'?'small':state.type):null);
   if(!state){card.hidden=true;return}
   let title='',sub='',content='',foot='',img='';
   if(state.kind==='exit'){
      title='Hotel exits';
      content=bars([['Lower exit',75.99273560968071],['Upper exit',24.0072643903193]],state.selected);
      foot='';
   }else if(state.kind==='marker'){
      const k=state.type;
      if(k==='dispenser'){
        title='Dispensers';img=icon('dispenser');
        content='<div class="maze-hover-explanation"><p>Hotel has 16 possible wall dispenser locations across four floors. Each independently has a 50% chance to generate.</p><p>All 16 locations are shown here. In vanilla generation, the average is 8 dispensers per Hotel.</p></div>';
      }else{
        const opts={breeze:['Breeze'],melee:['Zombie','Husk','Spider'],ranged:['Skeleton','Stray','Bogged'],small_melee:['Slime','Cave spider','Silverfish','Baby zombie']}[k]||[];
        const names={breeze:'Breeze spawner',melee:'Melee spawner',ranged:'Ranged spawner',small_melee:'Small melee spawner'};
        title=k==='ranged'?'Slow-ranged spawner':names[k]||'Trial spawner';img=icon(k==='small_melee'?'small':k);
        sub=k==='breeze'?'':'Example: '+(state.label.split(' · ')[2]||'').replace(/ \(matching melee category\)/,'');
        content=bars(opts.map(m=>[m,100/opts.length]),opts.find(m=>sub.toLowerCase().includes(m.toLowerCase())));
        foot=k==='ranged'?'Hotel always has four slow-ranged spawners. The mob type is shared across the Trial Chamber.':'One mob type per category throughout the Trial Chamber.';
      }
   }else{
      const label=state.label;const quad=label.match(/quadrant_(\d)/),hall=label.match(/hallway_(\d)/),ramp=label.match(/ramp_(\d)/);
      if(quad){
        title='Quadrant: Q'+quad[1];content=bars(q,'Q'+quad[1]);
      }else if(hall){
        title='Lower arm: '+hallName[hall[1]];content=bars(halls,hallName[hall[1]]);
      }else if(ramp){
        title='Upper arm: '+rampName[ramp[1]];content=bars(ramps,rampName[ramp[1]]);
      }else if(label==='Ominous upper arm'){
        title='Ominous upper arm';content=bars([['Ominous arm',100]],'Ominous arm');foot=rotationNote;
      }else{
        title='Centre';content=bars([['Centre',100]],'Centre');foot=rotationNote;
      }
   }
   card.innerHTML='<div class="maze-hover-title">'+img+'<h3>'+esc(title)+'</h3></div>'+(sub?'<p class="maze-hover-sub">'+esc(sub)+'</p>':'')+content+(foot?'<p class="maze-hover-note">'+esc(foot)+'</p>':'');
   card.hidden=false;
 }
 window.MazeUI={show,probability,displayName(label){const h=label.match(/hallway_(\d)/),r=label.match(/ramp_(\d)/),q=label.match(/quadrant_(\d)/);return h?'Lower arm: '+hallName[h[1]]:r?'Upper arm: '+rampName[r[1]]:q?'Quadrant: Q'+q[1]:label==='Center'?'Centre':label;}};
})();