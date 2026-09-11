export const defaultAudio=()=>({voice:0.9,music:0.22,ambience:0.2,effects:0.55});
export function normalizeAudio(value){return Object.fromEntries(Object.entries(defaultAudio()).map(([key,fallback])=>[key,typeof value?.[key]==='number'&&Number.isFinite(value[key])?Math.max(0,Math.min(1,value[key])):fallback]));}
