/**
 * Script tạo bảng analytics_events trên production DB
 * Chạy: npx ts-node -r tsconfig-paths/register src/database/seeds/create-analytics-table.ts
 */

import 'reflect-metadata';
require('dotenv').config();
require('tsconfig-paths/register');
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'spa_dev',
  synchronize: false,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function main() {
  console.log('🔌 Đang kết nối database...');
  await AppDataSource.initialize();

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    console.log('📋 Tạo bảng analytics_events...');
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_name VARCHAR NOT NULL,
        params JSONB,
        screen_name VARCHAR,
        session_id VARCHAR,
        user_id VARCHAR,
        device_os VARCHAR,
        app_version VARCHAR,
        event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON analytics_events(event_name);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics_events(session_id);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_event_timestamp ON analytics_events(event_timestamp);
    `);

    console.log('✅ Bảng analytics_events và indexes đã sẵn sàng!');
  } catch (err) {
    console.error('❌ Lỗi:', err);
    throw err;
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error('❌ Migration thất bại:', err);
  process.exit(1);
});
