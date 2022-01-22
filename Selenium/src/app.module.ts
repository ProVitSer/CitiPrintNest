import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/config.provides';
import { LoggerModule } from './logger/logger.module';
import { MongoModule } from './mongo/mongo.module';
import { SeleniumModule } from './selenium/selenium.module';
import { SyncDataModule } from './sync-data/sync-data.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [ConfigModule.forRoot({ load: [configuration] }), LoggerModule, SyncDataModule, SeleniumModule, MongoModule, MailModule],
  controllers: [AppController],
  providers: [AppService],
  exports: [ConfigModule],

})
export class AppModule {}
