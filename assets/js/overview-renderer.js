(async()=>{
const $=id=>document.getElementById(id),cv=$('c'),shell=cv.parentElement,hover=$('maze-hover-card');
try{
const res=await fetch('assets/data/core-geometry.json?v=1');if(!res.ok)throw Error('Core model unavailable');const D=await res.json();
const colors={end:0xb87b62,ec:0xd19a64,foundation:0x68767d,intersection:0x6c93b8,atrium:0x569b82,entrance:0xc9b16e,slice:0x87979d,ic:0x8ab5c7};
const R=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});R.setPixelRatio(Math.min(devicePixelRatio||1,2));
const S=new THREE.Scene(),cam=new THREE.PerspectiveCamera(48,1,.1,2000);
S.add(new THREE.HemisphereLight(0xffffff,0x849aab,1.4));const light=new THREE.DirectionalLight(0xfff4df,.65);light.position.set(-80,130,80);S.add(light);
const T=new THREE.Vector3(),pan=new THREE.Vector3(),ray=new THREE.Raycaster(),mouse=new THREE.Vector2(),tmp=new THREE.Vector3();
let variant=0,theta=.8,phi=1.05,rad=180,group=null,items=[],meshes=[],selected=null,drag=null,W=1,H=1,dirty=true,corners=[],outline=null,initial=true;
const choices={"entrance":[["Vent",33.333333333333336],["Sewer",33.333333333333336],["Twin Staircase",33.333333333333336]],"atrium":[["Atrium",100]],"slice":[["1: No door",7.142857142857143],["2: Lower door",14.285714285714286],["3: Middle door",14.285714285714286],["4: Upper door",14.285714285714286],["5: Lower door",14.285714285714286],["6: Middle door, Spawner",14.285714285714286],["7: Upper door",7.142857142857143],["8: No door, Spawner",14.285714285714286]],"intersection":[["Aquarium",33.333333333333336],["Loft",33.333333333333336],["Column",33.333333333333336]],"ic":[["Overhang",12.33725],["Snoverhang",12.33725],["Pedestal",12.33725],["Infestation",12.33725],["Eruption",12.33725],["Assembly",12.33725],["Hotel",12.33725],["Maze",12.33725],["No chamber",1.302]],"end":[["Wall",50],["Cake Chest",50]],"ec":[["Overhang",25],["Assembly",25],["Eruption",25],["Maze",25]]};
function show(item){
 if(item?.kind==='foundation')item=null;
 if(selected===item)return;
 if(selected)selected.mesh.material.emissive.setHex(0);
 if(outline){S.remove(outline);outline.geometry.dispose();outline.material.dispose();outline=null}
 selected=item;if(!item){hover.hidden=true;dirty=true;return}
 item.mesh.material.emissive.setHex(0x353535);
 outline=new THREE.Box3Helper(new THREE.Box3().setFromObject(item.mesh),0xffb56b);outline.material.depthTest=false;outline.material.transparent=true;outline.material.opacity=.85;outline.renderOrder=999;S.add(outline);
 hover.replaceChildren();
 const h=document.createElement('h3');h.textContent=item.name;h.style.margin='0 0 8px';h.style.font='700 16px/1.3 system-ui,sans-serif';hover.append(h);
 const bars=document.createElement('div');bars.className='maze-hover-bars';
 for(const [name,p] of choices[item.kind]||[]){
  const row=document.createElement('div');row.className='maze-hover-row'+(item.kind==='intersection'&&name===D.variants[variant].name?' selected':'');
  const label=document.createElement('span');label.textContent=name;
  const value=document.createElement('strong');value.textContent=p.toFixed(2)+'%';
  const track=document.createElement('div');track.className='maze-hover-track';const bar=document.createElement('i');bar.style.width=p+'%';track.append(bar);row.append(label,value,track);bars.append(row);
 }
 hover.append(bars);hover.hidden=false;dirty=true;
}
function rebuild(i){
 show(null);if(group){S.remove(group);group.traverse(o=>{o.geometry?.dispose();o.material?.dispose()})}
 variant=i;group=new THREE.Group();items=[];meshes=[];corners=[];
 const min=new THREE.Vector3(Infinity,Infinity,Infinity),max=new THREE.Vector3(-Infinity,-Infinity,-Infinity);
 for(const p of D.variants[i].boxes){
 const b=p.b,lo=new THREE.Vector3(...b.slice(0,3)),hi=new THREE.Vector3(...b.slice(3)),size=hi.clone().sub(lo),center=lo.clone().add(hi).multiplyScalar(.5);
 min.min(lo);max.max(hi);for(const x of [b[0],b[3]])for(const y of [b[1],b[4]])for(const z of [b[2],b[5]])corners.push(new THREE.Vector3(x,y,z));
 const g=new THREE.BoxGeometry(size.x,size.y,size.z),m=new THREE.MeshLambertMaterial({color:colors[p.kind],emissive:0x000000});const mesh=new THREE.Mesh(g,m);mesh.position.copy(center);group.add(mesh);
 const edges=new THREE.LineSegments(new THREE.EdgesGeometry(g),new THREE.LineBasicMaterial({color:0x26363c,transparent:true,opacity:.9}));edges.position.copy(center);group.add(edges);
 const item={...p,mesh};
 mesh.userData.item=item;items.push(item);meshes.push(mesh);
 }
 S.add(group);T.copy(min.add(max).multiplyScalar(.5));S.updateMatrixWorld(true);document.querySelectorAll('[data-core-variant]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.coreVariant===i)));dirty=true;
}
function resize(){
 W=Math.max(1,cv.clientWidth);H=Math.max(1,cv.clientHeight);R.setSize(W,H,false);cam.aspect=W/H;cam.updateProjectionMatrix();
 if(initial){fit();initial=false}dirty=true;
}
function camera(){
 const target=T.clone().add(pan);cam.position.copy(target).add(new THREE.Vector3(rad*Math.sin(phi)*Math.cos(theta),rad*Math.cos(phi),rad*Math.sin(phi)*Math.sin(theta)));cam.lookAt(target);cam.updateMatrixWorld(true);
}
function fit(){
 // Fit only on initial load or reset, never while orbiting.
 rad=350;camera();const centre=T.clone().applyMatrix4(cam.matrixWorldInverse);
 const ty=Math.tan(cam.fov*Math.PI/360),tx=ty*cam.aspect;
 let needed=0;
 for(const v of corners){tmp.copy(v).applyMatrix4(cam.matrixWorldInverse).sub(centre);needed=Math.max(needed,tmp.z+1.18*Math.max(Math.abs(tmp.x)/tx,Math.abs(tmp.y)/ty))}
 rad=Math.max(70,needed);
}
function frame(){if(dirty){camera();R.render(S,cam);dirty=false}requestAnimationFrame(frame)}
document.querySelectorAll('[data-core-variant]').forEach(b=>b.onclick=()=>rebuild(+b.dataset.coreVariant));
$('reset-view').onclick=()=>{theta=.8;phi=1.05;pan.set(0,0,0);fit();show(null);dirty=true};
cv.oncontextmenu=e=>e.preventDefault();
cv.onpointerdown=e=>{if(e.button!==0&&e.button!==2)return;show(null);drag={x:e.clientX,y:e.clientY,pan:e.shiftKey||e.button===2};cv.setPointerCapture(e.pointerId)};
cv.onpointermove=e=>{if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;if(drag.pan){const u=2*rad*Math.tan(cam.fov*Math.PI/360)/H;pan.addScaledVector(new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,0),-dx*u);pan.addScaledVector(new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,1),dy*u)}else{theta+=dx*.002;phi=Math.max(.1,Math.min(3,phi-dy*.002))}dirty=true;return}const r=cv.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(mouse,cam);show(ray.intersectObjects(meshes,false)[0]?.object.userData.item||null);dirty=true};
cv.onpointerup=()=>{drag=null};cv.onpointercancel=cv.onpointerleave=()=>{drag=null;show(null);dirty=true};
cv.addEventListener('wheel',e=>{e.preventDefault();rad=Math.max(20,Math.min(600,rad*(1+e.deltaY*.0007)));dirty=true},{passive:false});
new ResizeObserver(resize).observe(shell);rebuild(0);resize();frame();
}catch(e){console.error(e);const b=$('viewer-fallback');b.style.display='block';b.textContent='Unable to initialise the 3D viewer: '+e.message}
})();