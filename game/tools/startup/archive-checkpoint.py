from pathlib import Path
import zipfile, hashlib, json

root=Path(__file__).resolve().parents[3]
stage=root/'evidence/production/startup-diagnostics-v1'
assessment=json.loads((stage/'assessment.json').read_text());assert assessment['pass']
archive=root/'releases/checkpoints/startup-diagnostics-v1-source.zip'
assert not archive.exists(), 'Immutable checkpoint exists'
relative=['game/src/main.ts','game/src/world.ts','game/src/exhibit-residency.ts','game/src/startup.ts','game/src/world-module.ts',
          'game/tests/startup-recovery.mjs','game/tools/startup-compare-views.py',
          'production/STATUS.md','production/STARTUP-RECOVERY.md','production/DEFECTS.md','production/RELEASE-INTERPRETATION.md']
paths=[root/p for p in relative]
for folder in [stage,root/'game/tests/startup-diagnostics',root/'game/tools/startup']:
    paths.extend(p for p in folder.rglob('*') if p.is_file())
rows=[]
with zipfile.ZipFile(archive,'x',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for p in sorted(set(paths)):
        assert not p.is_symlink()
        name=p.relative_to(root).as_posix();assert '.herenow' not in name
        data=p.read_bytes();rows.append({'path':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()});z.writestr(name,data)
    manifest={'kind':'source/evidence overlay; rebuild dist after restore',
              'base':'static-shadow-v1-source.zip plus its complete base chain',
              'baseSha256':'afa5d6347443ddf05e840a740750857bc0b7e126eef3248a3760049e325935dd',
              'buildId':assessment['buildId'],'files':rows,'fullReleaseAccepted':False}
    z.writestr('CHECKPOINT-MANIFEST.json',json.dumps(manifest,indent=2))
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    for row in rows:
        data=z.read(row['path']);assert len(data)==row['bytes'] and hashlib.sha256(data).hexdigest()==row['sha256']
receipt={'archive':str(archive.relative_to(root)),'bytes':archive.stat().st_size,
         'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'filesVerified':len(rows),
         'base':manifest['base'],'baseSha256':manifest['baseSha256'],'buildId':assessment['buildId'],'fullReleaseAccepted':False}
(root/'evidence/production/checkpoint-startup-diagnostics-v1.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt))
