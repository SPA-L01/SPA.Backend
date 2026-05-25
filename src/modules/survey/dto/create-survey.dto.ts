import {
  IsInt,
  Min,
  Max,
  IsString,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSurveyDto {
  @ApiProperty({ example: 5, description: 'Overall app rating (1-5)' })
  @IsInt()
  @Min(1)
  @Max(5)
  overallRating: number;

  @ApiProperty({ example: 4, description: 'Usability & search rating (1-5)' })
  @IsInt()
  @Min(1)
  @Max(5)
  usabilityRating: number;

  @ApiProperty({ example: 5, description: 'Booking rating (1-5)' })
  @IsInt()
  @Min(1)
  @Max(5)
  bookingRating: number;

  @ApiProperty({ example: 4, description: 'UI/UX layout rating (1-5)' })
  @IsInt()
  @Min(1)
  @Max(5)
  uiRating: number;

  @ApiPropertyOptional({ example: 'Rất hài lòng, ứng dụng mượt và tìm bãi nhanh.' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ example: '1.0.0' })
  @IsOptional()
  @IsString()
  appVersion?: string;

  @ApiPropertyOptional({ example: 'ios' })
  @IsOptional()
  @IsString()
  deviceOS?: string;

  @ApiPropertyOptional({ example: 120, description: 'Session duration in seconds' })
  @IsOptional()
  @IsInt()
  sessionDurationSeconds?: number;

  @ApiPropertyOptional({ example: 'CheckoutScreen' })
  @IsOptional()
  @IsString()
  lastVisitedScreen?: string;
}
