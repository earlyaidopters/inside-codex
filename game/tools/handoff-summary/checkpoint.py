from pathlib import Path
import json,hashlib,zipfile
root=Path(__file__).resolve().parents[3]; stage=root/'evidence/production/handoff-summary-v1';read=lambda p:json.loads(p.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
a=read(stage/'assessment.json');assert a['pass'];assert all(sha(root/'game'/p)==h for p,h in a['sourceSha256'].items())
base=read(root/'evidence/production/checkpoint-static-parts-v1.json');assert sha(root/base['archive'])==base['sha256']
archive=root/'releases/checkpoints/handoff-summary-v1-source.zip';assert not archive.exists()
paths=[root/'game'/p for p in a['sourceSha256']]
paths += [root/p for p in ['production/STATUS.md','production/DEFECTS.md','production/HANDOFF-SUMMARY.md','production/RENDER-COST-INVESTIGATION.md']]
for folder in [stage,root/'evidence/production/render-costs-v1',root/'game/tools/handoff-summary',root/'game/tools/render-costs']:
 paths += [p for p in folder.rglob('*') if p.is_file() and '__pycache__' not in p.parts]
rows=[]
with zipfile.ZipFile(archive,'x',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in sorted(set(paths)):
  assert not p.is_symlink();name=p.relative_to(root).as_posix();assert '.herenow' not in name;data=p.read_bytes();rows.append({'path':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()});z.writestr(name,data)
 manifest={'kind':'Source and evidence overlay; rebuild dist after restore','base':base['archive']+' plus its complete base chain','baseSha256':base['sha256'],'buildId':a['buildId'],'files':rows,'fullReleaseAccepted':False};z.writestr('CHECKPOINT-MANIFEST.json',json.dumps(manifest,indent=2))
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None
 for row in rows:
  data=z.read(row['path']);assert len(data)==row['bytes'] and hashlib.sha256(data).hexdigest()==row['sha256']
receipt={'archive':str(archive.relative_to(root)),'bytes':archive.stat().st_size,'sha256':sha(archive),'filesVerified':len(rows),'base':manifest['base'],'baseSha256':base['sha256'],'buildId':a['buildId'],'fullReleaseAccepted':False}
(root/'evidence/production/checkpoint-handoff-summary-v1.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
