import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { LocationStatus } from '../enums/location-status.enum';
import { ParkingSlot } from './parking-slot.entity';

@Entity('parking_locations')
export class ParkingLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  slug: string;

  @Column('text')
  address: string;

  @Column('decimal', { precision: 10, scale: 8 })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8 })
  longitude: number;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('text', { name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({
    type: 'enum',
    enum: LocationStatus,
    default: LocationStatus.ACTIVE,
  })
  status: LocationStatus;

  @Column({ name: 'total_slots', default: 0 })
  totalSlots: number;

  @Column({ name: 'available_slots', default: 0 })
  availableSlots: number;

  @Column('decimal', { name: 'hourly_rate', precision: 10, scale: 2 })
  hourlyRate: number;

  @Column('decimal', {
    name: 'daily_rate',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  dailyRate: number;

  @Column('decimal', {
    name: 'monthly_rate',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  monthlyRate: number;

  @Column('time', { name: 'open_time', default: '07:00' })
  openTime: string;

  @Column('time', { name: 'close_time', default: '22:00' })
  closeTime: string;

  @Column({ name: 'is_24h', default: false })
  is24h: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => ParkingSlot, (slot) => slot.location, { cascade: true })
  slots: ParkingSlot[];
}
