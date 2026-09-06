import puppeteer from "puppeteer";
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-dev-shm-usage"]});
const p=await b.newPage();
const errs=[];p.on("pageerror",e=>errs.push(e.message.slice(0,160)));
await p.setViewport({width:1280,height:800,deviceScaleFactor:1});
await p.goto("http://localhost:3000/",{waitUntil:"networkidle2",timeout:90000});
await p.waitForSelector("h1",{timeout:60000}).catch(()=>{});
await new Promise(r=>setTimeout(r,1500));
// bring every reveal/stagger into view slowly and confirm opacity becomes 1
const res=await p.evaluate(async()=>{
  const els=[...document.querySelectorAll(".reveal,.stagger")];
  let bad=0; let total=0;
  for(const el of els){
    if(el.closest(".reveal,.stagger")!==el && el.closest(".reveal")) continue; // skip nested
    total++;
    el.scrollIntoView({block:"center"});
    await new Promise(r=>setTimeout(r,1000));
    const op=parseFloat(getComputedStyle(el).opacity);
    if(op<0.99) bad++;
  }
  return {total,bad};
});
console.log("reveal scan:",JSON.stringify(res));
console.log("pageerrors:",errs.length?errs:"none");
await b.close();
