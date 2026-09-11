import validator from 'gltf-validator';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {MeshoptDecoder} from 'meshoptimizer';
import {gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
await MeshoptDecoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const results=[];
for(const path of ['public/assets/headquarters/architecture.glb','public/assets/codex-mascot.glb','public/assets/codex-mascot-balanced.glb']){
 const bytes=await fs.readFile(path);const report=await validator.validateBytes(new Uint8Array(bytes),{uri:path,maxIssues:100});
 let decodedReport;
 if(path.includes('architecture')){
  assert(gunzipSync(await fs.readFile(path+'.gz')).equals(bytes),'Transport sidecar differs from the runtime GLB');
  const d=await io.read(path);for(const e of d.getRoot().listExtensionsUsed())if(e.extensionName==='EXT_meshopt_compression')e.dispose();
  decodedReport=await validator.validateBytes(await io.writeBinary(d),{maxIssues:100});
 }
 results.push({path,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,report,decodedReport,scope:decodedReport?'Raw container plus independently decoded geometry validation. Khronos itself does not validate the meshopt extension; decoded checks supplement that limitation.':'Direct GLB validation.'});
}
await fs.writeFile(process.argv[2]??'../evidence/production/current-assets-validation.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results.map(r=>({path:r.path,bytes:r.bytes,errors:r.report.issues.numErrors,warnings:r.report.issues.numWarnings,decodedErrors:r.decodedReport?.issues.numErrors,decodedWarnings:r.decodedReport?.issues.numWarnings})),null,2));
if(results.some(r=>r.report.issues.numErrors||r.report.issues.numWarnings||r.decodedReport?.issues.numErrors||r.decodedReport?.issues.numWarnings))process.exitCode=1;
