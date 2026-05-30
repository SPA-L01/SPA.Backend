import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CreateAnalyticsEventDto } from './dto/create-analytics-event.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../user/enums/role.enum';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Nhận event từ mobile app — không cần auth, gọi fire-and-forget
   */
  @Public()
  @Post('event')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Ghi nhận một analytics event từ mobile app' })
  @ApiResponse({ status: 202, description: 'Event nhận được' })
  async trackEvent(@Body() dto: CreateAnalyticsEventDto) {
    await this.analyticsService.trackEvent(dto);
    return { ok: true };
  }

  /**
   * Dashboard metrics — chỉ ADMIN mới xem được
   */
  @Get('stats')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thống kê analytics tổng hợp (Admin)' })
  async getStats() {
    return this.analyticsService.getStats();
  }
}
