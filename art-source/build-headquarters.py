"""Authored museum architecture, baked from a shared fixture manifest.

Coordinates in the manifest are runtime x/right, y/up, z/front. Blender receives
(x,-z,y), which glTF exports back to the runtime axes. No provider assets or fees.
"""
import bpy, math, json, hashlib, time
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'game/public/assets/headquarters';OUT.mkdir(parents=True,exist_ok=True)
E=ROOT/'evidence/production/headquarters-v1';E.mkdir(parents=True,exist_ok=True)
ROOM=ROOT/'production/rooms'
bpy.ops.wm.read_factory_settings(use_empty=True)
s=bpy.context.scene;s.unit_settings.system='METRIC'
s.render.engine='CYCLES';s.cycles.samples=24;s.cycles.use_denoising=True
s.cycles.max_bounces=6;s.cycles.diffuse_bounces=4
try:
 p=bpy.context.preferences.addons['cycles'].preferences;p.compute_device_type='METAL';p.get_devices()
 for d in p.devices:d.use=d.type=='METAL'
 s.cycles.device='GPU'
except Exception:pass
s.world=bpy.data.worlds.new('Daylight dome');s.world.use_nodes=True
s.world.node_tree.nodes['Background'].inputs[0].default_value=(.68,.76,1,1)
s.world.node_tree.nodes['Background'].inputs[1].default_value=.3
s.view_settings.view_transform='AgX'
groups={'floor':[],'shell':[],'furnishings':[],'exterior':[]};fixtures=[];openings=[];instances=[];surfaces=[]
def V(p):return Vector((p[0],-p[2],p[1]))
def material(name,color,metal=0,rough=.5,noise=0,emit=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;n=m.node_tree.nodes;p=n.get('Principled BSDF')
 p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 if metal:p.inputs['Coat Weight'].default_value=.15
 if emit:p.inputs['Emission Color'].default_value=(*color,1);p.inputs['Emission Strength'].default_value=emit
 if noise:
  geom=n.new('ShaderNodeNewGeometry');tex=n.new('ShaderNodeTexNoise');tex.inputs['Scale'].default_value=12;tex.inputs['Detail'].default_value=3;tex.inputs['Roughness'].default_value=.7
  m.node_tree.links.new(geom.outputs['Position'],tex.inputs['Vector'])
  ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.15;ramp.color_ramp.elements[1].position=.85
  ramp.color_ramp.elements[0].color=(*(max(0,c-noise) for c in color),1);ramp.color_ramp.elements[1].color=(*(min(1,c+noise) for c in color),1)
  m.node_tree.links.new(tex.outputs['Fac'],ramp.inputs[0]);m.node_tree.links.new(ramp.outputs['Color'],p.inputs['Base Color'])
 return m
stone=material('Ivory limestone',(.57,.535,.46),rough=.68,noise=.045)
plaster=material('Warm chalk plaster',(.73,.695,.61),rough=.84,noise=.018)
terrazzo=material('Honed pale terrazzo',(.46,.45,.41),rough=.4,noise=.055)
charcoal=material('Dark mineral exhibits',(.04,.065,.067),rough=.65,noise=.012)
metal=material('Champagne anodised aluminium',(.43,.32,.17),metal=.78,rough=.29)
chrome=material('Satin titanium',(.35,.4,.43),metal=.86,rough=.24)
wood=material('Smoked oak',(.17,.085,.032),rough=.64,noise=.055)
linen=material('Moss wool seating',(.13,.19,.13),rough=.97,noise=.028)
soil=material('Soil',(.025,.032,.016),rough=1)
leaf=material('Olive leaves',(.13,.23,.095),rough=.76)
diffuser=material('Porcelain light diffuser',(1,.82,.51),rough=.3,emit=2.5)
violet=material('Soft violet channel',(.27,.18,.75),rough=.4,emit=1.4)
glass=material('Sky glazing',(.38,.46,.48),metal=.6,rough=.16)
def register(o,name,mat,group='shell',bevel=.035,role='architectural detail'):
 o.name=name;o.data.materials.append(mat);o['role']=role;o['attachment']='declared support';o['runtime_group']=group
 if bevel:
  mod=o.modifiers.new('Machined edge radius','BEVEL');mod.width=bevel;mod.segments=3
  bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
 for poly in o.data.polygons:poly.use_smooth=True
 try:
  mod=o.modifiers.new('Face-weighted normals','WEIGHTED_NORMAL');mod.keep_sharp=True;mod.weight=50
  bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
 except Exception:pass
 groups[group].append(o);instances.append({'id':o.name,'group':group,'purpose':role,'location':list(o.location),'dimensions':list(o.dimensions)})
 return o
def box(name,pos,size,mat,group='shell',bevel=.035,role='architectural detail'):
 bpy.ops.mesh.primitive_cube_add(size=1,location=V(pos));o=bpy.context.object;o.dimensions=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 return register(o,name,mat,group,bevel,role)
def cyl(name,pos,r,h,mat,group='furnishings',verts=64,bevel=.02):
 bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=r,depth=h,location=V(pos));return register(bpy.context.object,name,mat,group,bevel)
