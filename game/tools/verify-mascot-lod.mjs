import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const dir='../evidence/production/mascot-lod-v1',io=new NodeIO().registerExtensions(ALL_EXTENSIONS);
const sources=['public/assets/codex-mascot.glb',`${dir}/balanced.glb`];
assert((await fs.readFile('public/assets/codex-mascot-balanced.glb')).equals(await fs.readFile(sources[1])),'Runtime balanced asset differs from the verified candidate');
const [high,balanced]=await Promise.all(sources.map(p=>io.read(p)));
const raw=await Promise.all(sources.map(async p=>{const b=await fs.readFile(p);return JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());}));
assert.deepEqual(raw[0].materials,raw[1].materials);
const hierarchy=d=>d.nodes.map(n=>({name:n.name,translation:n.translation,rotation:n.rotation,scale:n.scale,matrix:n.matrix,children:(n.children??[]).map(i=>d.nodes[i].name)}));
assert.deepEqual(hierarchy(raw[0]),hierarchy(raw[1]));
const hash=x=>createHash('sha256').update(new Uint8Array(x.buffer,x.byteOffset,x.byteLength)).digest('hex');
const animations=d=>d.getRoot().listAnimations().map(a=>({name:a.getName(),channels:a.listChannels().map(c=>({node:c.getTargetNode().getName(),path:c.getTargetPath(),interpolation:c.getSampler().getInterpolation(),input:hash(c.getSampler().getInput().getArray()),output:hash(c.getSampler().getOutput().getArray())}))}));
const skins=d=>d.getRoot().listSkins().map(s=>({joints:s.listJoints().map(n=>n.getName()),bind:hash(s.getInverseBindMatrices().getArray())}));
assert.deepEqual(animations(high),animations(balanced));assert.equal(animations(balanced).length,12);assert.deepEqual(skins(high),skins(balanced));
const nodes=d=>d.getRoot().listNodes().filter(n=>n.getMesh());
assert.deepEqual(nodes(high).map(n=>n.getName()).sort(),nodes(balanced).map(n=>n.getName()).sort());
const rows=[];
for(const n of nodes(balanced)){
 const original=nodes(high).find(x=>x.getName()===n.getName()),a=n.getMesh().listPrimitives()[0],b=original.getMesh().listPrimitives()[0];
 assert.deepEqual(n.getMatrix(),original.getMatrix());assert.equal(a.getMaterial().getName(),b.getMaterial().getName());
 const reduced=/ finger | palm| thumb| wrist/.test(n.getName());
 if(!reduced){for(const s of a.listSemantics())assert.deepEqual(a.getAttribute(s).getArray(),b.getAttribute(s).getArray(),`${n.getName()} ${s}`);assert.deepEqual(a.getIndices().getArray(),b.getIndices().getArray());}
 else {
  assert.equal(a.getIndices().getCount(),b.getIndices().getCount()/2);
  const j=a.getAttribute('JOINTS_0').getArray(),w=a.getAttribute('WEIGHTS_0').getArray(),expectedJoint=b.getAttribute('JOINTS_0').getArray()[0];
  for(let i=0;i<w.length;i+=4){assert.deepEqual([...w.slice(i,i+4)],[1,0,0,0]);assert.equal(j[i],expectedJoint);}
 }
 rows.push({name:n.getName(),reduced,highTriangles:b.getIndices().getCount()/3,balancedTriangles:a.getIndices().getCount()/3});
}
assert.equal(rows.filter(r=>r.reduced).length,12);
const report={pass:true,scope:'All animation samplers, inverse binds, node hierarchy/transforms, material definitions and five unchanged mesh primitives match exactly. Twelve hand parts have half the triangles and retain the original full rigid bone influence.',sources:await Promise.all(sources.map(async path=>{const bytes=await fs.readFile(path);return {path,bytes:bytes.length,sha256:hash(bytes)};})),animations:animations(balanced),meshes:rows};
await fs.writeFile(`${dir}/data-verification.json`,JSON.stringify(report,null,2));console.log(JSON.stringify({pass:true,meshes:rows.length,reduced:12,highTriangles:rows.reduce((n,r)=>n+r.highTriangles,0),balancedTriangles:rows.reduce((n,r)=>n+r.balancedTriangles,0)}));
