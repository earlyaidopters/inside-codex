import {gzipSync,gunzipSync} from 'node:zlib';
import {NodeIO} from '@gltf-transform/core';
import {reorder} from '@gltf-transform/functions';
import {ALL_EXTENSIONS,EXTMeshoptCompression} from '@gltf-transform/extensions';
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import validator from 'gltf-validator';
const dir=process.env.ARCHITECTURE_OUTPUT_DIR??'../evidence/production/startup-v1';
await fs.mkdir(dir,{recursive:true});
const reordered=process.argv.includes('--reorder'),suffix=reordered?'-v2':'';
const source=process.env.ARCHITECTURE_SOURCE??'../evidence/production/startup-v1/baseline/architecture.glb',output=`${dir}/architecture-meshopt${suffix}.glb`;
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const before=await io.read(source);assert(!before.getRoot().listExtensionsUsed().some(e=>e.extensionName==='EXT_meshopt_compression'),'Use an uncompressed source, not a previously compressed output');
// QUANTIZE selects unfiltered encoding here. No new quantization or
// simplification is applied. Optional reordering changes storage order only.
if(reordered)await before.transform(reorder({encoder:MeshoptEncoder,target:'size'}));
before.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
await io.write(output,before);
const original=await io.read(source),decoded=await io.read(output);
const digest=b=>createHash('sha256').update(b).digest('hex');
const arrays=a=>new Uint8Array(a.buffer,a.byteOffset,a.byteLength);
const nodeRows=d=>d.getRoot().listNodes().map(n=>({name:n.getName(),matrix:n.getMatrix(),children:n.listChildren().map(c=>c.getName()),mesh:n.getMesh()?.getName()}));
assert.deepEqual(nodeRows(original),nodeRows(decoded));
const triKey=(a,b,c)=>a<=b&&a<=c?[a,b,c]:b<=a&&b<=c?[b,c,a]:[c,a,b];
function orientedCorners(primitive){
 const semantics=primitive.listSemantics().sort(),attributes=semantics.map(s=>primitive.getAttribute(s)),keys=[];
 for(let i=0;i<attributes[0].getCount();i++)keys.push(Buffer.concat(attributes.map(a=>{const v=a.getArray(),stride=a.getElementSize()*v.BYTES_PER_ELEMENT;return Buffer.from(v.buffer,v.byteOffset+i*stride,stride);})).toString('hex'));
 const ix=primitive.getIndices().getArray(),triangles=[];
 for(let i=0;i<ix.length;i+=3)triangles.push(triKey(keys[ix[i]],keys[ix[i+1]],keys[ix[i+2]]).join('|'));
 return triangles.sort();
}
const verified=[];let triangles=0;
const originalMeshes=original.getRoot().listMeshes(),newMeshes=decoded.getRoot().listMeshes();assert.equal(newMeshes.length,originalMeshes.length);
for(let m=0;m<originalMeshes.length;m++){
 const beforePrimitives=originalMeshes[m].listPrimitives(),afterPrimitives=newMeshes[m].listPrimitives();assert.equal(beforePrimitives.length,afterPrimitives.length);
 for(let i=0;i<beforePrimitives.length;i++){
  const a=beforePrimitives[i],b=afterPrimitives[i];assert.equal(a.getMode(),b.getMode());assert.equal(a.getMaterial().getName(),b.getMaterial().getName());assert.deepEqual(a.listSemantics(),b.listSemantics());
  for(const semantic of a.listSemantics()){
   const x=a.getAttribute(semantic),y=b.getAttribute(semantic);assert.equal(x.getComponentType(),y.getComponentType());assert.equal(x.getNormalized(),y.getNormalized());if(!reordered)assert.deepEqual(arrays(x.getArray()),arrays(y.getArray()),`${originalMeshes[m].getName()} ${i} ${semantic}`);
  }
  const x=a.getIndices().getArray(),y=b.getIndices().getArray();assert.equal(x.length,y.length);
  // The triangle codec may cyclically rotate a triangle's first corner.
  // Check every oriented triangle in order, preserving winding and attributes.
  if(reordered)assert.deepEqual(orientedCorners(a),orientedCorners(b),`${originalMeshes[m].getName()} ${i} oriented corner bytes changed`);
  else for(let j=0;j<x.length;j+=3)assert.deepEqual(triKey(...x.slice(j,j+3)),triKey(...y.slice(j,j+3)));
  triangles+=x.length/3;verified.push({mesh:originalMeshes[m].getName(),primitive:i,triangles:x.length/3,attributes:a.listSemantics()});
 }
}
const textureRows=d=>d.getRoot().listTextures().map(t=>({name:t.getName(),mime:t.getMimeType(),sha256:digest(t.getImage())}));assert.deepEqual(textureRows(original),textureRows(decoded));
const [beforeJSON,afterJSON]=await Promise.all([io.writeJSON(original),io.writeJSON(decoded)]);assert.deepEqual(beforeJSON.json.materials,afterJSON.json.materials);
decoded.getRoot().listExtensionsUsed().find(e=>e.extensionName==='EXT_meshopt_compression').dispose();
const decodedBytes=await io.writeBinary(decoded);await fs.writeFile(`${dir}/architecture-decoded${suffix}.glb`,decodedBytes);
const check=await validator.validateBytes(decodedBytes,{maxIssues:100});assert.equal(check.issues.numErrors,0);assert.equal(check.issues.numWarnings,0);
const sourceBytes=await fs.readFile(source),outputBytes=await fs.readFile(output),report={pass:true,method:reordered?'Reorder triangle/vertex storage for transmission, then Meshopt encode without new quantization or simplification. All oriented triangle corner attribute bytes compared as multisets.':'Meshopt encoding without any new quantization, reorder or simplification. Triangle codec cyclic rotations verified with winding retained.',source:{path:source,bytes:sourceBytes.length,sha256:digest(sourceBytes)},output:{path:output,bytes:outputBytes.length,sha256:digest(outputBytes)},triangles,primitives:verified,textures:textureRows(decoded),decodedKhronos:check,scope:'All referenced vertex attribute bytes, node transforms/hierarchy, materials and image bytes retained. Every oriented triangle is equal after decoding; optional reordering changes storage order only. Does not by itself establish browser decoder compatibility.'};
await fs.writeFile(`${dir}/compression-verification${suffix}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify({pass:true,before:sourceBytes.length,after:outputBytes.length,triangles,primitives:verified.length}));

const packed=gzipSync(outputBytes,{level:9});assert(gunzipSync(packed).equals(outputBytes));await fs.writeFile(output+'.gz',packed);await fs.writeFile(output+'.gz.json',JSON.stringify({pass:true,inputSha256:digest(outputBytes),packedSha256:digest(packed),inputBytes:outputBytes.length,packedBytes:packed.length,method:'gzip level 9, byte-identical GLB round trip'},null,2));
