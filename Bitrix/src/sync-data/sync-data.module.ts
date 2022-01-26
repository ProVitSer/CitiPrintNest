import { Module } from '@nestjs/common';
import { SyncDataService } from './sync-data.service';
import { LoggerModule } from '@app/logger/logger.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { BitrixModule } from '@app/bitrix/bitrix.module';

@Module({
  imports: [ConfigModule ,LoggerModule, ScheduleModule.forRoot(), BitrixModule],
  exports: [SyncDataService],
  providers: [SyncDataService]
})
export class SyncDataModule {}
