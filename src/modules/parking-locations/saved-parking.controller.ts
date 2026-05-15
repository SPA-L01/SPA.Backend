import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { CurrentUser as CurrentUserType } from '@modules/auth/types/current-user.type';
import { SavedParkingService } from './saved-parking.service';

@ApiTags('Saved Parking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('saved-parking')
export class SavedParkingController {
  constructor(private readonly savedParkingService: SavedParkingService) {}

  @Get()
  @ApiOperation({ summary: 'List user\'s saved parking spots' })
  async findAll(@CurrentUser() user: CurrentUserType) {
    return this.savedParkingService.findAll(user.id);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Bulk sync saved spots from device' })
  async sync(@CurrentUser() user: CurrentUserType, @Body() body: { spots: any[] }) {
    return this.savedParkingService.sync(user.id, body.spots);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a saved spot' })
  async update(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.savedParkingService.update(user.id, id, body);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark a spot as retrieved (COMPLETED)' })
  async complete(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
    @Body() body: { durationMs?: number },
  ) {
    return this.savedParkingService.complete(user.id, id, body.durationMs);
  }

  @Post(':id/photos')
  @ApiOperation({ summary: 'Upload a photo for a saved spot' })
  async uploadPhoto(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
    @Body() body: { url: string },
  ) {
    return this.savedParkingService.uploadPhoto(user.id, id, body.url);
  }
}
