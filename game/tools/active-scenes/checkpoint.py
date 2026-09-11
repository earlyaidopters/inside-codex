from pathlib import Path
import json,hashlib,zipfile

root=Path(__file__).resolve().parents[3];stage=root/'evidence/production/active-scenes-v1'
assessment=json.loads((stage/'assessment.json').read_text());assert assessment['pass']
archive=root/'releases/checkpoints/active-scenes-v1-source.zip';assert not archive.exists()
paths=[root/p for p in ['game/src/main.ts','game/tests/browser.mjs','game/tests/mobile-atlas.mjs','game/tools/capture-active-scenes.mjs','game/.game-dev/adapter.json',
                      'production/STATUS.md','production/DEFECTS.md','production/ACTIVE-SCENE-COVERAGE.md']]
paths.extend(p for p in stage.iterdir() if p.is_file())
paths.extend(p for p in (stage/'mobile-atlas').rglob('*') if p.is_file())
paths.extend(p for p in (stage/'probe-balanced').glob('*.json'))
paths.extend(p for p in (root/'game/tools/active-scenes').rglob('*') if p.is_file())
rows=[]
with zipfile.ZipFile(archive,'x',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for p in sorted(set(paths)):
        assert not p.is_symlink();name=p.relative_to(root).as_posix();assert '.herenow' not in name
        data=p.read_bytes();rows.append({'path':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()});z.writestr(name,data)
    manifest={'kind':'source/assessment overlay; rebuild dist after restore; sealed capture bundles remain separately preserved at referenced paths',
              'base':'quality-advice-v1-source.zip plus its complete base chain','baseSha256':'fcc40798fa426fea8ecbb3e0dda1f673f0f92d336ab34c1812f3764e0114fe07',
              'buildId':assessment['buildId'],'capturedFileSetBuildId':assessment['capturedFileSetBuildId'],
              'sealedCaptures':[{'runId':r['runId'],'path':r['path'],'manifestSha256':r['manifestSha256']} for r in assessment['runs']],
              'files':rows,'fullReleaseAccepted':False}
    z.writestr('CHECKPOINT-MANIFEST.json',json.dumps(manifest,indent=2))
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    for row in rows:
        data=z.read(row['path']);assert len(data)==row['bytes'] and hashlib.sha256(data).hexdigest()==row['sha256']
receipt={'archive':str(archive.relative_to(root)),'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),
         'filesVerified':len(rows),'base':manifest['base'],'baseSha256':manifest['baseSha256'],'buildId':assessment['buildId'],
         'sealedCaptures':manifest['sealedCaptures'],'fullReleaseAccepted':False}
(root/'evidence/production/checkpoint-active-scenes-v1.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
