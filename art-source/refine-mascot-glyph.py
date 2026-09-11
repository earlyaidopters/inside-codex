import bpy,json
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent;OUT=ROOT/'evidence/production/mascot-v4'
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'art-source/codex-mascot-all-actions.blend'));bpy.context.preferences.filepaths.save_version=0
rig=bpy.data.objects['Codex character rig'];rig.animation_data.action=bpy.data.actions['Idle'];bpy.context.scene.frame_set(1)
removed=[]
for o in list(bpy.context.scene.objects):
 if o.name.startswith(('White prompt','Rounded glyph terminal','Chevron rounded corner')):removed.append(o.name);bpy.data.objects.remove(o,do_unlink=True)
assert len(removed)==7,removed
for part in json.loads((ROOT/'art-source/glyph-contours.json').read_text())['parts']:
 contour=part['verticesRuntime'];N=len(contour);verts=[(x,y,z) for y in [-.218,-.288] for x,z in contour];faces=[tuple(range(N-1,-1,-1)),tuple(range(N,2*N))]+[(i,(i+1)%N,(i+1)%N+N,i+N) for i in range(N)]
 mesh=bpy.data.meshes.new('Traced '+part['name']);mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new('White prompt '+part['name'],mesh);bpy.context.scene.collection.objects.link(o);mesh.materials.append(bpy.data.materials['Porcelain glyph']);bpy.context.view_layer.objects.active=o;o.select_set(True)
 bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT')
 mod=o.modifiers.new('Continuous porcelain edge','BEVEL');mod.width=.009;mod.segments=4;bpy.ops.object.modifier_apply(modifier=mod.name)
 mesh=o.data
 for f in mesh.polygons:f.use_smooth=True
 mod=o.modifiers.new('Face weighted glyph normals','WEIGHTED_NORMAL');mod.keep_sharp=True;mod.weight=50;bpy.ops.object.modifier_apply(modifier=mod.name)
 mesh=o.data
 g=o.vertex_groups.new(name='Core');g.add(list(range(len(mesh.vertices))),1,'REPLACE');m=o.modifiers.new('Character skin','ARMATURE');m.object=rig;o.parent=rig;o.select_set(False)
core=bpy.data.objects['Codex logo core'];bpy.context.view_layer.objects.active=core
mod=core.modifiers.new('Continuous shell highlights','WEIGHTED_NORMAL');mod.keep_sharp=True;mod.weight=50;bpy.ops.object.modifier_apply(modifier=mod.name)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'art-source/codex-mascot-traced-glyph-v4.blend'))
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.context.scene.objects:
 if o.type in ['MESH','ARMATURE']:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'mascot-traced-glyph-v4-export.glb'),export_format='GLB',use_selection=True,export_animations=True,export_force_sampling=True,export_apply=False,export_animation_mode='ACTIONS')
print('GLYPH_REFINEMENT_EXPORTED',flush=True)
