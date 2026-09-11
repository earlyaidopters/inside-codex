import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';import {dedup,weld,quantize} from '@gltf-transform/functions';import fs from 'node:fs/promises';
const out='../evidence/production/floor-study-v1',io=new NodeIO().registerExtensions(ALL_EXTENSIONS);
const source='../art-source/headquarters-browser-unquantized-v1.glb';
const doc=await io.read(source);const node=doc.getRoot().listNodes().find(n=>n.getName()==='Architecture floor');if(!node)throw Error('Floor node missing');
const matrix=node.getWorldMatrix(),mesh=node.getMesh(),reports=[];
for(const primitive of mesh.listPrimitives()){
 const positions=primitive.getAttribute('POSITION'),indices=primitive.getIndices().getArray(),groups=new Map(),parent=[];
 const root=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};const union=(a,b)=>{a=root(a);b=root(b);if(a!==b)parent[b]=a;};
 for(let i=0;i<positions.getCount();i++)parent[i]=i;
 const p=[0,0,0];for(let i=0;i<positions.getCount();i++){positions.getElement(i,p);const key=p.map(x=>Math.round(x*1e5)).join(',');if(groups.has(key))union(i,groups.get(key));else groups.set(key,i);}
 for(let i=0;i<indices.length;i+=3){union(indices[i],indices[i+1]);union(indices[i],indices[i+2]);}
 const components=new Map();
 for(let i=0;i<indices.length;i+=3){const k=root(indices[i]);if(!components.has(k))components.set(k,{triangles:[],min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]});const c=components.get(k);c.triangles.push(i);for(let j=0;j<3;j++){positions.getElement(indices[i+j],p);const world=[matrix[0]*p[0]+matrix[4]*p[1]+matrix[8]*p[2]+matrix[12],matrix[1]*p[0]+matrix[5]*p[1]+matrix[9]*p[2]+matrix[13],matrix[2]*p[0]+matrix[6]*p[1]+matrix[10]*p[2]+matrix[14]];for(let axis=0;axis<3;axis++){c.min[axis]=Math.min(c.min[axis],world[axis]);c.max[axis]=Math.max(c.max[axis],world[axis]);}}}
 const remove=new Set();
 for(const c of components.values()){const size=c.max.map((v,i)=>v-c.min[i]);const strip=size[1]<.012&&Math.max(size[0],size[2])>20;const ring=size[1]<.025&&size[0]>5&&size[0]<8&&size[2]>5&&size[2]<8;const report={material:primitive.getMaterial().getName(),triangles:c.triangles.length,min:c.min,max:c.max,size,remove:strip?'floor-strip':ring?'stage-ring':null};reports.push(report);if(report.remove)for(const t of c.triangles)remove.add(t);}
 const kept=[];for(let i=0;i<indices.length;i+=3)if(!remove.has(i))kept.push(indices[i],indices[i+1],indices[i+2]);primitive.getIndices().setArray(new Uint32Array(kept));
}
await fs.writeFile(out+'/components.json',JSON.stringify(reports,null,2));
await doc.transform(dedup(),weld(),quantize({quantizationVolume:'mesh',quantizePosition:16,quantizeNormal:12,quantizeTexcoord:16}));await io.write(out+'/candidates/no-trim.glb',doc);
const flat=await io.read(source);for(const p of flat.getRoot().listNodes().find(n=>n.getName()==='Architecture floor').getMesh().listPrimitives())p.getMaterial().setBaseColorTexture(null);
await flat.transform(dedup(),weld(),quantize({quantizationVolume:'mesh',quantizePosition:16,quantizeNormal:12,quantizeTexcoord:16}));await io.write(out+'/candidates/no-floor-albedo.glb',flat);
console.log(JSON.stringify({components:reports.length,removed:reports.filter(r=>r.remove).map(r=>({kind:r.remove,triangles:r.triangles})),output:out},null,2));
