"""Move the two front columns and olive trees as complete assemblies; retain UVs.
Writes a candidate only. Existing canonical masters, layout and assets are untouched.
"""
import bpy, json, hashlib
from pathlib import Path
from mathutils import Vector
from mathutils.kdtree import KDTree
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'evidence/production/camera-layout-v3';OUT.mkdir(parents=True,exist_ok=True)
ART=ROOT/'art-source'
def signature(coords):
 return hashlib.sha256(repr(sorted(tuple(round(float(c),4) for c in v) for v in coords)).encode()).hexdigest()
def worldcoords(o,ids=None):return [o.matrix_world@v.co for v in (o.data.vertices if ids is None else [o.data.vertices[i] for i in ids])]
bpy.ops.wm.open_mainfile(filepath=str(ART/'headquarters-flat-inlays-wide.blend'))
selected={};moves=[];source_coords={}
bpy.context.preferences.filepaths.save_version=0
for o in bpy.context.scene.objects:
 if o.type!='MESH':continue
 x,z=o.location.x,-o.location.y
 column=o.name.startswith(('Open atrium column','Column foot','Column reed')) and abs(z-1)<.6
 tree=o.name.startswith('Olive ') and abs(z-2)<1.6
 if not (column or tree):continue
 dz=9 if column else 8
 coords=worldcoords(o);key=signature(coords);assert key not in selected
 source_coords[key]=coords
 selected[key]={'name':o.name,'kind':'column' if column else 'tree','vertices':len(o.data.vertices),'dz':dz,'from':list(o.location)}
 o.location.y-=dz
 selected[key]['to']=list(o.location);moves.append(selected[key])
assert sum(m['kind']=='column' for m in moves)==36
assert sum(m['kind']=='tree' for m in moves)==42
bpy.ops.wm.save_as_mainfile(filepath=str(ART/'headquarters-clear-promenade.blend'))
bpy.ops.wm.open_mainfile(filepath=str(ART/'headquarters-flat-inlays-wide-runtime.blend'))
matched=[];retention=[]
for o in bpy.context.scene.objects:
 if o.type!='MESH' or not o.name.startswith('Architecture '):continue
 mesh=o.data
 before_uv=signature([uv.uv for uv in mesh.uv_layers.active.data]) if mesh.uv_layers.active else None
 adjacency=[[] for v in mesh.vertices]
 for e in mesh.edges:
  a,b=e.vertices;adjacency[a].append(b);adjacency[b].append(a)
 remaining=set(range(len(mesh.vertices)));moved=set();untouched_before=[]
 while remaining:
  start=remaining.pop();stack=[start];ids=[start]
  while stack:
   for nxt in adjacency[stack.pop()]:
    if nxt in remaining:remaining.remove(nxt);stack.append(nxt);ids.append(nxt)
  coords=worldcoords(o,ids);key=signature(coords)
  if key not in selected:
   center=sum(coords,Vector())/len(coords)
   options=[k for k,pts in source_coords.items() if len(pts)==len(coords) and (sum(pts,Vector())/len(pts)-center).length<.0001]
   if not options:continue
   assert len(options)==1
   key=options[0];kd=KDTree(len(coords))
   for i,v in enumerate(coords):kd.insert(v,i)
   kd.balance();error=max(kd.find(v)[2] for v in source_coords[key]);assert error<.00002,(selected[key]['name'],error)
  m=selected[key];delta=o.matrix_world.inverted().to_3x3()@Vector((0,-m['dz'],0))
  for i in ids:mesh.vertices[i].co+=delta
  moved.update(ids);matched.append({**m,'runtimeMesh':o.name,'signatureBefore':key})
 mesh.update()
 after_uv=signature([uv.uv for uv in mesh.uv_layers.active.data]) if mesh.uv_layers.active else None
 assert before_uv==after_uv
 retention.append({'mesh':o.name,'vertices':len(mesh.vertices),'movedVertices':len(moved),'uvSha256Before':before_uv,'uvSha256After':after_uv})
assert len(matched)==len(selected),(len(matched),len(selected),[v['name'] for k,v in selected.items() if k not in [m['signatureBefore'] for m in matched]])
bpy.ops.wm.save_as_mainfile(filepath=str(ART/'headquarters-clear-promenade-runtime.blend'))
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.context.scene.objects:
 if o.type=='MESH' and o.name.startswith('Architecture '):o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'architecture-candidate-unquantized.glb'),export_format='GLB',use_selection=True,export_apply=True,export_animations=False,export_extras=True)
layout=json.loads((ROOT/'production/rooms/room-layout.json').read_text());by_name={m['name']:m for m in moves}
for item in layout['instances']:
 if item['id'] in by_name:item['location']=by_name[item['id']]['to']
layout['sourceRevision']='clear-promenade-v3';layout['sourceMaster']='../../art-source/headquarters-clear-promenade.blend'
(OUT/'room-layout-candidate.json').write_text(json.dumps(layout,indent=2))
(OUT/'geometry-revision.json').write_text(json.dumps({'status':'candidate; indirect lighting still uses prior bake','moves':matched,'retention':retention,'sourceMaster':'art-source/headquarters-flat-inlays-wide.blend','sourceRuntimeMaster':'art-source/headquarters-flat-inlays-wide-runtime.blend'},indent=2))
print('PROMENADE_CANDIDATE_COMPLETE',len(matched),flush=True)
