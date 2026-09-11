from pathlib import Path
import zipfile,hashlib,json
root=Path(__file__).resolve().parents[3];stage=root/'evidence/production/static-shadow-v1'
assessment=json.loads((stage/'assessment.json').read_text());assert assessment['pass']
archive=root/'releases/checkpoints/static-shadow-v1-source.zip';assert not archive.exists(), 'Immutable checkpoint exists'
paths=[root/'game/src/world.ts',root/'game/src/static-shadow-batch.ts',root/'game/.game-dev/goals/static-shadow-submissions.json']
paths.extend(root/p for p in ['production/STATUS.md','production/STATIC-SHADOWS.md','production/RELEASE-INTERPRETATION.md','production/DEFECTS.md','production/EXECUTION-CONTRACT.md','GAME-PRODUCTION-PLAN.md'])
for folder in [stage,root/'game/tools/shadows',root/'game/tests/static-shadow']:
 paths.extend(p for p in folder.rglob('*') if p.is_file())
for run in assessment['runs']:
 paths.extend(p for p in Path(run['path']).rglob('*') if p.is_file())
rows=[]
with zipfile.ZipFile(archive,'x',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in sorted(set(paths)):
  assert not p.is_symlink();relative=p.relative_to(root).as_posix();assert '.herenow' not in relative
  b=p.read_bytes();rows.append({'path':relative,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()});z.writestr(relative,b)
 manifest={'kind':'source/evidence overlay; rebuild dist after restore','base':'architecture-detail-v1-source.zip plus its complete base chain','baseSha256':'23d8735f21697761e34c8dc7a30d4cd9ff99d34a5339e8887f7772054579d194','buildId':assessment['buildId'],'files':rows,'fullReleaseAccepted':False}
 z.writestr('CHECKPOINT-MANIFEST.json',json.dumps(manifest,indent=2))
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None
 for row in rows:
  b=z.read(row['path']);assert len(b)==row['bytes'] and hashlib.sha256(b).hexdigest()==row['sha256']
receipt={'archive':str(archive.relative_to(root)),'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'filesVerified':len(rows),'base':manifest['base'],'baseSha256':manifest['baseSha256'],'buildId':assessment['buildId'],'fullReleaseAccepted':False}
(root/'evidence/production/checkpoint-static-shadow-v1.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
