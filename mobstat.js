const puppeteer=require("puppeteer");
(async()=>{const b=await puppeteer.launch({args:["--no-sandbox"]});
const pm=await b.newPage(); await pm.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2});
await pm.goto("http://localhost:3000/",{waitUntil:"networkidle2",timeout:60000});
let found=null;
for(const e of await pm.$$('section')){ const t=await e.evaluate(n=>n.textContent||''); if(t.includes('1,940 successful')){found=e;break;} }
if(found){ await found.screenshot({path:"/home/user/uploads/stats_mobile_real.png"}); console.log('captured element h=',(await found.boundingBox()).height); }
else console.log('not found');
await b.close();})().catch(e=>{console.error("ERR",e);process.exit(1);});
