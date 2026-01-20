// 문제가 있는 마이그레이션을 건너뛰기 위해
// typeorm_migrations 테이블에 직접 추가

const { Client } = require('pg');

async function skipMigration() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'geobukschool_prod',
        user: process.env.DB_USER || 'tsuser',
        password: process.env.DB_PASSWORD || 'tsuser1234',
    });

    try {
        console.log('\n==========================================');
        console.log('문제의 마이그레이션 건너뛰기');
        console.log('==========================================\n');
        
        await client.connect();
        console.log('✅ 데이터베이스 연결 성공\n');

        // 1. 현재 마이그레이션 상태 확인
        console.log('📋 현재 마이그레이션 상태:');
        const current = await client.query(
            'SELECT * FROM typeorm_migrations ORDER BY timestamp DESC LIMIT 3'
        );
        
        current.rows.forEach(row => {
            console.log(`   ✓ ${row.name} (${row.timestamp})`);
        });
        console.log('');

        // 2. 문제의 마이그레이션이 이미 있는지 확인
        const problemMigration = 'AddPreviousResultColumns1765003406925';
        const exists = await client.query(
            'SELECT * FROM typeorm_migrations WHERE name = $1',
            [problemMigration]
        );

        if (exists.rows.length > 0) {
            console.log(`ℹ️  ${problemMigration}이(가) 이미 등록되어 있습니다.\n`);
        } else {
            console.log(`⚠️  ${problemMigration}을(를) 건너뛰기 처리합니다...`);
            
            // 마이그레이션 테이블에 추가 (이미 실행된 것으로 표시)
            await client.query(
                'INSERT INTO typeorm_migrations (timestamp, name) VALUES ($1, $2)',
                [1765003406925, problemMigration]
            );
            
            console.log(`✅ ${problemMigration}을(를) 건너뛰기 처리했습니다.\n`);
        }

        // 3. 최종 상태 확인
        console.log('📊 업데이트된 마이그레이션 상태:');
        const updated = await client.query(
            'SELECT * FROM typeorm_migrations ORDER BY timestamp DESC LIMIT 5'
        );
        
        updated.rows.forEach(row => {
            console.log(`   ✓ ${row.name} (${row.timestamp})`);
        });

        console.log('\n==========================================');
        console.log('✅ 완료!');
        console.log('==========================================\n');
        console.log('이제 다음 명령으로 나머지 마이그레이션을 실행하세요:');
        console.log('  .\\run-migration-now.ps1\n');

    } catch (error) {
        console.error('\n❌ 오류 발생:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

skipMigration();
