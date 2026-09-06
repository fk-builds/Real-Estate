const puppeteer=require("puppeteer");
(async()=>{const b=await puppeteer.launch({args:["--no-sandbox"]});
// desktop sidebar
let p=await b.newPage(); await p.setViewport({width:1280,height:800}); await p.goto("http://localhost:3000/",{waitUntil:"networkidle2",timeout:60000});
await new Promise(r=>setTimeout(r,400)); await p.screenshot({path:"/home/user/uploads/site_sidebar_desktop.png"}); await p.close();
// mobile drawer
p=await b.newPage(); await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2}); await p.goto("http://localhost:3000/",{waitUntil:"networkidle2",timeout:60000});
await p.click('button[aria-label="Open menu"]'); await new Promise(r=>setTimeout(r,500));
await p.screenshot({path:"/home/user/uploads/site_sidebar_mobile.png"}); await p.close();
console.log("ok"); await b.close();})().catch(e=>{console.error("ERR",e);process.exit(1);});
