import { LoggerModule } from '@app/logger/logger.module';
import { MongoModule } from '@app/mongo/mongo.module';
import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import * as ARI from 'ari-client';
import * as namiLib from 'nami';
import { AmiService } from './asterisk-ami.service';
import { AriService } from './asterisk-ari.service';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    MongoModule,
  ],
  providers: [
    {
        provide: 'ARI',
        useFactory: async (configService: ConfigService) => {
            return {
                ariClient: await ARI.connect(
                    configService.get('asterisk.ari.url'), 
                    configService.get('asterisk.ari.user'), 
                    configService.get('asterisk.ari.password')),
            };
        },
        inject: [ConfigService]
    },
    {
        provide: 'AMI',
        useFactory: async (configService: ConfigService) => {
            return new namiLib.Nami({
                username: configService.get('asterisk.ami.username'),
                secret: configService.get('asterisk.ami.password'),
                host: configService.get('asterisk.ami.host'),
                port: configService.get('asterisk.ami.port')
            })

        },
        inject: [ConfigService]
    },
    AriService,
    AmiService
  ],
  exports: ['ARI', AriService, 'AMI', AmiService]
})
export class AsteriskModule {}
