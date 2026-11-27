"""Pack the final catalogue batch against the immutable entrance and batch1 libraries.
Usage: python tools/pack_catalogue.py OUTPUT_DIR ENTRANCE_DIR BATCH1_DIR
The input directories contain the raw exporter model libraries and PNG atlases.
The output directory also contains the raw remaining-models.json and remaining-atlas.png.
"""
from PIL import Image
import json,zlib,base64,struct,sys
from pathlib import Path
P,base,b1=map(Path,sys.argv[1:4])
libs=[json.loads(p.read_text()) for p in [base/'entrance-models.json',b1/'batch1-models.json',P/'remaining-models.json']]
ims=[Image.open(p).convert('RGBA') for p in [base/'entrance-atlas.png',b1/'batch1-atlas.png',P/'remaining-atlas.png']]
def pack(b):return base64.b64encode(zlib.compress(b,9)).decode()
def tiles(im,n):
 c=im.width//18
 return [im.crop((i%c*18+1,i//c*18+1,i%c*18+17,i//c*18+17)).tobytes() for i in range(n)]
a,b,c=[tiles(im,n) for im,n in zip(ims,[74,84,213])]
existing=a+b;lookup={t:i for i,t in enumerate(existing)}
def index(t):
 px=[t[i:i+4] for i in range(0,1024,4)];pal=list(dict.fromkeys(px));d={p:i for i,p in enumerate(pal)}
 return bytes(d[p] for p in px),b''.join(pal)
patterns={index(t)[0]:i for i,t in enumerate(existing)};newpat=[];pals=[];refs=[];mapping=[]
for t in c:
 if t not in lookup:
  lookup[t]=len(existing)+len(pals);ix,pal=index(t)
  if ix not in patterns:patterns[ix]=len(existing)+len(newpat);newpat.append(ix)
  refs.append(patterns[ix]);pals.append(pal)
 mapping.append(lookup[t])
buf=bytearray(struct.pack('<HHH',len(mapping),len(newpat),len(pals)))
buf.extend(struct.pack('<'+'H'*len(mapping),*mapping));buf.extend(b''.join(newpat))
for i,pal in zip(refs,pals):buf.extend(struct.pack('<HH',i,len(pal)//4));buf.extend(pal)
texpack=pack(buf)
allmodels=[json.loads(zlib.decompress(base64.b64decode(l['models']))) for l in libs]
def shape(m):return json.dumps([m[0],[f[1:] for f in m[1]]],separators=(',',':'))
shapes={};refs=[]
for j,ms in enumerate(allmodels[:2]):
 for i,m in enumerate(ms):shapes.setdefault(shape(m),(j,i))
for i,m in enumerate(allmodels[2]):
 sh=shape(m)
 if sh in shapes:
  j,k=shapes[sh];refs.append([j,k,[f[0] for f in m[1]]])
 else:
  shapes[sh]=(2,i);refs.append([3,m])
modelpack=pack(json.dumps(refs,separators=(',',':')).encode())
raw=[]
for ref in refs:
 if ref[0]==3:raw.append(ref[1]);continue
 j,k,ts=ref;m=(allmodels[j] if j<2 else raw)[k];raw.append([m[0],[[t,*f[1:]] for t,f in zip(ts,m[1])]])
assert raw==allmodels[2]
ixs=[index(t)[0] for t in existing]+newpat
nb,np,nc=struct.unpack_from('<HHH',buf);off=6;mm=struct.unpack_from('<'+'H'*nb,buf,off);off+=2*nb+np*256;rebuilt=list(existing)
for _ in range(nc):
 k,l=struct.unpack_from('<HH',buf,off);off+=4;pal=buf[off:off+4*l];off+=4*l
 rebuilt.append(b''.join(pal[i*4:i*4+4] for i in ixs[k]))
assert [rebuilt[i] for i in mm]==c
meta=libs[2];meta.pop('models');meta.pop('atlasFile');meta.update(sources=['entrance-models.json','batch1-models.json'],modelPackFile='remaining-modelpack.json',texturePackFile='remaining-texturepack.json')
for name,data in [('remaining-models.json',meta),('remaining-modelpack.json',{'modelPack':modelpack}),('remaining-texturepack.json',{'texturePack':texpack})]:
 (P/name).write_text(json.dumps(data,separators=(',',':')))
print('Verified all model faces and texture tile interiors.')
