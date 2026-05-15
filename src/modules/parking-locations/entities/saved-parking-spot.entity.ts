import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '@modules/user/entities/user.entity';
import { ParkingLocation } from './parking-location.entity';

@Entity('saved_parking_spots')
export class SavedParkingSpot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'local_id', unique: true })
  localId: string; // UUID from device to deduplicate

  @Column({ name: 'parking_location_id', nullable: true })
  parkingLocationId: string;

  @ManyToOne(() => ParkingLocation, { nullable: true })
  @JoinColumn({ name: 'parking_location_id' })
  parkingLocation: ParkingLocation;

  @Column({ nullable: true })
  floor: string;

  @Column({ nullable: true })
  zone: string;

  @Column({ nullable: true })
  column: string;

  @Column('text', { nullable: true })
  note: string;

  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column('float', { nullable: true })
  accuracy: number;

  @Column({ name: 'address_label', nullable: true })
  addressLabel: string;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'COMPLETED'],
    default: 'ACTIVE',
  })
  status: 'ACTIVE' | 'COMPLETED';

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ name: 'duration_ms', type: 'bigint', nullable: true })
  durationMs: number;

  @OneToMany(() => SavedParkingPhoto, (photo) => photo.savedSpot, { cascade: true })
  photos: SavedParkingPhoto[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('saved_parking_photos')
export class SavedParkingPhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'saved_spot_id' })
  savedSpotId: string;

  @ManyToOne(() => SavedParkingSpot, (spot) => spot.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'saved_spot_id' })
  savedSpot: SavedParkingSpot;

  @Column('text')
  url: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
