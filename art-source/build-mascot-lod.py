"""A separate balanced mesh tier; shell, glyph and animation remain intact."""
import bpy,json,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent;SOURCE=ROOT/'art-source/codex-mascot-traced-glyph-v4.blend';OUT=ROOT/'evidence/production/mascot-lod-v1'
OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(SOURCE));bpy.context.preferences.filepaths.save_version=0
rig=bpy.data.objects['Codex character rig'];rig.animation_data.action=bpy.data.actions['Idle'];bpy.context.scene.frame_set(1)
rows=[]
for o in bpy.context.scene.objects:
 if o.type!='MESH':continue
 o.data.calc_loop_triangles();before=len(o.data.loop_triangles)
 reduce=any(t in o.name for t in [' finger ',' palm',' thumb',' wrist'])
 if reduce:
  bpy.context.view_layer.objects.active=o;mod=o.modifiers.new('Balanced rounded hand detail','DECIMATE');mod.ratio=.5;mod.use_collapse_triangulate=True;bpy.ops.object.modifier_apply(modifier=mod.name)
 o.data.calc_loop_triangles();after=len(o.data.loop_triangles)
 for v in o.data.vertices:assert len(v.groups)==1 and abs(v.groups[0].weight-1)<.000001
 rows.append({'mesh':o.name,'reduced':reduce,'before':before,'after':after})
assert sum(r['reduced'] for r in rows)==12
assert all(a.use_fake_user for a in bpy.data.actions);assert len(bpy.data.actions)==12
master=ROOT/'art-source/codex-mascot-balanced.blend';bpy.ops.wm.save_as_mainfile(filepath=str(master))
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.context.scene.objects:
 if o.type in ['MESH','ARMATURE']:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'balanced-export.glb'),export_format='GLB',use_selection=True,export_animations=True,export_force_sampling=True,export_apply=False,export_animation_mode='ACTIONS')
(OUT/'build.json').write_text(json.dumps({'source':str(SOURCE.relative_to(ROOT)),'sourceSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'master':str(master.relative_to(ROOT)),'masterSha256':hashlib.sha256(master.read_bytes()).hexdigest(),'method':'Collapse only the twelve rounded hand parts to half their triangle count. Shell, glyph, forearms, skin groups and all actions retained.','meshes':rows},indent=2));print('BALANCED_MASCOT_EXPORTED',sum(r['after'] for r in rows),flush=True)
