import { IsOptional, IsString, IsPhoneNumber, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  firstName?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  lastName?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  phoneNo?: string;

  @IsOptional()
  @IsUrl()
  @ApiPropertyOptional()
  avatarUrl?: string;
}
