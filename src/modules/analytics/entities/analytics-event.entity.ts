import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('analytics_events')
@Index(['eventName'])
@Index(['sessionId'])
@Index(['userId'])
@Index(['eventTimestamp'])
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_name' })
  eventName: string;

  @Column({ type: 'jsonb', nullable: true })
  params: Record<string, any> | null;

  @Column({ name: 'screen_name', nullable: true })
  screenName: string | null;

  /** UUID của phiên làm việc — tạo khi app khởi động, reset mỗi session */
  @Column({ name: 'session_id', nullable: true })
  sessionId: string | null;

  /** userId từ JWT, null nếu chưa đăng nhập */
  @Column({ name: 'user_id', nullable: true })
  userId: string | null;

  @Column({ name: 'device_os', nullable: true })
  deviceOs: string | null;

  @Column({ name: 'app_version', nullable: true })
  appVersion: string | null;

  @CreateDateColumn({ name: 'event_timestamp' })
  eventTimestamp: Date;
}
