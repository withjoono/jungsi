#!/usr/bin/env node
const { execSync } = require('child_process');

// 환경 변수 설정
process.env.NODE_ENV = 'production';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'geobukschool_prod';
process.env.DB_USER = 'tsuser';
process.env.DB_PASSWORD = 'tsuser1234';

console.log('');
console.log('========================================');
console.log('프로덕션 마이그레이션 실행');
console.log('========================================');
console.log('');
console.log(`📊 Database: ${process.env.DB_NAME} @ ${process.env.DB_HOST}:${process.env.DB_PORT}`);
console.log(`👤 User: ${process.env.DB_USER}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
console.log('');
console.log('🚀 마이그레이션 실행 중...');
console.log('');

try {
  execSync('yarn typeorm:run', {
    stdio: 'inherit',
    env: process.env,
    shell: true
  });

  console.log('');
  console.log('✅ 마이그레이션 완료!');
  console.log('');
  process.exit(0);
} catch (error) {
  console.log('');
  console.log('❌ 마이그레이션 실패');
  console.log('');
  process.exit(1);
}
