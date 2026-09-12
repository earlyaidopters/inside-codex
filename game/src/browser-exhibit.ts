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
import {freshBrowserDepth} from './browser-depth.mjs';

export function buildBrowserExhibit(scene:Scene,anchor:Vector3,onAction:(id:string)=>void){
 const root=new TransformNode('Browser persistence exhibit',scene);root.position=anchor.clone();
 const shell=new PBRMaterial('Browser porcelain frame',scene);shell.albedoColor=Color3.FromHexString('#d5cfdf');shell.metallic=.32;shell.roughness=.26;
 const mounts=['page','action','record'].map((id,i)=>{
  const mount=new TransformNode('Browser layer '+id,scene);mount.parent=root;
  const body=MeshBuilder.CreateBox('Browser frame '+id,{width:1.72,height:2.02,depth:.10},scene);body.parent=mount;body.material=shell;body.isPickable=false;
  const texture=new DynamicTexture('Browser crisp face '+id,{width:1024,height:1200},scene,true);texture.anisotropicFilteringLevel=8;
  const ink=new StandardMaterial('Browser ink '+id,scene);ink.diffuseTexture=texture;ink.emissiveColor=Color3.White();ink.disableLighting=true;ink.backFaceCulling=false;
  const face=MeshBuilder.CreatePlane('Inspect browser '+id,{width:1.64,height:1.94},scene);face.parent=mount;face.position.z=.056;face.material=ink;
  face.actionManager=new ActionManager(scene);face.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger,()=>onAction(exploring?id:'__explore')));
  return {id,mount,face,texture,i};
 });
 const entryTexture=new DynamicTexture('Browser explore ribbon',{width:1536,height:224},scene,true);entryTexture.anisotropicFilteringLevel=8;
 const entryInk=new StandardMaterial('Browser entry ink',scene);entryInk.diffuseTexture=entryTexture;entryInk.emissiveColor=Color3.White();entryInk.disableLighting=true;entryInk.backFaceCulling=false;
 const entry=MeshBuilder.CreatePlane('Explore inside browser',{width:2.45,height:.34},scene);entry.parent=root;entry.position.set(0,1.54,.23);entry.material=entryInk;entry.actionManager=new ActionManager(scene);entry.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger,()=>onAction('__explore')));
 const ctx=entryTexture.getContext();ctx.fillStyle='#342b49';ctx.fillRect(0,0,1536,224);ctx.fillStyle='#fff9ed';ctx.font='bold 88px sans-serif';ctx.fillText('EXPLORE INSIDE ↗',75,148);entryTexture.update();
 const paths=[[-1.85,-.16],[.16,1.85]].map(([a,b],i)=>{const line=MeshBuilder.CreateLines('Save connection '+i,{points:[new Vector3(a,1.95,.12),new Vector3(b,1.95,.12)]},scene);line.parent=root;line.color=Color3.FromHexString('#a89ac8');line.isPickable=false;return line;});
 let exploring=false,state:any=freshBrowserDepth(),signature='';
 function setState(next:any){exploring=!!next.exploration;state=next.exploration??{...freshBrowserDepth(),lab:next.lab??freshBrowserDepth().lab};
  const key=JSON.stringify([exploring,state.focus,state.lab]);if(key===signature)return;signature=key;
  for(const c of mounts){const t=c.texture.getContext(),l=state.lab;const accent=c.id==='record'?(l.verified?'#416752':!l.savedRecord?'#965541':'#655384'):'#655384';
   t.fillStyle='#f1ede4';t.fillRect(0,0,1024,1200);t.fillStyle='#302a3e';t.fillRect(0,0,1024,160);t.fillStyle='#c6b5ed';for(let i=0;i<3;i++){t.beginPath();t.arc(65+i*45,75,12,0,Math.PI*2);t.fill();}t.fillStyle='#f1ede4';t.font='bold 34px sans-serif';t.fillText('NORTHSTAR / '+c.id.toUpperCase(),230,88);
   t.fillStyle=accent;t.font='bold 37px sans-serif';t.fillText('0'+(c.i+1)+' / '+(c.id==='page'?'VISIBLE PAGE':c.id==='action'?'SAVE ACTION':'SAVED RECORD'),62,245);
   t.fillStyle='#302a3e';t.font='bold 86px sans-serif';t.fillText(c.id==='page'?'The page':c.id==='action'?'The action':'The record',62,380);
   t.fillStyle='#dad4e4';t.fillRect(62,460,900,3);
   const words=(c.id==='page'?(l.record||'No owner'):c.id==='action'?(l.fixed?'Write connected':'Write missing'):(l.savedRecord||'Empty')).split(/\s+/);let lines:string[]=[],line='';t.font='bold 76px sans-serif';
   for(const word of words){const candidate=line?line+' '+word:word;if(t.measureText(candidate).width>860&&line){lines.push(line);line=word;}else line=candidate;}lines.push(line);
   t.fillStyle=accent;lines.slice(0,3).forEach((v,i)=>{let text=v;while(t.measureText(text).width>860)text=text.slice(0,-2)+'…';t.fillText(text,62,600+i*95);});
   t.font='35px sans-serif';t.fillStyle='#52594f';t.fillText(c.id==='page'?'What you can see':c.id==='action'?'What Save actually does':'What Reload reads',62,955);
   t.fillStyle=accent;t.fillRect(62,1030,900,90);t.fillStyle='#fff';t.font='bold 37px sans-serif';t.fillText(c.id==='page'?(l.record?'SAVED MESSAGE SHOWN':'WAITING FOR A SAVE'):c.id==='action'?(l.fixed?'PAGE + RECORD':'PAGE ONLY'):l.verified?'SURVIVED RELOAD':l.savedRecord?'READY TO RELOAD':'NOTHING TO RESTORE',88,1089);
   if(exploring&&state.focus===c.id){t.strokeStyle='#9476c4';t.lineWidth=14;t.strokeRect(8,8,1008,1184);}c.texture.update();
  }
  paths.forEach((p,i)=>{p.setEnabled(exploring);p.color=Color3.FromHexString(i===1&&!state.lab.fixed?'#aa654d':'#a89ac8');});
 }
 const screenPoint=(node:TransformNode)=>{const e=scene.getEngine(),v=scene.activeCamera!.viewport.toGlobal(e.getRenderWidth(),e.getRenderHeight());v.y=e.getRenderHeight()-v.y-v.height;const p=Vector3.Project(node.getAbsolutePosition(),Matrix.Identity(),scene.getTransformMatrix(),v);return {x:p.x*e.getRenderingCanvas()!.clientWidth/e.getRenderWidth(),y:p.y*e.getRenderingCanvas()!.clientHeight/e.getRenderHeight()};};
 setState({});
 return {setState,update:(dt:number,reduced:boolean)=>{const f=reduced?1:Math.min(1,dt*4);for(const c of mounts){const target=exploring?new Vector3((c.i-1)*1.85,3.13,c.i===1?.20:0):new Vector3(c.i*.17-.14,2.85+c.i*.10,-c.i*.14);c.mount.position=Vector3.Lerp(c.mount.position,target,f);c.mount.rotation.y+=((exploring?(c.i-1)*-.07:0)-c.mount.rotation.y)*f;}entry.setEnabled(!exploring);},state:()=>({exploring,focus:state.focus,stored:state.lab.savedRecord,verified:state.lab.verified,entry:screenPoint(entry),cards:mounts.map(c=>({id:c.id,screen:screenPoint(c.face)}))})};
}
