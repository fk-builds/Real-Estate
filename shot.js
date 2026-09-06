const puppeteer=require("puppeteer");
(async()=>{const b=await puppeteer.launch({args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await b.newPage();
await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2});
await p.goto("http://localhost:3000/",{waitUntil:"networkidle2",timeout:60000});
await p.screenshot({path:"/home/user/uploads/home_mobile_full.png",fullPage:true});
// capture testimonials region by finding its scroll position
const y=await p.evaluate(()=>{const el=[...document.querySelectorAll('section')].find(s=>(s.className||'').toString().includes('bg-cream2') && (s.textContent||'').includes('clients say')); if(!el)return 0; el.scrollIntoView(); return window.scrollY||0;});
await new Promise(r=>setTimeout(r,400));
await p.screenshot({path:"/home/user/uploads/home_mobile_top.png"});
await p.screenshot({path:"/home/user/uploads/home_mobile_testimonials.png"});
console.log("done y="+y);
await b.close();})().catch(e=>{console.error("ERR",e);process.exit(1);});
