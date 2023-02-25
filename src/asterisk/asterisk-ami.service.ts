import { BitrixApiService } from '@app/bitrix/bitrix.api.service';
import { LoggerService } from '@app/logger/logger.service';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AsteriskHangupIncomingEventAppData, AsteriskHangupOutgoingEventAppData, AsteriskHangupEvent, CallTypeContext, getBitrixStatusByAsterisk } from './types/interfaces';
import { UtilsService } from '@app/utils/utils.service'
import { PostgresService } from '@app/postgres/postgres.service';
import { BitrixCallStatusType, BitrixCallType, CallFinishData, CallRegisterData, GetTaskResponse } from '@app/bitrix/types/interfaces';
import { CollectionType, DbRequestType } from '@app/mongo/types/types';
import { BitrixUsers, Tasks } from '@app/mongo/schemas';
import { MongoService } from '@app/mongo/mongo.service';
import { BitrixService } from '@app/bitrix/bitrix.service';

@Injectable()
export class AmiService implements OnApplicationBootstrap {
    private client: any;
    

    constructor(
        @Inject('AMI') private readonly ami: any,
        private readonly configService: ConfigService,
        private readonly log: LoggerService,
        private readonly bitrix: BitrixService,
        private readonly pg: PostgresService,
        private readonly mongo: MongoService
        
    ) {
    }

    public async onApplicationBootstrap() {
        try {
            this.client = await this.ami;
            this.client.logLevel = this.configService.get('asterisk.ami.logLevel');
            this.client.open();
            this.client.on('namiConnected', () => this.log.info('Подключение к AMI успешно установлено'));
            this.client.on('namiConnectionClose', () => this.connectionClose());
            this.client.on('namiLoginIncorrect', () => this.loginIncorrect());
            this.client.on('namiInvalidPeer', () => this.invalidPeer());
            this.client.on('namiEventNewexten', (event: AsteriskHangupEvent) => this.parseAmiEvent(event));
        } catch (e) {
            this.log.error(`AMI onApplicationBootstrap ${e}`)
        }

    };

    private async parseAmiEvent(event: AsteriskHangupEvent): Promise<void> {
        if(event.context == CallTypeContext.Incoming && event.application == 'NoOp'){
            this.log.info(`Завершился входящий вызов на Asterisk ${event.appdata}`);
            const phoneEvent: AsteriskHangupIncomingEventAppData = JSON.parse(event.appdata);
            this.bitrix.sendInfoByIncomingCall(phoneEvent)
        }
        else if(event.context == CallTypeContext.Outgoing && event.application == 'NoOp'){
            this.log.info(`Завершился исходящие вызов на Asterisk ${event.appdata}`);
            const phoneEvent: AsteriskHangupOutgoingEventAppData = JSON.parse(event.appdata);
            this.bitrix.sendInfoByOutgoingCall(phoneEvent)
        }
    }


    private connectionClose() {
        this.log.error(`Переподключение к AMI ...`);
        setTimeout(() => {
            this.client.open();
        }, 5000);
    }

    private loginIncorrect() {
        this.log.error(`Некорректный логин или пароль от AMI`);
        process.exit();
    }

    private invalidPeer() {
        this.log.error(`Invalid AMI Salute. Not an AMI?`);
        process.exit();
        
    }
}
