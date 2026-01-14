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

  console.log('=== 디자인조형학과 찾기 ===\n');

  $('table').each((tableIdx, table) => {
    $(table).find('tr').each((rowIdx, row) => {
      const text = $(row).text();

      if (text.includes('디자인조형학과')) {
        console.log(`테이블 ${tableIdx + 1}, 행 ${rowIdx}:`);
        console.log('전체 텍스트:', text.substring(0, 200));

        const cells = $(row).find('td');
        console.log(`\n셀 개수: ${cells.length}`);
        cells.each((i, cell) => {
          const cellText = $(cell).text().trim();
          const rowspan = $(cell).attr('rowspan');
          console.log(`  컬럼 ${i}: [${cellText}] ${rowspan ? `(rowspan=${rowspan})` : ''}`);
        });
        console.log('\n');
      }
    });
  });
})();
