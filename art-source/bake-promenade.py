"""Rebake moved-room indirect light without altering runtime albedo or UVs."""
import bpy,json,hashlib,time
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'art-source/headquarters-lighting-v3';OUT.mkdir(exist_ok=True)
MASTER=ROOT/'art-source/headquarters-clear-promenade-runtime.blend'
bpy.ops.wm.open_mainfile(filepath=str(MASTER));s=bpy.context.scene
# Restore original float albedo inputs in this in-memory baking scene only.
reloaded=[]
for group in ['floor','shell','furnishings']:
 o=bpy.data.objects['Architecture '+group]
 source=ROOT/f'art-source/headquarters-texture-sources/{group}-albedo.png'
 assert source.exists()
 img=bpy.data.images.load(str(source));img.colorspace_settings.name='Linear Rec.709'
 for slot in o.material_slots:
  m=slot.material;principled=m.node_tree.nodes.get('Principled BSDF')
  if not principled:continue
  tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=img
  m.node_tree.links.new(tex.outputs['Color'],principled.inputs['Base Color'])
 reloaded.append({'path':str(source.relative_to(ROOT)),'sha256':hashlib.sha256(source.read_bytes()).hexdigest()})
s.render.engine='CYCLES';s.cycles.samples=256;s.cycles.max_bounces=6;s.cycles.diffuse_bounces=4
p=bpy.context.preferences.addons['cycles'].preferences;p.compute_device_type='METAL';p.get_devices()
for d in p.devices:d.use=d.type=='METAL'
s.cycles.device='GPU';bakes=[]
for group in ['floor','shell','furnishings']:
 bpy.ops.object.select_all(action='DESELECT');o=bpy.data.objects['Architecture '+group];o.select_set(True);bpy.context.view_layer.objects.active=o
 img=bpy.data.images.new(group+' promenade indirect',2048,2048,alpha=False,float_buffer=True);img.colorspace_settings.name='Linear Rec.709'
 for slot in o.material_slots:
  n=slot.material.node_tree.nodes;node=n.new('ShaderNodeTexImage');node.image=img;n.active=node
 s.render.bake.margin=12;started=time.time();print('PROMENADE_BAKE_START',group,flush=True)
 bpy.ops.object.bake(type='DIFFUSE',pass_filter={'INDIRECT','COLOR'})
 target=OUT/f'{group}-indirect.png';img.filepath_raw=str(target);img.file_format='PNG';img.save()
 bakes.append({'group':group,'elapsedSeconds':time.time()-started,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()});print('PROMENADE_BAKE_SAVED',group,flush=True)
(OUT/'bake.json').write_text(json.dumps({'samples':256,'passes':['INDIRECT','COLOR'],'resolution':[2048,2048],'margin':12,'master':str(MASTER.relative_to(ROOT)),'masterSha256':hashlib.sha256(MASTER.read_bytes()).hexdigest(),'albedoInputs':reloaded,'bakes':bakes,'blender':bpy.app.version_string},indent=2))
print('PROMENADE_BAKE_COMPLETE',flush=True)
