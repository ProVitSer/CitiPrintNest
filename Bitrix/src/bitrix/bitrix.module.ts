import { LoggerModule } from '@app/logger/logger.module';
import { MongoModule } from '@app/mongo/mongo.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BitrixApiService } from './bitrix.api.service';
import { HttpModule } from "@nestjs/axios";

@Module({
  imports:[ConfigModule, LoggerModule, MongoModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
          headers: {
              'User-Agent': 'ProVitSer/1.0.2',
              'Content-Type': 'application/json',
          },
      }),
      inject: [ConfigService],
  })
  ],
  providers: [BitrixApiService],
  exports: [BitrixApiService],
})
export class BitrixModule {}
