const puppeteer=require("puppeteer");
(async()=>{const b=await puppeteer.launch({args:["--no-sandbox"]});
let p=await b.newPage(); await p.setViewport({width:1440,height:900}); await p.goto("http://localhost:3000/",{waitUntil:"networkidle2",timeout:60000});
await new Promise(r=>setTimeout(r,500));
await p.screenshot({path:"/home/user/uploads/design2_desktop_top.png"});
// scroll to mid sections
await p.evaluate(()=>window.scrollBy(0,1200)); await new Promise(r=>setTimeout(r,400)); await p.screenshot({path:"/home/user/uploads/design2_desktop_featured.png"});
await p.close();
p=await b.newPage(); await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2}); await p.goto("http://localhost:3000/",{waitUntil:"networkidle2",timeout:60000});
await new Promise(r=>setTimeout(r,400)); await p.screenshot({path:"/home/user/uploads/design2_mobile_top.png"});
await p.close();
console.log("ok"); await b.close();})().catch(e=>{console.error("ERR",e);process.exit(1);});
