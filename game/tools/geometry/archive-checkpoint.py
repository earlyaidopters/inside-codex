from pathlib import Path
import zipfile,hashlib,json
root=Path(__file__).resolve().parents[3]
stage=root/'evidence/production/architecture-detail-v1'
assessment=json.loads((stage/'assessment.json').read_text())
archive=root/'releases/checkpoints/architecture-detail-v1-source.zip'
assert not archive.exists(), 'Immutable checkpoint already exists'
paths=[root/'game/src/world.ts',root/'game/src/architecture-detail.ts',root/'game/.game-dev/goals/balanced-architecture-detail.json',root/'production/STATUS.md',root/'production/ARCHITECTURE-DETAIL.md',root/'production/EXECUTION-CONTRACT.md',root/'GAME-PRODUCTION-PLAN.md']
for folder in [stage,root/'game/tools/geometry',root/'game/tests/architecture-detail']:
 paths.extend(p for p in folder.rglob('*') if p.is_file())
geometry=json.loads((stage/'geometry.json').read_text());paths.append(root/'game/public/assets/headquarters/streamed'/geometry['asset'])
for rid in [assessment['candidate']['runId'],assessment['startup']['runId']]:
 paths.extend(p for p in (root/'game/assets/generated/.game-dev/runs'/rid).rglob('*') if p.is_file())
paths=sorted(set(paths));rows=[]
with zipfile.ZipFile(archive,'x',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in paths:
  assert not p.is_symlink();relative=p.relative_to(root).as_posix();assert '.herenow' not in relative
  b=p.read_bytes();rows.append({'path':relative,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()});z.writestr(relative,b)
 manifest={'kind':'source/evidence overlay; rebuild dist after restore','base':'texture-delivery-v1-source.zip plus its full base chain','baseSha256':'7dde12d6d744b506223d12825b632d2431aee06f5ba20fec1d6117f403fa94d2','buildId':assessment['buildId'],'files':rows,'fullReleaseAccepted':False}
 z.writestr('CHECKPOINT-MANIFEST.json',json.dumps(manifest,indent=2))
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None
 for row in rows:
  b=z.read(row['path']);assert len(b)==row['bytes'] and hashlib.sha256(b).hexdigest()==row['sha256']
receipt={'archive':str(archive.relative_to(root)),'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'filesVerified':len(rows),'base':manifest['base'],'baseSha256':manifest['baseSha256'],'buildId':assessment['buildId'],'fullReleaseAccepted':False}
(root/'evidence/production/checkpoint-architecture-detail-v1.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt))
