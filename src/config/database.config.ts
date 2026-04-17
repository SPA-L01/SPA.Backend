import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ParkingLocation } from '../modules/parking-locations/entities/parking-location.entity';
import { ParkingSlot } from '../modules/parking-locations/entities/parking-slot.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  // Khi deploy lên Render/Heroku, URL sẽ được cung cấp qua biến DATABASE_URL
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'spa_parking',
  entities: [ParkingLocation, ParkingSlot],
  /**
   * synchronize: false trong production để bảo vệ dữ liệu.
   * Chỉ dùng true trong môi trường development.
   */
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  migrations: ['dist/migrations/*.js'],
};
