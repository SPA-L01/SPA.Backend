import { Exclude, Expose } from 'class-transformer';
import { LocationStatus } from '../enums/location-status.enum';

@Exclude()
export class ParkingLocationResponseDto {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() slug: string;
  @Expose() address: string;
  @Expose() latitude: number;
  @Expose() longitude: number;
  @Expose() phone: string;
  @Expose() email: string;
  @Expose() description: string;
  @Expose() imageUrl: string;
  @Expose() status: LocationStatus;
  @Expose() totalSlots: number;
  @Expose() availableSlots: number;
  @Expose() hourlyRate: number;
  @Expose() dailyRate: number;
  @Expose() monthlyRate: number;
  @Expose() openTime: string;
  @Expose() closeTime: string;
  @Expose() is24h: boolean;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
