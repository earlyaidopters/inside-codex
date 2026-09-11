import {batchStaticParts} from './static-parts';
import {Scene} from '@babylonjs/core/scene';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {Color3} from '@babylonjs/core/Maths/math.color';
import {PBRMaterial} from '@babylonjs/core/Materials/PBR/pbrMaterial';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {DynamicTexture} from '@babylonjs/core/Materials/Textures/dynamicTexture';
import {branchFile,freshBranches,branchesPass} from './branch-lab.mjs';

/** Two file cartridges move apart along a rail when their checkouts are isolated. */
export function buildBranchExhibit(scene:Scene,anchor:Vector3){
 const root=new TransformNode('Worktree isolation instrument',scene);root.position=anchor.clone();
 const metal=new PBRMaterial('Worktree instrument titanium',scene);metal.albedoColor=Color3.FromHexString('#abb4ba');metal.metallic=.85;metal.roughness=.25;
 const shell=new PBRMaterial('File cartridge porcelain',scene);shell.albedoColor=Color3.FromHexString('#e2dfd7');shell.metallic=.1;shell.roughness=.28;
 const stem=MeshBuilder.CreateCylinder('Branch instrument stem',{height:.52,diameter:.09,tessellation:24},scene);stem.parent=root;stem.position.y=1.65;stem.material=metal;
 const rail=MeshBuilder.CreateCylinder('File separation rail',{height:2.25,diameter:.055,tessellation:24},scene);rail.parent=root;rail.rotation.z=Math.PI/2;rail.position.y=1.91;rail.material=metal;
 const cartridges=['a','b'].map((id,i)=>{
  const mount=new TransformNode('Checkout '+id.toUpperCase(),scene);mount.parent=root;mount.position.set(i===0?-.22:.22,2.56,i===0?.08:-.08);
  const body=MeshBuilder.CreateBox('File cartridge '+id,{width:.9,height:1.2,depth:.085},scene);body.parent=mount;body.material=shell;body.isPickable=false;
  const pin=MeshBuilder.CreateCylinder('Cartridge slider '+id,{height:.13,diameter:.055,tessellation:16},scene);pin.parent=mount;pin.position.y=-.66;pin.material=metal;
  const texture=new DynamicTexture('Working file '+id,{width:512,height:640},scene,false);texture.hasAlpha=false;
  const ink=new StandardMaterial('Working file screen '+id,scene);ink.diffuseTexture=texture;ink.emissiveColor=Color3.White();ink.disableLighting=true;ink.backFaceCulling=false;
  const face=MeshBuilder.CreatePlane('File content '+id,{width:.83,height:1.12},scene);face.parent=mount;face.position.z=.046;face.material=ink;face.isPickable=false;
  return {id,mount,texture};
 });
 batchStaticParts(root,[stem,rail],'Worktree rail');
 let state:any=freshBranches(),signature='';
 function setState(next:any){
  state=next;const key=JSON.stringify([state.mode,state.shared,state.files,state.checks,state.chosen]);if(signature===key)return;signature=key;
  for(const c of cartridges){
   const record=branchFile(state,c.id),check=state.checks[c.id];const ctx=c.texture.getContext();
   ctx.fillStyle='#172e2a';ctx.fillRect(0,0,512,640);
   ctx.fillStyle='#b5b3e7';ctx.font='bold 82px sans-serif';ctx.fillText('FILE '+c.id.toUpperCase(),36,108);
   ctx.fillStyle='#afc2b7';ctx.font='27px sans-serif';ctx.fillText(state.mode==='shared'?'SHARED CHECKOUT':'INDEPENDENT COPY',36,156);
   ctx.fillStyle='#adbbb0';ctx.font='30px sans-serif';ctx.fillText('APPROVAL OWNER',36,249);
   ctx.fillStyle=record.approval_owner?'#eef0e6':'#f3aa90';ctx.font='bold 52px sans-serif';ctx.fillText(record.approval_owner||'MISSING',36,314);
   ctx.fillStyle='#adbbb0';ctx.font='30px sans-serif';ctx.fillText('FILE ACCESS',36,405);
   ctx.fillStyle=record.files?'#eef0e6':'#f3aa90';ctx.font='bold 48px sans-serif';ctx.fillText(record.files?'REQUESTED':'MISSING',36,470);
   ctx.fillStyle=check?(check.failures.length?'#a24e39':'#4b856c'):'#4e5264';ctx.fillRect(25,550,462,66);
   ctx.fillStyle='#ffffff';ctx.font='bold 37px sans-serif';ctx.fillText(check?(check.failures.length?'CHECK FAILED':'CHECK PASSED'):'NOT CHECKED',40,595);
   c.texture.update();
  }
 }
 setState(state);
 return {setState,update:(dt:number,reduced:boolean)=>{for(const [i,c] of cartridges.entries()){const target=(i===0?-1:1)*(state.mode==='worktrees'?.58:.22);c.mount.position.x=reduced?target:c.mount.position.x+(target-c.mount.position.x)*Math.min(1,dt*5);}},state:()=>({mode:state.mode,collision:state.collision,verified:branchesPass(state),chosen:state.chosen,cartridges:cartridges.map(c=>({id:c.id,x:c.mount.position.x}))})};
}
