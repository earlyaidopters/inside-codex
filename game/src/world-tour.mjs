// Seconds, guide x/z, camera radius/alpha/beta, focused station.
// Cross-wing travel follows the open front promenade; the full orbit stays in the atrium.
const front=Math.PI/2;
export const tourFrames=[
 [0,2,2,10,front,1.26,-1],
 [3,2,2,6.5,front,1.30,-1],
 [6,-19,-1,9,front,1.19,1],
 [8,-19,-8.3,8,front,1.24,1],
 [11,-14,-8.3,7,front+.12,1.28,2],
 [13,-14,-1,8,front,1.20,2],
 [15,0,-1,9,front,1.20,5],
 [17,0,-8.3,8,front,1.24,5],
 [20,3,-8.3,7,front-.12,1.28,6],
 [22,3,-1,8,front,1.20,6],
 [24,17,-1,9,front,1.20,9],
 [26,17,-8.3,8,front,1.24,9],
 [29,19,-8.3,7,front+.12,1.28,10],
 [31,19,-1,8,front,1.20,10],
 [34,2,2,6.5,front,1.28,-1],
 [41,2,2,6.5,front+Math.PI*2,1.28,-1],
 [44,2,2,13.5,1.22+Math.PI*2,1.31,-1],
];
export const tourDuration=tourFrames.at(-1)[0];
export function sampleWorldTour(seconds,reduced=false){
 const t=Math.max(0,Math.min(tourDuration,seconds));let i=0;
 while(i<tourFrames.length-2&&t>=tourFrames[i+1][0])i++;
 const a=tourFrames[i],b=tourFrames[i+1];const u=(t-a[0])/(b[0]-a[0]),e=u*u*(3-2*u);
 const mix=k=>a[k]+(b[k]-a[k])*e;
 // Reduced motion uses held compositions with cuts and omits the orbit.
 const hold=reduced?(t<34?a:tourFrames[14]):null;
 return {x:hold?hold[1]:mix(1),z:hold?hold[2]:mix(2),radius:hold?hold[3]:mix(3),alpha:hold?hold[4]:mix(4),beta:hold?hold[5]:mix(5),station:a[6],moving:!reduced&&(a[1]!==b[1]||a[2]!==b[2]),progress:t/tourDuration,done:t>=tourDuration};
}