def ring(name,pos,r,tube,mat,group='furnishings'):
 bpy.ops.mesh.primitive_torus_add(major_segments=96,minor_segments=8,location=V(pos),major_radius=r,minor_radius=tube)
 return register(bpy.context.object,name,mat,group,0)
def cut(wall,name,pos,size,kind,destination):
 bpy.ops.mesh.primitive_cube_add(size=1,location=V(pos));c=bpy.context.object;c.dimensions=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 mod=wall.modifiers.new(name,'BOOLEAN');mod.operation='DIFFERENCE';mod.solver='EXACT';mod.object=c;bpy.context.view_layer.objects.active=wall;bpy.ops.object.modifier_apply(modifier=mod.name);bpy.data.objects.remove(c,do_unlink=True)
 openings.append({'id':name,'kind':kind,'wall':wall.name,'dimensionsMeters':size,'centerRuntime':pos,'destination':destination,'depthMeters':min(size[0],size[2]),'booleanApplied':True})
def aim(o,target):o.rotation_euler=(V(target)-o.location).to_track_quat('-Z','Y').to_euler()
def area(name,pos,target,power,size,color):
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;d.color=color;o=bpy.data.objects.new(name,d);s.collection.objects.link(o);o.location=V(pos);aim(o,target)
 fixtures.append({'id':name,'type':'area','position':pos,'target':target,'powerWatts':power,'sizeMeters':size,'color':color,'runtimeIntensity':power/1200})
 return o

# The same continuous structural shell underlies all three learning wings.
box('Continuous structural slab',[0,-.27,1],[54,.54,42],terrazzo,'floor',.018,'continuous walkable floor')
for x in range(-24,25,3):box('Inlaid floor joint x '+str(x),[x,.002,1],[.009,.008,40],stone,'floor',0)
for z in range(-18,22,3):box('Inlaid floor joint z '+str(z),[0,.003,z],[52,.008,.009],stone,'floor',0)
rear=box('Rear structural wall',[0,4.5,-19.5],[54,9,.7],plaster,bevel=.015)
front=box('Arrival wall',[0,4.5,21.5],[54,9,.7],plaster,bevel=.015)
cut(front,'entry-main',[0,2.8,21.5],[6,5.6,1.4],'door','covered approach and garden')
box('Entry threshold',[0,.005,21.5],[6.1,.01,1.2],stone,'floor',.003)
box('Entrance apron',[0,-.12,25],[12,.24,7],terrazzo,'exterior')
for side in [-1,1]:
 wall=box('Window wall '+str(side),[side*26.5,4.5,1],[.65,9,42],plaster,bevel=.015)
 for z in [-14,-5,4,13]:
  cut(wall,f'window-{side}-{z}',[side*26.5,4.65,z],[1.4,6.2,7.1],'window','landscaped courtyard')
  box('Deep window sill',[side*26.3,1.53,z],[1.05,.18,7.2],stone)
  for dz in [-3.6,3.6]:box('Window bronze upright',[side*26.48,4.7,z+dz],[.16,6.4,.11],metal)
  box('Window head',[side*26.48,7.86,z],[.16,.12,7.3],metal)
  box('Window central mullion',[side*26.48,4.7,z],[.10,6.4,.07],metal)
 for z in [-13,3,16]:
  cyl('Garden planter',[side*31,.5,z],2.4,1,stone,'exterior');cyl('Garden soil',[side*31,1,z],2.2,.02,soil,'exterior')
  for k in range(9):
   a=k*2.4;box('Garden vertical planting',[side*31+math.sin(a)*1.2,2+((k*7)%5)*.3,z+math.cos(a)*1.2],[.12,2+((k*7)%5)*.6,.12],wood,'exterior',.03)
box('Landscape ground',[0,-.65,0],[150,.3,150],linen,'exterior',0)

