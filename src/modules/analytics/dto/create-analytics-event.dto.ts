import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAnalyticsEventDto {
  @ApiProperty({ example: 'checkout_success' })
  @IsString()
  eventName: string;

  @ApiPropertyOptional({ example: { session_id: 'abc123', total_fee: 15000 } })
  @IsOptional()
  @IsObject()
  params?: Record<string, any>;

  @ApiPropertyOptional({ example: '/(tabs)/sessions' })
  @IsOptional()
  @IsString()
  screenName?: string;

  @ApiPropertyOptional({ example: 'sess_k3m2x9' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({ example: 'user-uuid' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ example: 'ios' })
  @IsOptional()
  @IsString()
  deviceOs?: string;

  @ApiPropertyOptional({ example: '1.0.0' })
  @IsOptional()
  @IsString()
  appVersion?: string;

  @ApiPropertyOptional({ description: 'ISO timestamp từ client (nếu cần sync offline)' })
  @IsOptional()
  @IsString()
  clientTimestamp?: string;
}
