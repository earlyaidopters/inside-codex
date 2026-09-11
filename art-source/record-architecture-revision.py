import bpy,json,hashlib,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent;rooms=ROOT/'production/rooms';master=ROOT/'art-source/headquarters-flat-inlays-wide.blend'
bpy.ops.wm.open_mainfile(filepath=str(master));bpy.context.view_layer.update()
p=rooms/'room-layout.json';old=rooms/'revisions/room-layout-before-inlays.json';old.parent.mkdir(exist_ok=True)
if not old.exists():shutil.copy2(p,old)
layout=json.loads(old.read_text());layout['instances']=[r for r in layout['instances'] if not r['id'].startswith(('Inlaid floor joint','Stage brass inlay','Stage index'))]
o=bpy.data.objects['Architecture floor inlays'];layout['instances'].append({'id':o.name,'group':'floor','purpose':'Flat stone joints, brass rings and engraved stage indices','location':list(o.location),'dimensions':list(o.dimensions)})
layout['sourceRevision']='inlays-v2';layout['sourceMaster']='../../art-source/headquarters-flat-inlays-wide.blend';p.write_text(json.dumps(layout,indent=2))
files=['art-source/headquarters-flat-inlays-wide.blend','art-source/headquarters-flat-inlays-wide-runtime.blend','art-source/headquarters-browser-unquantized.glb','game/public/assets/headquarters/architecture.glb']
revision={'id':'inlays-v2','description':'Preserve the room and baked surfaces; replace raised trim with flat, readable inlays','files':[{'path':f,'bytes':(ROOT/f).stat().st_size,'sha256':hashlib.sha256((ROOT/f).read_bytes()).hexdigest()} for f in files],'frozenPreviousSource':'art-source/headquarters-browser-unquantized-v1.glb','evidence':'evidence/production/floor-study-v1','plans':'production/rooms/plans/inlays-v2'}
(rooms/'architecture-revision.json').write_text(json.dumps(revision,indent=2));print('ARCHITECTURE_REVISION_RECORDED')