# The wing dividers have real transverse passages and a generous promenade in front.
for side in [-1,1]:
 wall=box('Wing partition '+str(side),[side*8,3.85,-11],[.5,7.7,17],plaster)
 cut(wall,'wing-passage-'+str(side),[side*8,2.5,-4.6],[1.3,5,3.6],'door','adjacent learning wing and shared promenade')
 box('Partition base reveal',[side*8, .10,-13.4],[.57,.20,12],metal)

# Coffered ceilings with an actual central skylight opening and visible mullions.
ceiling=box('Continuous roof slab',[0,9.2,1],[54,.45,42],plaster,bevel=.015)
cut(ceiling,'atrium-skylight',[0,9.2,5],[15,1.2,19],'window','sky above central atrium')
for x in [-7.5,7.5]:box('Skylight long frame',[x,9.07,5],[.16,.25,19.2],metal)
for z in [-4.5,14.5]:box('Skylight cross frame',[0,9.07,z],[15.2,.25,.16],metal)
for z in [-3,0,3,6,9,12]:box('Skylight mullion',[0,9.15,z],[15,.2,.075],metal)
for x in [-20,-12,12,20]:
 for z in [-14,-6,2,10,18]:
  for dx in [-3.6,3.6]:box('Coffer long edge',[x+dx,8.75,z],[.18,.55,7.2],stone)
  for dz in [-3.6,3.6]:box('Coffer cross edge',[x,8.75,z+dz],[7.4,.55,.18],stone)

# Pilasters engage the partitions; freestanding columns remain in genuinely open bays.
for side in [-1,1]:
 for z in [-17,-9]:
  box('Engaged ribbed pilaster',[side*8,3.7,z],[.85,7.4,.85],stone)
  for k in [-2,-1,0,1,2]:box('Pilaster vertical reed',[side*8+k*.13,3.8,z+.44],[.055,7.1,.035],plaster,bevel=.017)
 for z in [1,14]:
  cyl('Open atrium column',[side*9,4.4,z],.36,8.8,stone,'shell',64)
  cyl('Column foot',[side*9,.11,z],.53,.22,metal,'shell')
  for k in range(16):
   a=k*math.tau/16;cyl('Column reed',[side*9+.36*math.cos(a),4.4,z+.36*math.sin(a)],.036,8.5,plaster,'shell',8,.008)

# Recessed exhibit architecture gives the three bays distinct material/light rhythm.
wingPalette=[charcoal,wood,charcoal]
for wing in range(3):
 base=(wing-1)*16
 backing=box('Deep exhibit backing '+str(wing),[base,3.5,-18.4],[14.8,7,.3],wingPalette[wing])
 for side in [-1,1]:box('Exhibit reveal cheek',[base+side*7.4,3.5,-17.5],[.30,7,2.1],stone)
 box('Exhibit canopy',[base,7,-17.5],[15,.3,2.1],stone)
 box('Canopy indirect channel',[base,6.83,-16.8],[14,.035,.045],diffuser,'furnishings',.008)
 for k in range(31):
  x=base-7+k*.467;box('Acoustic exhibit rib',[x,3.65,-18.15],[.055,5.8,.10],metal if wing==1 else stone,bevel=.015)
 # Circular recessed instruments are display recesses, never false doorways.
 for j in range(4):
  i=wing*4+j;x=base-5.4+j*3.6;z=-10
  cyl('Plinth dark foot '+str(i),[x,.07,z],.92,.14,charcoal)
  cyl('Plinth stone body '+str(i),[x,.68,z],.88,1.18,stone,bevel=.055)
  cyl('Plinth metal reveal '+str(i),[x,1.28,z],.89,.055,metal,bevel=.009)
  cyl('Plinth porcelain top '+str(i),[x,1.34,z],.94,.10,plaster,bevel=.025)
  box('Recessed plaque '+str(i),[x,.97,z+.87],[.77,.21,.035],charcoal,'furnishings',.018)
  # Functional exhibit mounting point and retaining ring.
  ring('Exhibit mounting rim '+str(i),[x,1.396,z],.68,.009,chrome)
  area('Exhibit key '+str(i),[x,6.6,-8.3],[x,1.3,z],155,1.25,(1,.85,.65))
  cyl('Pendant housing '+str(i),[x,7.0,-8.3],.26,.17,metal)
  cyl('Pendant diffuser '+str(i),[x,6.9,-8.3],.225,.015,diffuser)
  cyl('Pendant stem '+str(i),[x,7.97,-8.3],.014,1.8,metal,verts=12,bevel=0)
 area('Wing wash '+str(wing),[base,6.7,-16.7],[base,3,-18.4],600,5,(.85,.8,1) if wing==0 else (1,.8,.55) if wing==1 else (.7,1,.87))

