import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { NetServerService } from './net-server.service';


@Module({
    imports:[ConfigModule],
    providers: [NetServerService],
    exports: [NetServerService],
})
export class NetServerModule {}
