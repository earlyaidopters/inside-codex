"""Export browser texture encodings from the untouched float bake sources."""
import bpy,json,hashlib,shutil,time
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent;OUT=ROOT/'game/public/assets/headquarters';SOURCE=ROOT/'art-source/headquarters-texture-sources';SOURCE.mkdir(exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'art-source/headquarters-baked.blend'))
s=bpy.context.scene;s.view_settings.look='None';s.view_settings.exposure=0;s.view_settings.gamma=1
for group in ['floor','shell','furnishings']:
 for kind in ['albedo','indirect']:
  original=OUT/f'{group}-{kind}.png';targetSource=SOURCE/original.name
  if targetSource.exists() and targetSource.read_bytes()!=original.read_bytes():
   backup=SOURCE/'previous'/str(int(time.time()));backup.mkdir(parents=True,exist_ok=True);shutil.copy2(targetSource,backup/targetSource.name)
  shutil.copy2(original,targetSource)
  img=bpy.data.images.get(group+' '+kind)
  if img is None:
   img=bpy.data.images.load(str(targetSource));img.name=group+' '+kind
  # Read the high-precision source every time; never recompress a runtime result.
  img.filepath=str(targetSource);img.reload()
  s.render.image_settings.color_mode='RGB';s.render.image_settings.color_depth='8'
  if kind=='albedo':
   s.render.image_settings.file_format='JPEG';s.render.image_settings.quality=90;s.view_settings.view_transform='Standard';path=OUT/f'{group}-albedo.jpg'
  else:
   s.render.image_settings.file_format='PNG';s.render.image_settings.compression=80;s.view_settings.view_transform='Raw';path=OUT/f'{group}-indirect.png'
  img.save_render(str(path),scene=s)
  img.filepath=str(path);img.reload()
  if kind=='albedo':img.colorspace_settings.name='sRGB';img.pack()
s.view_settings.view_transform='AgX'
bpy.ops.object.select_all(action='DESELECT')
for o in s.objects:
 if o.type=='MESH' and o.name.startswith('Architecture '):o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'architecture.glb'),export_format='GLB',use_selection=True,export_apply=True,export_animations=False,export_extras=True)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'art-source/headquarters-runtime.blend'))
for group in ['floor','shell','furnishings']:
 # Albedo is embedded in the GLB; retain high-precision inputs in art-source.
 for suffix in ['albedo.png','albedo.jpg']:
  p=OUT/f'{group}-{suffix}'
  if p.exists():p.unlink()
report={'source':'headquarters-baked.blend','precision':'float bake sources preserved separately; JPEG90 albedo, PNG8 linear indirect','files':{p.name:{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in OUT.iterdir() if p.is_file()}}
(ROOT/'evidence/production/headquarters-v1/runtime-package.json').write_text(json.dumps(report,indent=2))
print('RUNTIME_PACKAGE_COMPLETE')
