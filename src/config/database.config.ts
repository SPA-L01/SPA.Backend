import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ParkingLocation } from '../modules/parking-locations/entities/parking-location.entity';
import { ParkingSlot } from '../modules/parking-locations/entities/parking-slot.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'spa_parking',
  entities: [ParkingLocation, ParkingSlot],
  /**
   * synchronize: true → TypeORM tự tạo/cập nhật bảng theo entity (chỉ dùng dev)
   * Production: dùng migration
   */
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  migrations: ['dist/migrations/*.js'],
};
