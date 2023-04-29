const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// this function downloads the post as image through Shareddit
async function downloadRedditPostAsImage(userId, postId, subRedditName, accessToken) {
  console.log(`downloading post ${postId} from r/${subRedditName}`)
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox']
    });
  const page = await browser.newPage();

  // we use a custom download path for each user
  const downloadPath = path.join(__dirname, "data", userId);
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath, { recursive: true });
  }

  await page._client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadPath,
  });
  
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
