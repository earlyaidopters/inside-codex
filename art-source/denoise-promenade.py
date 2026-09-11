"""Denoise the float architectural bakes before the inspected runtime encoding."""
import bpy,json,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent;OUT=ROOT/'evidence/production/camera-layout-v3/lightmaps';OUT.mkdir(exist_ok=True);SOURCE=ROOT/'art-source/headquarters-lighting-v3'
bpy.ops.wm.read_factory_settings(use_empty=True);s=bpy.context.scene
s.render.engine='CYCLES';s.cycles.samples=1;s.render.resolution_x=2048;s.render.resolution_y=2048;s.render.resolution_percentage=100
bpy.ops.object.camera_add();s.camera=bpy.context.object
s.view_settings.view_transform='Raw';s.view_settings.look='None';s.render.image_settings.file_format='JPEG';s.render.image_settings.quality=95;s.render.image_settings.color_mode='RGB'
tree=bpy.data.node_groups.new('Architectural indirect denoising','CompositorNodeTree');s.compositing_node_group=tree
tree.interface.new_socket(name='Image',in_out='OUTPUT',socket_type='NodeSocketColor')
image=tree.nodes.new('CompositorNodeImage');denoise=tree.nodes.new('CompositorNodeDenoise');output=tree.nodes.new('NodeGroupOutput')
tree.links.new(image.outputs['Image'],denoise.inputs['Image']);tree.links.new(denoise.outputs['Image'],output.inputs['Image'])
for group in ['floor','shell','furnishings']:
 image.image=bpy.data.images.load(str(SOURCE/f'{group}-indirect.png'));image.image.colorspace_settings.name='Linear Rec.709'
 s.render.filepath=str(OUT/f'{group}-indirect.jpg');bpy.ops.render.render(write_still=True);print('DENOISED',group,flush=True)
(ROOT/'evidence/production/camera-layout-v3/lightmap-denoising.json').write_text(json.dumps({'method':'Blender compositor Denoise from original float indirect bake, Raw JPEG95 encoding','inputs':[str(SOURCE/f'{g}-indirect.png') for g in ['floor','shell','furnishings']],'outputs':{p.name:{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in OUT.glob('*-indirect.jpg')}},indent=2))
