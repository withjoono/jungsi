#!/usr/bin/env ts-node
/**
 * 프로덕션 마이그레이션 실행 스크립트
 * 
 * 사용법:
 * 1. Cloud SQL Proxy 실행:
 *    cloud-sql-proxy ts-back-nest-479305:asia-northeast3:geobuk-db --port 5432
 * 
 * 2. 환경 변수 설정 후 실행:
 *    NODE_ENV=production ts-node scripts/run-production-migration.ts
 * 
 * 또는 package.json에서:
 *    yarn migration:prod
 */

import { DataSource } from 'typeorm';
import * as readline from 'readline';

// 프로덕션 DB 설정 (환경 변수 또는 직접 설정)
const productionConfig = {
  type: 'postgres' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'geobukschool_prod',
  
  // 엔티티 및 마이그레이션 경로
  entities: [
    'src/database/entities/**/*.entity.ts',
    'src/database/entities/**/*-interests.ts',
    'src/database/entities/**/*-file.ts',
  ],
  
  migrations: ['src/migrations/*.ts'],
  
  // 프로덕션에서는 항상 synchronize false
  synchronize: false,
  
  // 로깅 활성화
  logging: true,
  
  migrationsTableName: 'typeorm_migrations',
  migrationsRun: false,
};

// 사용자 확인 입력 받기
async function confirmExecution(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log('\n⚠️  프로덕션 데이터베이스에 마이그레이션을 실행하려고 합니다.');
    console.log(`📊 DB: ${productionConfig.database} @ ${productionConfig.host}:${productionConfig.port}`);
    console.log('\n실행할 마이그레이션:');
    console.log('  - 1765320000000-AddCumulativePercentileToInputScores.ts');
    console.log('    → js_user_input_scores 테이블에 컬럼 추가:');
    console.log('      • standard_score_sum (표준점수 합계)');
    console.log('      • cumulative_percentile (나의 누적백분위)\n');
    
    rl.question('계속 진행하시겠습니까? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

async function runMigration() {
  try {
    // 필수 환경 변수 확인
    if (!productionConfig.password) {
      throw new Error('DB_PASSWORD 환경 변수가 설정되지 않았습니다.');
    }

    // 사용자 확인
    const confirmed = await confirmExecution();
    if (!confirmed) {
      console.log('\n❌ 마이그레이션이 취소되었습니다.');
      process.exit(0);
    }

    console.log('\n🔌 데이터베이스 연결 중...');
    
    // DataSource 생성 및 초기화
    const dataSource = new DataSource(productionConfig);
    await dataSource.initialize();
    
    console.log('✅ 데이터베이스 연결 성공');

    // 실행되지 않은 마이그레이션 확인
    const pendingMigrations = await dataSource.showMigrations();
    
    if (!pendingMigrations) {
      console.log('\n✅ 모든 마이그레이션이 이미 실행되었습니다.');
      await dataSource.destroy();
      return;
    }

    console.log('\n🚀 마이그레이션 실행 중...');
    
    // 마이그레이션 실행
    const migrations = await dataSource.runMigrations({ transaction: 'all' });
    
    if (migrations.length === 0) {
      console.log('\n✅ 실행할 마이그레이션이 없습니다.');
    } else {
      console.log('\n✅ 마이그레이션 실행 완료:');
      migrations.forEach((migration) => {
        console.log(`  ✓ ${migration.name}`);
      });
    }

    // 연결 종료
    await dataSource.destroy();
    console.log('\n🔒 데이터베이스 연결 종료');
    
  } catch (error) {
    console.error('\n❌ 마이그레이션 실행 중 오류 발생:');
    console.error(error);
    process.exit(1);
  }
}

// 스크립트 실행
runMigration();
