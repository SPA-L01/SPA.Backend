import { Column, Entity, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '@core/domain/base.entity';
import { User } from '@modules/user/entities/user.entity';
import { ParkingLocation } from '@modules/parking-locations/entities/parking-location.entity';

@Entity('favourite_parkings')
@Unique(['userId', 'parkingLocationId'])
export class FavouriteParking extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'parking_location_id', type: 'uuid' })
  parkingLocationId: string;

  @ManyToOne(() => ParkingLocation)
  @JoinColumn({ name: 'parking_location_id' })
  parkingLocation: ParkingLocation;
}
