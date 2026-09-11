import {Scene} from '@babylonjs/core/scene';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {DynamicTexture} from '@babylonjs/core/Materials/Textures/dynamicTexture';
import {Color3} from '@babylonjs/core/Maths/math.color';

// One opaque, filtered surface per wing keeps lettering out of the rib geometry
// and avoids transparent text sorting against the wall. Original shell, canopy,
// lightmaps and quality-switch geometry remain intact behind this inset finish.
export function buildWingBackdrop(scene:Scene,wing:number,base:number){
 const title=['UNDERSTAND','DIRECT','REPEAT'][wing];
 const tones=[['#536166','#424f54'],['#536358','#435247'],['#655f57','#544d46']][wing];
 const t=new DynamicTexture(`${title} architectural panel`,{width:2048,height:1024},scene,true);
 t.anisotropicFilteringLevel=8;t.hasAlpha=false;
 const c=t.getContext() as CanvasRenderingContext2D;const wash=c.createLinearGradient(0,0,0,1024);wash.addColorStop(0,tones[0]);wash.addColorStop(1,tones[1]);c.fillStyle=wash;c.fillRect(0,0,2048,1024);
 c.textAlign='center';c.textBaseline='middle';c.fillStyle='#faf6eb';c.font='600 108px sans-serif';c.fillText(title,1024,91);
 c.fillStyle='#e3e7df';c.font='500 38px sans-serif';c.fillText(`0${wing+1}  /  THE CODEX ECOSYSTEM`,1024,177);
 c.fillStyle='#b8bcb1';c.fillRect(888,229,272,3);
 t.update();
 const ink=new StandardMaterial(`${title} matte panel finish`,scene);ink.diffuseTexture=t;ink.emissiveColor=Color3.White();ink.disableLighting=true;ink.backFaceCulling=false;
 const panel=MeshBuilder.CreatePlane(`${title} clean wing backdrop`,{width:14.45,height:6.65},scene);
 panel.position.set(base,3.45,-17.98);panel.material=ink;panel.isPickable=false;
 return panel;
}
