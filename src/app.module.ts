import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { ParkingLocationsModule } from './modules/parking-locations/parking-locations.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { SurveyModule } from './modules/survey/survey.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
    }),
    ParkingLocationsModule,
    UserModule,
    WalletModule,
    SessionsModule,
    AuthModule,
    SurveyModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
