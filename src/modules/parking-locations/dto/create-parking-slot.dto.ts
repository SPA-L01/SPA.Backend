import { IsString, IsNotEmpty, IsEnum, IsOptional, Length } from 'class-validator';
import { VehicleType, SlotStatus } from '../enums/vehicle-type.enum';

export class CreateParkingSlotDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  slotNumber: string;

  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @IsOptional()
  @IsEnum(SlotStatus)
  status?: SlotStatus;
}
