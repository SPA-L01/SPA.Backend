import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { ParkingLocationsModule } from './modules/parking-locations/parking-locations.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    ParkingLocationsModule,
  ],
})
export class AppModule {}
