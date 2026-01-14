const axios = require('axios');
const cheerio = require('cheerio');

(async () => {
  const response = await axios.get('https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11020571.html');
  const $ = cheerio.load(response.data);

  const table4 = $('table').eq(3); // 4번째 테이블 (인덱스 3)

  console.log('=== 테이블 4 헤더 ===');
  table4.find('th').each((i, th) => {
    console.log(`컬럼 ${i}: [${$(th).text().trim()}]`);
  });

  console.log('\n=== 테이블 4 첫 5개 데이터 행 ===');
  table4.find('tr').slice(1, 6).each((rowIdx, row) => {
    const cells = $(row).find('td');
    console.log(`\n행 ${rowIdx + 1}:`);
    cells.each((i, cell) => {
      console.log(`  컬럼 ${i}: [${$(cell).text().trim()}]`);
    });
  });
})();
