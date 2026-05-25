import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SurveyService } from './survey.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../user/enums/role.enum';

@ApiTags('Surveys')
@ApiBearerAuth()
@Controller('surveys')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a new satisfaction survey' })
  @ApiResponse({ status: 201, description: 'Survey submitted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @CurrentUser() user: any,
    @Body() createSurveyDto: CreateSurveyDto,
  ) {
    return this.surveyService.create(user?.id || null, createSurveyDto);
  }

  @Get('analytics')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get aggregated survey and behavioral analytics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Aggregated analytics data' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin only)' })
  getAnalytics() {
    return this.surveyService.getAnalytics();
  }
}
