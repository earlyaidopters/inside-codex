import {batchStaticParts} from './static-parts';
import {Scene} from '@babylonjs/core/scene';
import {Vector3,Matrix} from '@babylonjs/core/Maths/math.vector';
import {Color3} from '@babylonjs/core/Maths/math.color';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {PBRMaterial} from '@babylonjs/core/Materials/PBR/pbrMaterial';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {DynamicTexture} from '@babylonjs/core/Materials/Textures/dynamicTexture';
import {ActionManager} from '@babylonjs/core/Actions/actionManager';
import {ExecuteCodeAction} from '@babylonjs/core/Actions/directActions';

/** A visible tool loop, never a visualization of hidden model reasoning. */
export function buildHarnessExhibit(scene:Scene,anchor:Vector3,onChoose:(id:string)=>void){
 const root=new TransformNode('Interactive harness instrument',scene);root.position=anchor;
 const positions={context:new Vector3(-1.12,2.8,0),model:new Vector3(0,2.8,0),tools:new Vector3(1.12,2.8,0),verify:new Vector3(.55,1.87,.05)};
 const alloy=new PBRMaterial('Harness satin alloy',scene);alloy.albedoColor=Color3.FromHexString('#a5a8ad');alloy.metallic=.86;alloy.roughness=.25;
 const wire=new PBRMaterial('Inactive circuit',scene);wire.albedoColor=Color3.FromHexString('#263c3b');wire.metallic=.5;wire.roughness=.34;
 const activeWire=new PBRMaterial('Checked circuit',scene);activeWire.albedoColor=Color3.FromHexString('#a9e1c4');activeWire.emissiveColor=Color3.FromHexString('#75b999').scale(.7);activeWire.metallic=.4;activeWire.roughness=.3;
 const nodes=Object.entries(positions).map(([id,position])=>{
  const mount=new TransformNode('Harness '+id,scene);mount.parent=root;mount.position=position.clone();
  const rim=MeshBuilder.CreateTorus(id+' retaining ring',{diameter:.5,thickness:.035,tessellation:48},scene);rim.parent=mount;rim.rotation.x=Math.PI/2;rim.material=alloy;
  const mat=new PBRMaterial(id+' working state',scene);mat.metallic=.32;mat.roughness=.22;mat.albedoColor=Color3.FromHexString('#314247');
  const core=MeshBuilder.CreateSphere(id+' port',{diameter:.34,segments:20},scene);core.parent=mount;core.material=mat;
  const texture=new DynamicTexture(id+' caption',{width:512,height:128},scene,true);texture.hasAlpha=true;texture.drawText(id==='verify'?'CHECK':id.toUpperCase(),null,82,'bold 53px sans-serif','#e8efe8','transparent',true);
  const labelMat=new StandardMaterial(id+' caption',scene);labelMat.diffuseTexture=texture;labelMat.useAlphaFromDiffuseTexture=true;labelMat.emissiveColor=Color3.White();labelMat.disableLighting=true;labelMat.backFaceCulling=false;
  const caption=MeshBuilder.CreatePlane(id+' caption',{width:1.3,height:.325},scene);caption.parent=mount;caption.position.set(0,.4,.025);caption.material=labelMat;
  if(id!=='model'){core.actionManager=new ActionManager(scene);core.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger,()=>onChoose(id)));rim.actionManager=core.actionManager;}
  return {id,mount,mat,core,position,amount:id==='model'?1:0};
 });
 const paths=[
  [positions.context,positions.model],
  [positions.model,positions.tools],
  [positions.tools,new Vector3(1.12,1.87,0),positions.verify],
  [positions.verify,new Vector3(0,1.87,0),positions.model],
 ];
 const links=batchStaticParts(root,paths.map((path,i)=>{const m=MeshBuilder.CreateTube('Tool result circuit '+i,{path,radius:.012,tessellation:8},scene);m.parent=root;m.material=wire;return m;}),'Harness circuits');
 // Support bracket meets the physical plinth; the ports sit on this instrument.
 const stem=MeshBuilder.CreateCylinder('Harness support',{diameter:.075,height:1.28,tessellation:16},scene);stem.parent=root;stem.position.set(0,2.03,-.08);stem.material=alloy;
 const tokenMat=new PBRMaterial('Visible result pulse',scene);tokenMat.albedoColor=Color3.FromHexString('#e3c685');tokenMat.emissiveColor=Color3.FromHexString('#cbb066');
 const token=MeshBuilder.CreateSphere('Tool result in transit',{diameter:.10,segments:12},scene);token.parent=root;token.material=tokenMat;token.setEnabled(false);
 let selected:string[]=[],correct=false,stage=0,elapsed=0;
 function setState(ids:string[],success:boolean,step:number){selected=[...ids];correct=success;stage=step;}
 function update(dt:number,reduced:boolean){
  elapsed+=dt;
  const assembled=correct||stage>0;const gold=Color3.FromHexString('#a79aef'),dim=Color3.FromHexString('#314247'),mint=Color3.FromHexString('#a9e1c4');
  for(const n of nodes){const target=n.id==='model'||assembled||selected.includes(n.id)?1:0;n.amount=reduced?target:n.amount+(target-n.amount)*Math.min(1,dt*6);n.mat.albedoColor=Color3.Lerp(dim,assembled?mint:gold,n.amount);n.mat.emissiveColor=(assembled?mint:gold).scale(n.amount*.24);n.core.scaling.setAll(.72+.28*n.amount);}
  links.forEach(l=>l.material=assembled?activeWire:wire);token.setEnabled(assembled&&!reduced);
  if(assembled&&!reduced){
   const points=[positions.context,positions.model,positions.tools,new Vector3(1.12,1.87,0),positions.verify,new Vector3(0,1.87,0),positions.model];const t=(elapsed*.75)%(points.length-1);token.position=Vector3.Lerp(points[Math.floor(t)],points[Math.floor(t)+1],t%1);token.position.z+=.07;
  }
 }
 return {root,setState,update,state:()=>({selected:[...selected],assembled:correct||stage>0,stage,ports:nodes.map(n=>{
  const camera=scene.activeCamera!;const engine=scene.getEngine();
  const viewport=camera.viewport.toGlobal(engine.getRenderWidth(),engine.getRenderHeight());
  // Projection uses a top-left origin; the render viewport uses bottom-left.
  viewport.y=engine.getRenderHeight()-viewport.y-viewport.height;
  const p=Vector3.Project(n.mount.getAbsolutePosition(),Matrix.Identity(),scene.getTransformMatrix(),viewport);
  return {id:n.id,amount:n.amount,screen:{x:p.x*engine.getRenderingCanvas()!.clientWidth/engine.getRenderWidth(),y:p.y*engine.getRenderingCanvas()!.clientHeight/engine.getRenderHeight()}};
 })})};
}
