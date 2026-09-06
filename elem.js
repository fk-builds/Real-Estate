const puppeteer=require("puppeteer");
(async()=>{const b=await puppeteer.launch({args:["--no-sandbox"]});
const p=await b.newPage(); await p.setViewport({width:390,height:800,isMobile:true,hasTouch:true,deviceScaleFactor:2});
await p.goto("http://localhost:3000/",{waitUntil:"networkidle2",timeout:60000});
const h=await p.$$('section');
let el=null;
for(const e of h){const t=await e.evaluate(n=>n.textContent); if(t.includes('Client retention')&&t.includes('PKR 9.2B')){el=e;break;}}
if(el) await el.screenshot({path:"/home/user/uploads/manzil_stats_element.png"});
console.log("captured", !!el);
await b.close();})().catch(e=>{console.error("ERR",e);process.exit(1);});
