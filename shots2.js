const puppeteer=require("puppeteer");
(async()=>{
const b=await puppeteer.launch({args:["--no-sandbox"]});
const base="http://localhost:3000/";
// Desktop top
let p=await b.newPage(); await p.setViewport({width:1440,height:900,deviceScaleFactor:1});
await p.goto(base,{waitUntil:"networkidle2",timeout:60000});
await p.screenshot({path:"/home/user/uploads/design_desktop_top.png"});
await p.close();
// Mobile top
p=await b.newPage(); await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2});
await p.goto(base,{waitUntil:"networkidle2",timeout:60000});
await p.screenshot({path:"/home/user/uploads/design_mobile_top.png"});
await p.close();
console.log("done");
await b.close();})().catch(e=>{console.error("ERR",e);process.exit(1);});
