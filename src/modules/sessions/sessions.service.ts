import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  ParkingSession,
  SessionStatus,
  PaymentStatus,
} from './entities/parking-session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { WalletService } from '@modules/wallet/wallet.service';
import { ParkingLocation } from '@modules/parking-locations/entities/parking-location.entity';
import { ParkingSlot } from '@modules/parking-locations/entities/parking-slot.entity';

const ESTIMATED_HOURS = 2; // upfront charge estimate for check-in

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(ParkingSession)
    private readonly sessionRepo: Repository<ParkingSession>,
    @InjectRepository(ParkingLocation)
    private readonly locationRepo: Repository<ParkingLocation>,
    @InjectRepository(ParkingSlot)
    private readonly slotRepo: Repository<ParkingSlot>,
    private readonly walletService: WalletService,
    private readonly dataSource: DataSource,
  ) {}

  async checkIn(userId: string, dto: CreateSessionDto): Promise<ParkingSession> {
    return this.dataSource.transaction(async (manager) => {
      // Validate parking location
      const location = await manager.findOne(ParkingLocation, {
        where: { id: dto.parkingLocationId },
      });
      if (!location) throw new NotFoundException('Parking location not found');

      // Validate slot if provided
      if (dto.slotId) {
        const slot = await manager.findOne(ParkingSlot, {
          where: { id: dto.slotId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!slot) throw new NotFoundException('Slot not found');
        if (slot.status !== 'available')
          throw new BadRequestException('Slot is not available');

        // Mark slot occupied
        slot.status = 'occupied' as any;
        await manager.save(ParkingSlot, slot);
      }

      // Estimated fee = hourlyRate * ESTIMATED_HOURS
      const hourlyRate = Number(location.hourlyRate ?? 0);
      const estimatedFee = hourlyRate * ESTIMATED_HOURS;

      // Deduct wallet (will throw if insufficient balance)
      if (estimatedFee > 0) {
        await this.walletService.createPayment(
          userId,
          estimatedFee,
          `Check-in: ${location.name}`,
        );
      }

      const session = manager.create(ParkingSession, {
        userId,
        parkingLocationId: dto.parkingLocationId,
        slotId: dto.slotId ?? null,
        vehicleType: dto.vehicleType,
        licensePlate: dto.licensePlate ?? null,
        status: SessionStatus.ACTIVE,
        checkInAt: new Date(),
        paymentStatus: estimatedFee > 0 ? PaymentStatus.PAID : PaymentStatus.PENDING,
        totalFee: estimatedFee,
      });

      return manager.save(ParkingSession, session);
    });
  }

  async getMySessions(userId: string): Promise<ParkingSession[]> {
    return this.sessionRepo.find({
      where: { userId, isDeleted: false },
      relations: ['parkingLocation'],
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async getMyActiveSession(userId: string): Promise<ParkingSession | null> {
    return this.sessionRepo.findOne({
      where: { userId, status: SessionStatus.ACTIVE, isDeleted: false },
      relations: ['parkingLocation'],
    });
  }

  async checkOut(userId: string, sessionId: string): Promise<ParkingSession> {
    return this.dataSource.transaction(async (manager) => {
      const session = await manager.findOne(ParkingSession, {
        where: { id: sessionId, userId, isDeleted: false },
        lock: { mode: 'pessimistic_write' },
        relations: ['parkingLocation'],
      });

      if (!session) throw new NotFoundException('Session not found');
      if (session.status !== SessionStatus.ACTIVE)
        throw new BadRequestException('Session is not active');

      const now = new Date();
      const durationMs = now.getTime() - session.checkInAt.getTime();
      const durationMinutes = Math.ceil(durationMs / 60000);
      const durationHours = Math.ceil(durationMinutes / 60);
      const hourlyRate = Number(session.parkingLocation?.hourlyRate ?? 0);
      const actualFee = hourlyRate * durationHours;
      const alreadyCharged = session.totalFee ?? 0;
      const diff = actualFee - alreadyCharged;

      // Deduct extra if actual > estimate, or refund if less
      if (diff > 0) {
        await this.walletService.createPayment(
          userId,
          diff,
          `Additional charge: ${session.parkingLocation?.name}`,
        );
      } else if (diff < 0) {
        await this.walletService.topUp(userId, Math.abs(diff));
      }

      // Free the slot
      if (session.slotId) {
        await manager.update(ParkingSlot, { id: session.slotId }, { status: 'available' as any });
      }

      session.status = SessionStatus.COMPLETED;
      session.checkOutAt = now;
      session.durationMinutes = durationMinutes;
      session.totalFee = actualFee;
      session.paymentStatus = PaymentStatus.PAID;

      return manager.save(ParkingSession, session);
    });
  }

  async cancelSession(userId: string, sessionId: string): Promise<ParkingSession> {
    // ... (existing code omitted for brevity in instruction, will be included in replacement)
    return this.dataSource.transaction(async (manager) => {
      const session = await manager.findOne(ParkingSession, {
        where: { id: sessionId, userId, isDeleted: false },
        lock: { mode: 'pessimistic_write' },
      });

      if (!session) throw new NotFoundException('Session not found');
      if (session.status !== SessionStatus.ACTIVE)
        throw new BadRequestException('Only active sessions can be cancelled');

      // Refund estimate
      if (session.totalFee && session.totalFee > 0) {
        await this.walletService.topUp(userId, session.totalFee);
      }

      // Free slot
      if (session.slotId) {
        await manager.update(ParkingSlot, { id: session.slotId }, { status: 'available' as any });
      }

      session.status = SessionStatus.CANCELLED;
      session.paymentStatus = PaymentStatus.REFUNDED;
      return manager.save(ParkingSession, session);
    });
  }

  async saveSpot(
    userId: string,
    sessionId: string,
    data: {
      latitude?: number;
      longitude?: number;
      photoUrl?: string;
      note?: string;
    },
  ): Promise<ParkingSession> {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, userId, status: SessionStatus.ACTIVE, isDeleted: false },
    });

    if (!session) throw new NotFoundException('Active session not found');

    if (data.latitude) session.savedLatitude = data.latitude;
    if (data.longitude) session.savedLongitude = data.longitude;
    if (data.photoUrl) session.savedPhotoUrl = data.photoUrl;
    if (data.note) session.savedNote = data.note;

    return this.sessionRepo.save(session);
  }
}
