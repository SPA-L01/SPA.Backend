import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { VehicleType } from '../entities/parking-session.entity';

export class CreateSessionDto {
  @IsUUID()
  parkingLocationId: string;

  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @IsOptional()
  @IsUUID()
  slotId?: string;

  @IsOptional()
  @IsString()
  licensePlate?: string;
}
