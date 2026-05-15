import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ParkingLocation } from '../modules/parking-locations/entities/parking-location.entity';
import { ParkingSlot } from '../modules/parking-locations/entities/parking-slot.entity';
import { User } from '../modules/user/entities/user.entity';
import { Wallet } from '../modules/wallet/entities/wallet.entity';
import { WalletTransaction } from '../modules/wallet/entities/wallet-transaction.entity';
import { ParkingSession } from '../modules/sessions/entities/parking-session.entity';
import { FavouriteParking } from '../modules/parking-locations/entities/favourite-parking.entity';
import { SavedParkingSpot, SavedParkingPhoto } from '../modules/parking-locations/entities/saved-parking-spot.entity';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const dbUrl = configService.get<string>('DATABASE_URL');
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  console.log(`[DB Config] NODE_ENV: ${nodeEnv}`);

  if (dbUrl) {
    // Rút gọn URL để log (ẩn thông tin nhạy cảm)
    const maskedUrl = dbUrl.replace(/\/\/.*@/, '//****:****@');
    console.log(`[DB Config] Connecting via DATABASE_URL: ${maskedUrl}`);

    return {
      type: 'postgres',
      url: dbUrl,
      entities: [
        ParkingLocation,
        ParkingSlot,
        User,
        Wallet,
        WalletTransaction,
        ParkingSession,
        FavouriteParking,
        SavedParkingSpot,
        SavedParkingPhoto,
      ],
      synchronize: false,
      logging: nodeEnv === 'development',
      ssl: { rejectUnauthorized: false }, // Render yêu cầu SSL
    };
  }

  // Fallback cho local development
  console.log(`[DB Config] No DATABASE_URL found. Falling back to local config.`);
  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', 'password'),
    database: configService.get<string>('DB_NAME', 'spa_parking'),
    entities: [
      ParkingLocation,
      ParkingSlot,
      User,
      Wallet,
      WalletTransaction,
      ParkingSession,
      FavouriteParking,
      SavedParkingSpot,
      SavedParkingPhoto,
    ],
    synchronize: nodeEnv === 'development',
    logging: true,
  };
};
