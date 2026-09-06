const puppeteer=require("puppeteer");
(async()=>{const b=await puppeteer.launch({args:["--no-sandbox"]});
const p=await b.newPage();
await p.setViewport({width:1440,height:900,deviceScaleFactor:1});
await p.goto("http://localhost:3000/",{waitUntil:"networkidle2",timeout:60000});
await new Promise(r=>setTimeout(r,600));
await p.screenshot({path:"/home/user/uploads/CURRENT_home_desktop.png"});
await p.close();
// mobile
const pm=await b.newPage(); await pm.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2});
await pm.goto("http://localhost:3000/",{waitUntil:"networkidle2",timeout:60000});
await new Promise(r=>setTimeout(r,500));
await pm.screenshot({path:"/home/user/uploads/CURRENT_home_mobile_top.png"});
await pm.click('button[aria-label="Open menu"]'); await new Promise(r=>setTimeout(r,500));
await pm.screenshot({path:"/home/user/uploads/CURRENT_home_mobile_menu.png"});
await pm.close();
console.log("ok"); await b.close();})().catch(e=>{console.error("ERR",e);process.exit(1);});
