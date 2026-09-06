const puppeteer=require("puppeteer");
(async()=>{const b=await puppeteer.launch({args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await b.newPage();
await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2});
await p.goto("http://localhost:3000/",{waitUntil:"networkidle2",timeout:60000});
const r=await p.evaluate(()=>{
  const de=document.documentElement;
  const wide=[];
  document.querySelectorAll("*").forEach(el=>{const b=el.getBoundingClientRect(); if(b.width>de.clientWidth+1&&b.width<20000)wide.push({t:el.tagName,c:''+(el.className||'').slice(0,40),w:Math.round(b.width)});});
  // page total height
  return {overflowX:de.scrollWidth>de.clientWidth, clientW:de.clientWidth, scrollW:de.scrollWidth, pageH:de.scrollHeight, wide:wide.slice(0,10)};
});
console.log("MOBILE RESULT:",JSON.stringify(r,null,1));
await p.screenshot({path:"/home/user/uploads/home_v2_mobile.png",fullPage:true});
// stats band closeup
await p.evaluate(()=>{const els=[...document.querySelectorAll('*')].filter(e=>(e.textContent||'').includes('Client retention')&&e.tagName==='DIV'); const s=els.find(e=>e.getBoundingClientRect().height>80&&e.getBoundingClientRect().height<400); if(s)s.scrollIntoView({block:'center'});});
await new Promise(r=>setTimeout(r,400));
await p.screenshot({path:"/home/user/uploads/home_v2_stats.png"});
await b.close();})().catch(e=>{console.error("ERR",e);process.exit(1);});
