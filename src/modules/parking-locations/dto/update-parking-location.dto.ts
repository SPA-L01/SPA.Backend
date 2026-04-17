import { PartialType } from '@nestjs/mapped-types';
import { CreateParkingLocationDto } from './create-parking-location.dto';

export class UpdateParkingLocationDto extends PartialType(
  CreateParkingLocationDto,
) {}
