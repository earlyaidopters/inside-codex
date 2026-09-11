import {batchStaticParts} from './static-parts';
import {Scene} from '@babylonjs/core/scene';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {Vector3,Matrix} from '@babylonjs/core/Maths/math.vector';
import {Color3} from '@babylonjs/core/Maths/math.color';
import {PBRMaterial} from '@babylonjs/core/Materials/PBR/pbrMaterial';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {DynamicTexture} from '@babylonjs/core/Materials/Textures/dynamicTexture';
import {ActionManager} from '@babylonjs/core/Actions/actionManager';
import {ExecuteCodeAction} from '@babylonjs/core/Actions/directActions';
import {freshReview,reviewPass,runPass} from './review-lab.mjs';

export function buildReviewExhibit(scene:Scene,anchor:Vector3,onAction:(id:string)=>void){
 const root=new TransformNode('Review bench',scene);root.position=anchor.clone();
 const nickel=new PBRMaterial('Review satin nickel',scene);nickel.albedoColor=Color3.FromHexString('#abaeb1');nickel.metallic=.8;nickel.roughness=.32;
 const charcoal=new PBRMaterial('Review graphite housing',scene);charcoal.albedoColor=Color3.FromHexString('#343c39');charcoal.roughness=.35;
 function box(name:string,x:number,y:number,z:number,w:number,h:number,d:number,mat:PBRMaterial){const m=MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);m.parent=root;m.position.set(x,y,z);m.material=mat;m.isPickable=false;return m;}
 function plate(name:string,x:number,y:number,w:number,h:number,tw:number,th:number){const t=new DynamicTexture(name,{width:tw,height:th},scene,true);const m=new StandardMaterial(name+' ink',scene);m.diffuseTexture=t;m.emissiveColor=Color3.White();m.disableLighting=true;m.backFaceCulling=false;const p=MeshBuilder.CreatePlane(name,{width:w,height:h},scene);p.parent=root;p.position.set(x,y,.14);p.material=m;p.isPickable=false;return {texture:t,face:p};}
 box('Review desk base',0,1.52,0,2.62,.13,.64,nickel);
 const sheets=[-1,1].map((side)=>{const x=side*.63;box('Evidence frame '+side,x,2.28,0,1.17,1.38,.18,nickel);box('Evidence bezel '+side,x,2.28,.1,1.08,1.27,.04,charcoal);return plate(side<0?'PROPOSED PATCH':'SAVED REPAIR',x,2.28,1.01,1.18,514,600);});
 const ports=['diff','checks','repair'].map((id,i)=>{const x=(i-1)*.87;box('Review selector support '+id,x,3.02,0,.035,.36,.035,nickel);const p=plate('Review '+id,x,3.22,.8,.36,512,230);p.face.isPickable=true;p.face.actionManager=new ActionManager(scene);p.face.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger,()=>onAction(id)));return {id,...p};});
 const scanMat=new PBRMaterial('Review scanner light',scene);scanMat.albedoColor=Color3.FromHexString('#afa0ca');scanMat.emissiveColor=Color3.FromHexString('#554073');scanMat.roughness=.25;
 const scanner=box('Evidence scan bar',0,2.28,.22,.035,1.16,.035,scanMat);scanner.isVisible=false;
 batchStaticParts(root,root.getChildMeshes().filter(m=>/^(Review desk base$|Evidence frame |Evidence bezel |Review selector support )/.test(m.name)),'Review frame');
 let s:any=freshReview(),signature='',scan=1,lastRun=0;
 function setState(next:any){s=next;const key=JSON.stringify([s.patch,s.flags,s.revision,s.inspected,s.current,s.section]);if(signature===key)return;signature=key;
  if(s.current&&s.current.id!==lastRun){lastRun=s.current.id;scan=0;}
  for(const [i,p] of sheets.entries()){const c=p.texture.getContext() as CanvasRenderingContext2D;c.fillStyle='#f0ece2';c.fillRect(0,0,514,600);c.textAlign='left';c.fillStyle='#35413b';c.font='bold 41px sans-serif';c.fillText(i?'SAVED FILE':'PROPOSED',26,57);c.font='26px sans-serif';c.fillText(i?'revision '+s.revision:'“Ready to use”',26,98);
   const values=i?[s.patch.owner?'KEEP ASSIGNED':'OVERWRITE',s.patch.files?'PRESERVE':'CLEARED',s.patch.title?'TYPO RETURNS':'CORRECTED']:['OVERWRITE','CLEARED','CORRECTED'];
   ['OWNER','FILES','HEADING'].forEach((label,n)=>{const good=i?(n===0?s.patch.owner:n===1?s.patch.files:!s.patch.title):n===2;c.fillStyle=good?'#dae7d2':'#efded0';c.fillRect(18,135+n*124,478,107);c.fillStyle='#344438';c.font='bold 29px sans-serif';c.fillText(label,34,174+n*124);c.font='bold 33px sans-serif';c.fillText(values[n],34,214+n*124);});c.fillStyle='#534568';c.font='bold 26px sans-serif';c.fillText(i?(reviewPass(s)?'VERIFIED':s.current?(runPass(s.current)?'CHECK SCOPE?':'REPAIR NEEDED'):'AWAITING CHECK'):'INSPECT THE DIFF',26,570);p.texture.update();}
  for(const p of ports){const c=p.texture.getContext() as CanvasRenderingContext2D;c.fillStyle=p.id===s.section?'#574570':'#eae7de';c.fillRect(0,0,512,230);c.fillStyle=p.id===s.section?'#f8f5ed':'#3d3944';c.textAlign='center';c.font='bold 60px sans-serif';c.fillText(p.id.toUpperCase(),256,98);c.font='30px sans-serif';c.fillText(p.id==='checks'?(reviewPass(s)?'VERIFIED':'RUN ON SAVED FILE'):p.id==='diff'?'COMPARE CHANGES':'LINE FEEDBACK',256,167);p.texture.update();}
 }
 setState(s);
 return {setState,update:(dt:number,reduced:boolean)=>{scan=reduced?1:Math.min(1,scan+dt*.9);scanner.isVisible=scan<1;scanner.position.x=-1.16+scan*2.32;},state:()=>({verified:reviewPass(s),revision:s.revision,scanActive:scan<1,ports:ports.map(p=>{const e=scene.getEngine(),v=scene.activeCamera!.viewport.toGlobal(e.getRenderWidth(),e.getRenderHeight());v.y=e.getRenderHeight()-v.y-v.height;const pos=Vector3.Project(p.face.getAbsolutePosition(),Matrix.Identity(),scene.getTransformMatrix(),v);return {id:p.id,screen:{x:pos.x*e.getRenderingCanvas()!.clientWidth/e.getRenderWidth(),y:pos.y*e.getRenderingCanvas()!.clientHeight/e.getRenderHeight()}};})})};
}
