import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { VehicleType, SlotStatus } from '../enums/vehicle-type.enum';
import { ParkingLocation } from './parking-location.entity';

@Entity('parking_slots')
export class ParkingSlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'location_id' })
  locationId: string;

  @Column({ name: 'slot_number', length: 20 })
  slotNumber: string;

  @Column({
    type: 'enum',
    enum: VehicleType,
    name: 'vehicle_type',
  })
  vehicleType: VehicleType;

  @Column({
    type: 'enum',
    enum: SlotStatus,
    default: SlotStatus.AVAILABLE,
  })
  status: SlotStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(() => ParkingLocation, (location) => location.slots, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'location_id' })
  location: ParkingLocation;
}
