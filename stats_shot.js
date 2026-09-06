const puppeteer=require("puppeteer");
(async()=>{const b=await puppeteer.launch({args:["--no-sandbox"]});
const p=await b.newPage(); await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2});
await p.goto("http://localhost:3000/",{waitUntil:"networkidle2",timeout:60000});
await p.screenshot({path:"/home/user/uploads/home_v2_mobile.png",fullPage:true});
// focus stats band
await p.evaluate(()=>{const els=[...document.querySelectorAll('div')].filter(e=>(e.textContent||'').includes('Client retention')&&e.getBoundingClientRect().height>200); const s=els[0]; if(s)s.scrollIntoView({block:'center'});});
await new Promise(r=>setTimeout(r,400));
await p.screenshot({path:"/home/user/uploads/home_v2_stats.png"});
await b.close(); console.log("done");})().catch(e=>{console.error("ERR",e);process.exit(1);});
