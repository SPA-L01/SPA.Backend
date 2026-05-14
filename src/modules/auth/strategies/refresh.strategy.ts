import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { AuthJwtPayload } from '@modules/auth/types/auth-jwt-payload.type';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import refreshJwtConfig from '@modules/auth/config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import { AuthService } from '@modules/auth/auth.service';
import { Request } from 'express';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: refreshJwtConfiguration.secret as string,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: AuthJwtPayload) {
    const authHeader = req.get('authorization');
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }
    const refreshToken = authHeader.replace('Bearer ', '').trim();
    return this.authService.validateRefreshToken(payload.sub, refreshToken);
  }
}
