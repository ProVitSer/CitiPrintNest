import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/config.provides';
import { MongoModule } from './mongo/mongo.module';
import { AsteriskModule } from './asterisk/asterisk.module';
import { BitrixModule } from './bitrix/bitrix.module';
import { PostgresModule } from './postgres/postgres.module';

@Module({
  imports: [ConfigModule.forRoot({ load: [configuration] }), LoggerModule, MongoModule, AsteriskModule, BitrixModule, PostgresModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
