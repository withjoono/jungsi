const axios = require('axios');
const iconv = require('iconv-lite');
const fs = require('fs');

async function fetchHtml(url, outputFile) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    // Try different encodings
    let html;
    const contentType = response.headers['content-type'] || '';

    if (contentType.includes('euc-kr') || contentType.includes('cp949')) {
      html = iconv.decode(response.data, 'euc-kr');
    } else {
      html = iconv.decode(response.data, 'utf-8');
    }

    fs.writeFileSync(outputFile, html, 'utf-8');
    console.log(`Saved to ${outputFile}`);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// 동명대학교
fetchHtml(
  'https://addon.jinhakapply.com/RatioV1/RatioH/Ratio30050611.html',
  'dongmyung-html.txt'
);

// 신라대학교
setTimeout(() => {
  fetchHtml(
    'https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11020571.html',
    'silla-html.txt'
  );
}, 1000);
