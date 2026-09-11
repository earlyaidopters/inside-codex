import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import {pathToFileURL} from 'node:url';import {stripTypeScriptTypes} from 'node:module';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine.js';import {Scene} from '@babylonjs/core/scene.js';import {ArcRotateCamera} from '@babylonjs/core/Cameras/arcRotateCamera.js';import {Vector3} from '@babylonjs/core/Maths/math.vector.js';import {Mesh} from '@babylonjs/core/Meshes/mesh.js';import {TransformNode} from '@babylonjs/core/Meshes/transformNode.js';import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial.js';import {RawTexture} from '@babylonjs/core/Materials/Textures/rawTexture.js';
// Strip types and resolve the existing package imports to their exact installed
// files; the production algorithm is evaluated unchanged in Babylon's NullEngine.
const source=stripTypeScriptTypes(await fs.readFile('src/exhibit-residency.ts','utf8')).replace(/from '(@babylonjs\/core\/[^']+)'/g,(_,specifier)=>`from '${pathToFileURL(path.resolve('node_modules',specifier+'.js')).href}'`);
const {createExhibitResidency}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
function fixture(){const engine=new NullEngine(),scene=new Scene(engine),camera=new ArcRotateCamera('test',0,1,10,Vector3.Zero(),scene),status=[];const resident=createExhibitResidency(scene,camera,s=>status.push(s));resident.focus(0);return {scene,resident,status,close:()=>{scene.dispose();engine.dispose();}};}
const inventory=s=>[s.meshes.length,s.transformNodes.length,s.materials.length,s.textures.length];
function resources(scene,name){const root=new TransformNode(name,scene),mesh=new Mesh(name+' mesh',scene);mesh.parent=root;const material=new StandardMaterial(name+' material',scene);mesh.material=material;const texture=RawTexture.CreateRGBATexture(new Uint8Array([255,255,255,255]),1,1,scene,false);material.diffuseTexture=texture;return {root,mesh,material,texture};}
function definition(make,load){return {id:'test',station:0,center:Vector3.Zero(),modulePath:'src/test.ts',exportName:'build',load:load??(async()=>({build:()=>{}})),make};}

test('a downloaded factory reconstructs synchronously with latest state and no retained scene allocations',async()=>{
 const f=fixture();try{const outside=resources(f.scene,'outside'),base=inventory(f.scene);let calls=0,imports=0;
 const facade=f.resident.register(definition(()=>{calls++;resources(f.scene,'owned');let value;return {setState:v=>value=v,state:()=>({value})};},async()=>{imports++;return {build:()=>{}};}));
 facade.setState('first');await f.resident.initial();assert.equal(facade.state().value,'first');assert.equal(imports,1);
 for(let n=0;n<5;n++){facade.setEnabled(false);assert.deepEqual(inventory(f.scene),base);assert(!outside.mesh.isDisposed());assert(f.scene.textures.includes(outside.texture));facade.setState('revision '+n);facade.setEnabled(true);f.resident.refresh();assert(f.resident.canRender(),'A cached reconstruction must be ready in the same turn');assert.equal(facade.state().value,'revision '+n);}
 assert.equal(calls,6);assert.equal(imports,1);assert.equal(f.resident.state().heldFrames,0);f.resident.dispose();assert.deepEqual(inventory(f.scene),base);assert(!f.resident.state().entries[0].factoryCached);
 }finally{f.close();}
});

test('cancellation and scene disposal prevent late factories from constructing resources',async()=>{
 for(const destroy of [false,true]){const f=fixture();let release,calls=0;const gate=new Promise(r=>release=r);try{const base=inventory(f.scene);const facade=f.resident.register(definition(()=>{calls++;resources(f.scene,'late');return {setState:()=>{},state:()=>({})};},()=>gate));const preparing=f.resident.initial();if(destroy)f.scene.dispose();else facade.setEnabled(false);release({build:()=>{}});await preparing;assert.equal(calls,0);assert(!f.resident.state().entries[0].loaded);if(!destroy)assert.deepEqual(inventory(f.scene),base);}finally{f.close();}}
});

test('partial synchronous reconstruction failure is contained and frees only its own resources',async()=>{
 const f=fixture();try{resources(f.scene,'outside');const base=inventory(f.scene);let calls=0;const facade=f.resident.register(definition(()=>{resources(f.scene,'partial');if(++calls===2)throw Error('deliberate reconstruction failure');return {setState:()=>{},state:()=>({})};}));await f.resident.initial();facade.setEnabled(false);facade.setEnabled(true);assert.doesNotThrow(()=>f.resident.refresh());assert.deepEqual(inventory(f.scene),base);const entry=f.resident.state().entries[0];assert(!entry.loaded&&!entry.factoryCached);assert.match(entry.error,/deliberate reconstruction failure/);assert(f.status.at(-1).retry);assert(!f.resident.canRender());}finally{f.close();}
});
