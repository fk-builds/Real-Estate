const puppeteer=require("puppeteer");
(async()=>{const b=await puppeteer.launch({args:["--no-sandbox"]});
const p=await b.newPage(); await p.setViewport({width:1440,height:900});
await p.goto("http://localhost:3000/",{waitUntil:"networkidle2",timeout:60000});
const el=await p.$('section'); // find stats section by walking
let found=null;
for(const e of await p.$$('section')){ const t=await e.evaluate(n=>n.textContent||''); if(t.includes('Client retention')&&t.includes('PKR 9.2B')){found=e;break;} }
if(found){ await found.scrollIntoView(); await new Promise(r=>setTimeout(r,300)); await found.screenshot({path:"/home/user/uploads/stats_v2_desktop.png"}); }
// mobile
const pm=await b.newPage(); await pm.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2});
await pm.goto("http://localhost:3000/",{waitUntil:"networkidle2",timeout:60000});
for(const e of await pm.$$('section')){ const t=await e.evaluate(n=>n.textContent||''); if(t.includes('Client retention')&&t.includes('PKR 9.2B')){ await e.scrollIntoView(); await new Promise(r=>setTimeout(r,300)); await e.screenshot({path:"/home/user/uploads/stats_v2_mobile.png"}); break; } }
console.log("ok"); await b.close();})().catch(e=>{console.error("ERR",e);process.exit(1);});
