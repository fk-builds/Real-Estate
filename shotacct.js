const puppeteer=require("puppeteer");
(async()=>{const b=await puppeteer.launch({args:["--no-sandbox"]});
// account desktop
let p=await b.newPage(); await p.setViewport({width:1280,height:800}); await p.goto("http://localhost:3000/account",{waitUntil:"networkidle2",timeout:60000});
await p.screenshot({path:"/home/user/uploads/acct_desktop.png"}); await p.close();
// account mobile with drawer closed (top area)
p=await b.newPage(); await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2}); await p.goto("http://localhost:3000/account",{waitUntil:"networkidle2",timeout:60000});
await p.screenshot({path:"/home/user/uploads/acct_mobile.png"}); await p.close();
// admin mobile with drawer open
p=await b.newPage(); await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2}); await p.goto("http://localhost:3000/admin",{waitUntil:"networkidle2",timeout:60000});
await p.click('button[aria-label="Open admin menu"]'); await new Promise(r=>setTimeout(r,500));
await p.screenshot({path:"/home/user/uploads/admin_mobile_drawer.png"}); await p.close();
console.log("ok"); await b.close();})().catch(e=>{console.error("ERR",e);process.exit(1);});
