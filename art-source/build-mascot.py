import bpy, math, json, hashlib, os
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parent.parent
OUT=Path(os.environ.get('MASCOT_OUTPUT_DIR',str(ROOT/'game/public/assets')));OUT.mkdir(parents=True,exist_ok=True)
E=ROOT/'evidence/production/mascot-v3';E.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
s=bpy.context.scene;s.unit_settings.system='METRIC';s.render.fps=30
s.world=bpy.data.worlds.new('Pearl studio');s.world.use_nodes=True
s.world.node_tree.nodes['Background'].inputs[0].default_value=(.32,.38,.5,1)
s.world.node_tree.nodes['Background'].inputs[1].default_value=.4

def mat(name,color,metal=0,rough=.3,emit=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF')
 p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 p.inputs['Coat Weight'].default_value=.35;p.inputs['Coat Roughness'].default_value=.17
 if emit:p.inputs['Emission Color'].default_value=(*color,1);p.inputs['Emission Strength'].default_value=emit
 return m
blue=mat('Codex • pearlescent blue',(.23,.18,.9),.22,.23)
white=mat('Porcelain glyph',(.95,.96,1),.12,.24,.13)
silver=mat('Satin titanium',(.52,.59,.7),.8,.22)
indigo=mat('Indigo joints',(.052,.04,.15),.38,.31)
objects=[]
def finish(o,name,m,bevel=0):
 o.name=name;o.data.materials.append(m)
 if bevel:
  mod=o.modifiers.new('Sculpted soft edge','BEVEL');mod.width=bevel;mod.segments=6;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
 for f in o.data.polygons:f.use_smooth=True
 objects.append(o);return o
def ball(name,loc,scale,m):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=20,location=loc);o=bpy.context.object;o.scale=scale
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 return finish(o,name,m)
def curve(name,pts,r,m,smooth=True):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=24;c.bevel_depth=r;c.bevel_resolution=6;c.use_fill_caps=True
 sp=c.splines.new('BEZIER');sp.bezier_points.add(len(pts)-1)
 for p,co in zip(sp.bezier_points,pts):p.co=co;p.handle_left_type='AUTO' if smooth else 'VECTOR';p.handle_right_type='AUTO' if smooth else 'VECTOR'
 o=bpy.data.objects.new(name,c);s.collection.objects.link(o);bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o=bpy.context.object;o.select_set(False)
 return finish(o,name,m)

cont=json.loads((ROOT/'art-source/logo-contour.json').read_text())['contour']
cont=[[(sum(cont[(i+j)%256][k] for j in range(-2,3))/5) for k in [0,1]] for i in range(256)]
vs=[(x,y,z+2) for y in [-.22,.22] for x,z in cont];N=len(cont)
faces=[tuple(range(N-1,-1,-1)),tuple(range(N,2*N))]+[(i,(i+1)%N,(i+1)%N+N,i+N) for i in range(N)]
mesh=bpy.data.meshes.new('Source-derived scalloped outline');mesh.from_pydata(vs,[],faces);mesh.update();body=bpy.data.objects.new('Codex logo core',mesh);s.collection.objects.link(body)
bpy.context.view_layer.objects.active=body;body.select_set(True)
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT')
finish(body,'Codex logo core',blue,.135);body.select_set(False)
# Vertex tint preserves the source's blue-to-lavender gradient in glTF.
col=body.data.color_attributes.new(name='Color',type='FLOAT_COLOR',domain='CORNER')
for loop in body.data.loops:
 z=body.data.vertices[loop.vertex_index].co.z;t=max(0,min(1,(z-.85)/2.3))
 col.data[loop.index].color=(.012+.15*t,.005+.055*t,.68+.25*t,1)
