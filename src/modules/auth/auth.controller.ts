import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '@modules/user/dto/create-user.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth/jwt-auth.guard';
import { RefreshAuthGuard } from '@modules/auth/guards/refresh-auth/refresh-auth.guard';
import { LocalAuthGuard } from '@modules/auth/guards/local-auth/local-auth.guard';
import { Public } from '@modules/auth/decorators/public.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  login(@Request() req) {
    return this.authService.login(req.user.id);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new account' })
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Public()
  @UseGuards(RefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  refreshToken(@Req() req) {
    return this.authService.refreshToken(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  logout(@Req() req) {
    return this.authService.signOut(req.user.id);
  }
}
