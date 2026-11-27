/* Reusable lazy-loaded non-chamber viewer. One WebGL context, per-piece geometry, shared model libraries and fluid geometry. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),cv=$('piece-render'),shell=$('piece-render-shell'),placeholder=$('piece-preview'),status=$('piece-render-status');
const unzip=async s=>new Uint8Array(await new Response(new Blob([Uint8Array.from(atob(s),c=>c.charCodeAt(0))]).stream().pipeThrough(new DecompressionStream('deflate'))).arrayBuffer());
const image=s=>new Promise((ok,bad)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=bad;im.src='data:image/png;base64,'+s});
const base='assets/data/pieces/',tag=$('piece-template-tag'),floorControls=$('piece-floor-controls');
const manifestPromise=fetch(base+'manifest.json?v=7').then(r=>{if(!r.ok)throw Error('Piece manifest unavailable');return r.json()});
const libraries=new Map(),views=new Map();let current=null,revision=0,view=null,R=null;
const json=async path=>{const r=await fetch(base+path+'?v=3');if(!r.ok)throw Error('Model data unavailable: '+path);return r.json()};
const loadImage=url=>new Promise((ok,bad)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=()=>bad(Error('Texture atlas unavailable'));im.src=url});
async function packedAtlas(d){
 const p=await json(d.atlasPackedFile),[source,delta]=await Promise.all([loadImage(base+p.source+'?v=2'),unzip(p.delta)]);
 const canvas=document.createElement('canvas');canvas.width=18*d.cols;canvas.height=18*d.rows;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
 const sourceCols=source.width/18,sourceRows=source.height/18;
 if(!Number.isInteger(sourceCols)||!Number.isInteger(sourceRows)||p.map.length>d.cols*d.rows||delta.length%1024!==0)throw Error('Invalid packed texture atlas');
 for(let i=0;i<p.map.length;i++){
  const n=p.map[i],x=(i%d.cols)*18,y=Math.floor(i/d.cols)*18;
  if(n>=0){if(n>=sourceCols*sourceRows)throw Error('Invalid shared tile');ctx.drawImage(source,(n%sourceCols)*18,Math.floor(n/sourceCols)*18,18,18,x,y,18,18);}
  else{
   const k=-n-1;if((k+1)*1024>delta.length)throw Error('Invalid delta tile');
   const tile=ctx.createImageData(18,18);
   for(let yy=0;yy<18;yy++)for(let xx=0;xx<18;xx++){
    const a=(k*256+Math.max(0,Math.min(15,yy-1))*16+Math.max(0,Math.min(15,xx-1)))*4;
    tile.data.set(delta.subarray(a,a+4),(yy*18+xx)*4);
   }
   ctx.putImageData(tile,x,y);
  }
 }
 return canvas;
}
async function combinedLibrary(d){
 const [a,b,mp,tp]=await Promise.all([library(d.sources[0]),library(d.sources[1]),json(d.modelPackFile),json(d.texturePackFile)]);
 const [raw,bytes]=await Promise.all([unzip(mp.modelPack),unzip(tp.texturePack)]);
 const models=[],refs=JSON.parse(new TextDecoder().decode(raw));
 for(const ref of refs){
  if(ref[0]===3){models.push(ref[1]);continue}
  const src=[a.models,b.models,models][ref[0]][ref[1]];
  if(!src||src[1].length!==ref[2].length)throw Error('Invalid model reference');
  models.push([src[0],src[1].map((f,i)=>[ref[2][i],...f.slice(1)])]);
 }
 const old=[];
 for(const [src,n] of [[a,74],[b,84]]){
  const im=src.tex.image,canvas=document.createElement('canvas');canvas.width=im.width;canvas.height=im.height;const ctx=canvas.getContext('2d');ctx.drawImage(im,0,0);
  for(let i=0;i<n;i++)old.push(ctx.getImageData(i%src.cols*18+1,Math.floor(i/src.cols)*18+1,16,16).data);
 }
 const indices=old.map(t=>{const map=new Map(),out=new Uint8Array(256);for(let i=0;i<256;i++){const key=Array.from(t.subarray(i*4,i*4+4)).join(',');if(!map.has(key))map.set(key,map.size);out[i]=map.get(key)}return out});
 const dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let off=0;const read=()=>{const x=dv.getUint16(off,true);off+=2;return x};
 const n=read(),np=read(),nc=read(),mapping=Array.from({length:n},read);for(let i=0;i<np;i++){indices.push(bytes.subarray(off,off+256));off+=256}
 for(let i=0;i<nc;i++){const k=read(),l=read(),pal=bytes.subarray(off,off+4*l);off+=4*l;const t=new Uint8ClampedArray(1024),idx=indices[k];if(!idx)throw Error('Invalid palette reference');for(let j=0;j<256;j++){if(idx[j]>=l)throw Error('Invalid palette index');t.set(pal.subarray(idx[j]*4,idx[j]*4+4),j*4)}old.push(t)}
 if(off!==bytes.length||n!==213||models.length!==156)throw Error('Invalid shared data');
 const canvas=document.createElement('canvas');canvas.width=d.cols*18;canvas.height=d.rows*18;const ctx=canvas.getContext('2d');
 for(let i=0;i<n;i++){const src=old[mapping[i]],tile=ctx.createImageData(18,18);if(!src)throw Error('Invalid tile index');for(let y=0;y<18;y++)for(let x=0;x<18;x++){const a=(Math.max(0,Math.min(15,y-1))*16+Math.max(0,Math.min(15,x-1)))*4;tile.data.set(src.subarray(a,a+4),(y*18+x)*4)}ctx.putImageData(tile,i%d.cols*18,Math.floor(i/d.cols)*18)}
 const tex=new THREE.Texture(canvas);tex.magFilter=tex.minFilter=THREE.NearestFilter;tex.generateMipmaps=false;tex.needsUpdate=true;return {...d,models,tex};
}
function library(key,data){
 if(!libraries.has(key)){
  const pending=(async()=>{const d=data||await json(key);if(d.modelPackFile)return combinedLibrary(d);
   const [raw,atlas]=await Promise.all([unzip(d.models),d.atlasPackedFile?packedAtlas(d):d.atlasFile?loadImage(base+d.atlasFile+'?v=2'):image(d.atlas)]);
   const models=JSON.parse(new TextDecoder().decode(raw));
   if(atlas.width!==18*d.cols||atlas.height!==18*d.rows)throw Error('Invalid texture dimensions');
   const tex=new THREE.Texture(atlas);tex.magFilter=tex.minFilter=THREE.NearestFilter;tex.generateMipmaps=false;tex.needsUpdate=true;
   return {...d,models,tex};
  })();
  libraries.set(key,pending);pending.catch(()=>{if(libraries.get(key)===pending)libraries.delete(key)});
 }
 return libraries.get(key);
}
async function select(file){
 const serial=++revision;current=file;if(view)view.stopDrag();view=null;
 tag.textContent=file.split('/').pop();tag.title='minecraft:trial_chambers/'+file;
 shell.hidden=true;placeholder.hidden=false;
 try{
  const manifest=await manifestPromise;if(serial!==revision)return;
  const cfg=manifest[file];if(!cfg)return;
  shell.hidden=false;placeholder.hidden=true;status.hidden=false;status.textContent='Loading '+cfg.name+'…';
  floorControls.replaceChildren();
  cv.setAttribute('aria-label','3D '+cfg.name+' example. Drag to orbit, right-drag to pan, scroll to zoom.');
  if(!views.has(file)){const pending=init(file,cfg);views.set(file,pending);pending.catch(()=>{if(views.get(file)===pending)views.delete(file)})}
  const next=await views.get(file);if(serial!==revision)return;
  view=next;status.hidden=true;view.activate();
 }catch(e){if(serial!==revision)return;console.error(e);shell.hidden=false;placeholder.hidden=true;status.hidden=false;status.textContent='Unable to load piece: '+e.message;}
}
window.PieceViewer={select};
new ResizeObserver(()=>view?.resize()).observe(shell);
async function init(file,cfg){
 if(typeof THREE==='undefined')throw Error('Three.js unavailable');
 const layout=await json(cfg.asset),D=await library(cfg.library||cfg.asset,cfg.library?null:layout),[X,Y,Z]=layout.size,N=X*Y*Z;
 const grid=await unzip(layout.grid),{models,tex}=D;
 if(grid.length!==N||grid.some(v=>v>models.length))throw Error('Invalid model grid');
 const id=(x,y,z)=>(y*Z+z)*X+x,inside=(x,y,z)=>x>=0&&y>=0&&z>=0&&x<X&&y<Y&&z<Z,solid=k=>k>0&&models[k-1][0]===1;
 const normals=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],shade=[.85,.85,1,.60,.75,.75];
 // Render inward-facing shell surfaces rather than opaque exterior walls; like chamber viewers.
 const air=new Uint8Array(N),stack=cfg.seeds.map(p=>p.slice());
 while(stack.length){const [x,y,z]=stack.pop();if(!inside(x,y,z))continue;const q=id(x,y,z);if(air[q]||solid(grid[q]))continue;air[q]=1;for(const d of normals)stack.push([x+d[0],y+d[1],z+d[2]])}
 // Static water mesh follows FluidRenderer's weighted corner heights and
 // same-fluid face suppression. Each library/manifest declares water block states.
 const waterTexture=new THREE.Texture(await image('iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgCAYAAACinX6EAAADg0lEQVR42u1Y3W7TMBg9dpymzTY2uu1mEqDxI9gVlzwLL8TbIJ6DK8QFPxJCAyENpo12rFvSNLHNReIsce0kzEytoJGqKrGP4/h8Pp+/Q54+f/kCANJ4BNMlsqnxOWV9dLn8wRAAwPq3igEFAIB4PgAg+vkJUgpInkJKnrcRD1Jy9Dfvwg+HiEeHyJJfIMQrx5WSY233ANOzr054igVf+uTnCUisbdTrOeNZMjlqnGBXpm0Ro8a3vYdQZp1guUgiK1mrsqjGdMGzRUcAIdQQFbxYzDi/52kttNVH8DR2xjOdYZ1BmwbYIiTY2DP2UxqjjxduP8Lkx1sTbfDDHaTRaTl5APD8ECJL8o8RGdZ2HjvhF64BV5HgGfcoT+OctUI0pRQlw4pZFzzrqvZKzXVG2y69nx4xaTxu3b+EeIDgxlB3xS88AkQW19mTYk7k9H2u+hPiOeOZzrxN9btmC1u/pmxCWQCRJXp6KFaI1xgjgv5V/BJEwAz9rXvlHq0yxNO4uqHL/yqjrnjWls8Vc7oW2DRAZQG93aoxXg/U69UmRQiFlLzM33ralOBlOpMidcIv/iTIU4CQ+dCtnBQJC8yZw/Od8czGmG3Ptqm/3h7e3s8nAgkAWN89AACcfXsNAJhNvpcTtSwRPH+ALD4zRE8AIaIWPBrxS3EO0AWs+jFVIij1a22D4X4HfNCIZ35/MxeD3noRQblYROPDxuqu6zlAHyebnht1wJSnCWWVc7yYT2cFfy74pagGk8mRMYTD4QMQysoUJqUABK/1dcWztd0nNdDlyUdjHa/2rmrX97weGbaTo/pX2pBGp+CzS2NFl8ZjhNsPEY8OjeE9i05BWeCGXxY/oEkfbOWuHw6d8ez4/avGCaqTnc5820lRv1dips4DFycfyn0qRNqySsK2eoXJdH388voBUszV87qpEY0+O+MpZf1Ork9bP9WufsHGHoKNvTmc3i/cfmT3E8MdiCwuFPyqni/NDZE541d+QJvj09UZsnmBbdXjyg9YsB9wYwvQphkim1YqzsBkFxvreROTVbwsMkNX/D/nBxBC/swP0PNzV/fXqryWE6DuL6h713p+5Qe4+gHXzQJ6RCjmt+48qz2/OH6XV4Gzi8Yq8rr1/H/gBwQ36we0eX2qahsM79eenx+9MVZ5yulp8wvUe2WWrPyAePylsZ4X2axWz6t8LyGc8b8BCfGuIeaqwNcAAAAASUVORK5CYII='));
 waterTexture.magFilter=waterTexture.minFilter=THREE.NearestFilter;waterTexture.generateMipmaps=false;waterTexture.needsUpdate=true;
 const buffers=Array.from({length:3},()=>({P:[],U:[],C:[],I:[],counts:[0]}));
 const at=(x,y,z)=>inside(x,y,z)?grid[id(x,y,z)]:0;
 const levels=cfg.waterLevels||D.waterLevels||{},wet=k=>Object.prototype.hasOwnProperty.call(levels,k);
 const height=(x,y,z)=>{const k=at(x,y,z);return wet(k)?(wet(at(x,y+1,z))?1:(8-(levels[k]>=8?0:levels[k]))/9):solid(k)?-1:0};
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
   if(!cfg.exterior&&!air[q]&&!normals.some(d=>inside(x+d[0],y+d[1],z+d[2])&&air[id(x+d[0],y+d[1],z+d[2])]))continue;
   for(const f of faces){
    const [tile,di,cull]=f,d=normals[di],nx=x+d[0],ny=y+d[1],nz=z+d[2];
    if(cull>=0&&inside(nx,ny,nz)&&(solid(grid[id(nx,ny,nz)])||((D.transparentTiles||[]).includes(tile)&&grid[id(nx,ny,nz)]===k&&k>0&&models[k-1][1].length===6)))continue;
    if(!cfg.exterior&&opaque&&!air[q]&&(!inside(nx,ny,nz)||!air[id(nx,ny,nz)]))continue;
    const {P,U,C,I}=buffers[(cfg.transparentTiles||D.transparentTiles||[]).includes(tile)?1:0],a=P.length/3,col=tile%D.cols,row=Math.floor(tile/D.cols),v=shade[di]*(y<3?.82:1);
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
 if(!buffers[0].I.length)throw Error('Empty piece geometry');
 if(!R){R=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});R.setPixelRatio(Math.min(devicePixelRatio||1,2));}
 const S=new THREE.Scene(),cam=new THREE.PerspectiveCamera(48,1,.1,500),T=new THREE.Vector3(X/2,cfg.targetY??Y/2-1,Z/2);
 const geometry=buffers.map(({P,U,C,I},i)=>{
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);g.computeBoundingSphere();
  const m=new THREE.MeshBasicMaterial({map:i===2?waterTexture:tex,vertexColors:true,alphaTest:i?.02:.5,transparent:!!i,depthWrite:!i,side:i===2?THREE.DoubleSide:THREE.FrontSide});const mesh=new THREE.Mesh(g,m);if(i===2)mesh.renderOrder=2;S.add(mesh);return g;
 });
 let th=cfg.theta??.8,ph=cfg.phi??1.05,rad=cfg.radius,drag=null,cut=Y,scheduled=false;
 function draw(){scheduled=false;if(current!==file)return;cam.position.set(T.x+rad*Math.sin(ph)*Math.cos(th),T.y+rad*Math.cos(ph),T.z+rad*Math.sin(ph)*Math.sin(th));cam.lookAt(T);R.render(S,cam)}
 function render(){if(!scheduled&&current===file){scheduled=true;requestAnimationFrame(draw)}}
 const resize=()=>{if(cv.clientWidth&&cv.clientHeight){R.setSize(cv.clientWidth,cv.clientHeight,false);cam.aspect=cv.clientWidth/cv.clientHeight;cam.updateProjectionMatrix();render()}};
 const setCut=h=>{cut=h;geometry.forEach((g,i)=>g.setDrawRange(0,buffers[i].counts[h]));shell.querySelectorAll('[data-piece-cut]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.pieceCut===h)));render()};
 function activate(){
 floorControls.hidden=cfg.floors.length<=1;
 floorControls.replaceChildren(...cfg.floors.map((h,i)=>{const b=document.createElement('button');b.type='button';b.dataset.pieceCut=h;b.textContent='Floor '+(i+1);b.setAttribute('aria-pressed',String(h===cut));b.onclick=()=>setCut(h);return b}));
 $('piece-reset-view').onclick=()=>{th=cfg.theta??.8;ph=cfg.phi??1.05;rad=cfg.radius;T.set(X/2,cfg.targetY??Y/2-1,Z/2);render()};
 cv.oncontextmenu=e=>e.preventDefault();cv.onpointerdown=e=>{if(e.button!==0&&e.button!==2)return;drag={x:e.clientX,y:e.clientY,pan:e.shiftKey||e.button===2};cv.setPointerCapture(e.pointerId)};
 cv.onpointermove=e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;if(drag.pan){const u=2*rad*Math.tan(cam.fov*Math.PI/360)/Math.max(1,cv.clientHeight);T.addScaledVector(new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,0),-dx*u);T.addScaledVector(new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,1),dy*u)}else{th+=dx*.002;ph=Math.min(3,Math.max(.1,ph-dy*.002))}render()};
 cv.onpointerup=cv.onpointercancel=cv.onlostpointercapture=stopDrag;
 cv.onwheel=e=>{e.preventDefault();rad=Math.max(cfg.minRadius??8,Math.min(cfg.maxRadius??130,rad*(1+e.deltaY*.0007)));render()};
 setCut(cut);resize();}
 function stopDrag(){drag=null}
 return {resize,stopDrag,activate};
}
})();
