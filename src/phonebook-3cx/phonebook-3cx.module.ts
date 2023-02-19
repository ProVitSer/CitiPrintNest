import { LoggerModule } from '@app/logger/logger.module';
import { MongoModule } from '@app/mongo/mongo.module';
import { SeleniumModule } from '@app/selenium/selenium.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { Login, Logout, Phonebook} from './phonebook-3cx-selenium';
import { Phonebook3cxSchedule } from './phonebook-3cx.schedule';
import { Phonebook3cxService } from './phonebook-3cx.service';

@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule, LoggerModule, SeleniumModule, MongoModule],
  providers: [Phonebook3cxSchedule, Phonebook3cxService, Login, Phonebook, Logout],
  exports: [],
})
export class Phonebook3cxModule {}
