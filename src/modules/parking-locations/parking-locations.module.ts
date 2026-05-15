import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingLocationsController } from './parking-locations.controller';
import { ParkingLocationsService } from './parking-locations.service';
import { FavouritesController } from './favourites.controller';
import { FavouritesService } from './favourites.service';
import { SavedParkingService } from './saved-parking.service';
import { SavedParkingController } from './saved-parking.controller';
import { ParkingLocation } from './entities/parking-location.entity';
import { ParkingSlot } from './entities/parking-slot.entity';
import { FavouriteParking } from './entities/favourite-parking.entity';
import { SavedParkingSpot, SavedParkingPhoto } from './entities/saved-parking-spot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ParkingLocation,
      ParkingSlot,
      FavouriteParking,
      SavedParkingSpot,
      SavedParkingPhoto,
    ]),
  ],
  controllers: [ParkingLocationsController, FavouritesController, SavedParkingController],
  providers: [ParkingLocationsService, FavouritesService, SavedParkingService],
  exports: [ParkingLocationsService, SavedParkingService],
})
export class ParkingLocationsModule {}
