import { BitrixModule } from '@app/bitrix/bitrix.module';
import { LoggerModule } from '@app/logger/logger.module';
import { MongoModule } from '@app/mongo/mongo.module';
import { PostgresModule } from '@app/postgres/postgres.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NetServerService } from './net-server.service';


@Module({
    imports:[ConfigModule, LoggerModule, PostgresModule, BitrixModule, MongoModule],
    providers: [NetServerService],
    exports: [NetServerService],
})
export class NetServerModule {}
