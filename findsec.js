const puppeteer=require("puppeteer");
(async()=>{const b=await puppeteer.launch({args:["--no-sandbox"]});
const p=await b.newPage(); await p.setViewport({width:390,height:820,isMobile:true,hasTouch:true});
await p.goto("http://localhost:3000/",{waitUntil:"networkidle2",timeout:60000});
const out=await p.evaluate(()=>[...document.querySelectorAll('section')].map((s,i)=>{const t=(s.textContent||''); return {i,top:Math.round(s.getBoundingClientRect().top+window.scrollY),h:Math.round(s.getBoundingClientRect().height),hasPKR:t.includes('PKR 9.2B'),hasRet:t.includes('Client retention'),head:(t.match(/[A-Z][^]{0,30}/)||[''])[0].slice(0,30)};}));
console.log(JSON.stringify(out,null,1));
await b.close();})().catch(e=>{console.error("ERR",e);process.exit(1);});
