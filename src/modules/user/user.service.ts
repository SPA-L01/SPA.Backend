import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { WalletService } from '@modules/wallet/wallet.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly walletService: WalletService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userRepo.findOne({
      where: { email: createUserDto.email },
    });
    if (existing) {
      throw new BadRequestException('Email already in use');
    }
    const user = this.userRepo.create(createUserDto);
    const savedUser = await this.userRepo.save(user);
    await this.walletService.createForUser(savedUser.id);
    return savedUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findOneById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async updateHashRefreshToken(
    userId: string,
    hashedRefreshToken: string | null,
  ): Promise<void> {
    await this.userRepo.update({ id: userId }, { hashedRefreshToken });
  }

  async findHashedRefreshToken(userId: string): Promise<string | null> {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.hashedRefreshToken')
      .where('user.id = :id', { id: userId })
      .getOne();
    return user?.hashedRefreshToken ?? null;
  }
}
