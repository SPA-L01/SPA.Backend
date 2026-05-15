import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParkingLocation } from './entities/parking-location.entity';
import { ParkingSlot } from './entities/parking-slot.entity';
import { CreateParkingLocationDto } from './dto/create-parking-location.dto';
import { UpdateParkingLocationDto } from './dto/update-parking-location.dto';
import { ParkingLocationQueryDto } from './dto/parking-location-query.dto';
import { CreateParkingSlotDto } from './dto/create-parking-slot.dto';
import { LocationStatus } from './enums/location-status.enum';

@Injectable()
export class ParkingLocationsService {
  constructor(
    @InjectRepository(ParkingLocation)
    private readonly locationRepo: Repository<ParkingLocation>,
    @InjectRepository(ParkingSlot)
    private readonly slotRepo: Repository<ParkingSlot>,
  ) {}

  // ── Create ────────────────────────────────────────────────────────────────
  async create(dto: CreateParkingLocationDto): Promise<ParkingLocation> {
    const existing = await this.locationRepo.findOne({
      where: { slug: dto.slug },
      withDeleted: false,
    });
    if (existing) {
      throw new ConflictException(`Slug "${dto.slug}" đã tồn tại`);
    }

    const location = this.locationRepo.create({
      ...dto,
      availableSlots: dto.totalSlots,
    });
    return this.locationRepo.save(location);
  }

  // ── Find All (paginated + filtered) ───────────────────────────────────────
  async findAll(query: ParkingLocationQueryDto) {
    const {
      search,
      status,
      hasAvailableSlots,
      minHourlyRate,
      maxHourlyRate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const qb = this.locationRepo
      .createQueryBuilder('loc')
      .where('loc.deleted_at IS NULL');

    if (search) {
      qb.andWhere(
        '(loc.name ILIKE :search OR loc.address ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (status) {
      qb.andWhere('loc.status = :status', { status });
    }
    if (hasAvailableSlots) {
      qb.andWhere('loc.available_slots > 0');
    }
    if (minHourlyRate !== undefined) {
      qb.andWhere('loc.hourly_rate >= :min', { min: minHourlyRate });
    }
    if (maxHourlyRate !== undefined) {
      qb.andWhere('loc.hourly_rate <= :max', { max: maxHourlyRate });
    }

    const allowedSort = ['name', 'createdAt', 'hourlyRate', 'availableSlots', 'viewCount'];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'createdAt';

    qb.orderBy(`loc.${safeSortBy}`, sortOrder as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ── Find Nearby (Haversine formula via PostgreSQL) ─────────────────────────
  async findNearby(lat: number, lng: number, radiusKm = 5): Promise<ParkingLocation[]> {
    return this.locationRepo
      .createQueryBuilder('loc')
      .where('loc.status = :status', { status: LocationStatus.ACTIVE })
      .andWhere('loc.deleted_at IS NULL')
      .andWhere(
        `(
          6371 * acos(
            cos(radians(:lat)) * cos(radians(CAST(loc.latitude AS FLOAT)))
            * cos(radians(CAST(loc.longitude AS FLOAT)) - radians(:lng))
            + sin(radians(:lat)) * sin(radians(CAST(loc.latitude AS FLOAT)))
          )
        ) < :radius`,
        { lat, lng, radius: radiusKm },
      )
      .orderBy('loc.available_slots', 'DESC')
      .getMany();
  }

  // ── Find One ──────────────────────────────────────────────────────────────
  async findOne(id: string): Promise<ParkingLocation> {
    const location = await this.locationRepo.findOne({
      where: { id },
      relations: ['slots'],
    });
    if (!location) {
      throw new NotFoundException(`Không tìm thấy điểm gửi xe #${id}`);
    }
    
    // Increment view count for popularity tracking
    await this.locationRepo.increment({ id }, 'viewCount', 1);
    
    return location;
  }

  // ── Update ────────────────────────────────────────────────────────────────
  async update(
    id: string,
    dto: UpdateParkingLocationDto,
  ): Promise<ParkingLocation> {
    const location = await this.findOne(id);

    if (dto.slug && dto.slug !== location.slug) {
      const conflict = await this.locationRepo.findOne({
        where: { slug: dto.slug },
      });
      if (conflict) {
        throw new ConflictException(`Slug "${dto.slug}" đã tồn tại`);
      }
    }

    Object.assign(location, dto);
    return this.locationRepo.save(location);
  }

  // ── Update Status ─────────────────────────────────────────────────────────
  async updateStatus(
    id: string,
    status: LocationStatus,
  ): Promise<ParkingLocation> {
    const location = await this.findOne(id);
    location.status = status;
    return this.locationRepo.save(location);
  }

  // ── Soft Delete ───────────────────────────────────────────────────────────
  async remove(id: string): Promise<void> {
    const result = await this.locationRepo.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy điểm gửi xe #${id}`);
    }
  }

  // ── Slots: Get ────────────────────────────────────────────────────────────
  async getSlots(locationId: string): Promise<ParkingSlot[]> {
    await this.findOne(locationId); // validate location exists
    return this.slotRepo.find({ where: { locationId } });
  }

  // ── Slots: Add ────────────────────────────────────────────────────────────
  async addSlots(
    locationId: string,
    dtos: CreateParkingSlotDto[],
  ): Promise<ParkingSlot[]> {
    const location = await this.findOne(locationId);

    const slots = dtos.map((dto) =>
      this.slotRepo.create({ ...dto, locationId }),
    );
    const saved = await this.slotRepo.save(slots);

    // Sync total_slots & available_slots
    location.totalSlots += saved.length;
    location.availableSlots += saved.length;
    await this.locationRepo.save(location);

    return saved;
  }
}
