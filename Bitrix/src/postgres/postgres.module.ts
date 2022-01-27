import { Module } from '@nestjs/common';
import { QueryService } from './query.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClCalls } from "./entities/ClCalls";
import { ClParticipants } from "./entities/ClParticipants";
import { ClPartyInfo } from "./entities/ClPartyInfo";
import { ClSegments } from "./entities/ClSegments";
import { CallcentQueuecalls } from "./entities/CallcentQueuecalls";
import { LoggerModule } from '@app/logger/logger.module';
import { PostgresService } from './postgres.service';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('postgres.host'),
        port: configService.get('postgres.port'),
        username: configService.get('postgres.username'),
        password: configService.get('postgres.password'),
        database: configService.get('postgres.databases'),
        entities: [__dirname + '/entities/*{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([ClParticipants,ClPartyInfo,ClSegments,ClCalls,CallcentQueuecalls]),
  ],
  providers: [QueryService,PostgresService],
  exports:[QueryService,PostgresService]
})
export class PostgresModule {}
