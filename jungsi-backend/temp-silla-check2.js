const axios = require('axios');
const cheerio = require('cheerio');

(async () => {
  const response = await axios.get('https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11020571.html');
  const $ = cheerio.load(response.data);

  console.log('=== 전체 테이블 개수:', $('table').length);

  $('table').each((tableIdx, table) => {
    console.log(`\n=== 테이블 ${tableIdx + 1} ===`);
    const headers = $(table).find('th').map((_, th) => $(th).text().trim()).get();
    console.log('헤더:', headers.slice(0, 10));

    const rows = $(table).find('tr');
    console.log('데이터 행 수:', rows.length - 1);

    if (tableIdx === 1) {
      console.log('\n첫 3개 데이터 행 샘플:');
      rows.slice(1, 4).each((rowIdx, row) => {
        const cells = $(row).find('td');
        console.log(`\n행 ${rowIdx + 1} (셀 개수: ${cells.length}):`);
        cells.each((i, cell) => {
          const text = $(cell).text().trim();
          if (text && text.length < 50) {
            console.log(`  컬럼 ${i}: [${text}]`);
          }
        });
      });
    }
  });
})();
