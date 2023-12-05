import { BitrixModule } from '@app/bitrix/bitrix.module';
import { LoggerModule } from '@app/logger/logger.module';
import { MongoModule } from '@app/mongo/mongo.module';
import { PostgresModule } from '@app/postgres/postgres.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NetServerService } from './net-server.service';
import { RegisterPbxOutboundCallInfoAdapter } from './adapters/register-pbx-outbound-call-data.adapter';


@Module({
    imports:[ConfigModule, LoggerModule, PostgresModule, BitrixModule, MongoModule],
    providers: [NetServerService, RegisterPbxOutboundCallInfoAdapter],
    exports: [NetServerService],
})
export class NetServerModule {}