node=blue.node_tree.nodes.new('ShaderNodeVertexColor');node.layer_name='Color';blue.node_tree.links.new(node.outputs['Color'],blue.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
curve('White prompt chevron',[(-.43,-.34,2.37),(-.10,-.34,2.04),(-.43,-.34,1.71)],.075,white,False)
ball('Chevron rounded corner',(-.10,-.34,2.04),(.075,.075,.075),white)
curve('White prompt underscore',[(.24,-.34,1.71),(.62,-.34,1.71)],.085,white)
for x,z in [(-.43,2.37),(-.43,1.71),(.24,1.71),(.62,1.71)]:
 r=.075 if x<0 else .085
 ball('Rounded glyph terminal',(x,-.34,z),(r,r,r),white)
bodyparts=objects[:]
arms={}
for side in [-1,1]:
 label='Left' if side<0 else 'Right';start=len(objects)
 curve(label+' floating forearm',[(side*1.03,.03,1.85),(side*1.24,-.02,1.65),(side*1.4,-.09,1.7)],.065,silver)
 ball(label+' wrist',(side*1.4,-.09,1.7),(.115,.11,.13),indigo)
 ball(label+' palm',(side*1.51,-.10,1.77),(.16,.105,.185),white)
 for j in range(3):
  ball(label+' finger '+str(j),(side*(1.43+j*.07),-.1,1.96),(.041,.09,.105-j*.008),white)
 ball(label+' thumb',(side*1.66,-.10,1.80),(.085,.09,.06),white)
 arms[label]=objects[start:]

bpy.ops.object.armature_add(enter_editmode=True,location=(0,0,0));rig=bpy.context.object;rig.name='Codex character rig'
root=rig.data.edit_bones[0];root.name='Core';root.head=(0,0,1.8);root.tail=(0,0,2.4)
for name,side in [('Left',-1),('Right',1)]:
 b=rig.data.edit_bones.new(name);b.head=(side*1.03,.03,1.85);b.tail=(side*1.5,-.1,1.9);b.parent=root
bpy.ops.object.mode_set(mode='OBJECT')
for name,obs in [('Core',bodyparts),*arms.items()]:
 for o in obs:
  g=o.vertex_groups.new(name=name);g.add(list(range(len(o.data.vertices))),1,'REPLACE');m=o.modifiers.new('Character skin','ARMATURE');m.object=rig;o.parent=rig

clips={'Idle':60,'Greet':90,'Beckon':90,'Point':90,'PointLeft':90,'Inspect':90,'Think':90,'Celebrate':90,'Correct':90,'Wait':60,'Travel':60,'Return':90}
def ease(t):
 t=max(0,min(1,t));return t*t*(3-2*t)
for name,length in clips.items():
 rig.animation_data_create();rig.animation_data.action=bpy.data.actions.new(name);rig.animation_data.action.use_fake_user=True
 for f in range(1,length+2,5):
  phase=(f-1)/length;t=phase*math.tau;envelope=ease(phase/.18)*(1-ease((phase-.76)/.24))
  for bone in rig.pose.bones:bone.rotation_mode='XYZ';bone.rotation_euler=(0,0,0);bone.location=(0,0,0)
  core=rig.pose.bones['Core'];left=rig.pose.bones['Left'];right=rig.pose.bones['Right']
  core.location.z=.03*math.sin(t);core.rotation_euler[1]=.018*math.sin(t)
  left.rotation_euler[1]=-.035*math.sin(t);right.rotation_euler[1]=.035*math.sin(t)
  if name=='Greet':
   right.rotation_euler[1]=envelope*(.80+.22*math.sin(t*3));right.rotation_euler[0]=envelope*.3*math.sin(t*3);core.rotation_euler[1]=-.06*envelope
  elif name=='Beckon':
   right.rotation_euler[1]=.55*envelope;right.rotation_euler[0]=envelope*(-.25+.5*math.sin(t*2));core.rotation_euler[2]=-.05*envelope
  elif name=='Point':
   right.rotation_euler[1]=.47*envelope;right.rotation_euler[0]=-.2*envelope;core.rotation_euler[1]=-.065*envelope;core.rotation_euler[2]=-.04*envelope
  elif name=='PointLeft':
   left.rotation_euler[1]=-.47*envelope;left.rotation_euler[0]=-.2*envelope;core.rotation_euler[1]=.065*envelope;core.rotation_euler[2]=.04*envelope
  elif name=='Inspect':
   core.rotation_euler[0]=.13*envelope;core.location.y=-.08*envelope;right.rotation_euler[1]=.2*envelope;right.rotation_euler[0]=-.45*envelope
  elif name=='Think':
   core.rotation_euler[1]=.10*envelope;right.rotation_euler[1]=.7*envelope;right.rotation_euler[0]=.55*envelope;left.rotation_euler[1]=-.12*envelope
  elif name=='Celebrate':
   core.location.z+=.12*envelope*(.5+.5*math.sin(t*2));core.rotation_euler[1]=.06*envelope*math.sin(t*2);right.rotation_euler[1]=1.05*envelope;left.rotation_euler[1]=-1.05*envelope
  elif name=='Correct':
   core.rotation_euler[2]=.075*envelope*math.sin(t*2);right.rotation_euler[0]=-.3*envelope;left.rotation_euler[0]=-.3*envelope
  elif name=='Travel':
   core.rotation_euler[0]=.06;right.rotation_euler[0]=.23;left.rotation_euler[0]=.23;core.location.z=.025*math.sin(t)
  elif name=='Return':
   left.rotation_euler[1]=-.6*envelope;left.rotation_euler[0]=-.3*envelope*math.sin(t*2);core.rotation_euler[2]=.08*envelope
  for bone in rig.pose.bones:bone.keyframe_insert('location',frame=f);bone.keyframe_insert('rotation_euler',frame=f)
rig.animation_data.action=bpy.data.actions['Idle'];s.frame_start=1;s.frame_end=91;s.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=os.environ.get('MASCOT_MASTER_PATH',str(ROOT/'art-source/codex-mascot.blend')))
bpy.ops.object.select_all(action='DESELECT')
for o in objects+[rig]:o.select_set(True)
options={'filepath':str(OUT/'codex-mascot.glb'),'export_format':'GLB','use_selection':True,'export_animations':True,'export_force_sampling':True,'export_apply':False}
if 'export_animation_mode' in bpy.ops.export_scene.gltf.get_rna_type().properties:options['export_animation_mode']='ACTIONS'
bpy.ops.export_scene.gltf(**options)

