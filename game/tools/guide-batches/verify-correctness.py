from pathlib import Path
import json,hashlib
from PIL import Image,ImageChops
root=Path(__file__).resolve().parents[3];game=root/'game';stage=root/'evidence/production/guide-batches-v1';read=lambda p:json.loads(p.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();build=sha(game/'dist/exhibits-manifest.json')
assert 'pass 4' in (stage/'geometry-final.log').read_text();assert 'fail 0' in (stage/'geometry-final.log').read_text();assert 'pass 77' in (stage/'unit-final.log').read_text() and 'fail 0' in (stage/'unit-final.log').read_text()
for engine in ['chrome','firefox','webkit']:
 r=read(stage/f'frozen-{engine}/report.json');assert r['pass'] and r['buildId']==build and len(r['checks'])==7
r=read(stage/'journey-final/report.json');assert r['pass'] and len(r['checks'])==37
for f in ['context-final/report.json','context-guide-check.json','no-uint.json']:assert read(stage/f)['pass']
r=read(stage/'poses/report.json');assert r['pass'];assert sum(len(q['comparisons']) for q in r['rows'])==128;assert all(c['identical'] for q in r['rows'] for c in q['comparisons'])
old=root/'evidence/production/static-parts-v1/views';new=stage/'frozen-views';before=read(old/'candidate-compressed.json');after=read(new/'candidate-compressed.json');assert after['pass'] and after['buildId']==build;rows=[]
for a,b in zip(before['rows'],after['rows']):
 assert all(a[k]==b[k] for k in ['quality','name','camera','mascot','renderSize'])
 x=Image.open(old/a['filename']).convert('RGB');y=Image.open(new/b['filename']).convert('RGB');assert ImageChops.difference(x,y).getbbox() is None
 rows.append({'quality':a['quality'],'view':a['name'],'identical':True,'beforeDraws':a['audit']['lastFrame']['totalDrawCalls'],'afterDraws':b['audit']['lastFrame']['totalDrawCalls'],'sameActiveTriangles':a['audit']['activeMeshTriangles']==b['audit']['activeMeshTriangles']})
assert len(rows)==10 and all(r['sameActiveTriangles'] for r in rows);(new/'comparison.json').write_text(json.dumps({'pass':True,'buildId':build,'rows':rows},indent=2)+'\n')
before=read(stage/'source-before.json');now={p.relative_to(game).as_posix():sha(p) for p in (game/'src').rglob('*') if p.is_file()};changed=sorted(k for k in set(before)|set(now) if before.get(k)!=now.get(k));assert changed==['src/mascot-detail.ts','src/skinned-guide-batch.ts','src/world.ts']
baseline=read(game/'assets/generated/.game-dev/runs/run_1789063754225_6a04cf9b82ee41df91bfec497c79dde9/traversal.json');assets=[r for r in baseline['inputs'] if r['path'].endswith(('.glb','.ktx2','.env','.png','.jpg','.mp3','.bin.gz','.svg','.woff2','.ttf'))];assert all(sha(game/r['path'])==r['sha256'] for r in assets)
report={'pass':True,'buildId':build,'changedPaths':changed,'sourceSha256':now,'checks':{'unit':77,'geometry':4,'journey':37,'lifecycleEngines':3,'checksPerLifecycle':7,'identicalPosePairs':128,'identicalWorldViews':10,'contextRestore':True,'noUint':True},'unchangedAssetFiles':len(assets),'limits':['Pose-pair renderer coverage preceded input-stream guard and projection-disposal-order repairs; final fixed world views and lifecycle reports match this frozen build.','No native GPU, physical-device, final repeat/soak or hosted acceptance inferred.']};(stage/'pre-capture.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'pass':True,'buildId':build,'checks':report['checks'],'assets':len(assets)}))