# Central guide stage, mechanically suspended orbital instrument and inset metal joints.
cyl('Arrival circular stage',[2,.065,2],3.8,.13,stone,'floor',96,.035)
for r in [3.72,2.8]:ring('Stage brass inlay',[2,.136,2],r,.009,metal,'floor')
for k in range(48):
 a=k*math.tau/48;o=box('Stage index',[2+3.55*math.cos(a),.139,2+3.55*math.sin(a)],[.07,.01,.02],metal,'floor',.004);o.rotation_euler.z=-a
for r,h in [(2.3,6.5),(2.65,6.65)]:ring('Suspended orbital instrument',[2,h,2],r,.025,metal)
ring('Orbital diffuser',[2,6.48,2],2.28,.017,diffuser)
for a in [0,math.tau/3,math.tau*2/3]:
 x=2+2.3*math.cos(a);z=2+2.3*math.sin(a);cyl('Orbital suspension',[x,7.85,z],.008,2.7,metal,verts=8,bevel=0)
 nearest=round(z/3)*3;box('Orbital suspension support',[x,9.18,(z+nearest)/2],[.06,.06,abs(z-nearest)+.08],metal,'shell',.009, 'cross bracket connects suspension wire to the skylight mullion')
area('Atrium key',[2,8,1],[2,0,2],1000,5,(1,.88,.72))

# Quiet furnished terraces face the shared promenade, never the wall.
for side in [-1,1]:
 for z in [6,14]:
  x=side*18
  box('Oak bench seat',[x,.46,z],[4,.14,1.05],wood,'furnishings',.065)
  box('Tailored wool cushion',[x,.58,z],[3.78,.16,.90],linen,'furnishings',.07)
  for dx in [-1.55,1.55]:box('Bench stone leg',[x+dx,.20,z],[.35,.40,.8],stone,'furnishings',.025)
  box('Bench back support',[x,.83,z-.53],[4,.6,.12],wood,'furnishings',.025)
 x=side*22;z=2
 cyl('Olive planter',[x,.6,z],1.15,1.2,stone,bevel=.08);cyl('Olive soil',[x,1.2,z],1.02,.015,soil)
 # Small botanical hierarchy: trunk, branches and leaf clusters with deterministic placement.
 cyl('Olive trunk',[x,2.75,z],.085,3.1,wood,verts=16)
 for k in range(18):
  a=k*2.399963;r=.35+(k%5)*.22;y=3.45+(k%4)*.32
  pos=[x+math.cos(a)*r,y,z+math.sin(a)*r]
  bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,location=V(pos));o=bpy.context.object;o.scale=(.45,.32,.28);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);register(o,'Olive foliage cluster',leaf,'furnishings',0)

# Shared bake/runtime daylight fixture. Runtime directional vector is stored explicitly.
d=bpy.data.lights.new('Sun through skylight','SUN');d.energy=2;d.angle=.08;d.color=(1,.91,.77);sun=bpy.data.objects.new(d.name,d);s.collection.objects.link(sun);sun.location=V([16,24,12]);aim(sun,[-2,0,-4])
fixtures.append({'id':d.name,'type':'directional','position':[16,24,12],'direction':[-.6,-1,-.5],'color':[1,.91,.77],'runtimeIntensity':2,'angularSize':.08})
(OUT/'fixtures.json').write_text(json.dumps({'schema':1,'coordinateSystem':'runtime x,y-up,z-front','fixtures':fixtures},indent=2))
(ROOM/'openings.json').write_text(json.dumps({'schema':'game-room.opening-schedule.v1','roomId':'codex-headquarters','primaryArrival':{'openingId':'entry-main','exception':''},'openings':openings},indent=2))
(ROOM/'room-layout.json').write_text(json.dumps({'schema':'game-room.layout.v1','roomId':'codex-headquarters','units':'meters','coordinateSystem':'instance location is Blender x,y,z-up; centerRuntime is x,y-up,z','surfaces':surfaces,'instances':instances,'productionCamera':{'location':[8,4,14],'target':[0,2.5,2],'verticalFovDegrees':48}},indent=2))

# Store the editable, separate-object master before atlas consolidation.
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'art-source/headquarters.blend'))
print('MASTER_SAVED',flush=True)

