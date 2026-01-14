const XLSX = require('xlsx');

const workbook = XLSX.readFile('uploads/최종경쟁률_v13_20260109_0452.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

const donguiData = data.filter(row => row['대학명'] === '동의대학교');
console.log('동의대학교 전체 데이터 건수:', donguiData.length);
console.log('\n첫 10건 샘플:');
donguiData.slice(0, 10).forEach((row, i) => {
  console.log(`\n[${i+1}]`);
  console.log('모집단위:', row['모집단위']);
  console.log('군:', row['군']);
  console.log('모집인원:', row['모집인원']);
  console.log('지원자:', row['지원자']);
  console.log('경쟁률:', row['경쟁률']);
});

console.log('\n군별 통계:');
const byGun = {};
donguiData.forEach(row => {
  const gun = row['군'] || '미분류';
  byGun[gun] = (byGun[gun] || 0) + 1;
});
Object.entries(byGun).forEach(([gun, count]) => {
  console.log(`  ${gun}: ${count}건`);
});

console.log('\n모집인원 0인 데이터:');
const zeroQuota = donguiData.filter(row => !row['모집인원'] || row['모집인원'] === 0 || row['모집인원'] === '0');
console.log('건수:', zeroQuota.length);
zeroQuota.forEach(row => {
  console.log(`  - ${row['모집단위']} (군: ${row['군']})`);
});
