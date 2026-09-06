const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch({ args: ["--no-sandbox","--disable-setuid-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle2", timeout: 60000 });
  // Horizontal overflow check
  const ov = await page.evaluate(() => {
    const de = document.documentElement;
    return {
      scrollW: de.scrollWidth, clientW: document.documentElement.clientWidth, overflowX: de.scrollWidth > document.documentElement.clientWidth,
      bodyOverflow: document.body.scrollWidth > document.documentElement.clientWidth
    };
  });
  console.log("VIEWPORT 390x844");
  console.log("HORIZONTAL OVERFLOW:", JSON.stringify(ov));
  // find elements wider than viewport
  const wide = await page.evaluate(() => {
    const res = [];
    document.querySelectorAll("*").forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > document.documentElement.clientWidth + 1 && r.width < 20000) {
        res.push({ tag: el.tagName, cls: (el.className&&el.className.toString().slice(0,60)), w: Math.round(r.width), left: Math.round(r.left) });
      }
    });
    return res.slice(0, 20);
  });
  console.log("WIDE ELEMENTS:", JSON.stringify(wide, null, 1));
  // list main section positions (vertical) to see gaps
  const secs = await page.evaluate(() => {
    const out=[];
    document.querySelectorAll("section").forEach((s,i)=>{ const r=s.getBoundingClientRect();
      out.push({i, cls:(s.className.toString().slice(0,50)), top:Math.round(r.top), h:Math.round(r.height), bottom:Math.round(r.bottom)}); });
    return out;
  });
  console.log("SECTIONS:");
  secs.forEach(s=>console.log(JSON.stringify(s)));
  await browser.close();
})().catch(e=>{console.error("ERR",e);process.exit(1);});
