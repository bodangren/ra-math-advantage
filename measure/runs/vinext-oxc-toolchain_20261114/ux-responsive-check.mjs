// Responsive check: banner name and overflow at phone width.
import { chromium } from '/home/daniebo/.nvm/versions/node/v24.19.0/lib/node_modules/@playwright/test/index.mjs';

const [url] = process.argv.slice(2);
const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 375, height: 720 } });
await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
await p.waitForTimeout(800);
const snap = await p.locator('body').ariaSnapshot();
console.log(snap.split('\n').slice(0, 6).join('\n'));
const h1 = await p.locator('h1').first().textContent();
const overflow = await p.evaluate(() => {
  const d = document.documentElement;
  return d.scrollWidth - d.clientWidth;
});
console.log('h1:', h1, '| horizontal overflow px at 375px width:', overflow);
await b.close();
