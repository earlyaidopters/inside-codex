
const escapeText=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
document.querySelector('#reader-toc').innerHTML=originalPlan.map((p,i)=>`<a href="#section-${i+1}">${escapeText(p.heading)}</a>`).join('');
document.querySelector('#reader-content').innerHTML=originalPlan.map((p,i)=>`<section id="section-${i+1}" class="reader-section"><h2>${escapeText(p.heading)}</h2>${p.text.split(/\n\n/).map(block=>{const notes=planAnnotations[i].notes.filter(n=>block.includes(n.quote));let text=block;for(const n of notes)text=text.replace(n.quote,`<mark>${n.quote}</mark>`);return `<div class="reader-row"><div class="source-paragraph">${marked.parse(text)}</div>${notes.length?`<aside>${notes.map(n=>`<strong>${escapeText(n.label)}</strong><p>${escapeText(n.why)}</p>`).join('')}</aside>`:''}</div>`}).join('')}</section>`).join('');

// Resolve deep links after the full source and fonts establish the page layout.
const openLinkedSection=()=>{
  const id=decodeURIComponent(location.hash.slice(1));
  if(id) document.getElementById(id)?.scrollIntoView({behavior:'instant',block:'start'});
};
window.addEventListener('load',()=>document.fonts.ready.then(openLinkedSection),{once:true});
window.addEventListener('hashchange',openLinkedSection);
