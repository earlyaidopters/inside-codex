import http from 'node:http';import {performance} from 'node:perf_hooks';
// One shared downstream bottleneck covers documents, assets and worker requests.
// Vite supplies the exact response encodings; this proxy never recompresses data.
export async function startupNetwork({bitsPerSecond=25_000_000,latencyMs=50,upstream='http://127.0.0.1:43211'}={}){
 const start=performance.now(),rows=[],queue=[];let timer,closed=false,nextAt=0;const sockets=new Set();
 function pump(){if(timer||!queue.length||closed)return;const job=queue.shift();let headerBytes=0;if(!job.response.headersSent&&!job.response.destroyed){job.response.writeHead(job.row.status,job.headers);headerBytes=Buffer.byteLength(job.response._header??'');}const at=Math.max(performance.now(),nextAt,job.eligible);nextAt=at+(job.bytes.length+headerBytes)*8000/bitsPerSecond;
  timer=setTimeout(()=>{timer=undefined;if(!job.response.destroyed){job.row.headerBytes+=headerBytes;job.response.write(job.bytes);job.row.bodyBytes+=job.bytes.length;if(job.last){job.response.end();job.row.finishedAt=performance.now()-start;}}pump();},Math.max(0,nextAt-performance.now()));
 }
 const server=http.createServer((request,response)=>{
  const row={url:request.url,method:request.method,requestedAt:performance.now()-start,status:0,headerBytes:0,bodyBytes:0,finishedAt:null,upstreamBodyBytes:0,headers:{}};rows.push(row);
  const target=new URL(request.url,upstream);const incoming=http.request(target,{method:request.method,headers:{...request.headers,host:target.host}},res=>{const buffers=[];res.on('data',b=>buffers.push(b));res.on('end',()=>{const body=Buffer.concat(buffers);row.status=res.statusCode;row.upstreamBodyBytes=body.length;row.headers=res.headers;const headers={...res.headers};delete headers['transfer-encoding'];delete headers.connection;headers['content-length']=body.length;const eligible=performance.now()+latencyMs;
   if(!body.length){queue.push({response,row,headers,bytes:Buffer.alloc(0),last:true,eligible});pump();return;}
   for(let offset=0;offset<body.length;offset+=16384)queue.push({response,row,headers,bytes:body.subarray(offset,offset+16384),last:offset+16384>=body.length,eligible});pump();
  });});incoming.on('error',error=>{row.error=String(error);response.writeHead(502);response.end('Measurement proxy upstream error');});request.pipe(incoming);
 });
 server.on('connection',socket=>{sockets.add(socket);socket.on('close',()=>sockets.delete(socket));});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 return {url:`http://127.0.0.1:${server.address().port}/`,snapshot:()=>structuredClone(rows),profile:{downloadBitsPerSecond:bitsPerSecond,latencyMs,revision:2,scope:'Shared FIFO downstream scheduler including HTTP headers and empty cache-validation responses for all page and worker HTTP responses; 16 KiB chunks; response bodies and HTTP headers counted; request/TCP/TLS bytes excluded; original Vite encodings preserved',upstream},close:async()=>{closed=true;clearTimeout(timer);for(const socket of sockets)socket.destroy();await new Promise(resolve=>server.close(resolve));}};
}
