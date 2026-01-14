const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

function smartDecode(buffer, contentType) {
  const utf8Html = iconv.decode(buffer, 'utf-8');
  if (!utf8Html.includes('�')) {
    return { html: utf8Html, encoding: 'utf-8' };
  }

  const euckrHtml = iconv.decode(buffer, 'euc-kr');
  if (!euckrHtml.includes('�') || euckrHtml.split('�').length < utf8Html.split('�').length) {
    return { html: euckrHtml, encoding: 'euc-kr' };
  }

  return { html: utf8Html, encoding: 'utf-8' };
}

(async () => {
  const response = await axios.get('https://ratio.uwayapply.com/Sl5KOmBWSnJXOi9KLWZUZg==', {
    responseType: 'arraybuffer'
  });

  const { html } = smartDecode(response.data, response.headers['content-type']);
  const $ = cheerio.load(html);

  console.log('=== 동의대학교 테이블 헤더 확인 ===\n');

  $('table').each((tableIdx, table) => {
    // 디자인조형학과가 포함된 테이블 찾기
    const tableText = $(table).text();
    if (tableText.includes('디자인조형학과')) {
      console.log(`\n테이블 ${tableIdx + 1}의 헤더:\n`);

      // 첫 번째 tr 확인 (보통 헤더)
      const firstRow = $(table).find('tr').first();
      const headerCells = firstRow.find('th, td');
      console.log(`헤더 셀 개수: ${headerCells.length}\n`);
      headerCells.each((i, cell) => {
        const cellText = $(cell).text().trim().replace(/\s+/g, ' ');
        const colspan = $(cell).attr('colspan');
        const rowspan = $(cell).attr('rowspan');
        console.log(`  컬럼 ${i}: [${cellText}] ${colspan ? `(colspan=${colspan})` : ''} ${rowspan ? `(rowspan=${rowspan})` : ''}`);
      });

      console.log('\n\n두 번째 행 (군 헤더일 수 있음):');
      const secondRow = $(table).find('tr').eq(1);
      const secondCells = secondRow.find('th, td');
      console.log(`셀 개수: ${secondCells.length}\n`);
      secondCells.each((i, cell) => {
        const cellText = $(cell).text().trim().replace(/\s+/g, ' ');
        const colspan = $(cell).attr('colspan');
        const rowspan = $(cell).attr('rowspan');
        console.log(`  컬럼 ${i}: [${cellText}] ${colspan ? `(colspan=${colspan})` : ''} ${rowspan ? `(rowspan=${rowspan})` : ''}`);
      });
    }
  });
})();
