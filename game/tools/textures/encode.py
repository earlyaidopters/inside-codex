from pathlib import Path
import struct,json,hashlib,subprocess,shutil
root=Path(__file__).resolve().parents[3];stage=root/'art-source/texture-compression';out=root/'game/public/assets/headquarters/compressed';tool=Path.home()/'.cache/inside-codex/ktx-4.4.2/expanded/KTX-Software-4.4.2-Darwin-arm64-tools.pkg/Payload/usr/local/bin/toktx'
b=(root/'game/public/assets/headquarters/architecture.glb').read_bytes();jl=struct.unpack_from('<I',b,12)[0];doc=json.loads(b[20:20+jl]);blobStart=20+jl+8;rows=[]
for img in doc['images']:
 v=doc['bufferViews'][img['bufferView']];start=blobStart+v.get('byteOffset',0);data=b[start:start+v['byteLength']];(stage/(img['name']+'.jpg')).write_bytes(data)
for group in ['floor','shell','furnishings']:shutil.copy2(root/f'game/public/assets/headquarters/{group}-indirect.jpg',stage/f'{group}-indirect.jpg')
for source in sorted(stage.glob('*.jpg')):
 dest=out/(source.stem+'.ktx2');transfer='srgb' if source.stem.endswith('albedo') else 'linear';command=[str(tool),'--t2','--encode','uastc','--uastc_quality','4','--zcmp','18','--genmipmap','--assign_oetf',transfer,'--threads','6',str(dest),str(source)];subprocess.run(command,check=True)
 rows.append({'id':source.stem,'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size,'transfer':transfer,'command':command});print(json.dumps(rows[-1]),flush=True)
(stage/'manifest.json').write_text(json.dumps({'sourceArchitectureSha256':hashlib.sha256(b).hexdigest(),'tool':'KTX-Software 4.4.2 toktx','toolSha256':hashlib.sha256(tool.read_bytes()).hexdigest(),'files':rows,'totalBytes':sum(x['bytes'] for x in rows),'resolutionPreserved':True,'rdo':False},indent=2))
