import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../core/domain/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity('surveys')
export class Survey extends BaseEntity {
  @Column({ name: 'overall_rating', type: 'int' })
  overallRating: number; // Q1: Overall satisfaction (1-5)

  @Column({ name: 'usability_rating', type: 'int' })
  usabilityRating: number; // Q2: Ease of finding parking (1-5)

  @Column({ name: 'booking_rating', type: 'int' })
  bookingRating: number; // Q3: Booking & check-in experience (1-5)

  @Column({ name: 'ui_rating', type: 'int' })
  uiRating: number; // Q4: App design and fluidity (1-5)

  @Column({ name: 'comment', type: 'text', nullable: true })
  comment: string | null; // Q5: Suggestions and remarks

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ name: 'app_version', length: 50, nullable: true })
  appVersion: string | null;

  @Column({ name: 'device_os', length: 50, nullable: true })
  deviceOS: string | null;

  @Column({ name: 'session_duration_seconds', type: 'int', nullable: true })
  sessionDurationSeconds: number | null;

  @Column({ name: 'last_visited_screen', length: 100, nullable: true })
  lastVisitedScreen: string | null;
}
