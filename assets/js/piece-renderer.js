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
 // Static water mesh follows FluidRenderer's weighted corner heights and
 // same-fluid face suppression. IDs are verified against the Atrium NBT:
 // 18 source, 20 falling, 21 level 1. Still/flow frames come from the JAR.
 const waterTexture=new THREE.Texture(await image('iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgCAYAAACinX6EAAADg0lEQVR42u1Y3W7TMBg9dpymzTY2uu1mEqDxI9gVlzwLL8TbIJ6DK8QFPxJCAyENpo12rFvSNLHNReIsce0kzEytoJGqKrGP4/h8Pp+/Q54+f/kCANJ4BNMlsqnxOWV9dLn8wRAAwPq3igEFAIB4PgAg+vkJUgpInkJKnrcRD1Jy9Dfvwg+HiEeHyJJfIMQrx5WSY233ANOzr054igVf+uTnCUisbdTrOeNZMjlqnGBXpm0Ro8a3vYdQZp1guUgiK1mrsqjGdMGzRUcAIdQQFbxYzDi/52kttNVH8DR2xjOdYZ1BmwbYIiTY2DP2UxqjjxduP8Lkx1sTbfDDHaTRaTl5APD8ECJL8o8RGdZ2HjvhF64BV5HgGfcoT+OctUI0pRQlw4pZFzzrqvZKzXVG2y69nx4xaTxu3b+EeIDgxlB3xS88AkQW19mTYk7k9H2u+hPiOeOZzrxN9btmC1u/pmxCWQCRJXp6KFaI1xgjgv5V/BJEwAz9rXvlHq0yxNO4uqHL/yqjrnjWls8Vc7oW2DRAZQG93aoxXg/U69UmRQiFlLzM33ralOBlOpMidcIv/iTIU4CQ+dCtnBQJC8yZw/Od8czGmG3Ptqm/3h7e3s8nAgkAWN89AACcfXsNAJhNvpcTtSwRPH+ALD4zRE8AIaIWPBrxS3EO0AWs+jFVIij1a22D4X4HfNCIZ35/MxeD3noRQblYROPDxuqu6zlAHyebnht1wJSnCWWVc7yYT2cFfy74pagGk8mRMYTD4QMQysoUJqUABK/1dcWztd0nNdDlyUdjHa/2rmrX97weGbaTo/pX2pBGp+CzS2NFl8ZjhNsPEY8OjeE9i05BWeCGXxY/oEkfbOWuHw6d8ez4/avGCaqTnc5820lRv1dips4DFycfyn0qRNqySsK2eoXJdH388voBUszV87qpEY0+O+MpZf1Ork9bP9WufsHGHoKNvTmc3i/cfmT3E8MdiCwuFPyqni/NDZE541d+QJvj09UZsnmBbdXjyg9YsB9wYwvQphkim1YqzsBkFxvreROTVbwsMkNX/D/nBxBC/swP0PNzV/fXqryWE6DuL6h713p+5Qe4+gHXzQJ6RCjmt+48qz2/OH6XV4Gzi8Yq8rr1/H/gBwQ36we0eX2qahsM79eenx+9MVZ5yulp8wvUe2WWrPyAePylsZ4X2axWz6t8LyGc8b8BCfGuIeaqwNcAAAAASUVORK5CYII='));
 waterTexture.magFilter=waterTexture.minFilter=THREE.NearestFilter;waterTexture.generateMipmaps=false;waterTexture.needsUpdate=true;
 const buffers=Array.from({length:3},()=>({P:[],U:[],C:[],I:[],counts:[0]}));
 const at=(x,y,z)=>inside(x,y,z)?grid[id(x,y,z)]:0;
 const wet=k=>k===18||k===20||k===21;
 const height=(x,y,z)=>{const k=at(x,y,z);return wet(k)?(wet(at(x,y+1,z))?1:k===21?7/9:8/9):solid(k)?-1:0};
 function corner(x,y,z,dx,dz){
  const h=height(x,y,z),a=height(x+dx,y,z),b=height(x,y,z+dz);
  if(h===1||a===1||b===1)return 1;
  const hs=[h,a,b];if(a>0||b>0)hs.push(height(x+dx,y,z+dz));
  if(hs.includes(1))return 1;
  let sum=0,weight=0;for(const v of hs)if(v>=0){const w=v>=.8?10:1;sum+=v*w;weight+=w}
  return sum/weight;
 }
 function fluid(x,y,z,k){
  const nw=corner(x,y,z,-1,-1),ne=corner(x,y,z,1,-1),se=corner(x,y,z,1,1),sw=corner(x,y,z,-1,1);
  const {P,U,C,I}=buffers[2];
  function quad(points,uv,flow,shade){
   const i=P.length/3;
   for(let j=0;j<4;j++){
    const [a,b,c]=points[j];P.push(x+a,y+b,z+c);
    const [u,v]=uv[j];U.push(((flow?32:0)+.25+u*31.5)/64,1-(.25+v*31.5)/32);C.push(shade,shade,shade);
   }I.push(i,i+1,i+2,i,i+2,i+3);
  }
  const open=(a,b,c)=>{const n=at(x+a,y+b,z+c);return !wet(n)&&!solid(n)};
  const flat=[[0,0],[1,0],[1,1],[0,1]];
  if(open(0,1,0)){
   const own=height(x,y,z),diff=(dx,dz)=>{const h=height(x+dx,y,z+dz);if(h<0)return 0;if(h===0){const below=height(x+dx,y-1,z+dz);return below>0?own-(below-8/9):0}return own-h};
   const fx=diff(1,0)-diff(-1,0),fz=diff(0,1)-diff(0,-1),moving=Math.hypot(fx,fz)>1e-6;
   const angle=Math.atan2(fz,fx)-Math.PI/2,cs=Math.cos(angle),sn=Math.sin(angle);
   const uv=moving?flat.map(([u,v])=>[.5+((u-.5)*cs-(v-.5)*sn)*.5,.5+((u-.5)*sn+(v-.5)*cs)*.5]):flat;
   quad([[0,nw-.001,0],[1,ne-.001,0],[1,se-.001,1],[0,sw-.001,1]],uv,moving,1);
  }
  if(open(0,-1,0))quad([[0,.001,1],[1,.001,1],[1,.001,0],[0,.001,0]],flat,false,.6);
  function side(dx,dz,a,b,ha,hb,shade){
   if(!open(dx,0,dz))return;
   quad([[a[0],ha,a[1]],[b[0],hb,b[1]],[b[0],0,b[1]],[a[0],0,a[1]]],[[0,(1-ha)/2],[.5,(1-hb)/2],[.5,.5],[0,.5]],true,shade);
  }
  side(0,-1,[1,.001],[0,.001],ne,nw,.8);
  side(0,1,[0,.999],[1,.999],sw,se,.8);
  side(-1,0,[.001,0],[.001,1],nw,sw,.65);
  side(1,0,[.999,1],[.999,0],se,ne,.65);
 }
 for(let y=0;y<Y;y++){
  for(let z=0;z<Z;z++)for(let x=0;x<X;x++){
   const q=id(x,y,z),k=grid[q];if(!k)continue;if(wet(k)){fluid(x,y,z,k);continue}const [opaque,faces]=models[k-1];
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
  const m=new THREE.MeshBasicMaterial({map:i===2?waterTexture:tex,vertexColors:true,alphaTest:i?.02:.5,transparent:!!i,depthWrite:!i,side:i===2?THREE.DoubleSide:THREE.FrontSide});const mesh=new THREE.Mesh(g,m);if(i===2)mesh.renderOrder=2;S.add(mesh);return g;
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
