import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACTS_DIR = '/Users/prateekpd/.gemini/antigravity-ide/brain/2db9e337-01a9-4401-b077-6294b22f90d2';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000/login?mode=signup', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  const screenshotPath = path.join(ARTIFACTS_DIR, 'mobile_login_real_icons.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log('Saved mobile login screenshot to:', screenshotPath);

  await browser.close();
}

run().catch(console.error);
