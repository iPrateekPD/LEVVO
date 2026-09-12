import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACTS_DIR = '/Users/prateekpd/.gemini/antigravity-ide/brain/2db9e337-01a9-4401-b077-6294b22f90d2';

async function run() {
  console.log('Launching headless Chrome via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  console.log('\n--- 1. Testing Login Page at 390x844 (Mobile Phone) ---');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000)); // Allow GSAP entrance animation to complete

  // Evaluate overflows
  const loginMetrics = await page.evaluate(() => {
    const scrollWidth = document.documentElement.scrollWidth;
    const clientWidth = document.documentElement.clientWidth;
    const bodyScrollWidth = document.body.scrollWidth;

    const overflowing = [];
    document.querySelectorAll('*').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.right > window.innerWidth + 1) {
        overflowing.push({
          tag: el.tagName,
          className: el.className ? String(el.className).slice(0, 50) : '',
          right: Math.round(rect.right),
          width: Math.round(rect.width)
        });
      }
    });

    return {
      scrollWidth,
      clientWidth,
      bodyScrollWidth,
      innerWidth: window.innerWidth,
      overflowingCount: overflowing.length,
      overflowingSamples: overflowing.slice(0, 5)
    };
  });

  console.log('Login Page Metrics:', JSON.stringify(loginMetrics, null, 2));

  const loginScreenshotPath = path.join(ARTIFACTS_DIR, 'mobile_login_390.png');
  await page.screenshot({ path: loginScreenshotPath });
  console.log('Saved mobile login screenshot to:', loginScreenshotPath);

  console.log('\n--- 2. Performing Login to Test Authenticated Dashboard ---');
  await page.type('input[placeholder*="Email"]', 'hero@liferpg.dev');
  await page.type('input[placeholder*="Password"]', 'password123');
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) {
    await submitBtn.click();
    console.log('Submitted login form, waiting 2.5s for session cookie and redirect...');
    await new Promise(r => setTimeout(r, 2500));
  }
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000)); // Allow dashboard data and GSAP animations

  console.log('\n--- 3. Testing Dashboard at 390x844 (Mobile Phone) ---');
  const dashboardMetrics = await page.evaluate(() => {
    const main = document.querySelector('main');
    const mainChildren = main ? Array.from(main.children).map(c => ({
      tag: c.tagName,
      className: String(c.className).slice(0, 40),
      width: Math.round(c.getBoundingClientRect().width),
      right: Math.round(c.getBoundingClientRect().right)
    })) : [];

    const scrollWidth = document.documentElement.scrollWidth;
    const clientWidth = document.documentElement.clientWidth;
    const bodyScrollWidth = document.body.scrollWidth;

    return {
      url: window.location.href,
      scrollWidth,
      clientWidth,
      innerWidth: window.innerWidth,
      mainChildren
    };
  });

  console.log('Dashboard Children:', JSON.stringify(dashboardMetrics, null, 2));

  const dashboardScreenshotPath = path.join(ARTIFACTS_DIR, 'mobile_dashboard_390.png');
  await page.screenshot({ path: dashboardScreenshotPath });
  console.log('Saved mobile dashboard screenshot to:', dashboardScreenshotPath);

  console.log('\n--- 4. Testing App Overview at 390x844 (Mobile Phone) ---');
  // Click "APP OVERVIEW" button
  const overviewButton = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('OVERVIEW'));
    if (b) {
      b.click();
      return true;
    }
    return false;
  });

  if (overviewButton) {
    await new Promise(r => setTimeout(r, 800));
    const overviewMetrics = await page.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        innerWidth: window.innerWidth
      };
    });
    console.log('Overview Metrics:', JSON.stringify(overviewMetrics, null, 2));

    const overviewScreenshotPath = path.join(ARTIFACTS_DIR, 'mobile_overview_390.png');
    await page.screenshot({ path: overviewScreenshotPath });
    console.log('Saved mobile overview screenshot to:', overviewScreenshotPath);
  }

  await browser.close();
  console.log('\nMobile verification completed successfully!');
}

run().catch((err) => {
  console.error('Mobile test failed:', err);
  process.exit(1);
});
