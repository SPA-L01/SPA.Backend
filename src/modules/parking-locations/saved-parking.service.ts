import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { SavedParkingSpot, SavedParkingPhoto } from './entities/saved-parking-spot.entity';

@Injectable()
export class SavedParkingService {
  constructor(
    @InjectRepository(SavedParkingSpot)
    private readonly spotRepo: Repository<SavedParkingSpot>,
    @InjectRepository(SavedParkingPhoto)
    private readonly photoRepo: Repository<SavedParkingPhoto>,
  ) {}

  async findAll(userId: string): Promise<SavedParkingSpot[]> {
    return this.spotRepo.find({
      where: { userId },
      relations: ['photos'],
      order: { createdAt: 'DESC' },
    });
  }

  async sync(userId: string, spots: any[]): Promise<any> {
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
    };

    for (const spotData of spots) {
      const { localId, photos, ...data } = spotData;
      
      let spot = await this.spotRepo.findOne({ where: { userId, localId } });
      
      if (spot) {
        // Update existing
        await this.spotRepo.update({ id: spot.id }, data);
        results.updated++;
      } else {
        // Create new
        spot = this.spotRepo.create({
          ...data,
          userId,
          localId,
        });
        spot = await this.spotRepo.save(spot);
        
        // Handle photos if any
        if (photos && photos.length > 0) {
          const photoEntities = photos.map(url => this.photoRepo.create({
            savedSpotId: spot.id,
            url
          }));
          await this.photoRepo.save(photoEntities);
        }
        results.created++;
      }
    }

    return results;
  }

  async update(userId: string, id: string, data: any): Promise<SavedParkingSpot> {
    const spot = await this.spotRepo.findOne({ where: { id, userId } });
    if (!spot) throw new NotFoundException('Saved spot not found');
    
    await this.spotRepo.update({ id }, data);
    return this.spotRepo.findOne({ where: { id }, relations: ['photos'] });
  }

  async complete(userId: string, id: string, durationMs?: number): Promise<SavedParkingSpot> {
    const spot = await this.spotRepo.findOne({ where: { id, userId } });
    if (!spot) throw new NotFoundException('Saved spot not found');
    
    await this.spotRepo.update({ id }, {
      status: 'COMPLETED',
      completedAt: new Date(),
      durationMs
    });
    return this.spotRepo.findOne({ where: { id }, relations: ['photos'] });
  }

  async uploadPhoto(userId: string, id: string, url: string): Promise<SavedParkingPhoto> {
    const spot = await this.spotRepo.findOne({ where: { id, userId } });
    if (!spot) throw new NotFoundException('Saved spot not found');
    
    const photo = this.photoRepo.create({ savedSpotId: id, url });
    return this.photoRepo.save(photo);
  }
}
