import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {VertexData} from '@babylonjs/core/Meshes/mesh.vertexData';
import {VertexBuffer} from '@babylonjs/core/Buffers/buffer';
import {Matrix,Vector3} from '@babylonjs/core/Maths/math.vector';
import type {AbstractMesh} from '@babylonjs/core/Meshes/abstractMesh';
import type {Scene} from '@babylonjs/core/scene';
import type {ShadowGenerator} from '@babylonjs/core/Lights/Shadows/shadowGenerator';

// Only permanently visible, opaque, unskinned world fixtures belong here.
// The original meshes remain the main-pass and directional projection sources.
export function batchStaticShadows(scene:Scene,shadow:ShadowGenerator,candidates:AbstractMesh[]){
 // Large merged streams exceed 65,535 vertices. Keep the exact original path
 // when a WebGL 1 device lacks OES_element_index_uint; never truncate indices.
 if(!scene.getEngine().getCaps().uintIndices)return {state:()=>({batches:[],drawsSaved:0,additionalBufferBytes:0,projectionUsesOriginalBounds:true,reason:'32-bit element indices unavailable'})};
 const map=shadow.getShadowMap()!;
 const originalList=[...(map.renderList??[])];
 const groups=new Map<string,Mesh[]>();
 for(const mesh of candidates){
  if(!(mesh instanceof Mesh)||!originalList.includes(mesh)||!mesh.getTotalIndices())continue;
  const m=mesh.material;
  if(!m||mesh.skeleton||mesh.morphTargetManager||mesh.hasThinInstances||mesh.instances.length||m.needAlphaTestingForMesh(mesh)||m.needAlphaBlendingForMesh(mesh)||mesh.visibility!==1)continue;
  mesh.computeWorldMatrix(true);
  // Reflected/cull-sensitive geometry remains on its original draw path.
  if(mesh.getWorldMatrix().determinant()<=0)continue;
  const key=JSON.stringify([m.backFaceCulling,m.cullBackFaces,m.sideOrientation,mesh.sideOrientation]);
  const group=groups.get(key)??[];group.push(mesh);groups.set(key,group);
 }
 const batches:Array<{mesh:Mesh;sources:Mesh[];offsets:number[];refs:ReturnType<Mesh['getIndices']>[];vertexBytes:number;refreshes:number}>=[];
 for(const sources of groups.values()){
  if(sources.length<2)continue;
  const positions:number[]=[],normals:number[]=[],offsets:number[]=[];
  for(const source of sources){
   const p=source.getVerticesData(VertexBuffer.PositionKind)!,n=source.getVerticesData(VertexBuffer.NormalKind)!;
   if(!p||!n||p.length!==n.length)throw Error('Static shadow source requires positions and normals');
   offsets.push(positions.length/3);const world=source.getWorldMatrix(),normalMatrix=Matrix.Identity();world.toNormalMatrix(normalMatrix);
   for(let i=0;i<p.length;i+=3){positions.push(...Vector3.TransformCoordinates(Vector3.FromArray(p,i),world).asArray());normals.push(...Vector3.TransformNormal(Vector3.FromArray(n,i),normalMatrix).normalize().asArray());}
  }
  const mesh=new Mesh(`Static shadow batch ${batches.length+1}`,scene),data=new VertexData();
  data.positions=new Float32Array(positions);data.normals=new Float32Array(normals);data.applyToMesh(mesh);
  mesh.material=sources[0].material;mesh.sideOrientation=sources[0].sideOrientation;
  // Custom RTT render lists bypass layer masks; the main camera excludes zero.
  mesh.layerMask=0;mesh.isPickable=false;mesh.receiveShadows=false;
  batches.push({mesh,sources,offsets,refs:[],vertexBytes:(positions.length+normals.length)*4,refreshes:0});
 }
 function refresh(){
  for(const batch of batches){
   const refs=batch.sources.map(m=>m.getIndices());
   if(refs.every((r,i)=>r===batch.refs[i]))continue;
   const indices=new Uint32Array(refs.reduce((n,r)=>n+r!.length,0));let offset=0;
   refs.forEach((r,j)=>{for(let i=0;i<r!.length;i++)indices[offset++]=r![i]+batch.offsets[j];});
   batch.mesh.setIndices(indices);batch.refs=refs;++batch.refreshes;
  }
 }
 refresh();
 const sourceBatch=new Map(batches.flatMap(b=>b.sources.map(s=>[s,b.mesh] as const)));
 const inserted=new Set<Mesh>();map.renderList=originalList.flatMap(source=>{
  const batch=sourceBatch.get(source as Mesh);if(!batch)return [source];
  if(inserted.has(batch))return [];inserted.add(batch);return [batch];
 });
 const sourcesByBatch=new Map(batches.map(b=>[b.mesh,b.sources]));
 const light=shadow.getLight(),originalProjection=light.setShadowProjectionMatrix;
 // Preserve the exact original bounds calculation. A merged AABB alone could
 // enlarge the light frustum and shift every shadow texel in the room.
 const projection:typeof originalProjection=function(matrix,view,list){
  return originalProjection.call(light,matrix,view,list.flatMap(m=>sourcesByBatch.get(m as Mesh)??[m]));
 };
 light.setShadowProjectionMatrix=projection;
 const observer=scene.onBeforeRenderObservable.add(refresh);
 scene.onDisposeObservable.addOnce(()=>{scene.onBeforeRenderObservable.remove(observer);if(light.setShadowProjectionMatrix===projection)light.setShadowProjectionMatrix=originalProjection;});
 return {state:()=>({batches:batches.map(b=>({id:b.mesh.uniqueId,sources:b.sources.map(s=>s.uniqueId),triangles:b.mesh.getTotalIndices()/3,sourceTriangles:b.sources.reduce((n,s)=>n+s.getTotalIndices()/3,0),vertexBytes:b.vertexBytes,indexBytes:b.mesh.getTotalIndices()*4,refreshes:b.refreshes,layerMask:b.mesh.layerMask})),drawsSaved:batches.reduce((n,b)=>n+b.sources.length-1,0),additionalBufferBytes:batches.reduce((n,b)=>n+b.vertexBytes+b.mesh.getTotalIndices()*4,0),projectionUsesOriginalBounds:true})};
}
