import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingLocationsController } from './parking-locations.controller';
import { ParkingLocationsService } from './parking-locations.service';
import { ParkingLocation } from './entities/parking-location.entity';
import { ParkingSlot } from './entities/parking-slot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ParkingLocation, ParkingSlot])],
  controllers: [ParkingLocationsController],
  providers: [ParkingLocationsService],
  exports: [ParkingLocationsService],
})
export class ParkingLocationsModule {}
