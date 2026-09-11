import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {VertexData} from '@babylonjs/core/Meshes/mesh.vertexData';
import {Matrix} from '@babylonjs/core/Maths/math.vector';
import type {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import type {AbstractMesh} from '@babylonjs/core/Meshes/abstractMesh';

// Callers explicitly select geometry that never moves relative to this root.
// A shared material may change uniformly (the harness circuit); independent
// controls, moving children and separately changing finishes stay separate.
export function batchStaticParts(root:TransformNode,parts:AbstractMesh[],label:string):Mesh[]{
 const scene=root.getScene(),groups=new Map<string,Mesh[]>(),untouched:Mesh[]=[];
 root.computeWorldMatrix(true);if(root.getWorldMatrix().determinant()<=0)return parts.filter((m):m is Mesh=>m instanceof Mesh);const inverse=Matrix.Invert(root.getWorldMatrix());
 const supported=new Set(['position','normal','uv','uv2','color','tangent']);
 for(const part of parts){
  if(!(part instanceof Mesh))continue;
  part.computeWorldMatrix(true);
  if(!part.material||part.actionManager||part.skeleton||part.morphTargetManager||part.instances.length||part.hasThinInstances||part.isUnIndexed||part.getChildren().length||part.isUsingPivotMatrix()||!part.isEnabled()||!part.isVisible||part.visibility!==1||part.subMeshes?.length!==1||!part.isDescendantOf(root)||part.getWorldMatrix().determinant()<=0||part.material.needAlphaBlendingForMesh(part)||part.material.needAlphaTestingForMesh(part)||part.getVerticesDataKinds().some(k=>!supported.has(k))){untouched.push(part);continue;}
  const key=[part.material.uniqueId,part.isPickable,part.receiveShadows,part.sideOrientation,part.layerMask,part.renderingGroupId,part.alphaIndex,part.hasVertexAlpha,part.getVerticesDataKinds().sort().join(',')].join(':');
  const group=groups.get(key)??[];group.push(part);groups.set(key,group);
 }
 for(const parts of groups.values()){
  const vertices=parts.reduce((n,m)=>n+m.getTotalVertices(),0);
  if(parts.length<2||(vertices>65535&&!scene.getEngine().getCaps().uintIndices)){untouched.push(...parts);continue;}
  const originals=parts.map(m=>({name:m.name,vertices:m.getTotalVertices(),triangles:m.getTotalIndices()/3}));
  // Copy all attributes before releasing any source. Keep the owning root so
  // visibility, residency eviction and reconstruction keep their existing scope.
  const data=parts.map(m=>VertexData.ExtractFromMesh(m,true,true).transform(m.getWorldMatrix().multiply(inverse)));
  const merged=data[0].merge(data.slice(1),vertices>65535,true);
  const first=parts[0],batch=new Mesh(`Batch: ${label} / ${first.material!.name}`,scene);
  try{merged.applyToMesh(batch);batch.parent=root;batch.material=first.material;batch.isPickable=first.isPickable;batch.receiveShadows=first.receiveShadows;batch.sideOrientation=first.sideOrientation;batch.layerMask=first.layerMask;batch.renderingGroupId=first.renderingGroupId;batch.alphaIndex=first.alphaIndex;batch.hasVertexAlpha=first.hasVertexAlpha;batch.metadata={staticParts:{sources:originals,triangles:originals.reduce((n,x)=>n+x.triangles,0),coordinateSpace:'root-local'}};
   for(const m of parts)m.dispose(false,false);untouched.push(batch);
  }catch(error){batch.dispose(false,false);throw error;}
 }
 return untouched;
}
