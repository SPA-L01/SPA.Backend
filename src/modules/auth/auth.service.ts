import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@modules/user/user.service';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from '@modules/auth/types/auth-jwt-payload.type';
import { CreateUserDto } from '@modules/user/dto/create-user.dto';
import refreshJwtConfig from '@modules/auth/config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import { CurrentUser } from '@modules/auth/types/current-user.type';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User does not exist');
    const isMatch = await compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
    return { id: user.id };
  }

  async login(userId: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.userService.updateHashRefreshToken(userId, hashedRefreshToken);
    return { id: userId, accessToken, refreshToken };
  }

  async register(dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  async generateTokens(userId: string) {
    const payload: AuthJwtPayload = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);
    return { accessToken, refreshToken };
  }

  async refreshToken(userId: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.userService.updateHashRefreshToken(userId, hashedRefreshToken);
    return { id: userId, accessToken, refreshToken };
  }

  async validateJwtUser(userId: string): Promise<CurrentUser> {
    const user = await this.userService.findOneById(userId);
    if (!user) throw new UnauthorizedException('User does not exist');
    return { id: userId, role: user.role };
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.userService.findOneById(userId);
    if (!user) throw new UnauthorizedException('Invalid refresh token');

    const hashed = await this.userService.findHashedRefreshToken(userId);
    if (!hashed) throw new UnauthorizedException('Invalid refresh token');

    const isValid = await argon2.verify(hashed, refreshToken);
    if (!isValid) throw new UnauthorizedException('Refresh token mismatch');

    return { id: userId };
  }

  async signOut(userId: string) {
    await this.userService.updateHashRefreshToken(userId, null);
  }
}
