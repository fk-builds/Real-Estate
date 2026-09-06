const puppeteer=require("puppeteer");
(async()=>{const b=await puppeteer.launch({args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await b.newPage(); await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
await p.goto("http://localhost:3000/",{waitUntil:"networkidle2",timeout:60000});
const r=await p.evaluate(()=>{
 const res=[];
 // 1) text overflow inside elements (content clipped horizontally)
 document.querySelectorAll('*').forEach(el=>{
   if(el.scrollWidth>el.clientWidth+2){
     const t=(el.textContent||'').trim().slice(0,40);
     if(t) res.push({type:'hoverflow',tag:el.tagName,cls:(el.className&&''+el.className).slice(0,45),txt:t,sw:el.scrollWidth,cw:el.clientWidth});
   }
 });
 // 2) line-clamp truncated? check elements with overflow hidden whose text may be cut
 return res.slice(0,30);
});
console.log("TEXT H-OVERFLOWS:",r.length?JSON.stringify(r,null,1):"none");
await b.close();})().catch(e=>{console.error("ERR",e);process.exit(1);});
