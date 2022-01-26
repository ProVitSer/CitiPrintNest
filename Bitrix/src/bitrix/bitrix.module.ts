import { LoggerModule } from '@app/logger/logger.module';
import { MongoModule } from '@app/mongo/mongo.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BitrixService } from './bitrix.service';

@Module({
  exports:[ConfigModule, LoggerModule, MongoModule],
  providers: [BitrixService]
})
export class BitrixModule {}
