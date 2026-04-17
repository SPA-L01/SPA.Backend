import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ParkingLocation } from '../modules/parking-locations/entities/parking-location.entity';
import { ParkingSlot } from '../modules/parking-locations/entities/parking-slot.entity';

export const databaseConfig: TypeOrmModuleOptions = process.env.DATABASE_URL
  ? {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [ParkingLocation, ParkingSlot],
      synchronize: false, // Luôn false trong production
      logging: false,
      ssl: { rejectUnauthorized: false }, // Render yêu cầu SSL
      migrations: ['dist/migrations/*.js'],
    }
  : {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'spa_parking',
      entities: [ParkingLocation, ParkingSlot],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      ssl: false,
      migrations: ['dist/migrations/*.js'],
    };
