/* Reusable lazy-loaded non-chamber viewer. One WebGL context, per-piece geometry, shared model libraries and fluid geometry. */
(()=>{
'use strict';
const unzip=async s=>new Uint8Array(await new Response(new Blob([Uint8Array.from(atob(s),c=>c.charCodeAt(0))]).stream().pipeThrough(new DecompressionStream('deflate'))).arrayBuffer());
const image=s=>new Promise((ok,bad)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=bad;im.src='data:image/png;base64,'+s});
const base='assets/data/pieces/';
const manifestPromise=fetch(base+'manifest.json?v=11').then(r=>{if(!r.ok)throw Error('Piece manifest unavailable');return r.json()});
const libraries=new Map(),pieceData=new Map();
const json=async path=>{const r=await fetch(base+path+'?v=4');if(!r.ok)throw Error('Model data unavailable: '+path);return r.json()};
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

async function infestationPiece(){
 const res=await fetch('assets/data/rooms/infestation-geometry.json');if(!res.ok)throw Error('Chamber model unavailable');const D=await res.json();
 const grid=await unzip(D.grid),models=JSON.parse(new TextDecoder().decode(await unzip(D.geometry))),[X,Y,Z]=D.size,N=X*Y*Z;
if(grid.length!==N||grid.some(x=>x>models.length))throw Error('Invalid voxel data');
// Stone bricks are a non-directional cube_all block. Keep the top-face
// texture aligned to world X/Z (north = -Z), not the structure rotation.
// Tile 43 was matched byte-for-byte to the 26.3 stone_bricks.png.
let brickFaces=0;
for(const [,faces] of models)for(const f of faces)if(f[0]===43&&f[1]===2){
 for(let j=0;j<4;j++){f[15+2*j]=f[3+3*j];f[16+2*j]=f[5+3*j]}
 brickFaces++;
}
if(brickFaces!==2)throw Error('Unexpected stone brick models');
const load=s=>new Promise((ok,bad)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=bad;i.src='data:image/png;base64,'+s});
const [base,extra]=await Promise.all([load('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'),load('iVBORw0KGgoAAAANSUhEUgAAAIAAAAAgCAMAAADt/IAXAAAA7VBMVEVscWtYYFg3OzUqJDVAYngqRFUAAAApKChFSkJ6WjSIZTmAXjaLZzyZcUA/PkI0NDg6QEUyNUAsLTtVOh9hSy5aRCRwUi5mTShrUzItLTIQHSUYLDmURA5VARNvDSKCYTpFPzswLCknJysoIhwhIDR4WDb/oWD/h00lHy4YFCQSDxvoUCzoZ0B6enpbW1vLNCDZQimiJyK1MSmQISCvycmdtraBmptvgoJnYWFZWFhJSEhPT0+YX0WWXUOUW0OcXUGLiYucmZxaWVr/wZX/agCbYEV/f3//oF6/TQAhOEZ4dnhQdodqbWpjY2MeGCeBJQuqAAAAT3RSTlP///////8A////////////////////////////////////////////////////////////////////////////////////////////////kcZYdwAABi9JREFUeNqNV2tj2kYQ1BMJJPESFqCrQ0jqxE2btmnixIB42sYBnPz/n9OZPQHh/MGs0d2Jc7Jzs7uzZ8uyLdtxPc/3XQdLq2IY9wPHsmzbCbgPs0PHhjkh36qwGowjF1GcJMnxiZLT96ReWqPRkNkKQ/j3CYAIwtAEgP0AngGAcxhazWar3cbTbLdbzaZVSzud9KKTZVkHQ1pLur1erxvpodtNYnx+fcQ1rN9vCAYrdBwnV78pfHIsnwNwAiu4fOU4ry6xcAAgCPBrToB/GAQA0BkMqvhUqxmeTjWB6yiKYRFRxHGaxBGfrsxRXZzDCKHfqFsqh7mu57suV8oEoHK4CgLEAd6DXFktvIO1ANDDoGXXcPzORZpeXKQcazH8xxpAAgTJ6+FrseFwyOUQAOi7/0ajqFt+Di+5cl0lC98E4OfBZZgDgpOHl0HuW22cP7QchsNx2mAgYwpwAA2dWtJD2GEMeBz1krew4fDtwRra+xsYowAASgD4fgngdxOAwsnz0LYxOABgt+HfBgCLCNp2NRuA/KyDAAwGgwwhoGOmG4duEqXR1dX+6UZXjMCb0gSAp5TvMQh57gGE9+79KQAPMXDyPAhy0IDfsZohayG4lnJoAkCVCYBMwJQBQLf0LWmPWHQRjBSMYE7SKCYDBwAMgceDqz9gQoX3/p0BAP4dvY+syz27HcCuP1zja8dp2VVEnznALLjopDUd/z2AXhL3dPaDmQjhiSUCRwrIAAHAg9IA/vzLZKCC1JT9PMe+3aJjQQBDCDqMfa20DDkQf/w7Snh6DQBRIAikQxSDifoxAhIDHQLlY1QMgf/PvyaA0327KfpzHSACFkJQywZkHzogqcAc+PhxD4BHT5MrAZAeAPwSgn5DV4GCG09n46f/zCo43S+TEOKok7CWMfQZRUBQMO+ohroQEA8kH3NAgHQJ4IigLwxI8kMI9cI3AZj7tpQh1bksw1IHMEEK0mpM9yUA8s76pwxQCDgQgFRhf1+GjDCqEHXIKKvPn0wGTvdtESIwYIsQWch/KMAgkwQYMAcgBGS/FCJTB7QSCvtaCRFK58uXm5ubr9++oRtZnz8bzcjYL6UY4qClmAXI+GdUZBGiEyk+1QE8eyXkxGYgkbz5+lU8kFsTgLlfNiM0It2MqikzoJOyFaEZVWM0oy77UNTlCj0AicA+UM66GfV1R2IzatHa+D9hXJoAzH1LGrKYNOeqtGLdkzmZ7RgMRFE30jOeYzfW/di6HY1uSxtxPZ5MRvqr0WgymYyLKawoitlcrxbLoy0Wi9XdvYdmznbOjn5/d3fvy1K+8+7vKi+YRTejX2wyPrFJMX+AzadTjLOimC7Xi/WCtqYtVo/f1dHc74+P39HXlNpsNnjF+4sAxP2EP3o1GTfqB2sAwGw6nfHooGH+MC+W8L/Wzhfb9XrlVVQpmNSLiuiV5+3EPCjYiwDkmPRO/3A/GdePu3UAgN/5rBASiGO53sI1Bzzb7Qo+wDVVUmbcqxiK0jzXO4OBA+n0Ph6dAhiB+ak2HYvl9mlL73C+3j6RAWgFPr5MmNWO8RcCoOHeGQzUT8wEIBnIo89kmi7gFc4JAqvtyheSmYTlvNn5Bw52ZwDQNyN9S6Q63J4CuIV7cFA8yPGL6ezp1ACAZ5dLrZ4BgBA8DrvNywBYjTrtZGyYAJh+tNlsJmT8+LFa8cEgph55nXtU+1kD2P38INPmnBAgBvskQA6YABD52cMcBgbIQ6kAq70e4DJbqehLrZ41gA8/PQHwchUgzBNimLAYxs8ZYPmVVYjpodhqDVgttRysXZ397n6WJORSAJyRA0K8JkAU0kzCQocfWkAKigLOWQIrlONiixUvtX6Fl1pWgZIq2Behv3P9M3Lg1EwAszlSb04YWCAcFAHU32qJKqQauRU5pHJLIdpIGWoZOgtA37BnDBzyT4sBNRC+VwtRg+32SL0Wos2pEJ2RA0L8/s/Fcf2ZFEv9UQZnU/aFLYTo6QkARIrWW7nTknuZ8GeEW8oQGfBc9TIAuh2Ld+mQz5pRUWrwXNS42Nf/Xghcw9iMXPaiDRLznGZkhsBsx6IB1CBdDIWu/tVBCHhd9qUdI/9wbbu71xc4fqXUy+34f6/bdOQprGmwAAAAAElFTkSuQmCC')]);
if(base.width!==128||base.height!==64||extra.width!==128||extra.height!==32)throw Error('Invalid texture dimensions');
// Pot geometry is a special block-entity model, not a blockstate JSON cube.
// Minecraft 26.3 DecoratedPotRenderer.createBaseLayer / createSidesLayer:
// a 14x16x14 body, a 6x1x6 collar (+.2 deformation), and an 8x3x8 rim (-.1).
// The face crops below are from decorated_pot_side.png and decorated_pot_base.png.
const potTiles=await load('iVBORw0KGgoAAAANSUhEUgAAAIAAAAAQCAYAAADeWHeIAAACV0lEQVR42u1YsW7bMBQ8K2IqOV0MdOzWqXP2TFkyZ0q2fE/W7hnzCd3yAe1YoB9QFEgCOHAQWKGiJzkZjKeSNG2RkiwFrg4wIMlP5OPd45Hi6Ors5BVbRpIRDvaF9b+/j08AgEgs/49F6NX2unZd8fv+Ydl/uFc+S/PC+f3Lmx8jAPh2evwqKcfPP3eYPafO758ffm3E38X191GT8YdJRgAASfkK+fyMO+dYmwBqkmqbrmKlRIiEsOZRRQ63bcuhS8QixNGXzyvj9p0kdfirXQAq4bbEJeXYFKMmlWRUxnKcKqykHJ8OYu39SAikRPh1+1DOnMk4ciaS++LYqvFsG036rMNf4wIwk06JEAsBSaRZ86aBTROp2bekvEyc2+S2bHYWCaHZpo+F9g1zCa0zS5vy16gAbB2x+GoFmonYZuHsWa7YunmfEm3FyvqGuRT57GH65C+0dWRbn9fdJ9k/u2I79103JeWYjCNtCXDJq86msW1ME6nN3DpLQBP+WimAdciKBfb3gsoKZstygekets1T36J2iTb4a60AVMGzYuFVCD6J2yxSnTmmFQ6o5q8uAlVoU3j1PisWK9dqbFVlcoXzZyX/BvTLX2CKWwVbHFu2yyD6+DR77+iTv8BVZJfTONs6pg6q7fVrl/YBffGnFYDPEajLbpwTnoxjRGL5udP2QcauuUDX/IU+wnOcem5uVrFpUTywQXg3F+iav9AmfpoXpch8rcatKxhzY9L2qdX/UARd8xcAwPyFMH8hTdxpkpbXquAcN2A3EJqC2u4/fhDa86EIdgdvw+7W9Jr8yqkAAAAASUVORK5CYII=');
const potFaces=[];
function potBox(lo,hi,side,top,bottom){
 const [x,y,z]=lo,[X,Y,Z]=hi;
 const pts=[[[X,Y,Z],[X,Y,z],[X,y,z],[X,y,Z]],[[x,Y,z],[x,Y,Z],[x,y,Z],[x,y,z]],[[x,Y,z],[X,Y,z],[X,Y,Z],[x,Y,Z]],[[x,y,Z],[X,y,Z],[X,y,z],[x,y,z]],[[x,Y,Z],[X,Y,Z],[X,y,Z],[x,y,Z]],[[X,Y,z],[x,Y,z],[x,y,z],[X,y,z]]];
 for(let d=0;d<6;d++){
  const [tile,w,h]=d===2?top:d===3?bottom:side;
  potFaces.push([tile,d,-1,...pts[d].flat(),0,0,w,0,w,h,0,h]);
 }
}
potBox([1,0,1],[15,16,15],[48,14,16],[49,14,14],[54,14,14]);
potBox([4.8,15.8,4.8],[11.2,17.2,11.2],[52,6,1],[53,6,6],[53,6,6]);
potBox([4.1,17.1,4.1],[11.9,19.9,11.9],[51,8,3],[50,8,8],[50,8,8]);
let corrected=0;for(let n=0;n<models.length;n++)if(models[n][1].length===12&&models[n][1].every(f=>f[0]===42)){models[n]=[0,potFaces];corrected++}
if(corrected!==2)throw Error('Unexpected pot model variants');
// Preserve the previous Hotel/Maze UV inset, plus one extruded guard texel
// around each atlas tile. Nearest filtering stays pixel-crisp and cannot sample
// a transparent or white neighboring tile at the edges.
const source=document.createElement('canvas');source.width=128;source.height=112;
const src=source.getContext('2d');src.imageSmoothingEnabled=false;src.drawImage(base,0,0);src.drawImage(extra,0,64);src.drawImage(potTiles,0,96);
const ac=document.createElement('canvas');ac.width=144;ac.height=126;
const ctx=ac.getContext('2d');ctx.imageSmoothingEnabled=false;
for(let t=0;t<56;t++){
 const sx=(t%8)*16,sy=Math.floor(t/8)*16,dx=(t%8)*18+1,dy=Math.floor(t/8)*18+1;
 ctx.drawImage(source,sx,sy,16,16,dx,dy,16,16);
 ctx.drawImage(source,sx,sy,1,16,dx-1,dy,1,16);
 ctx.drawImage(source,sx+15,sy,1,16,dx+16,dy,1,16);
 ctx.drawImage(source,sx,sy,16,1,dx,dy-1,16,1);
 ctx.drawImage(source,sx,sy+15,16,1,dx,dy+16,16,1);
 for(const [a,b,c,d] of [[0,0,-1,-1],[15,0,16,-1],[0,15,-1,16],[15,15,16,16]])ctx.drawImage(source,sx+a,sy+b,1,1,dx+c,dy+d,1,1);
}
const tex=new THREE.CanvasTexture(ac);tex.magFilter=tex.minFilter=THREE.NearestFilter;tex.generateMipmaps=false;tex.anisotropy=1;

 return {grid,size:D.size,D:{models,tex,cols:8,rows:7,transparentTiles:[],waterLevels:{}},seeds:D.exits.flatMap(([p,d])=>[[p[0]-d[0],p[1],p[2]-d[2]],[p[0]-d[0],p[1]+1,p[2]-d[2]]])};
}
function piece(file,manifest){
 if(!pieceData.has(file)){
  const promise=(async()=>{if(file==='chamber/chamber_4')return infestationPiece();const cfg=manifest[file];if(!cfg)throw Error('Unknown piece '+file);const layout=await json(cfg.asset),D=await library(cfg.library||cfg.asset,cfg.library?null:layout),grid=await unzip(layout.grid);if(grid.length!==layout.size.reduce((a,b)=>a*b,1)||grid.some(k=>k>D.models.length))throw Error('Invalid source layout '+file);return {grid,size:layout.size,D:{...D,waterLevels:cfg.waterLevels||D.waterLevels||{},transparentTiles:cfg.transparentTiles||D.transparentTiles||[]},seeds:cfg.seeds};})();
  pieceData.set(file,promise);promise.catch(()=>{if(pieceData.get(file)===promise)pieceData.delete(file)});
 }
 return pieceData.get(file);
}
const rotate=(p,r)=>{let [x,y,z]=p;for(let i=0;i<r;i++)[x,z]=[-z,x];return [x,y,z]};
const translate=(p,o)=>p.map((v,i)=>v+o[i]);
async function composeDoor(cfg,manifest){
 const parts=await Promise.all(cfg.parts.map(async part=>({...part,...await piece(part.file,manifest)})));
 const norms=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
 const lo=[0,0,0],hi=[0,0,0];
 for(const p of parts){const [X,Y,Z]=p.size;for(const x of [0,X-1])for(const y of [0,Y-1])for(const z of [0,Z-1]){const q=translate(rotate([x,y,z],p.rotation),p.offset);for(let i=0;i<3;i++){lo[i]=Math.min(lo[i],q[i]);hi[i]=Math.max(hi[i],q[i]+1)}}}
 if(cfg.blocked)lo[0]=Math.min(lo[0],-1);
 const size=hi.map((v,i)=>v-lo[i]),[X,Y,Z]=size,N=X*Y*Z;
 const grid=new Uint16Array(N),mask=new Uint8Array(N),models=[],waterLevels={},transparentTiles=[],seeds=[];
 const id=(x,y,z)=>(y*Z+z)*X+x,shift=q=>q.map((v,i)=>v-lo[i]);
 const canvas=document.createElement('canvas');canvas.width=144;canvas.height=parts.reduce((n,p)=>n+p.D.rows*18,0);const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
 let rows=0;
 for(const p of parts){
  const D=p.D,[a,b,c]=p.size,modelOffset=models.length,tileOffset=rows*8;
  if(D.cols!==8)throw Error('Unsupported atlas width');
  ctx.drawImage(D.tex.image,0,rows*18);rows+=D.rows;
  for(const t of D.transparentTiles||[])transparentTiles.push(tileOffset+t);
  for(const [k,v] of Object.entries(D.waterLevels||{}))waterLevels[modelOffset+Number(k)]=v;
  const normIndex=i=>i<0?-1:norms.findIndex(n=>n.every((v,j)=>v===rotate(norms[i],p.rotation)[j]));
  for(const [solid,faces] of D.models)models.push([solid,faces.map(f=>{const g=f.slice();g[0]+=tileOffset;g[1]=normIndex(f[1]);g[2]=normIndex(f[2]);for(let j=0;j<4;j++){const i=3+3*j,q=rotate([f[i]-8,f[i+1]-8,f[i+2]-8],p.rotation);g.splice(i,3,...q.map(v=>v+8))}return g})]);
  const pos=q=>shift(translate(rotate(q,p.rotation),p.offset));
  for(let y=0;y<b;y++)for(let z=0;z<c;z++)for(let x=0;x<a;x++){const q=pos([x,y,z]),i=id(...q),k=p.grid[(y*c+z)*a+x];if(mask[i])throw Error('Overlapping door templates');mask[i]=1;if(k)grid[i]=modelOffset+k;}
  for(const q of p.seeds||[])seeds.push(pos(q));
  if(!p.seeds?.length)for(let y=1;y<b;y+=2)for(let z=1;z<c;z+=2)for(let x=1;x<a;x+=2)seeds.push(pos([x,y,z]));
 }
 if(cfg.blocked){
  const root=parts[0],k=root.grid[(0*root.size[2]+2)*root.size[0]+9];
  if(!k||root.D.models[k-1][0]!==1)throw Error('Missing solid blocking model');
  for(let y=cfg.doorY-1;y<=cfg.doorY+1;y++)for(let z=1;z<=3;z++){const q=shift([-1,y,z]),i=id(...q);grid[i]=k;mask[i]=1}
 }
 seeds.push(shift([2,cfg.doorY,2]),shift([0,cfg.doorY,2]));
 const tex=new THREE.CanvasTexture(canvas);tex.magFilter=tex.minFilter=THREE.NearestFilter;tex.generateMipmaps=false;
 cfg.seeds=seeds;cfg.floors=[...new Set([6,12,19].map(h=>h-lo[1]).filter(h=>h>0&&h<Y).concat(Y))].sort((a,b)=>a-b);cfg.radius=Math.max(30,Math.hypot(...size)*1.22);cfg.theta=.65;cfg.phi=1.1;cfg.targetY=Y/2;cfg.minRadius=5;cfg.maxRadius=180;
 return {grid,size,mask,D:{models,tex,cols:8,rows,waterLevels,transparentTiles}};
}
function createViewer(root=document){
 const $=id=>root===document?document.getElementById(id):root.querySelector('[data-view="'+id+'"]'),cv=$('piece-render'),shell=$('piece-render-shell'),placeholder=$('piece-preview'),status=$('piece-render-status'),tag=$('piece-template-tag'),floorControls=$('piece-floor-controls');
 const views=new Map();let current=null,revision=0,view=null,R=null;
async function select(file,override){
 const serial=++revision;current=file;if(view)view.stopDrag();view=null;
 tag.textContent=override?.tag||file.split('/').pop();tag.title=override?.tagTitle||'minecraft:trial_chambers/'+file;
 shell.hidden=true;placeholder.hidden=false;
 try{
  const manifest=await manifestPromise;if(serial!==revision)return;
  const cfg=override?{...override}:manifest[file];if(!cfg)return;
  shell.hidden=false;placeholder.hidden=true;status.hidden=false;status.textContent='Loading '+cfg.name+'…';
  floorControls.replaceChildren();
  cv.setAttribute('aria-label','3D '+cfg.name+' example. Drag to orbit, right-drag to pan, scroll to zoom.');
  if(!views.has(file)){const pending=init(file,cfg,manifest);views.set(file,pending);pending.catch(()=>{if(views.get(file)===pending)views.delete(file)})}
  const next=await views.get(file);if(serial!==revision)return;
  view=next;status.hidden=true;view.activate();
 }catch(e){if(serial!==revision)return;console.error(e);shell.hidden=false;placeholder.hidden=true;status.hidden=false;status.textContent='Unable to load piece: '+e.message;}
}

new ResizeObserver(()=>view?.resize()).observe(shell);
async function init(file,cfg,manifest){
 if(typeof THREE==='undefined')throw Error('Three.js unavailable');
 const loaded=cfg.parts?await composeDoor(cfg,manifest):await piece(file,manifest),{grid,mask,D}=loaded,[X,Y,Z]=loaded.size,N=X*Y*Z,{models,tex}=D;
 if(grid.length!==N||grid.some(v=>v>models.length))throw Error('Invalid model grid');
 const id=(x,y,z)=>(y*Z+z)*X+x,inside=(x,y,z)=>x>=0&&y>=0&&z>=0&&x<X&&y<Y&&z<Z,solid=k=>k>0&&models[k-1][0]===1;
 const normals=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],shade=[.85,.85,1,.60,.75,.75];
 // Render inward-facing shell surfaces rather than opaque exterior walls; like chamber viewers.
 const air=new Uint8Array(N),stack=cfg.seeds.map(p=>p.slice());
 while(stack.length){const [x,y,z]=stack.pop();if(!inside(x,y,z))continue;const q=id(x,y,z);if((mask&&!mask[q])||air[q]||solid(grid[q]))continue;air[q]=1;for(const d of normals)stack.push([x+d[0],y+d[1],z+d[2]])}
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
 return {select};
}
window.PieceViewerFactory=createViewer;
if(document.getElementById('piece-render'))window.PieceViewer=createViewer();
})();
