import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const SCREENSHOTS_DIR = join(ROOT, '.tmp', 'screenshots');

const url = process.argv[2] || 'http://localhost:3000';
const name = process.argv[3] || 'screenshot';

await mkdir(SCREENSHOTS_DIR, { recursive: true });

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

// Desktop viewport
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
await page.waitForFunction(() => document.fonts.ready);
await new Promise(r => setTimeout(r, 500));

// Scroll through page to trigger reveal animations
await page.evaluate(async () => {
  const distance = 300;
  const delay = 100;
  const scrollHeight = document.body.scrollHeight;
  let current = 0;
  while (current < scrollHeight) {
    window.scrollBy(0, distance);
    current += distance;
    await new Promise(r => setTimeout(r, delay));
  }
  window.scrollTo(0, 0);
});
await new Promise(r => setTimeout(r, 1000));

const desktopPath = join(SCREENSHOTS_DIR, `${name}-desktop.png`);
await page.screenshot({ path: desktopPath, fullPage: true });
console.log(`Desktop: ${desktopPath}`);

// Mobile viewport
await page.setViewport({ width: 390, height: 844 });
await page.reload({ waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 500));

await page.evaluate(async () => {
  const distance = 300;
  const delay = 100;
  const scrollHeight = document.body.scrollHeight;
  let current = 0;
  while (current < scrollHeight) {
    window.scrollBy(0, distance);
    current += distance;
    await new Promise(r => setTimeout(r, delay));
  }
  window.scrollTo(0, 0);
});
await new Promise(r => setTimeout(r, 1000));

const mobilePath = join(SCREENSHOTS_DIR, `${name}-mobile.png`);
await page.screenshot({ path: mobilePath, fullPage: true });
console.log(`Mobile: ${mobilePath}`);

await browser.close();
console.log('Done.');
