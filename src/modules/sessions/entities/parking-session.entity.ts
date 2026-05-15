import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@core/domain/base.entity';
import { User } from '@modules/user/entities/user.entity';
import { ParkingLocation } from '@modules/parking-locations/entities/parking-location.entity';

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
}

export enum VehicleType {
  CAR = 'car',
  MOTOR = 'motor',
  BICYCLE = 'bicycle',
  TRUCK = 'truck',
}

@Entity('parking_sessions')
export class ParkingSession extends BaseEntity {
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

  @Column({ name: 'slot_id', type: 'uuid', nullable: true })
  slotId: string | null;

  @Column({
    name: 'vehicle_type',
    type: 'enum',
    enum: VehicleType,
    default: VehicleType.CAR,
  })
  vehicleType: VehicleType;

  @Column({ name: 'license_plate', nullable: true })
  licensePlate: string | null;

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.ACTIVE })
  status: SessionStatus;

  @Column({ name: 'check_in_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  checkInAt: Date;

  @Column({ name: 'check_out_at', type: 'timestamptz', nullable: true })
  checkOutAt: Date | null;

  @Column({ name: 'duration_minutes', type: 'int', nullable: true })
  durationMinutes: number | null;

  @Column({ name: 'total_fee', type: 'int', nullable: true })
  totalFee: number | null;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  // Saved Spot Info (Phase 5/6)
  @Column({ name: 'saved_latitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  savedLatitude: number | null;

  @Column({ name: 'saved_longitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  savedLongitude: number | null;

  @Column({ name: 'saved_photo_url', nullable: true })
  savedPhotoUrl: string | null;

  @Column({ name: 'saved_note', type: 'text', nullable: true })
  savedNote: string | null;
}
