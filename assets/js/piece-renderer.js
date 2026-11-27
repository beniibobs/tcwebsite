/* Non-chamber piece viewer: first example, Atrium. Geometry is assembled from actual 26.3 NBT template pieces and blockstate models. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),cv=$('piece-render'),shell=$('piece-render-shell'),placeholder=$('piece-preview'),status=$('piece-render-status');
const unzip=async s=>new Uint8Array(await new Response(new Blob([Uint8Array.from(atob(s),c=>c.charCodeAt(0))]).stream().pipeThrough(new DecompressionStream('deflate'))).arrayBuffer());
const image=s=>new Promise((ok,bad)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=bad;im.src='data:image/png;base64,'+s});
let current=null,ready=null,view=null;
function select(file){
 current=file;const visible=file==='corridor/atrium_1';shell.hidden=!visible;placeholder.hidden=visible;
 if(!visible){if(view)view.stopDrag();return}
 if(view){view.resize();return}
 status.hidden=false;status.textContent='Loading Atrium…';
 if(!ready)ready=init().then(v=>{view=v;status.hidden=true;if(current==='corridor/atrium_1')view.resize();return v}).catch(e=>{console.error(e);ready=null;status.hidden=false;status.textContent='Unable to load Atrium: '+e.message;});
}
window.PieceViewer={select};
async function init(){
 if(typeof THREE==='undefined')throw Error('Three.js unavailable');
 const res=await fetch('assets/data/pieces/atrium.json?v=1');if(!res.ok)throw Error('Model data unavailable');
 const D=await res.json(),[X,Y,Z]=D.size,N=X*Y*Z;
 const [grid,raw,atlas]=await Promise.all([unzip(D.grid),unzip(D.models),image(D.atlas)]);
 const models=JSON.parse(new TextDecoder().decode(raw));if(grid.length!==N||grid.some(v=>v>models.length)||atlas.width!==18*D.cols||atlas.height!==18*D.rows)throw Error('Invalid model data');
 const tex=new THREE.Texture(atlas);tex.magFilter=tex.minFilter=THREE.NearestFilter;tex.generateMipmaps=false;tex.needsUpdate=true;
 const id=(x,y,z)=>(y*Z+z)*X+x,inside=(x,y,z)=>x>=0&&y>=0&&z>=0&&x<X&&y<Y&&z<Z,solid=k=>k>0&&models[k-1][0]===1;
 const normals=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],shade=[.85,.85,1,.60,.75,.75];
 // Render inward-facing shell surfaces rather than opaque exterior walls; like chamber viewers.
 const air=new Uint8Array(N),stack=[[14,5,5],[14,13,17]];
 while(stack.length){const [x,y,z]=stack.pop();if(!inside(x,y,z))continue;const q=id(x,y,z);if(air[q]||solid(grid[q]))continue;air[q]=1;for(const d of normals)stack.push([x+d[0],y+d[1],z+d[2]])}
 const buffers=[{P:[],U:[],C:[],I:[],counts:[0]},{P:[],U:[],C:[],I:[],counts:[0]}];
 for(let y=0;y<Y;y++){
  for(let z=0;z<Z;z++)for(let x=0;x<X;x++){
   const q=id(x,y,z),k=grid[q];if(!k)continue;const [opaque,faces]=models[k-1];
   if(!air[q]&&!normals.some(d=>inside(x+d[0],y+d[1],z+d[2])&&air[id(x+d[0],y+d[1],z+d[2])]))continue;
   for(const f of faces){
    const [tile,di,cull]=f,d=normals[di],nx=x+d[0],ny=y+d[1],nz=z+d[2];
    if(cull>=0&&inside(nx,ny,nz)&&solid(grid[id(nx,ny,nz)]))continue;
    if(opaque&&!air[q]&&(!inside(nx,ny,nz)||!air[id(nx,ny,nz)]))continue;
    const {P,U,C,I}=buffers[[17,19,20].includes(tile)?1:0],a=P.length/3,col=tile%D.cols,row=Math.floor(tile/D.cols),v=shade[di]*(y<3?.82:1);
    for(let j=0;j<4;j++){
     P.push(x+f[3+3*j]/16,y+f[4+3*j]/16,z+f[5+3*j]/16);
     U.push((col*18+1+.32+f[15+2*j]*.96)/(18*D.cols),1-(row*18+1+.32+f[16+2*j]*.96)/(18*D.rows));
     C.push(v,v,v);
    }
    const b=3*a,e=[P[b+3]-P[b],P[b+4]-P[b+1],P[b+5]-P[b+2]],w=[P[b+6]-P[b],P[b+7]-P[b+1],P[b+8]-P[b+2]];
    if((e[1]*w[2]-e[2]*w[1])*d[0]+(e[2]*w[0]-e[0]*w[2])*d[1]+(e[0]*w[1]-e[1]*w[0])*d[2]>=0)I.push(a,a+1,a+2,a,a+2,a+3);else I.push(a,a+2,a+1,a,a+3,a+2);
   }
  }
  buffers.forEach(b=>b.counts.push(b.I.length));
 }
 if(!buffers[0].I.length)throw Error('Empty Atrium geometry');
 const R=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});R.setPixelRatio(Math.min(devicePixelRatio||1,2));
 const S=new THREE.Scene(),cam=new THREE.PerspectiveCamera(48,1,.1,500),T=new THREE.Vector3(X/2,Y/2-1,Z/2);
 const geometry=buffers.map(({P,U,C,I},i)=>{
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);g.computeBoundingSphere();
  const m=new THREE.MeshBasicMaterial({map:tex,vertexColors:true,alphaTest:i?.02:.5,transparent:!!i,depthWrite:!i});S.add(new THREE.Mesh(g,m));return g;
 });
 let th=.8,ph=1.05,rad=52,drag=null,cut=Y,scheduled=false;
 function draw(){scheduled=false;if(current!=='corridor/atrium_1')return;cam.position.set(T.x+rad*Math.sin(ph)*Math.cos(th),T.y+rad*Math.cos(ph),T.z+rad*Math.sin(ph)*Math.sin(th));cam.lookAt(T);R.render(S,cam)}
 function render(){if(!scheduled&&current==='corridor/atrium_1'){scheduled=true;requestAnimationFrame(draw)}}
 const resize=()=>{if(cv.clientWidth&&cv.clientHeight){R.setSize(cv.clientWidth,cv.clientHeight,false);cam.aspect=cv.clientWidth/cv.clientHeight;cam.updateProjectionMatrix();render()}};
 const setCut=h=>{cut=h;geometry.forEach((g,i)=>g.setDrawRange(0,buffers[i].counts[h]));shell.querySelectorAll('[data-piece-cut]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.pieceCut===h)));render()};
 shell.querySelectorAll('[data-piece-cut]').forEach(b=>b.onclick=()=>setCut(+b.dataset.pieceCut));
 $('piece-reset-view').onclick=()=>{th=.8;ph=1.05;rad=52;T.set(X/2,Y/2-1,Z/2);render()};
 cv.oncontextmenu=e=>e.preventDefault();cv.onpointerdown=e=>{if(e.button!==0&&e.button!==2)return;drag={x:e.clientX,y:e.clientY,pan:e.shiftKey||e.button===2};cv.setPointerCapture(e.pointerId)};
 cv.onpointermove=e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;if(drag.pan){const u=2*rad*Math.tan(cam.fov*Math.PI/360)/Math.max(1,cv.clientHeight);T.addScaledVector(new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,0),-dx*u);T.addScaledVector(new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,1),dy*u)}else{th+=dx*.002;ph=Math.min(3,Math.max(.1,ph-dy*.002))}render()};
 const stopDrag=()=>{drag=null};cv.onpointerup=cv.onpointercancel=cv.onlostpointercapture=stopDrag;
 cv.addEventListener('wheel',e=>{e.preventDefault();rad=Math.max(8,Math.min(130,rad*(1+e.deltaY*.0007)));render()},{passive:false});
 new ResizeObserver(resize).observe(shell);setCut(Y);resize();return {resize,stopDrag};
}
})();
