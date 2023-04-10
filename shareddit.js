const puppeteer = require('puppeteer');

// this function downloads the post as image through Shareddit
async function downloadRedditPostAsImage(postId, subRedditName, accessToken) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    headless: false
    });
  const page = await browser.newPage();
  
  // Navigate to website and click button
  await page.goto(`https://shareddit.taptappers.club/generate?sub=${subRedditName}&postId=${postId}&accessToken=${accessToken}`);
  console.log('opened page, waiting for page to load completely...')
  
  await page.waitForTimeout(10000);
  await page.click('.chakra-button');

  
  console.log('download initiated, waiting for it to finish')
  await page.waitForTimeout(10000);
  
  console.log('closing browser')
  await browser.close();
};

module.exports = downloadRedditPostAsImage;
