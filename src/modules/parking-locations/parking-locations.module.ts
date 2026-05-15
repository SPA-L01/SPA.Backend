import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingLocationsController } from './parking-locations.controller';
import { ParkingLocationsService } from './parking-locations.service';
import { FavouritesController } from './favourites.controller';
import { FavouritesService } from './favourites.service';
import { ParkingLocation } from './entities/parking-location.entity';
import { ParkingSlot } from './entities/parking-slot.entity';
import { FavouriteParking } from './entities/favourite-parking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ParkingLocation, ParkingSlot, FavouriteParking])],
  controllers: [ParkingLocationsController, FavouritesController],
  providers: [ParkingLocationsService, FavouritesService],
  exports: [ParkingLocationsService, FavouritesService],
})
export class ParkingLocationsModule {}
