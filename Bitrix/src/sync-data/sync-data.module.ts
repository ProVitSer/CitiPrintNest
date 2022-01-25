import { Module } from '@nestjs/common';
import { SyncDataService } from './sync-data.service';
import { LoggerModule } from '@app/logger/logger.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule ,LoggerModule, ScheduleModule.forRoot()],
  exports: [SyncDataService],
  providers: [SyncDataService]
})
export class SyncDataModule {}
