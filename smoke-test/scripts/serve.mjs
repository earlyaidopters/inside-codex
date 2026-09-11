import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.glb':'model/gltf-binary','.png':'image/png','.json':'application/json','.css':'text/css'};
const server=http.createServer(async(req,res)=>{
  try {
    let rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(rel==='/')rel='/index.html';
    const file=path.resolve(root,'.'+rel);
    if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    if(rel.startsWith('/node_modules/')&&!/^\/node_modules\/(babylonjs\/babylon.js|babylonjs-loaders\/babylonjs.loaders.min.js)$/.test(rel)){res.writeHead(403);res.end();return;}
    const body=await fs.readFile(file);
    res.writeHead(200,{'Content-Type':types[path.extname(file)]??'application/octet-stream','Cache-Control':'no-store'});res.end(body);
  }catch{res.writeHead(404);res.end('Not found');}
});
const port=Number(process.env.SMOKE_PORT??43197);
server.listen(port,'127.0.0.1',()=>process.stdout.write(`Smoke preview: http://127.0.0.1:${port}\n`));
