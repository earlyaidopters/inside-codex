from pathlib import Path
import hashlib,json,zipfile
root=Path('..').resolve();stage=root/'evidence/production/texture-delivery-v1'
def sha(data):return hashlib.sha256(data).hexdigest()
def file_sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
a=json.loads((stage/'assessment.json').read_text());assert a['evidenceVerified'] and a['goalStatus']=='met'
base=json.loads((root/'evidence/production/checkpoint-architecture-textures-v1.json').read_text());assert file_sha(root/base['archive'])==base['sha256']
names=set()
for folder in ['game/src','game/tests','game/tools','game/public/assets/headquarters/compressed','game/public/assets/headquarters/streamed','art-source/texture-delivery','evidence/production/texture-delivery-v1']:
 names.update(p.relative_to(root).as_posix() for p in (root/folder).rglob('*') if p.is_file())
for name in ['production/STATUS.md','production/TEXTURE-DELIVERY.md','production/EXECUTION-CONTRACT.md','game/.game-dev/goals/architecture-startup-delivery.json']:names.add(name)
for run in a['runs']:
 names.update(p.relative_to(root).as_posix() for p in Path(run['runPath']).rglob('*') if p.is_file())
manifest_name='evidence/production/texture-delivery-v1/checkpoint-manifest.json';names.discard(manifest_name)
files=[]
for name in sorted(names):
 p=root/name;assert not p.is_symlink();assert not any(x in ['..','.git','node_modules','.herenow','credentials'] or x=='.env' or x.startswith('.env.') for x in Path(name).parts),name
 b=p.read_bytes();files.append({'path':name,'bytes':len(b),'sha256':sha(b)})
dist=[]
for p in sorted((root/'game/dist').rglob('*')):
 if p.is_file():dist.append({'path':p.relative_to(root).as_posix(),'bytes':p.stat().st_size,'sha256':file_sha(p)})
manifest={'baseArchive':base['archive'],'baseSha256':base['sha256'],'files':files,'testedDist':dist,'rebuildRequired':True,'fullReleaseAccepted':False}
(root/manifest_name).write_text(json.dumps(manifest,indent=2)+'\n')
archive=root/'releases/checkpoints/texture-delivery-v1-source.zip'
with zipfile.ZipFile(archive,'x',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for name in sorted(names):z.write(root/name,name)
 z.write(root/manifest_name,manifest_name)
 z.writestr('CHECKPOINT-RESTORE.md',f"# Texture delivery production checkpoint\n\nRestore the architecture-texture source checkpoint `{base['archive']}` and all of its required bases first, then overlay this archive. Verify the file hashes in `{manifest_name}`. Run npm ci and npm run build inside game/. Old dist contents must be replaced by that build; this source overlay does not ship dist. Private decoder/compiler caches are not required to play the bundled assets. Full community release is not accepted.\n")
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None
 for f in files:assert sha(z.read(f['path']))==f['sha256'],f['path']
receipt={'pass':True,'archive':archive.relative_to(root).as_posix(),'bytes':archive.stat().st_size,'sha256':file_sha(archive),'baseArchive':base['archive'],'baseSha256':base['sha256'],'verifiedFiles':len(files),'scope':'Source, texture/decoder assets and evidence overlay on the architecture-texture checkpoint and its bases; rebuild dist after restore.','fullReleaseAccepted':False}
(root/'evidence/production/checkpoint-texture-delivery-v1.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
