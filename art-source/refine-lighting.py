import bpy,json
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent;SOURCE=ROOT/'art-source/headquarters-texture-sources';OUT=ROOT/'art-source/headquarters-lighting-v2';OUT.mkdir(exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'art-source/headquarters-baked.blend'));s=bpy.context.scene
for img in bpy.data.images:
 p=SOURCE/Path(img.filepath).name
 if p.exists():img.filepath=str(p);img.reload()
s.render.engine='CYCLES';s.cycles.samples=256;s.cycles.max_bounces=6;s.cycles.diffuse_bounces=4
try:
 p=bpy.context.preferences.addons['cycles'].preferences;p.compute_device_type='METAL';p.get_devices()
 for d in p.devices:d.use=d.type=='METAL'
 s.cycles.device='GPU'
except Exception:pass
for group in ['floor','shell','furnishings']:
 bpy.ops.object.select_all(action='DESELECT');o=bpy.data.objects['Architecture '+group];o.select_set(True);bpy.context.view_layer.objects.active=o
 img=bpy.data.images.new(group+' refined indirect',2048,2048,alpha=False,float_buffer=True);img.colorspace_settings.name='Linear Rec.709'
 for slot in o.material_slots:
  n=slot.material.node_tree.nodes;node=n.new('ShaderNodeTexImage');node.image=img;n.active=node
 s.render.bake.margin=12
 print('REFINED_BAKE_START',group,flush=True);bpy.ops.object.bake(type='DIFFUSE',pass_filter={'INDIRECT','COLOR'})
 img.filepath_raw=str(OUT/f'{group}-indirect.png');img.file_format='PNG';img.save();print('REFINED_BAKE_SAVED',group,flush=True)
(OUT/'bake.json').write_text(json.dumps({'samples':256,'passes':['INDIRECT','COLOR'],'source':'headquarters-baked.blend','fixtureManifest':'game/public/assets/headquarters/fixtures.json'},indent=2))
