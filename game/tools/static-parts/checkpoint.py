from pathlib import Path
import json,hashlib,zipfile
root=Path(__file__).resolve().parents[3]; stage=root/'evidence/production/static-parts-v1'
read=lambda p:json.loads(p.read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
a=read(stage/'assessment.json'); assert a['pass']
base=read(root/'evidence/production/checkpoint-active-scenes-v1.json'); assert sha(root/base['archive'])==base['sha256']
archive=root/'releases/checkpoints/static-parts-v1-source.zip'; assert not archive.exists()
goal=read(root/'game/.game-dev/goals/static-exhibit-submissions.json')
paths=[root/'game'/p for p in goal['allowedPaths'] if p.startswith('src/')]
paths += [root/p for p in ['game/.game-dev/goals/static-exhibit-submissions.json','production/STATUS.md','production/DEFECTS.md','production/STATIC-EXHIBIT-BATCHES.md']]
for folder in [stage,root/'game/tests/static-parts',root/'game/tools/static-parts']:paths += [p for p in folder.rglob('*') if p.is_file() and '__pycache__' not in p.parts]
rows=[]
with zipfile.ZipFile(archive,'x',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in sorted(set(paths)):
  assert not p.is_symlink(); name=p.relative_to(root).as_posix(); assert '.herenow' not in name
  data=p.read_bytes();rows.append({'path':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()});z.writestr(name,data)
 manifest={'kind':'Source and evidence overlay; rebuild dist after restore; sealed capture bundles remain separately preserved at referenced paths','base':base['archive']+' plus its complete base chain','baseSha256':base['sha256'],'buildId':a['buildId'],'capturedFileSetBuildId':a['capturedFileSetBuildId'],'sealedCaptures':[{'runId':r['runId'],'path':r['path'],'manifestSha256':r['manifestSha256']} for r in a['runs']],'files':rows,'fullReleaseAccepted':False}
 z.writestr('CHECKPOINT-MANIFEST.json',json.dumps(manifest,indent=2))
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None
 for row in rows:
  data=z.read(row['path']);assert len(data)==row['bytes'] and hashlib.sha256(data).hexdigest()==row['sha256']
receipt={'archive':str(archive.relative_to(root)),'bytes':archive.stat().st_size,'sha256':sha(archive),'filesVerified':len(rows),'base':manifest['base'],'baseSha256':base['sha256'],'buildId':a['buildId'],'sealedCaptures':manifest['sealedCaptures'],'fullReleaseAccepted':False}
(root/'evidence/production/checkpoint-static-parts-v1.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
