const axios = require('axios');
const cheerio = require('cheerio');

(async () => {
  const response = await axios.get('https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11020571.html');
  const $ = cheerio.load(response.data);

  console.log('=== 신라대학교 테이블 헤더 ===');
  $('table').first().find('th').each((i, th) => {
    console.log(`컬럼 ${i}: [${$(th).text().trim()}]`);
  });

  console.log('\n=== 첫 5개 데이터 행 ===');
  $('table').first().find('tr').slice(1, 6).each((rowIdx, row) => {
    const cells = $(row).find('td');
    console.log(`\n행 ${rowIdx + 1}:`);
    cells.each((i, cell) => {
      console.log(`  컬럼 ${i}: [${$(cell).text().trim()}]`);
    });
  });
})();
