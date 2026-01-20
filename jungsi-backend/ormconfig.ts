/**
 * TypeORM CLI Configuration
 *
 * 이 파일은 TypeORM CLI 명령어(migration:generate, migration:run 등)에서 사용됩니다.
 * NestJS 애플리케이션 실행 시에는 TypeOrmConfigService가 사용됩니다.
 *
 * 사용 예시:
 * - yarn typeorm migration:generate -n MigrationName
 * - yarn typeorm migration:run
 * - yarn typeorm migration:revert
 */

import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';
import { existsSync } from 'fs';

// 환경에 따라 다른 .env 파일 로드
const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env.development';

const envPath = join(__dirname, envFile);

// .env 파일이 존재하면 로드, 없으면 환경 변수만 사용
if (existsSync(envPath)) {
  console.log(`📂 Loading environment from ${envFile}`);
  config({ path: envPath });
} else {
  console.log(`⚠️  ${envFile} not found, using system environment variables`);
}

// 환경 변수 검증
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}\n` +
    `Please check your ${envFile} file.\n` +
    `Run: node scripts/validate-env.js`
  );
}

// 연결 정보 출력 (비밀번호 제외)
console.log(`🔌 Database Connection:`);
console.log(`   Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
console.log(`   Database: ${process.env.DB_NAME}`);
console.log(`   User: ${process.env.DB_USER}`);
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // 엔티티 파일 경로 (모든 엔티티 자동 로드)
  entities: [
    'src/database/entities/**/*.entity.ts',
    'src/database/entities/**/*-interests.ts',
    'src/database/entities/**/*-file.ts',
  ],

  // 마이그레이션 파일 경로
  migrations: [
    'src/migrations/*.ts',
  ],

  // CLI에서는 항상 synchronize를 false로 설정
  // 마이그레이션을 통한 스키마 변경을 강제합니다
  synchronize: false,

  // 디버깅을 위한 SQL 로깅 (개발 환경에서만)
  logging: process.env.NODE_ENV !== 'production',

  // 마이그레이션 테이블 이름
  migrationsTableName: 'typeorm_migrations',

  // 마이그레이션 실행 옵션
  migrationsRun: false,  // 자동 실행 비활성화 (수동으로 yarn typeorm migration:run 실행)
});
