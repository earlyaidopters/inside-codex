from pathlib import Path
import json,hashlib,zipfile,re
root=Path('..').resolve(); evidence=root/'evidence/production'; stage=evidence/'quality-pipeline-v1'
def read(p): return json.loads(p.read_text())
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for block in iter(lambda:f.read(1024*1024),b''):h.update(block)
 return h.hexdigest()
a=read(stage/'assessment.json');assert a['evidenceVerified'] and not a['fullPerformanceAcceptance'];assert len(a['runs'])==2
for p in ['final-views/comparison.json','final-journey/report.json','final-switches/report.json']:assert read(stage/p)['pass']
assert read(stage/'final-memory/report.json')['releaseInvariantPass']
assert 'pass 71' in (stage/'unit-final.log').read_text() and 'fail 0' in (stage/'unit-final.log').read_text()
for f in read(root/'production/rooms/architecture-revision.json')['files']:
 p=root/f['path'];assert p.stat().st_size==f['bytes'] and sha(p)==f['sha256'],f['path']
current=read(Path(a['runs'][-1]['runPath'])/'traversal.json')['inputs']
files=[]
for p in sorted((root/'game/dist').rglob('*')):
 if p.is_file():files.append({'path':p.relative_to(root/'game').as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)})
assert {x['path']:(x['bytes'],x['sha256']) for x in files}=={x['path']:(x['bytes'],x['sha256']) for x in current},'Live dist differs from measured build'
assert not any(x['path'].endswith('-lab.html') for x in files)
manifest=evidence/'dist-quality-pipeline-v1-manifest.json';manifest.write_text(json.dumps({'buildId':a['candidateBuildId'],'files':files},indent=2)+'\n')
previous=root/'releases/checkpoints/traversal-v1-tested.zip'
with zipfile.ZipFile(previous) as z:names={n for n in z.namelist() if not n.startswith('game/dist/') and (root/n).is_file()}
for folder in ['game/src','game/public','game/dist','game/tests','game/tools','production','evidence/production/quality-pipeline-v1','game/.game-dev/goals']:
 names.update(p.relative_to(root).as_posix() for p in (root/folder).rglob('*') if p.is_file())
for run in a['runs']:
 rp=Path(run['runPath']);names.update(p.relative_to(root).as_posix() for p in rp.rglob('*') if p.is_file())
for name in ['game/.game-dev/adapter.json','game/package.json','game/package-lock.json','game/decoder-lab.html','game/mascot-lab.html',manifest.relative_to(root).as_posix()]:
 if (root/name).is_file():names.add(name)
for name in names:
 parts=Path(name).parts;assert not any(x in ['..','.git','node_modules','.herenow','credentials'] or x=='.env' or x.startswith('.env.') for x in parts),name
 assert not name.startswith('releases/'),name
ids=re.findall(r'^\| ([A-Z]+-\d+) \|',(root/'production/DEFECTS.md').read_text(),re.M);assert len(ids)==len(set(ids))
archive=root/'releases/checkpoints/quality-pipeline-v1-tested.zip'
with zipfile.ZipFile(archive,'x',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for name in sorted(names):z.write(root/name,name)
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None
 for f in files:assert hashlib.sha256(z.read('game/'+f['path'])).hexdigest()==f['sha256']
receipt={'pass':True,'archive':archive.relative_to(root).as_posix(),'bytes':archive.stat().st_size,'sha256':sha(archive),'files':len(names),'distFiles':len(files),'allDistHashesVerified':True,'zipIntegrityVerified':True,'activeArchitectureRevisionHashesVerified':True,'performanceReleaseAccepted':False,'knownMemoryReleaseInvariantPass':True,'scope':'Recoverable local graphics-quality ownership checkpoint with recorded open resource budgets. Not a hosted release or full quality acceptance.'}
(evidence/'checkpoint-quality-pipeline-v1.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
