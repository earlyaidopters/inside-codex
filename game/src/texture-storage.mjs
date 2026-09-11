// Allocation estimates, not total driver VRAM. Block-compressed formats count
// complete blocks at every mip level, including sub-block tail mipmaps.
export function estimateTextureStorage(t){
 const channels={0:1,1:1,2:2,4:3,5:4,6:1,7:2,8:1,9:2,10:3,11:4,12:4};
 const components={[-1]:1,0:1,1:4,2:2,3:1,4:2,5:2,6:4,7:4};
 const packed={8:2,9:2,10:2,11:4,12:4,13:4,14:4,15:8};
 const depth={13:4,14:4,15:2,16:4,17:4,18:8,19:1};
 const blocks={0x8e8c:16,0x8e8d:16,0x93b0:16,0x93d0:16,0x9278:16,0x9279:16,0x9274:8,0x9275:8,0x83f0:8,0x83f1:8,0x83f2:16,0x83f3:16};
 const blockBytes=blocks[t.format]??null;
 const bytesPerPixel=blockBytes?null:depth[t.format]??packed[t.type]??(channels[t.format]&&components[t.type]?channels[t.format]*components[t.type]:null);
 let textureBytes=0,w=t.width,h=t.height,d=Math.max(1,t.depth||1);
 do{textureBytes+=(blockBytes?Math.ceil(w/4)*Math.ceil(h/4)*blockBytes:bytesPerPixel===null?0:w*h*bytesPerPixel)*d;if(!t.generateMipMaps||w<=1&&h<=1&&(!t.is3D||d<=1))break;w=Math.max(1,Math.floor(w/2));h=Math.max(1,Math.floor(h/2));if(t.is3D)d=Math.max(1,Math.floor(d/2));}while(w>0&&h>0);
 textureBytes*=t.isCube?6:1;
 const samples=Math.max(1,t.samples||1),basePixels=t.width*t.height*Math.max(1,t.depth||1)*(t.isCube?6:1);
 return {bytesPerPixel,blockBytes,textureBytes:bytesPerPixel===null&&blockBytes===null?null:textureBytes,estimatedMultisampleColorBytes:bytesPerPixel===null?null:samples>1?basePixels*samples*bytesPerPixel:0};
}
