import { LoggerModule } from '@app/logger/logger.module';
import { MongoModule } from '@app/mongo/mongo.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SeleniumService } from './selenium.service';

@Module({
  imports: [ConfigModule, LoggerModule, MongoModule],
  providers: [SeleniumService],
  exports: [SeleniumService]
})
export class SeleniumModule {}
