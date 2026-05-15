import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingSession } from './entities/parking-session.entity';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { WalletModule } from '@modules/wallet/wallet.module';
import { ParkingLocation } from '@modules/parking-locations/entities/parking-location.entity';
import { ParkingSlot } from '@modules/parking-locations/entities/parking-slot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ParkingSession, ParkingLocation, ParkingSlot]),
    WalletModule,
  ],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
