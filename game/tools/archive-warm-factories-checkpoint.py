from pathlib import Path
import hashlib,json,zipfile

root=Path('..').resolve();stage=root/'evidence/production/warm-factories-v1'
def read(p):return json.loads(p.read_text())
def digest(data):return hashlib.sha256(data).hexdigest()
def file_sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for chunk in iter(lambda:f.read(1024*1024),b''):h.update(chunk)
 return h.hexdigest()
assessment=read(stage/'assessment.json');assert assessment['evidenceVerified'] and assessment['goalStatus']=='met'
for name in ['journey-final/report.json','views-final/comparison.json','first-frames-final/comparison.json','recovery-diagnostic-detail/report.json']:assert read(stage/name)['pass']
assert 'pass 3' in (stage/'ownership-tests-final.log').read_text()
base_receipt=read(root/'evidence/production/checkpoint-exhibit-residency-v1.json');base=root/base_receipt['archive'];assert file_sha(base)==base_receipt['sha256']
names=set()
for folder in ['game/src','game/public','game/dist','game/tests','game/tools','production','evidence/production/warm-factories-v1','game/.game-dev/goals']:
 names.update(p.relative_to(root).as_posix() for p in (root/folder).rglob('*') if p.is_file())
for run in assessment['runs']:
 names.update(p.relative_to(root).as_posix() for p in Path(run['runPath']).rglob('*') if p.is_file())
manifest_name='evidence/production/warm-factories-v1/delta-manifest.json';names.discard(manifest_name)
for name in names:
 assert not any(p in ['..','.git','node_modules','.herenow','credentials'] or p=='.env' or p.startswith('.env.') for p in Path(name).parts),name
 assert not (root/name).is_symlink(),name
files=[];changed=[]
with zipfile.ZipFile(base) as previous:
 old=set(previous.namelist())
 for name in sorted(names):
  data=(root/name).read_bytes();sha=digest(data);files.append({'path':name,'bytes':len(data),'sha256':sha})
  if name not in old or digest(previous.read(name))!=sha:changed.append(name)
 removed=sorted(n for n in old if n.startswith('game/dist/') and n not in names)
 current_dist={f['path'][5:]:(f['bytes'],f['sha256']) for f in files if f['path'].startswith('game/dist/')}
 measured=read(Path(assessment['runs'][-1]['runPath'])/'traversal.json')['inputs'];assert current_dist=={f['path']:(f['bytes'],f['sha256']) for f in measured}
 manifest={'schema':'inside-codex.delta-checkpoint.v1','baseArchive':base_receipt['archive'],'baseSha256':base_receipt['sha256'],'buildId':assessment['candidateBuildId'],'changedPaths':changed,'removedPaths':removed,'verifiedCurrentFiles':files,'fullReleaseAccepted':False}
 (root/manifest_name).write_text(json.dumps(manifest,indent=2)+'\n')
 archive=root/'releases/checkpoints/warm-factories-v1-delta.zip'
 with zipfile.ZipFile(archive,'x',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
  for name in changed:z.write(root/name,name)
  z.write(root/manifest_name,manifest_name)
  z.writestr('CHECKPOINT-RESTORE.md',f'''# Restore this production checkpoint\n\nThis is a delta archive, not a standalone game package.\n\n1. Verify and extract `{base_receipt['archive']}` into a new, empty recovery directory. Its SHA-256 is `{base_receipt['sha256']}`.\n2. Overlay this archive in that directory.\n3. Remove only the obsolete build paths listed under `removedPaths` in `{manifest_name}`. Then verify every `verifiedCurrentFiles` SHA-256 from that manifest.\n\nThe current source and build are restored on top of the unchanged authored assets and history. Keep the base and delta together. Install dependencies with `npm ci` inside `game/`. This remains a production checkpoint with open release defects, not a community release.\n''')
 with zipfile.ZipFile(archive) as z:
  assert z.testzip() is None
  for f in files:
   data=z.read(f['path']) if f['path'] in changed else previous.read(f['path'])
   assert digest(data)==f['sha256'],f['path']
  assert not(set(removed)&{f['path'] for f in files})
receipt={'pass':True,'archive':archive.relative_to(root).as_posix(),'bytes':archive.stat().st_size,'sha256':file_sha(archive),'baseArchive':base_receipt['archive'],'baseSha256':base_receipt['sha256'],'changedFiles':len(changed),'removedBuildFiles':len(removed),'verifiedOverlayFiles':len(files),'allMeasuredDistHashesVerified':True,'zipIntegrityVerified':True,'fullReleaseAccepted':False,'scope':'Recoverable delta over the verified exhibit-residency checkpoint; both archives are required.'}
(root/'evidence/production/checkpoint-warm-factories-v1.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
