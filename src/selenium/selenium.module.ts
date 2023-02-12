import { LoggerModule } from '@app/logger/logger.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SeleniumWebdriver } from './selenium-webdriver';

@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [SeleniumWebdriver],
  exports: [SeleniumWebdriver],
})
export class SeleniumModule {}
