import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { ParkingLocationsModule } from './modules/parking-locations/parking-locations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Để ConfigService khả dụng ở mọi nơi
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
    }),
    ParkingLocationsModule,
  ],
})
export class AppModule {}
