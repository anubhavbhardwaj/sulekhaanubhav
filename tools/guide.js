// Builds guide.pdf from the SIDES/FAQ data inside the site's index.html
const {chromium}=require('playwright');
const path=require('path'),fs=require('fs');
const SITE=process.argv[2], OUT=process.argv[3];
(async()=>{
const b=await chromium.launch();
const p=await b.newPage();
await p.goto('file://'+path.resolve(SITE));
const d=await p.evaluate(()=>({SIDES,FAQ,toran:getComputedStyle(document.documentElement).getPropertyValue('--toran').trim()}));
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const COL={Haldi:['#F7C531','#4A3300'],Mehendi:['#3E7B2E','#F3FBEA'],Sangeet:['#D9418A','#fff'],Baraat:['#B0225A','#FFE7A3'],'Getting ready':['#C9772B','#FFF6E6'],Wedding:['#A3162F','#FFE7A3']};
function side(k,title,city,accent){
  const s=d.SIDES[k];
  const ev=s.events.filter(e=>!e.shared).map(e=>{const c=COL[e.name]||COL.Wedding;return `<tr>
    <td class="tag" style="background:${c[0]};color:${c[1]}">${esc(e.name)}</td>
    <td>${e.when?esc(e.when):'<i>Coming soon</i>'}</td>
    <td>${e.venue?esc(e.venue):'<i>To be added</i>'}${e.addr?`<div class="addr">${esc(e.addr)}</div>`:''}${e.prog?'<div class="addr">'+e.prog.map(x=>esc(x[0]+' '+x[1])).join(' · ')+'</div>':''}${e.note?'<div class="addr">'+esc(e.note)+'</div>':''}</td>
    <td>${e.dress?esc(e.dress):'<i>To be added</i>'}</td></tr>`;}).join('');
  const travel=s.travel.map(t=>`<li><b>${esc(t[0])}:</b> ${esc(t[1])}</li>`).join('');
  const stay=s.stay?`<li><b>Stay:</b> ${esc(s.stay[0])}. ${esc(s.stay[1])}</li>`:'';
  const contact=s.contact?`<li><b>Contact:</b> ${esc(s.contact)}</li>`:'<li><b>Contact:</b> <i>To be added</i></li>';
  return `<section class="side" style="--a:${accent}">
   <h2>${title} <span>${city}</span></h2>
   <table><thead><tr><th>Event</th><th>When</th><th>Where</th><th>Wear</th></tr></thead><tbody>${ev}</tbody></table>
   <ul>${travel}${stay}${contact}</ul></section>`;
}
const html=`<!doctype html><html><head><meta charset="utf-8"><style>
@page{size:A4;margin:0}
*{box-sizing:border-box}
body{margin:0;font:10pt/1.4 Inter,'DejaVu Sans',sans-serif;color:#262222;background:#FFF6E6;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.hi{font-family:FreeSerif,serif}
header{position:relative;background:#7C0F23;color:#FFE7A3;text-align:center;padding:66px 40px 12px}
.toran{position:absolute;left:0;right:0;top:0;height:78px;background:${d.toran} repeat-x center top}
header .hi{color:#F2C230;font-size:14pt}
header h1{font-family:Caladea,'DejaVu Serif',serif;font-weight:700;font-size:27pt;margin:0;letter-spacing:.5px}
header p{margin:0;color:#F9D9A0;font-size:10.5pt;letter-spacing:.14em;text-transform:uppercase}
main{padding:14px 36px 4px}
.side{margin-bottom:10px;page-break-inside:avoid}
h2{font-family:Caladea,'DejaVu Serif',serif;font-size:15pt;color:var(--a);margin:0 0 8px;border-bottom:2px solid var(--a);padding-bottom:3px}
h2 span{font-size:10.5pt;color:#6E6762;font-family:Inter,sans-serif;font-weight:400;margin-left:6px}
table{width:100%;border-collapse:separate;border-spacing:0 4px;font-size:9.1pt}
th{text-align:left;font-size:8pt;letter-spacing:.12em;text-transform:uppercase;color:#6E6762;font-weight:500;padding:0 8px}
td{background:#fff;padding:4px 8px;vertical-align:top}
td.tag{font-weight:700;width:78px;border-radius:8px 0 0 8px}
td:last-child{border-radius:0 8px 8px 0;width:24%}
td:nth-child(2){width:19%}
.addr{color:#6E6762;font-size:8.6pt;margin-top:2px}
i{color:#8a817b}
ul{margin:3px 0 0;padding-left:16px;font-size:9.1pt}
li{margin:1px 0}
.faq{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px 16px;font-size:8.9pt}
.faq b{display:block;color:#7C0F23}
footer{margin:6px 36px 0;padding:10px 16px;background:#7C0F23;color:#F9D9A0;border-radius:10px;display:flex;justify-content:space-between;align-items:center;font-size:9.6pt}
footer .hi{color:#F2C230;font-size:13pt}
</style></head><body>
<header><div class="toran"></div><div class="hi">॥ शुभ विवाह ॥</div><h1>Sulekha weds Anubhav</h1><p>19 to 20 November 2026 · Jaipur and Rohtak</p></header>
<main>
${side('groom',"Groom's side","Jaipur, Rajasthan",'#B0225A')}
${side('bride',"Bride's side","Rohtak, Haryana",'#A3162F')}
<section class="side" style="--a:#7C0F23"><h2>Good to know</h2><div class="faq">${d.FAQ.filter(f=>f[1]!=='To be added').map(f=>`<div><b>${esc(f[0])}</b>${esc(f[1])}</div>`).join('')}</div></section>
</main>
<footer><span><span class="hi">ढोल बजेगा, नाचना पड़ेगा!</span> &nbsp;<b style="color:#FFE7A3;font-size:11pt">#AnukhaKiChemistry</b></span><span>RSVP and latest updates: <b>anubhavbhardwaj.github.io/sulekhaanubhav</b></span></footer>
</body></html>`;
const g=await b.newPage();await g.setContent(html,{waitUntil:'load'});
await g.pdf({path:OUT,format:'A4',printBackground:true,margin:{top:0,bottom:0,left:0,right:0}});
await g.setViewportSize({width:794,height:1123});await g.screenshot({path:OUT.replace('.pdf','_preview.png'),fullPage:true});
await b.close();console.log('built',OUT);
})();
