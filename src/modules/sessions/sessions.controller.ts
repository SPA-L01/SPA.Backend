import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { CurrentUser as CurrentUserType } from '@modules/auth/types/current-user.type';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';

@ApiTags('Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @ApiOperation({ summary: 'Check-in and create a new parking session' })
  checkIn(@CurrentUser() user: CurrentUserType, @Body() dto: CreateSessionDto) {
    return this.sessionsService.checkIn(user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get all parking sessions for the current user' })
  getMySessions(@CurrentUser() user: CurrentUserType) {
    return this.sessionsService.getMySessions(user.id);
  }

  @Get('my/active')
  @ApiOperation({ summary: 'Get the current active parking session' })
  getMyActiveSession(@CurrentUser() user: CurrentUserType) {
    return this.sessionsService.getMyActiveSession(user.id);
  }

  @Patch(':id/checkout')
  @ApiOperation({ summary: 'Check-out from a parking session' })
  checkOut(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.sessionsService.checkOut(user.id, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel an active session' })
  cancelSession(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.sessionsService.cancelSession(user.id, id);
  }

  @Post(':id/spot')
  @ApiOperation({ summary: 'Save car spot info (GPS, note, photo) for an active session' })
  saveSpot(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
    @Body() data: { latitude?: number; longitude?: number; photoUrl?: string; note?: string },
  ) {
    return this.sessionsService.saveSpot(user.id, id, data);
  }
}
