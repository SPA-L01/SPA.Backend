import { Module } from '@nestjs/common';
import { UserModule } from '@modules/user/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from '@modules/auth/strategies/local.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@modules/user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '@modules/auth/config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import refreshJwtConfig from '@modules/auth/config/refresh-jwt.config';
import { JwtStrategy } from '@modules/auth/strategies/jwt.strategy';
import { RefreshJwtStrategy } from '@modules/auth/strategies/refresh.strategy';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '@modules/auth/guards/roles/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UserModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    RefreshJwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AuthModule {}
