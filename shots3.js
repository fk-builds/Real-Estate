const puppeteer=require("puppeteer");
(async()=>{const b=await puppeteer.launch({args:["--no-sandbox"]});
// desktop
let p=await b.newPage(); await p.setViewport({width:1440,height:900});
await p.goto("http://localhost:3000/",{waitUntil:"networkidle2",timeout:60000});
for(const e of await p.$$('section')){const t=await e.evaluate(n=>n.textContent||''); if(t.includes('1,940 successful')){await e.screenshot({path:"/home/user/uploads/stats_final_desktop.png"});break;}}
await p.close();
// mobile full top around stats
p=await b.newPage(); await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2});
await p.goto("http://localhost:3000/",{waitUntil:"networkidle2",timeout:60000});
for(const e of await p.$$('section')){const t=await e.evaluate(n=>n.textContent||''); if(t.includes('1,940 successful')){await e.screenshot({path:"/home/user/uploads/stats_final_mobile.png"});break;}}
await p.close();
console.log("ok"); await b.close();})().catch(e=>{console.error("ERR",e);process.exit(1);});
