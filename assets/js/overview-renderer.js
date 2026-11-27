(async()=>{
const $=id=>document.getElementById(id),cv=$('c'),shell=cv.parentElement,labels=$('core-labels'),hover=$('maze-hover-card'),svg=$('core-leaders');
try{
const res=await fetch('assets/data/core-geometry.json?v=1');if(!res.ok)throw Error('Core model unavailable');const D=await res.json();
const colors={end:0xb87b62,ec:0xd19a64,foundation:0x68767d,intersection:0x6c93b8,atrium:0x569b82,entrance:0xc9b16e,slice:0x87979d,ic:0x8ab5c7};
const R=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});R.setPixelRatio(Math.min(devicePixelRatio||1,2));
const S=new THREE.Scene(),cam=new THREE.OrthographicCamera(-1,1,1,-1,.1,2000);
S.add(new THREE.HemisphereLight(0xffffff,0x849aab,1.4));const light=new THREE.DirectionalLight(0xfff4df,.65);light.position.set(-80,130,80);S.add(light);
const T=new THREE.Vector3(),pan=new THREE.Vector3(),ray=new THREE.Raycaster(),mouse=new THREE.Vector2(),tmp=new THREE.Vector3(),projected=new THREE.Vector3();
let variant=0,theta=.9,phi=.63,zoom=1,group=null,items=[],meshes=[],selected=null,drag=null,W=1,H=1,dirty=true,corners=[];
const details={ec:'A combat chamber attached directly to the End Room.',end:'Connects the End Chamber to the first four corridor slices.',intersection:'Connects the two four-slice corridor runs. The intersection branch can lead to an additional combat chamber.',ic:'An example combat chamber attached to the intersection. This chamber is not guaranteed.',atrium:'Connects the corridor spine to the entrance.',entrance:'The entrance room at the end of the main corridor spine.',slice:'One of four corridor slices in this run.',foundation:'One-block foundation plate supporting four corridor slices.'};
function show(item){
 if(selected===item)return;
 if(selected){selected.mesh.material.emissive.setHex(0);selected.label?.classList.remove('is-active')}
 selected=item;if(!item){hover.hidden=true;return}
 item.mesh.material.emissive.setHex(0x353535);item.label?.classList.add('is-active');
 const b=item.b;hover.replaceChildren();
 const h=document.createElement('h3');h.textContent=item.kind==='intersection'?D.variants[variant].name:item.name;h.style.margin='0 0 5px';h.style.font='700 16px/1.3 system-ui,sans-serif';hover.append(h);
 const size=document.createElement('p');size.className='maze-hover-sub';size.textContent=(b[3]-b[0])+' × '+(b[4]-b[1])+' × '+(b[5]-b[2])+' blocks';hover.append(size);
 const note=document.createElement('p');note.className='maze-hover-note';note.textContent=details[item.kind];hover.append(note);hover.hidden=false;dirty=true;
}
function rebuild(i){
 show(null);if(group){S.remove(group);group.traverse(o=>{o.geometry?.dispose();o.material?.dispose()})}
 variant=i;group=new THREE.Group();items=[];meshes=[];labels.replaceChildren();svg.replaceChildren();corners=[];
 const min=new THREE.Vector3(Infinity,Infinity,Infinity),max=new THREE.Vector3(-Infinity,-Infinity,-Infinity);
 for(const p of D.variants[i].boxes){
 const b=p.b,lo=new THREE.Vector3(...b.slice(0,3)),hi=new THREE.Vector3(...b.slice(3)),size=hi.clone().sub(lo),center=lo.clone().add(hi).multiplyScalar(.5);
 min.min(lo);max.max(hi);for(const x of [b[0],b[3]])for(const y of [b[1],b[4]])for(const z of [b[2],b[5]])corners.push(new THREE.Vector3(x,y,z));
 const g=new THREE.BoxGeometry(size.x,size.y,size.z),m=new THREE.MeshLambertMaterial({color:colors[p.kind],emissive:0x000000});const mesh=new THREE.Mesh(g,m);mesh.position.copy(center);group.add(mesh);
 const edges=new THREE.LineSegments(new THREE.EdgesGeometry(g),new THREE.LineBasicMaterial({color:0x26363c,transparent:true,opacity:.9}));edges.position.copy(center);group.add(edges);
 const item={...p,mesh,anchor:new THREE.Vector3(center.x,b[4]+.4,center.z)};
 if(p.kind!=='foundation'){
 const label=document.createElement('span');label.className='core-label'+(p.kind==='slice'?' is-slice':'');
 label.textContent=p.kind==='slice'?'Slice '+p.slice:p.kind==='intersection'?D.variants[i].name:p.kind==='ec'?'End Chamber (EC)':p.kind==='ic'?'Intersection Chamber (IC)':p.name;
 labels.append(label);item.label=label;const line=document.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('stroke','#b6c7c6');line.setAttribute('stroke-width','1');line.setAttribute('opacity','.7');svg.append(line);item.line=line;
 }
 mesh.userData.item=item;items.push(item);meshes.push(mesh);
 }
 S.add(group);T.copy(min.add(max).multiplyScalar(.5));S.updateMatrixWorld(true);document.querySelectorAll('[data-core-variant]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.coreVariant===i)));dirty=true;
}
function resize(){W=Math.max(1,cv.clientWidth);H=Math.max(1,cv.clientHeight);R.setSize(W,H,false);svg.setAttribute('viewBox','0 0 '+W+' '+H);dirty=true}
function camera(){
 const target=T.clone().add(pan);cam.position.copy(target).add(new THREE.Vector3(Math.sin(phi)*Math.cos(theta),Math.cos(phi),Math.sin(phi)*Math.sin(theta)).multiplyScalar(350));cam.lookAt(target);cam.updateMatrixWorld(true);
 let ex=0,ey=0;for(const v of corners){tmp.copy(v).applyMatrix4(cam.matrixWorldInverse);ex=Math.max(ex,Math.abs(tmp.x));ey=Math.max(ey,Math.abs(tmp.y))}
 // Fit to the unpanned bounds; panning changes the centre, not the scale.
 const local=T.clone().applyMatrix4(cam.matrixWorldInverse);
 ex=0;ey=0;for(const v of corners){tmp.copy(v).applyMatrix4(cam.matrixWorldInverse);ex=Math.max(ex,Math.abs(tmp.x-local.x));ey=Math.max(ey,Math.abs(tmp.y-local.y))}
 const a=W/H,half=Math.max(ey,ex/a)*1.27/zoom;cam.left=-half*a;cam.right=half*a;cam.top=half;cam.bottom=-half;cam.updateProjectionMatrix();
}
function placeLabels(){
 const occupied=[];const ordered=items.filter(i=>i.label).sort((a,b)=>(a.kind==='slice')-(b.kind==='slice'));
 for(const item of ordered){
 projected.copy(item.anchor).project(cam);const x=(projected.x+1)*W/2,y=(1-projected.y)*H/2;
 const w=item.label.offsetWidth,h=item.label.offsetHeight;
 if(x<0||x>W||y<0||y>H||projected.z>1||projected.z< -1){item.label.style.visibility='hidden';item.line.style.display='none';continue}
 let best=null;const offsets=[[0,0],[0,-16],[0,16],[-24,-15],[24,-15],[-24,15],[24,15],[0,-32],[0,32],[-42,0],[42,0],[-42,-32],[42,-32],[-42,32],[42,32],[0,-50],[0,50],[-70,0],[70,0]];
 for(const [dx,dy] of offsets){const cx=Math.min(W-w/2-4,Math.max(w/2+4,x+dx)),cy=Math.min(H-h/2-4,Math.max(h/2+4,y+dy)),r=[cx-w/2-3,cy-h/2-3,cx+w/2+3,cy+h/2+3];if(!occupied.some(o=>r[0]<o[2]&&o[0]<r[2]&&r[1]<o[3]&&o[1]<r[3])){best={cx,cy,r};break}}
 if(!best){item.label.style.visibility='hidden';item.line.style.display='none';continue}
 occupied.push(best.r);item.label.style.visibility='visible';item.label.style.left=best.cx+'px';item.label.style.top=best.cy+'px';const moved=Math.hypot(x-best.cx,y-best.cy)>7;item.line.style.display=moved?'':'none';if(moved){item.line.setAttribute('x1',x);item.line.setAttribute('y1',y);item.line.setAttribute('x2',best.cx);item.line.setAttribute('y2',best.cy)}
 }
}
function frame(){if(dirty){camera();R.render(S,cam);placeLabels();dirty=false}requestAnimationFrame(frame)}
document.querySelectorAll('[data-core-variant]').forEach(b=>b.onclick=()=>rebuild(+b.dataset.coreVariant));
$('reset-view').onclick=()=>{theta=.9;phi=.63;zoom=1;pan.set(0,0,0);show(null);dirty=true};
cv.oncontextmenu=e=>e.preventDefault();
cv.onpointerdown=e=>{if(e.button!==0&&e.button!==2)return;show(null);drag={x:e.clientX,y:e.clientY,pan:e.shiftKey||e.button===2};cv.setPointerCapture(e.pointerId)};
cv.onpointermove=e=>{if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;if(drag.pan){const u=(cam.top-cam.bottom)/H;pan.addScaledVector(new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,0),-dx*u);pan.addScaledVector(new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,1),dy*u)}else{theta-=dx*.007;phi=Math.max(.08,Math.min(3.04,phi-dy*.006))}dirty=true;return}const r=cv.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(mouse,cam);show(ray.intersectObjects(meshes,false)[0]?.object.userData.item||null);dirty=true};
cv.onpointerup=()=>{drag=null};cv.onpointercancel=cv.onpointerleave=()=>{drag=null;show(null);dirty=true};
cv.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.45,Math.min(4,zoom*Math.exp(-e.deltaY*.001)));dirty=true},{passive:false});
new ResizeObserver(resize).observe(shell);rebuild(0);resize();frame();
}catch(e){console.error(e);const b=$('viewer-fallback');b.style.display='block';b.textContent='Unable to initialise the 3D viewer: '+e.message}
})();