# Consolidate per atlas group. Source semantics remain in the master/layout manifest.
joined=[]
for group,obs in groups.items():
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs:o.select_set(True)
 bpy.context.view_layer.objects.active=obs[0];bpy.ops.object.join();o=bpy.context.object;o.name='Architecture '+group
 # Copy materials per atlas so each runtime material has one unambiguous lightmap.
 for slot in o.material_slots:
  source=slot.material or plaster;m=source.copy();m.name=source.name+'__'+group;slot.material=m
 if group!='exterior':
  bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=1.15,island_margin=.006,area_weight=.7);bpy.ops.object.mode_set(mode='OBJECT')
  # One shared UV atlas drives both the source color bake and indirect lightmap.
  for bake in ['albedo','indirect']:
   img=bpy.data.images.new(group+' '+bake,2048,2048,alpha=False,float_buffer=True);img.colorspace_settings.name='sRGB' if bake=='albedo' else 'Linear Rec.709'
   for slot in o.material_slots:
    n=slot.material.node_tree.nodes;node=n.new('ShaderNodeTexImage');node.image=img;n.active=node
   s.render.bake.use_pass_color=bake=='albedo';s.render.bake.use_pass_direct=False;s.render.bake.use_pass_indirect=bake=='indirect';s.render.bake.margin=10;s.cycles.samples=1 if bake=='albedo' else 24
   # Indirect includes color so it can be added to PBR radiance in the runtime.
   if bake=='indirect':s.render.bake.use_pass_color=True
   print('BAKE_START',group,bake,flush=True);bpy.ops.object.bake(type='DIFFUSE')
   img.filepath_raw=str(OUT/f'{group}-{bake}.png');img.file_format='PNG';img.save();print('BAKE_SAVED',group,bake,flush=True)
   if bake=='albedo':
    for slot in o.material_slots:
     n=slot.material.node_tree.nodes;node=n.new('ShaderNodeTexImage');node.image=img;slot.material.node_tree.links.new(node.outputs['Color'],n.get('Principled BSDF').inputs['Base Color'])
 joined.append(o)
# Remove unused procedural image nodes from export; runtime lightmaps bind by material suffix.
for o in joined:
 for slot in o.material_slots:
  for n in list(slot.material.node_tree.nodes):
   if n.type=='TEX_IMAGE' and not n.outputs['Color'].is_linked:slot.material.node_tree.nodes.remove(n)
bpy.ops.object.select_all(action='DESELECT')
for o in joined:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'architecture.glb'),export_format='GLB',use_selection=True,export_apply=True,export_animations=False,export_extras=True)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'art-source/headquarters-baked.blend'))

# Geometry/lighting review uses the actual exported source geometry, including the ceiling.
bpy.ops.object.camera_add(location=V([8,4,14]));cam=bpy.context.object;s.camera=cam
s.render.resolution_x=1200;s.render.resolution_y=800;s.render.resolution_percentage=100;s.cycles.samples=24
views=[('arrival',[8,4,14],[0,2.5,2],48),('first-wing',[-17,3,-3],[-19,2,-11],55),('corner-front-left',[-25,4,19],[0,4,0],120),('corner-front-right',[25,4,19],[0,4,0],120),('corner-rear-left',[-25,4,-18],[0,4,0],120),('corner-rear-right',[25,4,-18],[0,4,0],120),('ceiling-up',[0,3,1],[0,9,1.001],100),('ceiling-oblique-a',[-19,2,14],[5,9,-4],95),('ceiling-oblique-b',[19,2,-14],[-5,9,5],95)]
for name,pos,target,fov in views:
 cam.location=V(pos);aim(cam,target);cam.data.type='PERSP';cam.data.angle=math.radians(fov);s.render.filepath=str(E/(name+'.png'));bpy.ops.render.render(write_still=True);print('REVIEW_RENDER',name,flush=True)
report={'buildSource':'art-source/build-headquarters.py','blender':bpy.app.version_string,'fixtureManifest':'game/public/assets/headquarters/fixtures.json','meshGroups':list(groups),'openings':len(openings),'booleansApplied':all(o['booleanApplied'] for o in openings),'renderViews':[v[0] for v in views],'humanApproval':False,'files':{p.name:{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in OUT.iterdir() if p.is_file()}}
(E/'build-report.json').write_text(json.dumps(report,indent=2));print('HEADQUARTERS_BUILD_COMPLETE',flush=True)
