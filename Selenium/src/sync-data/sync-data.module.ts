import { Module } from '@nestjs/common';
import { SyncDataService } from './sync-data.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@app/logger/logger.module';
import { SeleniumModule } from '@app/selenium/selenium.module';

@Module({
  imports: [ScheduleModule.forRoot(), LoggerModule, ConfigModule, SeleniumModule],
  exports: [SyncDataService],
  providers: [SyncDataService]
})
export class SyncDataModule {}
