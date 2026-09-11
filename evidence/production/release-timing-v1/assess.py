from pathlib import Path
import json,hashlib,datetime
stage=Path(__file__).resolve().parent;root=stage.parents[2]
read=lambda p:json.loads(p.read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert read(stage/'completed.json')['runs']==8
records=read(stage/'run-index.json');assert len(records)==8
manifest=read(root/'releases/0.1.0/manifest.json');expected={f['path']:f['sha256'] for f in manifest['files']}
def check_inputs(inputs):
 actual={f['path'].split('/',1)[1]:f['sha256'] for f in inputs};assert actual==expected
warm=[];cold=[];failed=[]
for record in records:
 path=Path(record['runPath']);v=read(stage/(record['label']+'-verify.json'));assert v['ok'];data=v['data'];assert data['run']['status']=='completed' and data['run']['process']['exitCode']==0;assert sha(path/'run.json')==data['manifestSha256']
 high=record['quality']=='high';report=read(path/('traversal.json' if record['scenario']=='warm-traversal' else 'startup.json'));check_inputs(report['inputs']);assert not report['errors'] and not report['failed']
 row={**record,'manifestSha256':data['manifestSha256'],'browser':report['browser'],'graphics':report['graphics'],'viewport':report['viewport'],'dpr':report['dpr'],'profile':report['profile']}
 if record['scenario']=='warm-traversal':
  s=report['summary'];checks={'median':s['medianMs']<=(16.701 if high else 33.301),'p95':s['p95Ms']<=(22 if high else 40),'noOver100ms':s['intervalsOver100ms']==0,'noHeldFrames':s['heldRenderFrames']==0,'draws':s['maxTotalDrawCalls']<=(180 if high else 100),'activeTriangles':s['maxActiveTriangles']<=(700000 if high else 250000),'textureEstimate':s['maxTextureEstimateBytes']<=(384000000 if high else 160000000)}
  row.update(checks=checks,powerBefore=report['powerBefore'],powerAfter=report['powerAfter']);warm.append(row)
  if not all(checks.values()):failed.append({'label':record['label'],'checks':{k:v for k,v in checks.items() if not v}})
 else:
  row.update(startupTargetMs=6000,startupTargetMet=row['readyMs']<=6000,startupMissMs=max(0,row['readyMs']-6000),payloadTargetBytes=12000000 if high else 8000000,payloadTargetMet=row['firstPlayTransferredBytes']<=(12000000 if high else 8000000));cold.append(row)
  if not row['payloadTargetMet']:failed.append({'label':record['label'],'payload':False})
assert len(warm)==6 and len(cold)==2 and len({r['buildId'] for r in records})==1
for quality in ['high','balanced']:
 group=[r for r in warm if r['quality']==quality];assert len(group)==3
 for r in group[1:]:
  for field in ['buildId','profile','viewport','dpr','browser','graphics']:assert r[field]==group[0][field],field
v=read(stage/'soak-verify.json');assert v['ok'];data=v['data'];soak_path=Path(data['runPath']);assert sha(soak_path/'run.json')==data['manifestSha256'];soak=read(soak_path/'soak.json');assert soak['pass'];check_inputs(soak['inputs'])
assert soak['summary']['durationMs']>=1800000 and not soak['errors'] and not soak['failed']
soak_record={'runId':soak_path.name,'runPath':str(soak_path),'manifestSha256':data['manifestSha256'],'summary':soak['summary'],'scope':'Endurance with recorded audio enabled, actual mission changes, screenshots and concurrent QA. Not an isolated frame-time benchmark or headphone listening judgment.'}
all_startup=all(r['startupTargetMet'] for r in cold)
result={'accepted':not failed and all_startup,'technicalChecksPass':not failed,'allStartupTargetsMet':all_startup,'requiresMinorExceptionReview':not all_startup,'date':datetime.datetime.now(datetime.timezone.utc).isoformat(),'fileSetSha256':'d19f5312196c7aad0fa9497cf45c4695de3984ea3c8b896ceb750c0ff5963553','files':len(expected),'capturedTimingBuildId':records[0]['buildId'],'warm':warm,'cold':cold,'soak':soak_record,'failed':failed,'limits':['Local Mac browser measurements; portrait is desktop emulation, not physical mobile qualification.','RAF presentation-loop intervals and runtime texture estimates are not native GPU timings or measured VRAM.','Other internal-browser game tabs were unloaded and the soak was complete before timed runs. OS load, thermals and battery state remain uncontrolled; actual power strings are retained.','Cold proxy models shared 25 Mbps/50 ms transfer to local built preview. It does not predict every hosted internet load.','The 0.001 ms median threshold allowance only accommodates floating-point representation of the 16.7/33.3 ms targets.']}
(stage/'assessment.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'accepted':result['accepted'],'technicalChecksPass':not failed,'allStartupTargetsMet':all_startup,'failures':failed,'cold':[{k:r[k] for k in ['quality','readyMs','firstPlayTransferredBytes','startupMissMs']} for r in cold],'warm':[{'quality':r['quality'],'repeat':r['repeat'],**r['summary']} for r in warm],'soak':soak['summary']},indent=2))
