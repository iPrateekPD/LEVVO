import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACTS_DIR = '/Users/prateekpd/.gemini/antigravity-ide/brain/2db9e337-01a9-4401-b077-6294b22f90d2';

async function run() {
  console.log('Launching headless Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  
  // First, log in via /login
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  console.log('Logging in as hero@liferpg.dev...');
  await page.type('input[placeholder*="Email"]', 'hero@liferpg.dev');
  await page.type('input[placeholder*="Password"]', 'password123');
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) {
    await submitBtn.click();
    await new Promise(r => setTimeout(r, 2000));
  }

  // Navigate to / (the authenticated dashboard)
  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2500));

  // Check desktop metrics
  const desktopMetrics = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      innerWidth: window.innerWidth,
      hasModernDashboard: !!document.querySelector('aside') && !!document.querySelector('input[placeholder*="Search"]'),
      greetingText: document.querySelector('h1')?.textContent || '',
      taskItemsCount: document.querySelectorAll('.group\\/task').length
    };
  });
  console.log('Desktop Metrics:', JSON.stringify(desktopMetrics, null, 2));

  const desktopScreenshot = path.join(ARTIFACTS_DIR, 'desktop_redesigned_dashboard.png');
  await page.screenshot({ path: desktopScreenshot, fullPage: false });
  console.log('Saved desktop screenshot to:', desktopScreenshot);

  // Now resize to mobile phone 390x844
  console.log('\nTesting mobile phone viewport (390x844)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await new Promise(r => setTimeout(r, 1000));

  const mobileMetrics = await page.evaluate(() => {
    const scrollWidth = document.documentElement.scrollWidth;
    const clientWidth = document.documentElement.clientWidth;
    return {
      scrollWidth,
      clientWidth,
      innerWidth: window.innerWidth,
      hasOverflow: scrollWidth > clientWidth
    };
  });
  console.log('Mobile Metrics:', JSON.stringify(mobileMetrics, null, 2));

  const mobileScreenshot = path.join(ARTIFACTS_DIR, 'mobile_redesigned_dashboard.png');
  await page.screenshot({ path: mobileScreenshot, fullPage: false });
  console.log('Saved mobile screenshot to:', mobileScreenshot);

  await browser.close();
  console.log('\nVerification run finished!');
}

run().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});
