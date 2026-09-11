const add=(a,b)=>a.map((v,i)=>v+b[i]);
export const orbitPosition=(target,alpha,beta,radius)=>add(target,[Math.cos(alpha)*Math.sin(beta)*radius,Math.cos(beta)*radius,Math.sin(alpha)*Math.sin(beta)*radius]);
export const guideSightPoints=(position,scale=1,lift=0)=>[-.75,0,.75].flatMap(x=>[-.65,0,.65].map(y=>add(position,[x*scale,(1.8+y+lift)*scale,0])));
export function segmentBox(a,b,box,margin=0){let lo=0,hi=1;for(let axis=0;axis<3;axis++){const d=b[axis]-a[axis],min=box.min[axis]-margin,max=box.max[axis]+margin;if(Math.abs(d)<1e-9){if(a[axis]<min||a[axis]>max)return null;continue;}let x=(min-a[axis])/d,y=(max-a[axis])/d;if(x>y)[x,y]=[y,x];lo=Math.max(lo,x);hi=Math.min(hi,y);if(lo>hi)return null;}return hi>0&&lo<.995?Math.max(0,lo):null;}
export function visibilityIndex(boxes){
 const build=items=>{const min=[0,1,2].map(i=>Math.min(...items.map(b=>b.min[i]))),max=[0,1,2].map(i=>Math.max(...items.map(b=>b.max[i])));if(items.length<=8)return {min,max,items};const sizes=max.map((v,i)=>v-min[i]),axis=sizes.indexOf(Math.max(...sizes));items=[...items].sort((a,b)=>a.min[axis]+a.max[axis]-b.min[axis]-b.max[axis]);const mid=Math.floor(items.length/2);return {min,max,left:build(items.slice(0,mid)),right:build(items.slice(mid))};};const root=build(boxes);
 const firstHit=(a,b,margin=0)=>{let hit=null,t=Infinity;function visit(node){const q=segmentBox(a,b,node,margin);if(q===null||q>t)return;if(node.items){for(const box of node.items){const x=segmentBox(a,b,box,margin);if(x!==null&&x<t){t=x;hit=box.id;}}}else{visit(node.left);visit(node.right);}}visit(root);return hit?{id:hit,t}:null;};
 const blocked=(camera,points,margin=.05)=>{for(const p of points){const hit=firstHit(camera,p,margin);if(hit)return hit;}return null;};return {firstHit,blocked};
}
export function chooseTourCamera(index,desired,points,future,previous){
 const at=(pose,target=desired.target)=>orbitPosition(target,pose.alpha,pose.beta,pose.radius);
 const okay=pose=>!index.blocked(at(pose),points,.15)&&(!future||!index.blocked(at(pose,future.target),future.points,.15));
 if(okay(desired))return {...desired,adjusted:false};
 let best=null,score=Infinity;
 const alphaOffsets=[0,-.12,.12,-.26,.26,-.44,.44,-.66,.66,-.9,.9];
 for(const rScale of [1,.9,.78,.64,.5])for(const betaOffset of [0,-.15,-.3,-.45])for(const alphaOffset of alphaOffsets){const p={...desired,alpha:desired.alpha+alphaOffset,beta:Math.max(.55,desired.beta+betaOffset),radius:Math.max(3.6,desired.radius*rScale)};const cost=Math.abs(alphaOffset)*2+Math.abs(betaOffset)*2.2+(1-rScale)*3+(previous?Math.abs(p.alpha-previous.alpha)*.55+Math.abs(p.beta-previous.beta)*.4+Math.abs(p.radius-previous.radius)*.08:0);if(cost>=score||!okay(p))continue;best=p;score=cost;}
 if(best)return {...best,adjusted:true};
 // A future constraint must never force the current frame behind geometry.
 if(future)return chooseTourCamera(index,desired,points,null,previous);
 return {...desired,adjusted:true,unresolved:true};
}
