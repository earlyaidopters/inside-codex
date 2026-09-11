from pathlib import Path
import struct,json,gzip,hashlib,copy
root=Path(__file__).resolve().parents[3];source=root/'game/public/assets/headquarters/architecture.glb';out=root/'game/public/assets/headquarters/streamed';stage=root/'art-source/texture-delivery';out.mkdir(exist_ok=True);stage.mkdir(exist_ok=True)
b=source.read_bytes();jl=struct.unpack_from('<I',b,12)[0];old=json.loads(b[20:20+jl]);doc=copy.deepcopy(old);blob=b[28+jl:28+jl+doc['buffers'][0]['byteLength']];images=doc['images'];assert [x['bufferView'] for x in images]==[0,1,2]
cut=min(v['extensions']['EXT_meshopt_compression']['byteOffset'] for v in doc['bufferViews'][3:] if 'EXT_meshopt_compression' in v.get('extensions',{}));files=[]
for image in images:
 view=doc['bufferViews'][image['bufferView']];assert view['buffer']==0;data=blob[view['byteOffset']:view['byteOffset']+view['byteLength']];dest=out/(image['name']+'.jpg');dest.write_bytes(data);files.append({'path':dest.name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
for v in doc['bufferViews'][3:]:
 if v['buffer']==0:assert v['byteOffset']>=cut;v['byteOffset']-=cut
 ext=v.get('extensions',{}).get('EXT_meshopt_compression')
 if ext and ext['buffer']==0:assert ext['byteOffset']>=cut;ext['byteOffset']-=cut
for a in doc['accessors']:
 if 'bufferView' in a:assert a['bufferView']>=3;a['bufferView']-=3
 assert 'sparse' not in a
for m in doc['materials']:
 pbr=m.get('pbrMetallicRoughness',{});texture=pbr.pop('baseColorTexture',None)
 if texture:assert texture.get('texCoord',0)==0
 assert not any(k.endswith('Texture') for k in m)
 assert not any(k.endswith('Texture') for k in pbr)
doc['bufferViews']=doc['bufferViews'][3:]
for key in ['images','textures','samplers']:doc.pop(key,None)
blob=blob[cut:];doc['buffers'][0]['byteLength']=len(blob)
# Exact encoded geometry bytes, offsets and vertex-accessor declarations survive.
for oldv,newv in zip(old['bufferViews'][3:],doc['bufferViews']):
 oe=oldv.get('extensions',{}).get('EXT_meshopt_compression');ne=newv.get('extensions',{}).get('EXT_meshopt_compression')
 if oe:assert b[28+jl+oe['byteOffset']:28+jl+oe['byteOffset']+oe['byteLength']]==blob[ne['byteOffset']:ne['byteOffset']+ne['byteLength']]
assert old['meshes']==doc['meshes'] and old['nodes']==doc['nodes'] and old.get('scenes')==doc.get('scenes')
raw=json.dumps(doc,separators=(',',':'),ensure_ascii=False).encode();raw+=b' '*((-len(raw))%4);blob+=b'\0'*((-len(blob))%4);encoded=struct.pack('<III',0x46546c67,2,28+len(raw)+len(blob))+struct.pack('<II',len(raw),0x4e4f534a)+raw+struct.pack('<II',len(blob),0x004e4942)+blob
(out/'architecture.glb.gz').write_bytes(gzip.compress(encoded,compresslevel=9,mtime=0));(stage/'architecture.glb').write_bytes(encoded)
receipt={'sourceSha256':hashlib.sha256(b).hexdigest(),'removedEmbeddedPrefixBytes':cut,'rawBytes':len(encoded),'gzipBytes':(out/'architecture.glb.gz').stat().st_size,'geometryEncodedBytesIdentical':True,'nodeMeshDeclarationsIdentical':True,'textureCoordinate':0,'images':files,'glbSha256':hashlib.sha256(encoded).hexdigest(),'gzipSha256':hashlib.sha256((out/'architecture.glb.gz').read_bytes()).hexdigest()};(stage/'geometry-manifest.json').write_text(json.dumps(receipt,indent=2));print(json.dumps(receipt))