if os.environ.get('MASCOT_SKIP_RENDERS')=='1':
 print('MASCOT_SOURCE_EXPORT_COMPLETE',flush=True)
 raise SystemExit(0)

# Reproducible material/shape review with a neutral studio and grounded shadow.
floor=mat('Studio backdrop',(.70,.72,.77),0,.5)
bpy.ops.mesh.primitive_plane_add(size=200);ground=bpy.context.object;ground.data.materials.append(floor)
for name,loc,color,energy,size in [('Key',(-4,-5,7),(1,.88,.74),900,5),('Cool rim',(4,1,5),(.5,.6,1),1100,3),('Fill',(0,-4,2),(1,1,1),200,4)]:
 d=bpy.data.lights.new(name,'AREA');d.energy=energy;d.color=color;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);s.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,2))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(3.7,-8,3.7));camera=bpy.context.object;camera.rotation_euler=(Vector((0,0,1.8))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.lens=55;s.camera=camera
s.render.engine='CYCLES';s.cycles.samples=32;s.cycles.use_denoising=True
try:
 p=bpy.context.preferences.addons['cycles'].preferences;p.compute_device_type='METAL';p.get_devices()
 for d in p.devices:d.use=d.type=='METAL'
 s.cycles.device='GPU'
except Exception:pass
s.render.resolution_x=1200;s.render.resolution_y=1000;s.render.resolution_percentage=100;s.render.filepath=str(E/'mascot-studio.png');s.view_settings.view_transform='AgX'
bpy.ops.render.render(write_still=True)
# Compare two bounded material treatments under an identical camera and light rig.
s.render.filepath=str(E/'material-enamel.png');bpy.ops.render.render(write_still=True)
principled=blue.node_tree.nodes.get('Principled BSDF');principled.inputs['Transmission Weight'].default_value=.18;principled.inputs['IOR'].default_value=1.45;principled.inputs['Roughness'].default_value=.16
s.render.filepath=str(E/'material-resin.png');bpy.ops.render.render(write_still=True)
principled.inputs['Transmission Weight'].default_value=0;principled.inputs['Roughness'].default_value=.23
# The exported runtime keeps enamel while the material comparison is reviewed.
glb=OUT/'codex-mascot.glb'
(E/'mascot-build.json').write_text(json.dumps({'source':'art-source/build-mascot.py','bytes':glb.stat().st_size,'sha256':hashlib.sha256(glb.read_bytes()).hexdigest(),'clips':list(clips),'blender':bpy.app.version_string,'humanArtApproval':False},indent=2))
print('MASCOT_BUILD_COMPLETE')
