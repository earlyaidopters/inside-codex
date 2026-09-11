import bpy,json,hashlib,os
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent;MASTER=Path(os.environ.get('MASCOT_VERIFY_MASTER',ROOT/'art-source/codex-mascot-traced-glyph-v4.blend'))
bpy.ops.wm.open_mainfile(filepath=str(MASTER))
expected={'Idle','Greet','Beckon','Point','PointLeft','Inspect','Think','Celebrate','Correct','Wait','Travel','Return'}
assert {a.name for a in bpy.data.actions}==expected
assert all(a.use_fake_user for a in bpy.data.actions)
meshes=[]
for o in bpy.context.scene.objects:
 if o.type!='MESH':continue
 assert o.parent and o.parent.name=='Codex character rig'
 for v in o.data.vertices:assert len(v.groups)==1 and abs(v.groups[0].weight-1)<.000001,(o.name,v.index)
 meshes.append({'name':o.name,'vertices':len(o.data.vertices),'groups':[g.name for g in o.vertex_groups]})
assert len(meshes)==17
report={'pass':True,'master':str(MASTER.relative_to(ROOT)),'masterSha256':hashlib.sha256(MASTER.read_bytes()).hexdigest(),'actions':[{'name':a.name,'retainedOnSave':a.use_fake_user,'range':list(a.frame_range)} for a in bpy.data.actions],'meshes':meshes,'scope':'Reopened saved authoring master. Twelve persistent actions and complete rigid skin weights on all 17 meshes; no renderer or cross-engine claim.'}
Path(os.environ.get('MASCOT_VERIFY_REPORT',ROOT/'evidence/production/mascot-v4/master-verification.json')).write_text(json.dumps(report,indent=2));print('MASTER_VERIFIED',len(meshes),len(expected),flush=True)
