import { Module } from '@nestjs/common';
import { SyncDataService } from './sync-data.service';
import { LoggerModule } from '@app/logger/logger.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BitrixModule } from '@app/bitrix/bitrix.module';
import { HttpModule } from '@nestjs/axios';
import { MongoModule } from '@app/mongo/mongo.module';

@Module({
  imports: [ConfigModule ,LoggerModule, ScheduleModule.forRoot(), BitrixModule,     
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        headers: {
            'User-Agent': 'ProVitSer/1.0.2',
            'Content-Type': 'application/json',
        },
    }),
    inject: [ConfigService],
  }), 
  MongoModule],
  exports: [SyncDataService],
  providers: [SyncDataService]
})
export class SyncDataModule {}
