// A user-requested reload refreshes failed module responses before import.
// Resolve the module only against this page's current build manifest.
const retryKey='codex3dRetry';
export function retryWorld(){
 const url=new URL(location.href);url.searchParams.set(retryKey,crypto.randomUUID());location.assign(url.href);
}
export async function loadWorldModule(signal:AbortSignal):Promise<typeof import('./world')>{
 const page=new URL(location.href),retry=page.searchParams.get(retryKey);
 if(!retry)return import('./world');
 page.searchParams.delete(retryKey);history.replaceState(history.state,'',page.href);
 let target=new URL('/src/world.ts',location.origin);
 if(!import.meta.env.DEV){
  const response=await fetch('/exhibits-manifest.json',{cache:'no-cache',signal});
  if(!response.ok)throw Error('World manifest unavailable');
  const manifest=await response.json() as Record<string,{file:string}>;
  const script=document.querySelector<HTMLScriptElement>('script[type="module"][src]')?.src;
  if(!script||!manifest['index.html']?.file||new URL(manifest['index.html'].file,location.origin+'/').href!==script)throw Error('World release changed');
  if(!manifest['src/world.ts']?.file)throw Error('World module missing from manifest');
  target=new URL(manifest['src/world.ts'].file,location.origin+'/');
  if(target.origin!==location.origin||!target.pathname.startsWith('/assets/')||!target.pathname.endsWith('.js'))throw Error('Invalid world module location');
 }
 signal.throwIfAborted();
 // Refresh the original URL before importing so shared chunks retain one module identity.
 const refreshed=await fetch(target,{cache:'reload',signal});
 if(!refreshed.ok)throw Error('World module download failed');
 await refreshed.arrayBuffer();signal.throwIfAborted();
 return import('./world');
}
