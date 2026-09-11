from pathlib import Path
import json, hashlib

stage=Path(__file__).resolve().parent
root=stage.parents[2]
prior=root/'evidence/production/guide-batches-v1'
read=lambda p:json.loads(p.read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
frozen=read(prior/'pre-capture.json')
assert all(sha(root/'game'/p)==h for p,h in frozen['sourceSha256'].items())
runs=[]
for quality in ['high','balanced']:
 for number in [1,2,3]:
  folder=prior if number==1 else stage
  label=('warm-high' if quality=='high' else 'candidate') if number==1 else f'warm-{quality}-{number}'
  verify=read(folder/(label+'-verify.json'));assert verify['ok']
  data=verify['data'];run=data['run'];path=Path(data['runPath'])
  assert run['status']=='completed' and run['process']['exitCode']==0
  assert sha(path/'run.json')==data['manifestSha256']
  report=read(path/'traversal.json');assert report['pass'] and report['quality']==quality
  summary=report['summary'];high=quality=='high'
  assert summary['medianMs'] <= (16.701 if high else 33.301)
  assert summary['p95Ms'] <= (22 if high else 40)
  assert summary['intervalsOver100ms']==0 and summary['heldRenderFrames']==0
  assert summary['maxTotalDrawCalls'] <= (180 if high else 100)
  assert summary['maxActiveTriangles'] <= (700000 if high else 250000)
  assert summary['maxTextureEstimateBytes'] <= (384000000 if high else 160000000)
  runs.append({'quality':quality,'repeat':number,'runId':run['runId'],'path':str(path),'manifestSha256':data['manifestSha256'],'buildId':report['buildId'],'profile':report['profile'],'viewport':report['viewport'],'dpr':report['dpr'],'browser':report['browser'],'graphics':report['graphics'],'summary':summary,'powerBefore':report['powerBefore'],'powerAfter':report['powerAfter']})
for quality in ['high','balanced']:
 group=[r for r in runs if r['quality']==quality]
 for r in group[1:]:
  for field in ['buildId','profile','viewport','dpr','browser','graphics']:assert r[field]==group[0][field],field
assert len({r['buildId'] for r in runs})==1
cold=[]
for quality,repeat in [('high',1),('balanced',1),('balanced',2),('balanced',3)]:
 suffix='' if repeat==1 else f'-{repeat}'
 data=read(stage/f'cold-{quality}{suffix}-verify.json');assert data['ok'];data=data['data'];run=data['run'];path=Path(data['runPath'])
 assert run['status']=='completed' and run['process']['exitCode']==0 and sha(path/'run.json')==data['manifestSha256']
 report=read(path/'startup.json');assert report['buildId']==runs[0]['buildId']
 ready=report['ready']['observation']['readyAt'];size=report['firstPlayTransferredBytes']
 assert size<=(12000000 if quality=='high' else 8000000)
 assert not report['errors'] and not report['failed']
 cold.append({'quality':quality,'repeat':repeat,'startupTargetMet':ready<=6000,'targetMs':6000,'missMs':max(0,ready-6000),'runId':run['runId'],'path':str(path),'manifestSha256':data['manifestSha256'],'readyMs':ready,'firstPlayTransferredBytes':size,'firstActionAt':report['firstActionAt'],'profile':report['profile'],'limits':report['limits']})
result={'pass':True,'startupTargetAllMet':all(r['startupTargetMet'] for r in cold),'acceptedMinorLimitation':'Balanced cold startup measured 6066–6153 ms in three fixed-build repeats against the proposed 6000 ms target. Retained as a minor 66–153 ms latency miss, without changing the target or claiming compliance. All payload, warm-traversal, scene-budget and functional gates in this assessment pass; the delay does not block readiness or progression. Accepted under plan section 12; no broader network/device timing promise is made.','buildId':frozen['buildId'],'capturedFileSetBuildId':runs[0]['buildId'],'sourceSha256':frozen['sourceSha256'],'traversals':runs,'cold':cold,'scope':'Three comparable warm traversals per quality, plus one High and three Balanced cold-load qualifications on the frozen build. The first traversal per quality comes from the verified guide-batches qualification.','limits':['All measurements are local Mac browser observations. Portrait is emulation; native GPU/physical-device claims are excluded.','Power-state strings are retained; battery charge, OS load and thermal state are uncontrolled.','Cold firstActionAt includes screenshot and automation overhead. ReadyAt is the startup load metric, not an observed novice time-to-action.','The audio-enabled soak, complete release scorecard and hosted acceptance are separate gates.'],'fullReleaseAccepted':False}
(stage/'assessment.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'pass':True,'traversals':len(runs),'cold':cold,'buildId':frozen['buildId']}))
