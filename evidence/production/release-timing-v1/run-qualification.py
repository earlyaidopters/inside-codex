from pathlib import Path
import json,subprocess,time,datetime,hashlib
stage=Path(__file__).resolve().parent
root=stage.parents[2];game=root/'game'
soak=game/'assets/generated/.game-dev/runs/run_1789069138804_1328d7a390da4a399819d21cb9265937'
def read(p):return json.loads(p.read_text())
def run(args,dest):
 with dest.open('w') as f: subprocess.run(args,cwd=game,stdout=f,stderr=subprocess.STDOUT,check=True)
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
print('Waiting for final-build endurance completion before timing; companion internal-browser game views unloaded.',flush=True)
end=time.monotonic()+1500
while True:
 if (soak/'run.json').exists():
  s=read(soak/'run.json')
  if s.get('status')=='completed':break
  if s.get('status') in ['failed','cancelled']:raise RuntimeError('Endurance did not complete successfully')
 if time.monotonic()>end:raise RuntimeError('Endurance completion not observed within bounded wait')
 time.sleep(10)
assert read(soak/'soak.json')['pass']
run(['game-dev','capture','verify',str(soak),'--json'],stage/'soak-verify.json')
assert read(stage/'soak-verify.json')['ok']
run(['game-dev','performance','summarize',str(soak),'--json'],stage/'soak-summary.json')
records=[]
for scenario,quality,number in [('warm-traversal',q,n) for q in ['high','balanced'] for n in [1,2,3]]+[('cold-startup',q,1) for q in ['high','balanced']]:
 label=('warm' if scenario=='warm-traversal' else 'cold')+'-'+quality+'-'+str(number)
 params=stage/(quality+'-params.json');params.write_text(json.dumps({'quality':quality}))
 print(now(),label,'started',flush=True)
 run(['game-dev','scenario','run',scenario,'--project',str(game),'--request',str(params),'--confirm','--allow-gpu','--allow-performance','--jsonl'],stage/(label+'-run.jsonl'))
 events=[json.loads(l) for l in (stage/(label+'-run.jsonl')).read_text().splitlines() if l.startswith('{')]
 completed=next(e for e in reversed(events) if e.get('type')=='completed');path=Path(completed['data']['runPath'])
 run(['game-dev','capture','verify',str(path),'--json'],stage/(label+'-verify.json'));assert read(stage/(label+'-verify.json'))['ok']
 run(['game-dev','performance','summarize',str(path),'--json'],stage/(label+'-summary.json'))
 report=read(path/('traversal.json' if scenario=='warm-traversal' else 'startup.json'))
 record={'label':label,'runId':path.name,'scenario':scenario,'quality':quality,'repeat':number,'runPath':str(path),'completedAt':now(),'buildId':report['buildId']}
 if scenario=='warm-traversal':record['summary']=report['summary']
 else:record.update(readyMs=report['ready']['observation']['readyAt'],firstPlayTransferredBytes=report['firstPlayTransferredBytes'])
 records.append(record);(stage/'run-index.json').write_text(json.dumps(records,indent=2));print(json.dumps(record),flush=True)
(stage/'completed.json').write_text(json.dumps({'completedAt':now(),'runs':len(records),'scope':'Three comparable 90-second warm traversals per tier and one cold-start per tier, after final-build audio endurance; temporary internal-browser game views unloaded.'},indent=2))
print('Fixed qualification run set completed.',flush=True)
