from pathlib import Path
from PIL import Image,ImageChops
import json,hashlib,zipfile

root=Path(__file__).resolve().parents[3];stage=root/'evidence/production/quality-advice-v1'
def read(name):
    data=json.loads((stage/name).read_text());assert data['pass'],name;return data
browser=read('browser.json');assert len(browser['rows'])==3 and all(r['pass'] for r in browser['rows'])
journey=read('journey/report.json');assert len(journey['checks'])==37
for name,n in [('unit.log',76),('monitor.log',3),('unit-advice.log',5)]:assert f'pass {n}' in (stage/name).read_text()
views=read('views/candidate-compressed.json');assert len(views['rows'])==10
baseline=root/'evidence/production/startup-diagnostics-v1/views'
old=json.loads((baseline/'candidate-compressed.json').read_text());comparisons=[]
for a,b in zip(old['rows'],views['rows']):
    assert (a['quality'],a['name'])==(b['quality'],b['name'])
    first=Image.open(baseline/a['filename']).convert('RGB');second=Image.open(stage/'views'/b['filename']).convert('RGB');assert first.size==second.size
    identical=ImageChops.difference(first,second).getbbox() is None
    comparisons.append({'quality':a['quality'],'view':a['name'],'pixelIdentical':identical});assert identical
build=hashlib.sha256((root/'game/dist/exhibits-manifest.json').read_bytes()).hexdigest()
assessment={'pass':True,'buildId':build,'unit':76,'startupMonitor':3,'sampler':5,'journey':37,'browserEngines':3,'views':comparisons,
            'scope':'Product recommendation correctness; local RAF delay fixture and desktop browser review. No new performance or physical-device acceptance.',
            'fullReleaseAccepted':False}
(stage/'assessment.json').write_text(json.dumps(assessment,indent=2)+'\n')
archive=root/'releases/checkpoints/quality-advice-v1-source.zip';assert not archive.exists()
files=[root/'game/src'/n for n in ['main.ts','world.ts','mascot-detail.ts','architecture-detail.ts','quality-advice.ts']]
files.extend(root/'production'/n for n in ['STATUS.md','QUALITY-ADVICE.md','DEFECTS.md'])
for folder in [stage,root/'game/tools/quality-advice',root/'game/tests/quality-advice']:
    files.extend(p for p in folder.rglob('*') if p.is_file())
rows=[]
with zipfile.ZipFile(archive,'x',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for p in sorted(set(files)):
        assert not p.is_symlink();name=p.relative_to(root).as_posix();assert '.herenow' not in name
        data=p.read_bytes();rows.append({'path':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()});z.writestr(name,data)
    manifest={'kind':'source/evidence overlay; rebuild dist after restore','base':'startup-diagnostics-v1-source.zip plus its complete base chain',
              'baseSha256':'d8baad87ebffe5928e25d843dbcf79b8b21cdbe2d511641a04e3dbb87376d6a8','buildId':build,'files':rows,'fullReleaseAccepted':False}
    z.writestr('CHECKPOINT-MANIFEST.json',json.dumps(manifest,indent=2))
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    for row in rows:
        data=z.read(row['path']);assert len(data)==row['bytes'] and hashlib.sha256(data).hexdigest()==row['sha256']
receipt={'archive':str(archive.relative_to(root)),'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),
         'filesVerified':len(rows),'base':manifest['base'],'baseSha256':manifest['baseSha256'],'buildId':build,'fullReleaseAccepted':False}
(root/'evidence/production/checkpoint-quality-advice-v1.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
