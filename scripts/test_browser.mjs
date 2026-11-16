import { chromium } from 'playwright';

async function testBrowser() {
  console.log('Testing Chrome launch via Playwright...');
  try {
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    console.log('✓ Successfully launched system Chrome!');
    const page = await browser.newPage();
    await page.goto('http://localhost:5174/');
    const title = await page.title();
    console.log('Page title:', title);
    await browser.close();
    console.log('✓ Browser test passed!');
  } catch (err) {
    console.error('Launch failed:', err.message);
  }
}

testBrowser();
