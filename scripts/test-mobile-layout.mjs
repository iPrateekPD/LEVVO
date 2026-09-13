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
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Screenshot 1: Scroll to trust badges and 4-step process
  await page.evaluate(() => {
    const el = document.getElementById('why-levvo');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 600));
  const shot1 = path.join(ARTIFACTS_DIR, 'mobile_process_grid.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved mobile process grid screenshot to:', shot1);

  // Screenshot 2: Scroll to lifetime stats and quick win
  await page.evaluate(() => {
    const el = document.querySelector('section.w-full.bg-\\[\\#09071A\\]') || document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 600));
  const shot2 = path.join(ARTIFACTS_DIR, 'mobile_stats_and_tabs.png');
  await page.screenshot({ path: shot2 });
  console.log('Saved mobile stats & tabs screenshot to:', shot2);

  // Screenshot 3: Scroll to footer
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await new Promise(r => setTimeout(r, 600));
  const shot3 = path.join(ARTIFACTS_DIR, 'mobile_clean_footer.png');
  await page.screenshot({ path: shot3 });
  console.log('Saved mobile clean footer screenshot to:', shot3);

  await browser.close();
}

run().catch(console.error);
