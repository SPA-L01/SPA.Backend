import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import jwtConfig from '@modules/auth/config/jwt.config';
import { AuthJwtPayload } from '@modules/auth/types/auth-jwt-payload.type';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { AuthService } from '@modules/auth/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfiguration.secret as string,
    });
  }

  validate(payload: AuthJwtPayload) {
    return this.authService.validateJwtUser(payload.sub);
  }
}
