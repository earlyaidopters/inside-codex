import bpy
import json
import math
import hashlib
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / 'artifacts'
PUBLIC = ROOT / 'public'
EVIDENCE = ROOT / 'evidence'
for folder in [ART, PUBLIC, EVIDENCE]:
    folder.mkdir(parents=True, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.render.resolution_x = 1280
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.fps = 24
scene.frame_start = 1
scene.frame_end = 49
scene.world = bpy.data.worlds.new('Studio world')
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.055, 0.075, 0.10, 1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.45
scene.view_settings.view_transform = 'AgX'

def material(name, rgba, metallic=0, roughness=.4, emission=0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = rgba
    p.inputs['Metallic'].default_value = metallic
    p.inputs['Roughness'].default_value = roughness
    if emission:
        p.inputs['Emission Color'].default_value = rgba
        p.inputs['Emission Strength'].default_value = emission
    return m

ivory = material('Ceramic ivory', (.72,.79,.77,1), .25,.3)
dark = material('Graphite', (.025,.04,.055,1), .35,.38)
copper = material('Copper trim', (.55,.25,.10,1), .65,.3)
teal = material('Signal cyan', (.02,.7,.65,1), .1,.3, 1.7)
stage_mat = material('Stage slate', (.065,.095,.13,1), .2,.5)

def cube(name, location, scale, mat, bevel=.08):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    o = bpy.context.object
    o.name = name
    o.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        b = o.modifiers.new('Machined edges','BEVEL')
        b.width = bevel
        b.segments = 3
        bpy.ops.object.modifier_apply(modifier=b.name)
    o.data.materials.append(mat)
    for p in o.data.polygons:
        p.use_smooth = False
    return o

def cylinder(name, location, radius, depth, mat):
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=radius, depth=depth, location=location)
    o=bpy.context.object
    o.name=name
    o.data.materials.append(mat)
    b=o.modifiers.new('Soft rim','BEVEL'); b.width=.05; b.segments=3
    bpy.ops.object.modifier_apply(modifier=b.name)
    for f in o.data.polygons: f.use_smooth=True
    return o

cylinder('Stage base',(0,0,-.17),2.2,.3,stage_mat)
cylinder('Copper rim',(0,0,-.015),2.08,.045,copper)
cylinder('Stage surface',(0,0,.025),2.02,.055,dark)
for x in [-1.7,1.7]:
    cube('Signal post '+str(x),(x,.95,.4),(.14,.14,.7),copper,.03)
    cube('Post light '+str(x),(x,.92,.7),(.09,.08,.12),teal,.02)

body = cube('Core body',(0,0,1.05),(1.12,.70,1.10),ivory,.16)
left_foot=cube('Left foot',(-.32,-.025,.18),(.34,.62,.23),dark,.06)
right_foot=cube('Right foot',(.32,-.025,.18),(.34,.62,.23),dark,.06)
cube('Left leg',(-.32,0,.40),(.15,.18,.3),copper,.035)
cube('Right leg',(.32,0,.40),(.15,.18,.3),copper,.035)
face=cube('Face panel',(0,-.365,1.2),(.84,.10,.44),dark,.095)
for x in [-.21,.21]:
    cube('Lens '+str(x),(x,-.427,1.23),(.10,.028,.13),teal,.028)

# A generated diagnostic texture tests UV export and embedding; it is not artwork.
size=128
img=bpy.data.images.new('UV diagnostic grid',width=size,height=size,alpha=True)
px=[]
for y in range(size):
    for x in range(size):
        edge=x%32<3 or y%32<3
        px.extend((.08,.22,.28,1) if edge else ((.035,.55,.48,1) if (x//32+y//32)%2 else (.72,.81,.74,1)))
img.pixels=px
img.filepath_raw=str(ART/'diagnostic-texture.png')
img.file_format='PNG'
img.save()
img.pack()
panelmat=material('Embedded checker PBR',(.8,.8,.8,1),.15,.45)
tex=panelmat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=img
panelmat.node_tree.links.new(tex.outputs['Color'],panelmat.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
badge=cube('Textured chest',(0,-.36,.82),(.46,.055,.27),panelmat,.03)
arm=cube('Wave arm',(.87,0,1.15),(.40,.27,.21),ivory,.065)
hand=cube('Wave hand',(1.12,0,1.15),(.17,.30,.30),copper,.06)
cube('Other arm',(-.76,0,1.04),(.26,.26,.45),ivory,.07)

# Real skinning and an action: the browser must import and move a bone.
bpy.ops.object.armature_add(enter_editmode=True, location=(0,0,0))
rig=bpy.context.object;rig.name='Diagnostic rig'
rootbone=rig.data.edit_bones[0];rootbone.name='Root';rootbone.head=(0,0,.55);rootbone.tail=(0,0,1.05)
wave=rig.data.edit_bones.new('Wave');wave.head=(.56,0,1.15);wave.tail=(1.22,0,1.15);wave.parent=rootbone
bpy.ops.object.mode_set(mode='OBJECT')
for ob in [arm,hand]:
    group=ob.vertex_groups.new(name='Wave')
    group.add(list(range(len(ob.data.vertices))),1,'REPLACE')
    mod=ob.modifiers.new('Skin','ARMATURE');mod.object=rig
    ob.parent=rig
pose=rig.pose.bones['Wave'];pose.rotation_mode='XYZ'
for frame,angle in [(1,0),(13,1.0),(25,.45),(37,1.0),(49,0)]:
    pose.rotation_euler=(angle,0,0)
    pose.keyframe_insert(data_path='rotation_euler',frame=frame)
if rig.animation_data and rig.animation_data.action:
    rig.animation_data.action.name='Companion wave'

def area(name,loc,power,color,size):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.color=color;data.shape='DISK';data.size=size
    obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);obj.location=loc
    obj.rotation_euler=(Vector((0,0,.8))-obj.location).to_track_quat('-Z','Y').to_euler()
    return obj
area('Warm key',(-3,-4,5),650,(1,.82,.65),4)
area('Cool rim',(3,2,4),850,(.45,.8,1),3)
area('Front fill',(1,-3,2),200,(.75,1,.94),3)
bpy.ops.object.camera_add(location=(4,-6,3.6))
cam=bpy.context.object;cam.name='Production camera';cam.data.lens=47
cam.rotation_euler=(Vector((0,0,.65))-cam.location).to_track_quat('-Z','Y').to_euler();scene.camera=cam

# Use Cycles Metal when available; preserve exact device evidence in the report.
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
device_report={'engine':'CYCLES','requested':'CPU','devices':[]}
try:
    prefs=bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type='METAL'
    prefs.get_devices()
    device_report['devices']=[{'name':d.name,'type':d.type} for d in prefs.devices]
    has_metal=any(d.type=='METAL' for d in prefs.devices)
    for d in prefs.devices:d.use=(d.type=='METAL')
    if has_metal:
        scene.cycles.device='GPU';device_report['requested']='METAL'
except Exception as exc:
    device_report['fallback']=str(exc)

scene.frame_set(13)
bpy.ops.wm.save_as_mainfile(filepath=str(ART/'diagnostic-scene.blend'))
scene.render.filepath=str(ART/'blender-render.png')
bpy.ops.render.render(write_still=True)
scene.frame_set(1)
export_path=PUBLIC/'diagnostic-scene.glb'
bpy.ops.export_scene.gltf(filepath=str(export_path),export_format='GLB',export_animations=True,export_force_sampling=True,export_apply=False,export_cameras=True,export_lights=False)
triangles=0
for ob in scene.objects:
    if ob.type=='MESH':
        ob.data.calc_loop_triangles();triangles+=len(ob.data.loop_triangles)
summary={'blenderVersion':bpy.app.version_string,'render':str(ART/'blender-render.png'),'renderDevice':device_report,'glbBytes':export_path.stat().st_size,'glbSha256':hashlib.sha256(export_path.read_bytes()).hexdigest(),'triangles':triangles,'meshObjects':sum(o.type=='MESH' for o in scene.objects),'materials':len(bpy.data.materials),'imageTextures':1,'bones':2,'animation':'Companion wave','humanCreativeApproval':False,'scope':'Engineering smoke-test fixture only'}
(EVIDENCE/'blender-build.json').write_text(json.dumps(summary,indent=2))
print('SMOKE_TEST_BUILD '+json.dumps(summary))
