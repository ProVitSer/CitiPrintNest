import { LoggerModule } from '@app/logger/logger.module';
import { MailModule } from '@app/mail/mail.module';
import { MongoModule } from '@app/mongo/mongo.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SeleniumService } from './selenium.service';

@Module({
  imports: [ConfigModule, LoggerModule, MongoModule, MailModule],
  providers: [SeleniumService],
  exports: [SeleniumService]
})
export class SeleniumModule {}
