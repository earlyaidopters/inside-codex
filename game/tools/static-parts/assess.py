from pathlib import Path
import json,hashlib
root=Path(__file__).resolve().parents[3]; game=root/'game'; stage=root/'evidence/production/static-parts-v1'
read=lambda p:json.loads(p.read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
goal=read(game/'.game-dev/goals/static-exhibit-submissions.json'); assert goal['state']['status']=='met' and len(goal['state']['iterations'])==1
pre=read(stage/'pre-capture.json'); assert all(sha(game/p)==h for p,h in pre['sourceSha256'].items())
runs=[]
for label,scenario in [('high-candidate','active-scenes'),('balanced','active-scenes'),('warm-high','warm-traversal'),('warm-balanced','warm-traversal')]:
 events=[json.loads(l) for l in (stage/f'{label}-run.jsonl').read_text().splitlines()]; result=next(x['data'] for x in events if x['type']=='completed'); path=Path(result['runPath']); assert result['run']['status']=='completed'
 assert sha(path/'run.json')==result['manifestSha256']
 assert read(stage/f'{label}-verify.json')['ok']; metrics=read(stage/f'{label}-summary.json'); assert metrics['ok']
 row={'label':label,'scenario':scenario,'runId':result['run']['runId'],'path':str(path),'manifestSha256':result['manifestSha256'],'metrics':metrics['data']['metrics']}
 if scenario=='active-scenes':
  a=read(path/'scene-audit.json'); profile=read(path/'profile.json'); report=read(path/'report.json'); assert a['pass'] and report['pass'] and len(a['cases'])==85 and len(report['checks'])==37
  row.update(quality=a['quality'],checkpoints=85,frameInventories=850,journeyChecks=37,buildId=profile['buildId'],maxActiveTriangles=max(c['audit']['activeMeshTriangles'] for c in a['cases']),profile={k:profile[k] for k in ['browser','graphics','initialViewport','dpr','workload','powerBefore','powerAfter']})
 else:
  a=read(path/'traversal.json'); assert a['pass']; row.update(quality=a['quality'],buildId=a['buildId'],summary=a['summary'],profile={k:a[k] for k in ['browser','graphics','viewport','dpr','profile','powerBefore','powerAfter']})
 runs.append(row)
assert len({r['buildId'] for r in runs})==1
assert read(stage/'comparability.json')['pass']
views=read(stage/'views/comparison.json'); assert all(r['identical'] for r in views['rows'])
for p in ['browser.json','context/report.json','no-uint.json','journey/report.json']: assert read(stage/p)['pass']
manifest=read(game/'dist/exhibits-manifest.json')
assessment={'pass':True,'scope':'One closed bounded optimization, followed by fixed-build qualifications. No final repeat, soak, native-GPU, physical-device or hosted acceptance inferred.','buildId':sha(game/'dist/exhibits-manifest.json'),'capturedFileSetBuildId':runs[0]['buildId'],'goal':goal,'checks':pre['checks'],'identicalFixedViews':len(views['rows']),'contextRestore':True,'noUintFallback':True,'runs':runs,'fullReleaseAccepted':False}
(stage/'assessment.json').write_text(json.dumps(assessment,indent=2)+'\n')
for r in runs: print(r['label'],r.get('summary',{}),[(m['metric'],m['max']) for m in r['metrics']])
