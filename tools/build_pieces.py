import zipfile,struct,gzip,io,json,collections
from PIL import Image
z=None
def nbt(p):
 f=io.BytesIO(gzip.decompress(z.read('data/minecraft/structure/trial_chambers/'+p+'.nbt')))
 def num(t):return struct.unpack('>'+t,f.read(struct.calcsize(t)))[0]
 def st():return f.read(num('H')).decode('utf8')
 def val(t):
  if t in range(1,7):return num(' bh iqfd'.replace(' ','')[t-1])
  if t==7:return f.read(num('i'))
  if t==8:return st()
  if t==9:
   k=num('B');return [val(k) for _ in range(num('i'))]
  if t==10:
   d={}
   while (k:=num('B')): name=st();d[name]=val(k)
   return d
  if t in (11,12):return [num('i' if t==11 else 'q') for _ in range(num('i'))]
 assert num('B')==10;st();return val(10)

import math,zlib,base64,functools,sys,argparse
from pathlib import Path
from PIL import ImageChops
D={'east':(1,0,0),'west':(-1,0,0),'up':(0,1,0),'down':(0,-1,0),'south':(0,0,1),'north':(0,0,-1)};names=list(D);dirs=list(D.values())
def rot(p,r):
 x,y,z=p
 for _ in range(r%4):x,z=-z,x
 return x,y,z
def place(path,r=0,offset=(0,0,0)):
 d=nbt(path)
 for b in d['blocks']:
  s=d['palette'][b['state']];name=s['id'].split(':')[1];prop=s.get('properties',{}).copy();p=tuple(a+b for a,b in zip(rot(b['pos'],r),offset))
  if name=='jigsaw':name=b['nbt']['final_state'].split(':')[1].split('[')[0];prop={}
  if 'facing' in prop and prop['facing'] in D:prop['facing']=names[dirs.index(rot(D[prop['facing']],r))]
  if name=='air':blocks.pop(p,None)
  else:blocks[p]=(name,tuple(sorted(prop.items())))
 return d
@functools.lru_cache(None)
def model(path):
 path=path.split(':')[-1];d=json.loads(z.read('assets/minecraft/models/'+path+'.json'));parent=d.get('parent');base=model(parent).copy() if parent else {};base['textures']={**base.get('textures',{}),**d.get('textures',{})};
 if 'elements' in d:base['elements']=d['elements']
 return base
texs=[]
def tile(t):
 t=t.split(':')[-1];t=t if t.startswith('block/') else 'block/'+t
 if t not in texs:texs.append(t)
 return texs.index(t)
