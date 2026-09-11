import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {MeshoptDecoder,MeshoptSimplifier} from 'meshoptimizer';
import fs from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

// Index-only LOD: keep every source vertex, normal, UV, material and transform.
// Meshopt's error is an approximate combined attribute/position metric, not a
// Hausdorff bound. Visual acceptance is a separate browser comparison.
const source='../art-source/texture-delivery/architecture.glb';
const bytes=await fs.readFile(source),sha=b=>createHash('sha256').update(b).digest('hex');
assert.equal(sha(bytes),'705665f178129075ce5d538132e92766f2d5e399357b41fcc4c0bffc5beb33b4');
await Promise.all([MeshoptDecoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const doc=await io.read(source),rows=[],parts=[];let offset=0;
for(const mesh of doc.getRoot().listMeshes())for(const p of mesh.listPrimitives()){
 const material=p.getMaterial().getName(),pos=p.getAttribute('POSITION'),n=pos.getCount(),positions=new Float32Array(n*3);
 const attrs=p.listSemantics().filter(s=>s!=='POSITION').map(s=>p.getAttribute(s)),stride=attrs.reduce((s,a)=>s+a.getElementSize(),0),attributes=new Float32Array(n*stride);
 for(let i=0;i<n;i++){
  positions.set(pos.getElement(i,[]),i*3);let k=0;
  for(const a of attrs){attributes.set(a.getElement(i,[]),i*stride+k);k+=a.getElementSize();}
 }
 const original=new Uint32Array(p.getIndices().getArray());
 const eligible=/__(shell|furnishings)$/.test(material)&&original.length>=6000;
 const [indices,error]=eligible?MeshoptSimplifier.simplifyWithAttributes(original,positions,3,attributes,stride,Array(stride).fill(1),null,Math.floor(original.length*.5/3)*3,.0003,['LockBorder']):[original,0];
 assert(indices.length>0&&indices.length%3===0&&indices.length<=original.length);
 assert(indices.every(v=>v<n));
 const packed=Buffer.alloc(indices.length*4);indices.forEach((v,i)=>packed.writeUInt32LE(v,i*4));parts.push(packed);
 rows.push({material,vertices:n,originalIndices:original.length,offset,count:indices.length,error});offset+=indices.length;
}
assert.equal(new Set(rows.map(r=>r.material)).size,rows.length);
const header=Buffer.from(JSON.stringify({version:1,sourceSha256:sha(bytes),rows}));
const padding=Buffer.alloc((4-header.length%4)%4),prefix=Buffer.alloc(8);prefix.write('ICL1');prefix.writeUInt32LE(header.length,4);
const raw=Buffer.concat([prefix,header,padding,...parts]),packed=gzipSync(raw,{level:9});
const name=`architecture-balanced-${sha(packed).slice(0,12)}.bin.gz`;
await fs.writeFile(`public/assets/headquarters/streamed/${name}`,packed);
const report={source,sourceSha256:sha(bytes),asset:name,sha256:sha(packed),bytes:packed.length,rawBytes:raw.length,before:rows.reduce((s,r)=>s+r.originalIndices/3,0),after:rows.reduce((s,r)=>s+r.count/3,0),recipe:{library:'meshoptimizer 1.2.0',ratio:.5,error:.0003,attributeWeights:1,flags:['LockBorder'],scope:'shell/furnishings primitives >= 2000 triangles; index-only'},rows};
await fs.writeFile('../evidence/production/architecture-detail-v1/geometry.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,rows:undefined}));
