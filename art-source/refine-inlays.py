"""Replace raised subpixel trim with inset ribbons, preserving the baked floor UVs."""
import bpy,bmesh,math,json,os
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'evidence/production/floor-study-v1/candidates';OUT.mkdir(parents=True,exist_ok=True)
STEM=os.environ.get('INLAY_VARIANT','flat-inlays');WIDTH=float(os.environ.get('INLAY_WIDTH','.032'));assert .02<=WIDTH<=.1
def pos(x,y,z):return (x,-z,y)
def material(name,color,metal,rough):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough;return m

def create_inlays():
 limestone=material('Inset limestone solid finish',(.50,.48,.43),0,.74)
 brass=material('Inset satin brass solid finish',(.43,.32,.17),.78,.33)
 verts=[];faces=[];slots=[]
 def quad(points,slot):
  start=len(verts);verts.extend(pos(*p) for p in points);faces.append(tuple(range(start,start+4)));slots.append(slot)
 # Consistent upward normals. Ribbon top is 6 mm above the floor datum.
 for x in range(-24,25,3):quad([(x-.013,.006,-19),(x+.013,.006,-19),(x+.013,.006,21),(x-.013,.006,21)],0)
 for z in range(-18,22,3):quad([(-26,.007,z-.013),(26,.007,z-.013),(26,.007,z+.013),(-26,.007,z+.013)],0)
 for radius in [3.72,2.8]:
  for i in range(192):
   a=i*math.tau/192;b=(i+1)*math.tau/192
   quad([(2+(radius-WIDTH/2)*math.cos(a),.135,2+(radius-WIDTH/2)*math.sin(a)),(2+(radius+WIDTH/2)*math.cos(a),.135,2+(radius+WIDTH/2)*math.sin(a)),(2+(radius+WIDTH/2)*math.cos(b),.135,2+(radius+WIDTH/2)*math.sin(b)),(2+(radius-WIDTH/2)*math.cos(b),.135,2+(radius-WIDTH/2)*math.sin(b))],1)
 for i in range(48):
  a=i*math.tau/48;c=math.cos(a);sn=math.sin(a);cx=2+3.55*c;cz=2+3.55*sn
  quad([(cx+u*c-v*sn,.135,cz+u*sn+v*c) for u,v in [(-.035,-.01),(.035,-.01),(.035,.01),(-.035,.01)]],1)
 mesh=bpy.data.meshes.new('Inset ribbons and indices');mesh.from_pydata(verts,[],faces);mesh.update();mesh.materials.append(limestone);mesh.materials.append(brass)
 # Our runtime coordinate conversion reverses the apparent winding; orient all faces up.
 for poly,slot in zip(mesh.polygons,slots):poly.material_index=slot
 bm=bmesh.new();bm.from_mesh(mesh);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
 for f in bm.faces:
  if f.normal.z<0:f.normal_flip()
 bm.to_mesh(mesh);bm.free()
 uv=mesh.uv_layers.new(name='Planar UV')
 for poly in mesh.polygons:
  for li in poly.loop_indices:
   v=mesh.vertices[mesh.loops[li].vertex_index].co;uv.data[li].uv=(v.x/54+.5,v.y/42+.5)
 o=bpy.data.objects.new('Architecture floor inlays',mesh);bpy.context.scene.collection.objects.link(o);o['role']='Flush stone joints and brass inlays';o['runtime_group']='floor';o['unbaked_material']='Uniform solid finishes avoid tiny UV-atlas islands';return o

bpy.ops.wm.open_mainfile(filepath=str(ROOT/'art-source/headquarters-runtime.blend'))
floor=bpy.data.objects['Architecture floor'];bm=bmesh.new();bm.from_mesh(floor.data);remaining=set(bm.verts);remove=[];counts={'floor-strip':0,'stage-ring':0,'stage-index':0};components=[]
while remaining:
 start=remaining.pop();stack=[start];group=[start]
 while stack:
  v=stack.pop()
  for e in v.link_edges:
   other=e.other_vert(v)
   if other in remaining:remaining.remove(other);stack.append(other);group.append(other)
 coords=[floor.matrix_world@v.co for v in group];xs=[v.x for v in coords];ys=[v.z for v in coords];zs=[-v.y for v in coords];size=[max(xs)-min(xs),max(ys)-min(ys),max(zs)-min(zs)]
 kind='floor-strip' if size[1]<.012 and max(size[0],size[2])>20 else 'stage-ring' if size[1]<.025 and 5<size[0]<8 and 5<size[2]<8 else 'stage-index' if .008<size[1]<.012 and max(size[0],size[2])<.09 and min(ys)>.12 else None
 if kind:remove.extend(group);counts[kind]+=1
 components.append({'vertices':len(group),'size':size,'removed':kind})
assert counts=={'floor-strip':31,'stage-ring':2,'stage-index':48},counts
bmesh.ops.delete(bm,geom=remove,context='VERTS');bm.to_mesh(floor.data);bm.free();floor.data.update()
bpy.context.view_layer.objects.active=floor
mod=floor.modifiers.new('Restored face-weighted floor normals','WEIGHTED_NORMAL');mod.keep_sharp=True;mod.weight=50;bpy.ops.object.modifier_apply(modifier=mod.name)
create_inlays()
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.context.scene.objects:
 if o.type=='MESH' and o.name.startswith('Architecture '):o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/(STEM+'-unquantized.glb')),export_format='GLB',use_selection=True,export_apply=True,export_animations=False,export_extras=True)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/('art-source/headquarters-'+STEM+'-runtime.blend')))
# Retain the same geometry in the separate-object authoring master.
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'art-source/headquarters.blend'))
for o in list(bpy.context.scene.objects):
 if o.name.startswith(('Inlaid floor joint','Stage brass inlay','Stage index')):bpy.data.objects.remove(o,do_unlink=True)
create_inlays();bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/('art-source/headquarters-'+STEM+'.blend')))
(OUT.parent/(STEM+'-refinement.json')).write_text(json.dumps({'replaced':counts,'components':components,'floorJointWidthMeters':.026,'brassRibbonWidthMeters':WIDTH,'ringSegments':192,'bakedUVs':'retained for structural slab, stage and threshold','materials':'uniform PBR finishes on the new ribbons; existing floor materials and lightmaps retained','masters':['headquarters-'+STEM+'.blend','headquarters-'+STEM+'-runtime.blend']},indent=2))
print('INLAY_CANDIDATE_COMPLETE',flush=True)
