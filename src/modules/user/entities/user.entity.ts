import { Column, Entity, BeforeInsert } from 'typeorm';
import { BaseEntity } from '@core/domain/base.entity';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { Role } from '../enums/role.enum';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column({ select: false })
  password: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({ name: 'avatar_url', nullable: true, type: 'text' })
  avatarUrl: string | null;

  @Column({ name: 'phone_no', nullable: true, length: 20 })
  phoneNo: string | null;

  @Exclude()
  @Column({
    name: 'hashed_refresh_token',
    type: 'text',
    nullable: true,
    select: false,
  })
  hashedRefreshToken: string | null;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