def transform(p,x,y):
 a,b,c=[v-8 for v in p]
 for _ in range(x//90):b,c=c,-b
 a,b,c=rot((a,b,c),y//90)
 return [a+8,b+8,c+8]
def uv_default(d,a,b):
 x,y,z=a;X,Y,Z=b
 return {'east':[16-Z,16-Y,16-z,16-y],'west':[z,16-Y,Z,16-y],'up':[x,z,X,Z],'down':[x,16-Z,X,16-z],'south':[x,16-Y,X,16-y],'north':[16-X,16-Y,16-x,16-y]}[d]
def compile(s):
 name,pp=s;pr=dict(pp)
 if name=='water':return [0,[[tile('block/water_still'),2,-1,0,14,0,16,14,0,16,14,16,0,14,16,0,0,16,0,16,16,0,16]]]
 state=json.loads(z.read('assets/minecraft/blockstates/'+name+'.json'));opts=state['variants'];key=next(k for k in opts if all(pr.get(a)==b for a,b in (p.split('=') for p in k.split(',') if p)));v=opts[key];v=v[0] if isinstance(v,list) else v;x,y=v.get('x',0),v.get('y',0);m=model(v['model']);textures=m['textures'];faces=[]
 def resolve(t):
  while isinstance(t,str) and t.startswith('#'):t=textures[t[1:]]
  if isinstance(t,dict):print('DICT',t);t=t.get('texture',t.get('sprite',t.get('id')))
  return tile(t)
 elements=m.get('elements',[])
 for e in elements:
  a,b=e['from'],e['to'];xx,yy,zz=a;X,Y,Z=b
  pts={'east':[[X,Y,Z],[X,Y,zz],[X,yy,zz],[X,yy,Z]],'west':[[xx,Y,zz],[xx,Y,Z],[xx,yy,Z],[xx,yy,zz]],'up':[[xx,Y,zz],[X,Y,zz],[X,Y,Z],[xx,Y,Z]],'down':[[xx,yy,Z],[X,yy,Z],[X,yy,zz],[xx,yy,zz]],'south':[[xx,Y,Z],[X,Y,Z],[X,yy,Z],[xx,yy,Z]],'north':[[X,Y,zz],[xx,Y,zz],[xx,yy,zz],[X,yy,zz]]}
  for d,f in e['faces'].items():
   points=pts[d];v0=transform([8+c for c in D[d]],x,y);di=dirs.index(tuple(c-8 for c in v0));u0,v0,u1,v1=f.get('uv',uv_default(d,a,b));uv=[[u0,v0],[u1,v0],[u1,v1],[u0,v1]];k=f.get('rotation',0)//90;uv=uv[k:]+uv[:k];pts2=[transform(p,x,y) for p in points]
   # actual blockstate UV lock on horizontal faces (world north)
   if v.get('uvlock') and di==2:uv=[[p[0],p[2]] for p in pts2]
   faces.append([resolve(f['texture']),di,di if 'cullface' in f else -1,*sum(pts2,[]),*sum(uv,[])])
 solid=int(len(elements)==1 and elements[0]['from']==[0,0,0] and elements[0]['to']==[16,16,16] and not any(k in name for k in ['grate','glass','vault']))
 return [solid,faces]

oldcompile=compile
# Standalone entity chest: closed model, atlas face crops from normal.png.
extra={};chest=None
# chest base model cube (1,0,1) to (15,10,15), lid (1,10,1) to (15,14,15), latch at front.
def crop(name,rect):
 im=Image.new('RGBA',(16,16));im.paste(chest.crop(rect),(0,0));extra['block/'+name]=im;return tile(name)
def box(a,b,tiles,r):
 x,y,z0=a;X,Y,Z=b;pts={'east':[[X,Y,Z],[X,Y,z0],[X,y,z0],[X,y,Z]],'west':[[x,Y,z0],[x,Y,Z],[x,y,Z],[x,y,z0]],'up':[[x,Y,z0],[X,Y,z0],[X,Y,Z],[x,Y,Z]],'down':[[x,y,Z],[X,y,Z],[X,y,z0],[x,y,z0]],'south':[[x,Y,Z],[X,Y,Z],[X,y,Z],[x,y,Z]],'north':[[X,Y,z0],[x,Y,z0],[x,y,z0],[X,y,z0]]};out=[]
 for d,points in pts.items():
  if d not in tiles:continue
  t,w,h=tiles[d];di=dirs.index(rot(D[d],r));out.append([t,di,-1,*sum([transform(p,0,r*90) for p in points],[]),0,0,w,0,w,h,0,h])
 return out
def chest_model(p):
 r={'north':0,'east':1,'south':2,'west':3}[p['facing']];faces=[]
 for label,a,b,yy,hh in [('base',[1,0,1],[15,10,15],33,10),('lid',[1,10,1],[15,14,15],14,4)]:
  t={d:(crop('chest_'+label+'_'+d,(u,yy,u+14,yy+hh)),14,hh) for d,u in [('east',0),('north',14),('west',28),('south',42)]};t['up']=(crop('chest_'+label+'_top',(14,yy-14,28,yy)),14,14);t['down']=t['up'];faces+=box(a,b,t,r)
 t=(crop('chest_latch',(1,1,3,5)),2,4);faces+=box([7,8,0],[9,12,1],{d:t for d in D},r);return [0,faces]
def compile(s):
 n,pp=s
 if n=='chest':return chest_model(dict(pp))
 out=oldcompile(s)
 if n.endswith('_leaves'):out[0]=0
 if n=='dead_bush':
  # Element rotation/rescale in the JAR's cross model (45 degrees around Y).
  for f in out[1]:
   for j in range(4):
    x,y,z0=f[3+j*3:6+j*3];a,c=x-8,z0-8;f[3+j*3:6+j*3]=[round(8+a+c,4),y,round(8-a+c,4)]
 return out
# model parent data supports standard template bed, stairs, doors etc.
# Use actual display pool and valid aligned connector matching.
def attach(parent,conn,path):
 p=conn['pos'];pd=nbt(parent);f=pd['palette'][conn['state']]['properties']['orientation'].split('_')[0];d=nbt(path);c=next(b for b in d['blocks'] if d['palette'][b['state']]['id']=='minecraft:jigsaw' and b['nbt']['name']==conn['nbt']['target']);f2=d['palette'][c['state']]['properties']['orientation'].split('_')[0];r=next(r for r in range(4) if rot(D[f2],r)==tuple(-v for v in D[f]));o=tuple(a+b-c for a,b,c in zip(p,D[f],rot(c['pos'],r)));place(path,r,o);return [path,r,list(o)]

# Each recipe lists a base template, optional child per non-empty connector pool,
# and display metadata. Pick the explicit child, then derive rotation and translation
# from matching Jigsaw connector name and facing. Shared library is built per batch.
def build(recipe,out):
 global blocks,chest,texs,extra
 texs.clear();extra.clear();model.cache_clear();chest=Image.open(io.BytesIO(z.read('assets/minecraft/textures/entity/chest/normal.png'))).convert('RGBA')
 rooms=[];states=[];models=[]
 for entry in recipe['pieces']:
  blocks={};p=entry['base'];d=place(p);children=[]
  for c in d['blocks']:
   if d['palette'][c['state']]['id']!='minecraft:jigsaw':continue
   pool=c['nbt']['pool'];path=entry.get('pools',{}).get(pool)
   if path:children.append(attach(p,c,path))
  lo=tuple(min(0,min(p[i] for p in blocks)) for i in range(3));hi=tuple(max(d['size'][i],max(p[i] for p in blocks)+1) for i in range(3));size=tuple(b-a for a,b in zip(lo,hi));X,Y,Z=size;grid=bytearray(X*Y*Z)
  for pos,s in blocks.items():
   if s not in states:states.append(s);models.append(compile(s))
   x,y,z0=(pos[i]-lo[i] for i in range(3));grid[(y*Z+z0)*X+x]=states.index(s)+1
  rooms.append((entry['asset'],dict(size=size,grid=pack(grid),source={'base':p,'children':children},floors=entry['floors'])))
 cols=8;rows=(len(texs)+7)//8;atlas=Image.new('RGBA',(cols*18,rows*18))
 for i,t in enumerate(texs):
  im=extra.get(t)
  if im is None:im=Image.open(io.BytesIO(z.read('assets/minecraft/textures/'+t+'.png'))).convert('RGBA').crop((0,0,16,16))
  if t.endswith('oak_leaves'):im=ImageChops.multiply(im,Image.new('RGBA',(16,16),(119,171,47,255)))
  x=i%8*18+1;y=i//8*18+1;atlas.paste(im,(x,y));atlas.paste(im.crop((0,0,1,16)),(x-1,y));atlas.paste(im.crop((15,0,16,16)),(x+16,y));atlas.paste(im.crop((0,0,16,1)),(x,y-1));atlas.paste(im.crop((0,15,16,16)),(x,y+16))
  for a,b,c,d in [(0,0,-1,-1),(15,0,16,-1),(0,15,-1,16),(15,15,16,16)]:atlas.putpixel((x+c,y+d),im.getpixel((a,b)))
 palette=list(dict.fromkeys(atlas.getdata()));buf=io.BytesIO()
 if len(palette)<=256:
  lookup={p:i for i,p in enumerate(palette)};indexed=Image.new('P',atlas.size);indexed.putdata([lookup[p] for p in atlas.getdata()]);indexed.putpalette([c for p in palette for c in p[:3]]+[0]*(768-len(palette)*3));indexed.info['transparency']=bytes(p[3] for p in palette);indexed.save(buf,format='PNG',optimize=True)
 else:atlas.save(buf,format='PNG',optimize=True)
 shared={'models':pack(json.dumps(models,separators=(',',':')).encode()),'cols':cols,'rows':rows,'waterIds':[i+1 for i,s in enumerate(states) if s[0]=='water'],'waterLevels':{str(i+1):int(dict(s[1]).get('level',0)) for i,s in enumerate(states) if s[0]=='water'},'transparentTiles':[i for i,t in enumerate(texs) if 'grate' in t or 'leaves' in t or 'glass' in t],'atlasFile':recipe['atlas']}
 out.mkdir(parents=True,exist_ok=True)
 for filename,data in rooms:(out/filename).write_text(json.dumps(data,separators=(',',':')))
 (out/recipe['library']).write_text(json.dumps(shared,separators=(',',':')));(out/recipe['atlas']).write_bytes(buf.getvalue())
 print('Built',len(rooms),'pieces,',len(states),'models,',len(texs),'textures')
def pack(a):return base64.b64encode(zlib.compress(a,9)).decode()
if __name__=='__main__':
 parser=argparse.ArgumentParser(description='Compile a batch of 26.3 Trial Chamber piece models from the client JAR.')
 parser.add_argument('jar',type=Path);parser.add_argument('recipe',type=Path);parser.add_argument('out',type=Path)
 args=parser.parse_args();z=zipfile.ZipFile(args.jar);build(json.loads(args.recipe.read_text()),args.out)
