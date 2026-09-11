from pathlib import Path
import hashlib,json,re,zipfile,datetime
release=Path(__file__).resolve().parent;root=release.parents[1]
assert json.loads((root/'evidence/production/release-timing-v1/assessment.json').read_text())['accepted']
archive=release/'inside-codex-0.1.0-source.zip';assert not archive.exists(),'Preserve an existing source archive.'
files=set()
def include(p):
 if p.is_file():files.add(p)
 elif p.is_dir():
  for f in p.rglob('*'):
   if f.is_file() and not f.is_symlink() and not any(part in ['node_modules','.git','.herenow','__pycache__'] for part in f.relative_to(root).parts):files.add(f)
for name in ['README.md','GAME-PRODUCTION-PLAN.md','.gitignore','production','art-source','smoke-test','game/src','game/public','game/tests','game/tools','game/package.json','game/package-lock.json','game/tsconfig.json','game/index.html','game/vite.config.ts','game/.game-dev/adapter.json']:
 include(root/name)
for name in ['release-hosting-v1','release-orbit-v1','release-review-v1','release-qualification-v1','release-timing-v1','guide-batches-v1']:
 include(root/'evidence/production'/name)
for name in ['RELEASE-NOTES.md','PILOT-GUIDE.md','EVIDENCE-INDEX.md','manifest.json','final-host-check.json','package-source.py']:
 include(release/name)
# These historical receipts establish inherited invariants. Entire older PNG
# galleries are not required to rebuild or run the current application.
for name in ['active-scenes-v1','handoff-summary-v1','audio-v1','startup-diagnostics-v1','quality-advice-v1','architecture-textures-v1','mascot-v4','mascot-lod-v1']:
 p=root/'evidence/production'/name
 if p.exists():
  for f in p.rglob('*'):
   if f.is_file() and f.suffix in ['.json','.md','.log']:include(f)
# Retain actual sealed bundles referenced by current release qualification.
runids={'run_1789069138804_1328d7a390da4a399819d21cb9265937','run_1789048295204_f776da21276e498ea69e456c6b6d7af8'}
for f in list(files):
 if any('/'+x+'/' in str(f) for x in ['release-timing-v1','release-orbit-v1','release-qualification-v1','guide-batches-v1']) and f.suffix in ['.json','.jsonl']:
  runids.update(re.findall(r'run_\d+_[a-f0-9]+',f.read_text(errors='replace')))
runs=[]
for rid in sorted(runids):
 p=root/'game/assets/generated/.game-dev/runs'/rid
 if (p/'run.json').exists():
  include(p);runs.append({'runId':rid,'manifestSha256':hashlib.sha256((p/'run.json').read_bytes()).hexdigest(),'path':str(p.relative_to(root))})
key=(Path.home()/'.herenow/credentials').read_bytes().strip()
roster=[]
for f in sorted(files):
 relative=str(f.relative_to(root));assert not any(p in ['.git','.herenow','node_modules'] for p in Path(relative).parts)
 data=f.read_bytes();assert not key or key not in data,'Private credential found in archive candidate: '+relative
 roster.append({'path':relative,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
manifest={'version':'0.1.0','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Standalone application and authored masters, current source captures and selected release evidence. No earlier overlay archive, provider model weights, node_modules or private hosting state is required to rebuild the website. Optional historical diagnostic scripts may refer to older galleries outside this selected evidence set.','files':roster,'sealedRuns':runs}
prefix='inside-codex-0.1.0/'
with zipfile.ZipFile(archive,'x',compression=zipfile.ZIP_DEFLATED,compresslevel=6,allowZip64=True) as z:
 for f in sorted(files):z.write(f,prefix+str(f.relative_to(root)))
 z.writestr(prefix+'SOURCE-MANIFEST.json',json.dumps(manifest,indent=2)+'\n')
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None
 for f in roster:assert hashlib.sha256(z.read(prefix+f['path'])).hexdigest()==f['sha256']
record={'file':archive.name,'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'files':len(roster)+1,'sealedRunBundles':len(runs),'crcAndEveryFileSha256Verified':True,'privateCredentialAbsent':True,'standaloneRebuildEvidence':'evidence/production/release-orbit-v1/clean-build-comparison.json','runtimeRebuildMatchesFrozenDeploy':467}
(release/'source-archive.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record,indent=2))
