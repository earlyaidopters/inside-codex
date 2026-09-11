import type {ArcRotateCamera} from '@babylonjs/core/Cameras/arcRotateCamera';
import {visibilityIndex} from './tour-camera.mjs';
type Box={id:string;min:number[];max:number[]};
type Pose={alpha:number;beta:number;radius:number;x:number;y:number;z:number};

/** Keep the orbit on the room side of authored walls and solid furnishings.
 * The 35 cm reserve includes the near plane. Clear views are left unchanged;
 * there is no per-frame mesh raycast or geometry/render-quality modification.
 */
export function createCameraClearance(camera:ArcRotateCamera,boxes:Box[]){
 const index=visibilityIndex(boxes);let last:Pose|undefined,safe:Pose|undefined;
 let adjustments=0,blocked:string|null=null;
 const pose=():Pose=>({alpha:camera.alpha,beta:camera.beta,radius:camera.radius,x:camera.target.x,y:camera.target.y,z:camera.target.z});
 const sameTarget=(a:Pose,b:Pose)=>a.x===b.x&&a.y===b.y&&a.z===b.z;
 const same=(a:Pose,b:Pose)=>sameTarget(a,b)&&a.alpha===b.alpha&&a.beta===b.beta&&a.radius===b.radius;
 function constrain(){
  const current=pose();if(last&&same(current,last))return;
  camera.getViewMatrix(true);
  const hit=index.firstHit(camera.target.asArray(),camera.position.asArray(),.35);
  blocked=hit?.id??null;
  if(hit){
   const radius=current.radius*hit.t-.05;
   if(radius>=(camera.lowerRadiusLimit??5)){
    camera.radius=radius;camera.inertialRadiusOffset=0;adjustments++;
   }else if(safe&&sameTarget(current,safe)){
    camera.alpha=safe.alpha;camera.beta=safe.beta;camera.radius=safe.radius;
    camera.inertialAlphaOffset=0;camera.inertialBetaOffset=0;camera.inertialRadiusOffset=0;adjustments++;
   }
   camera.getViewMatrix(true);
  }
  last=pose();
  if(!index.firstHit(camera.target.asArray(),camera.position.asArray(),.30))safe=last;
 }
 return {constrain,reset:()=>{last=undefined;safe=undefined;blocked=null;},state:()=>({adjustments,blocked,marginMeters:.35,scope:'Authored conservative interior bounds with wall openings; orbit clearance, not a free-walking physics system.'})};
}
