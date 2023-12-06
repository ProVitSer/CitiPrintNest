import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './conf/config.provides';
import { MongoModule } from './mongo/mongo.module';
import { AsteriskModule } from './asterisk/asterisk.module';
import { BitrixModule } from './bitrix/bitrix.module';
import { PostgresModule } from './postgres/postgres.module';
import { SyncDataModule } from './sync-data/sync-data.module';
import { NetServerModule } from './net-server/net-server.module';
import { SeleniumModule } from './selenium/selenium.module';
import { Phonebook3cxModule } from './phonebook-3cx/phonebook-3cx.module';

@Module({
  imports: [ConfigModule.forRoot({ load: [configuration] }), 
  LoggerModule, 
  MongoModule,
  AsteriskModule,
  BitrixModule,
  PostgresModule,
  SyncDataModule,
  NetServerModule,
  SeleniumModule,
  Phonebook3cxModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}