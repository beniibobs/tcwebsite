"""Losslessly pack new 16px RGBA tile interiors against the published previous atlas.
Usage: python tools/pack_atlas.py OUTPUT_DIRECTORY PREVIOUS_ATLAS
Keep PREVIOUS_ATLAS immutable: packed maps address its exact tile indices.
"""
import sys, json, zlib, base64
from pathlib import Path
from PIL import Image
out=Path(sys.argv[1]);source=Path(sys.argv[2])
p=out/'batch1-models.json';d=json.loads(p.read_text())
old=Image.open(source).convert('RGBA');new=Image.open(out/d['atlasFile']).convert('RGBA')
def tile(im,i):
 c=im.width//18;x=i%c*18+1;y=i//c*18+1
 return im.crop((x,y,x+16,y+16)).tobytes()
lookup={tile(old,i):i for i in range(old.width//18*old.height//18)}
delta=[];mapping=[]
# Count tiles from the model library; no padding tiles are needed.
models=json.loads(zlib.decompress(base64.b64decode(d['models'])))
n=1+max(f[0] for _,faces in models for f in faces)
for i in range(n):
 t=tile(new,i)
 if t in lookup:mapping.append(lookup[t])
 else:mapping.append(-len(delta)-1);delta.append(t)
name='batch1-atlas-pack.json'
(out/name).write_text(json.dumps({'map':mapping,'delta':base64.b64encode(zlib.compress(b''.join(delta),9)).decode(),'source':source.name},separators=(',',':')))
del d['atlasFile'];d['atlasPackedFile']=name
p.write_text(json.dumps(d,separators=(',',':')))
