import bpy,json,math,hashlib,os
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parent.parent;REV=os.environ.get('ARCHITECTURE_REVISION','inlays-v2');MASTER=os.environ.get('ARCHITECTURE_MASTER','headquarters-flat-inlays-wide.blend');P=ROOT/'production/rooms/plans'/REV;P.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'art-source'/MASTER));s=bpy.context.scene
s.render.engine='BLENDER_WORKBENCH';s.display.shading.light='FLAT';s.display.shading.color_type='SINGLE';s.display.shading.single_color=(.82,.82,.82);s.display.shading.show_shadows=False;s.display.shading.show_cavity=True;s.display.shading.cavity_type='BOTH';s.display.shading.show_object_outline=True;s.display.shading.object_outline_color=(.02,.02,.02);s.display.shading.background_type='WORLD';s.world.color=(1,1,1)
s.view_settings.view_transform='Standard';s.render.resolution_x=1500;s.render.resolution_y=1200;s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG'
bpy.ops.object.camera_add();cam=bpy.context.object;s.camera=cam;cam.data.type='ORTHO';cam.data.ortho_scale=60
ceilingWords=['roof','skylight','coffer','pendant','orbital','canopy']
records=[]
for layer in ['lower-room','reflected-ceiling']:
 visible=[]
 for o in s.objects:
  if o.type!='MESH':continue
  isCeiling=any(word in o.name.lower() for word in ceilingWords)
  o.hide_render=(isCeiling or o.get('runtime_group')=='exterior') if layer=='lower-room' else not isCeiling
  if not o.hide_render:visible.append(o.name)
 cam.location=(0,-1,70 if layer=='lower-room' else -30)
 target=Vector((0,-1,0 if layer=='lower-room' else 9));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler()
 s.render.filepath=str(P/(layer+'.png'));bpy.ops.render.render(write_still=True);records.append({'layer':layer,'projection':'orthographic from actual source meshes','objects':visible,'image':'plans/'+REV+'/'+layer+'.png','sha256':hashlib.sha256((P/(layer+'.png')).read_bytes()).hexdigest()})
(ROOT/'production/rooms/plan-metadata.json').write_text(json.dumps({'schema':'game-room.plan-metadata.v1','roomId':'codex-headquarters','source':'../../art-source/'+MASTER,'sourceSha256':hashlib.sha256((ROOT/'art-source'/MASTER).read_bytes()).hexdigest(),'units':'meters','orthographicWidth':60,'layers':records,'note':'Lower-room excludes ceiling and exterior landscape. Reflected ceiling looks upward from below. Titles/legend remain outside the rendered geometry.'},indent=2))
