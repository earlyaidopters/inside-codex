import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {stripTypeScriptTypes} from 'node:module';
import {Mesh} from '@babylonjs/core/Meshes/mesh.js';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine.js';import {Scene} from '@babylonjs/core/scene.js';import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder.js';import {TransformNode} from '@babylonjs/core/Meshes/transformNode.js';import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial.js';import {Vector3} from '@babylonjs/core/Maths/math.vector.js';import {ActionManager} from '@babylonjs/core/Actions/actionManager.js';
let source=await fs.readFile(new URL('../../src/static-parts.ts',import.meta.url),'utf8');source=source.replace(/from '(@babylonjs\/[^']+)'/g,(_,id)=>`from '${import.meta.resolve(id+'.js')}'`);
const {batchStaticParts}=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64'));
function fixture(){const engine=new NullEngine(),scene=new Scene(engine);scene.useRightHandedSystem=true;const root=new TransformNode('root',scene);root.position.set(-21.4,0,-10);const material=new StandardMaterial('finish',scene);const box=(name,x,mat=material)=>{const m=MeshBuilder.CreateBox(name,{width:.065,height:1.27,depth:.16},scene);m.parent=root;m.position.set(x,2.24,.025);m.material=mat;m.isPickable=false;return m;};return {engine,scene,root,material,box,close:()=>{scene.dispose();engine.dispose();}};}
const points=m=>{m.computeWorldMatrix(true);const p=m.getVerticesData('position'),out=[];for(let i=0;i<p.length;i+=3)out.push(...Vector3.TransformCoordinates(Vector3.FromArray(p,i),m.getWorldMatrix()).asArray());return out;};
test('batches preserve world geometry, normals, UVs, indices, material and root ownership',()=>{
 const f=fixture();try{const a=f.box('left',-.35),b=f.box('right',.35);b.rotation.z=.15;
  const expected=[...points(a),...points(b)],normals=[...a.getVerticesData('normal')],uv=[...a.getVerticesData('uv'),...b.getVerticesData('uv')],indices=a.getTotalIndices()+b.getTotalIndices();
  const batch=batchStaticParts(f.root,[a,b],'test');assert.equal(batch.length,1);assert.equal(batch[0].parent,f.root);assert.equal(batch[0].material,f.material);assert.equal(batch[0].getTotalIndices(),indices);assert.deepEqual([...batch[0].getVerticesData('uv')],uv);
  assert.deepEqual([...batch[0].getVerticesData('normal')].slice(0,normals.length),normals);const actual=points(batch[0]);assert.equal(actual.length,expected.length);assert(Math.max(...actual.map((v,i)=>Math.abs(v-expected[i])))<.00001);
  assert(a.isDisposed()&&b.isDisposed());f.root.setEnabled(false);assert(!batch[0].isEnabled());f.root.setEnabled(true);assert(batch[0].isEnabled());f.root.dispose();assert(batch[0].isDisposed());
 }finally{f.close();}
});
test('interactive, reflected, translucent and differently configured parts remain separate',()=>{
 const f=fixture();try{const a=f.box('plain',0),b=f.box('action',1),c=f.box('reflected',2),d=f.box('alpha',3,new StandardMaterial('alpha',f.scene)),e=f.box('picked',4);
  b.actionManager=new ActionManager(f.scene);c.scaling.x=-1;d.material.alpha=.5;e.isPickable=true;
  const out=batchStaticParts(f.root,[a,b,c,d,e],'guard');assert.equal(out.length,5);assert(out.every(m=>!m.isDisposed()));
 }finally{f.close();}
});
test('uniform circuit material changes affect the returned batch and preserve source material ownership',()=>{
 const f=fixture();try{const a=f.box('one',0),b=f.box('two',1),next=new StandardMaterial('checked',f.scene),out=batchStaticParts(f.root,[a,b],'circuit');out.forEach(m=>m.material=next);assert.equal(out.length,1);assert.equal(out[0].material,next);assert(f.scene.materials.includes(f.material));}
 finally{f.close();}
});
test('different vertex layouts retain their separate groups',()=>{const f=fixture();try{const a=f.box('one',0),b=f.box('two',1);b.removeVerticesData('uv');assert.equal(batchStaticParts(f.root,[a,b],'attributes').length,2);}finally{f.close();}});

test('oversized groups fall back when 32-bit indices are unavailable',()=>{const f=fixture();try{f.engine.getCaps().uintIndices=false;const parts=['a','b'].map(name=>{const m=new Mesh(name,f.scene);m.parent=f.root;m.material=f.material;m.setVerticesData('position',new Float32Array(40000*3));m.setIndices([0,1,2]);return m;});assert.deepEqual(batchStaticParts(f.root,parts,'large'),parts);assert(parts.every(m=>!m.isDisposed()));}finally{f.close();}});
