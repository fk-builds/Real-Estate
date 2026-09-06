const puppeteer=require("puppeteer");
(async()=>{const b=await puppeteer.launch({args:["--no-sandbox"]});
const p=await b.newPage(); await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
await p.goto("http://localhost:3000/",{waitUntil:"networkidle2",timeout:60000});
const secs=await p.evaluate(()=>[...document.querySelectorAll('section')].map((s,i)=>{const r=s.getBoundingClientRect(); const h=s.textContent.trim().slice(0,20);return {i,t:(s.className||'').toString().slice(0,35),h:Math.round(r.height),start:h};}));
secs.forEach(s=>console.log(JSON.stringify(s)));
await b.close();})().catch(e=>{console.error("ERR",e);process.exit(1);});
