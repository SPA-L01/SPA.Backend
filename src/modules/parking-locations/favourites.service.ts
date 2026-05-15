import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavouriteParking } from './entities/favourite-parking.entity';
import { ParkingLocation } from './entities/parking-location.entity';

@Injectable()
export class FavouritesService {
  constructor(
    @InjectRepository(FavouriteParking)
    private readonly favouriteRepo: Repository<FavouriteParking>,
    @InjectRepository(ParkingLocation)
    private readonly locationRepo: Repository<ParkingLocation>,
  ) {}

  async getFavourites(userId: string): Promise<ParkingLocation[]> {
    const favourites = await this.favouriteRepo.find({
      where: { userId },
      relations: ['parkingLocation'],
      order: { createdAt: 'DESC' },
    });
    return favourites.map((f) => f.parkingLocation);
  }

  async addFavourite(userId: string, locationId: string): Promise<FavouriteParking> {
    const location = await this.locationRepo.findOne({ where: { id: locationId } });
    if (!location) throw new NotFoundException('Parking location not found');

    const existing = await this.favouriteRepo.findOne({
      where: { userId, parkingLocationId: locationId },
    });
    if (existing) return existing;

    const favourite = this.favouriteRepo.create({
      userId,
      parkingLocationId: locationId,
    });
    return this.favouriteRepo.save(favourite);
  }

  async removeFavourite(userId: string, locationId: string): Promise<void> {
    const result = await this.favouriteRepo.delete({ userId, parkingLocationId: locationId });
    if (result.affected === 0) throw new NotFoundException('Favourite not found');
  }

  async isFavourite(userId: string, locationId: string): Promise<boolean> {
    const count = await this.favouriteRepo.count({
      where: { userId, parkingLocationId: locationId },
    });
    return count > 0;
  }
}
