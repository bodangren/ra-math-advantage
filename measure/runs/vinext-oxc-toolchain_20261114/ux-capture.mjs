// UX smoke capture: loads a URL, saves snapshot, console, errors, screenshot, title, h1.
// Usage: node ux-capture.mjs <url> <out-prefix> [link-selector] [link-out-prefix]
import { chromium } from '/home/daniebo/.nvm/versions/node/v24.19.0/lib/node_modules/@playwright/test/index.mjs';
import fs from 'node:fs';

const [url, outPrefix, linkSel, linkOutPrefix] = process.argv.slice(2);
const consoleLines = [];
const pageErrors = [];
const failedRequests = [];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('console', (m) => {
  const kind = m.type();
  const text = m.text();
  consoleLines.push(`[${kind}] ${text}`);
});
page.on('pageerror', (e) => pageErrors.push(String(e)));
page.on('requestfailed', (r) => failedRequests.push(`${r.url()} ${r.failure()?.errorText}`));
let status = 0;
page.on('response', (r) => { if (r.url() === url && status === 0) status = r.status(); });
const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch((e) => null);
if (resp) status = resp.status();
await page.waitForTimeout(1500);
const result = {
  url,
  finalUrl: page.url(),
  status,
  title: await page.title(),
  firstH1: await page.locator('h1').first().textContent().catch(() => ''),
  screenshot: true,
  snapshot: true,
  pageErrors: pageErrors.length,
};
fs.writeFileSync(`${outPrefix}-snapshot.txt`, await page.locator('body').ariaSnapshot());
await page.screenshot({ path: `${outPrefix}-screenshot.png`, fullPage: false });
fs.writeFileSync(`${outPrefix}-console.txt`, consoleLines.join('\n') + '\n');
fs.writeFileSync(`${outPrefix}-errors.txt`,
  `Page: ${url}\nFinal URL: ${result.finalUrl}\nConsole lines: ${consoleLines.length}\nPage errors: ${pageErrors.length}\nFailed requests: ${failedRequests.length}\n\n` +
  consoleLines.map((l, i) => `[console ${i + 1}] ${l}`).join('\n') + '\n' +
  pageErrors.map((e, i) => `[pageerror ${i + 1}] ${e}`).join('\n') + '\n' +
  failedRequests.map((e, i) => `[requestfailed ${i + 1}] ${e}`).join('\n') + '\n');
let linkResult = null;
if (linkSel && linkOutPrefix) {
  const link = page.locator(linkSel).first();
  const linkText = await link.textContent().catch(() => '');
  const linkHref = await link.getAttribute('href').catch(() => '');
  await link.click().catch(async (e) => {
    // fall back to direct navigation
    await page.goto(new URL(linkHref, url).toString(), { waitUntil: 'networkidle', timeout: 60000 });
  });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1500);
  const linkStatus = resp ? await page.evaluate(async () => {
    const r = await fetch(location.href, { method: 'GET' });
    return r.status;
  }).catch(() => 0) : 0;
  linkResult = {
    selector: linkSel,
    text: (linkText || '').trim(),
    href: linkHref,
    finalUrl: page.url(),
    status: linkStatus,
    title: await page.title(),
    firstH1: await page.locator('h1').first().textContent().catch(() => ''),
  };
  fs.writeFileSync(`${linkOutPrefix}-snapshot.txt`, await page.locator('body').ariaSnapshot());
  await page.screenshot({ path: `${linkOutPrefix}-screenshot.png`, fullPage: false });
  fs.writeFileSync(`${linkOutPrefix}-console.txt`, consoleLines.slice(result.consoleLines ?? 0).join('\n') + '\n');
  fs.writeFileSync(`${linkOutPrefix}-result.json`, JSON.stringify(linkResult, null, 2));
}
fs.writeFileSync(`${outPrefix}-result.json`, JSON.stringify({ ...result, link: linkResult }, null, 2));
console.log(JSON.stringify({ ...result, link: linkResult }, null, 2));
await browser.close();
