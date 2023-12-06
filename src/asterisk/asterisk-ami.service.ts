import { LoggerService } from '@app/logger/logger.service';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AsteriskHangupIncomingEventAppData, AsteriskHangupOutgoingEventAppData, AsteriskHangupEvent } from './types/interfaces';
import { BitrixService } from '@app/bitrix/bitrix.service';
import { ApplicationTypes, CallTypeContext } from './types/enum';
import { RegisterAsteriskIncomingCallInfoAdapter } from './adapters/register-asterisk-incoming-call-data.adapter';
import { RegisterAsteriskOutboundCallInfoAdapter } from './adapters/register-asterisk-outbound-call-data.adapter';

@Injectable()
export class AmiService implements OnApplicationBootstrap {
    private client: any;

    constructor(
        @Inject('AMI') private readonly ami: any,
        private readonly configService: ConfigService,
        private readonly log: LoggerService,
        private readonly bitrix: BitrixService,
        private readonly registerIncoming: RegisterAsteriskIncomingCallInfoAdapter,
        private readonly registerOutgoing: RegisterAsteriskOutboundCallInfoAdapter

    ) {}

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
        if(event.context == CallTypeContext.Incoming && event.application == ApplicationTypes.noOp){

            this.log.info(`Завершился входящий вызов на Asterisk ${event.appdata}`);

            const phoneEvent: AsteriskHangupIncomingEventAppData = JSON.parse(event.appdata);

            this.bitrix.sendInfoByIncomingCall(await this.registerIncoming.getRegisterCallInfo(phoneEvent, this.configService.get('bitrix.custom.asteriskRecordUrl')));
        }
        else if(event.context == CallTypeContext.Outgoing && event.application == ApplicationTypes.noOp){

            this.log.info(`Завершился исходящие вызов на Asterisk ${event.appdata}`);

            const phoneEvent: AsteriskHangupOutgoingEventAppData = JSON.parse(event.appdata);

            this.bitrix.sendInfoByOutgoingCall(this.registerOutgoing.getRegisterCallInfo(phoneEvent, this.configService.get('bitrix.custom.asteriskRecordUrl')))
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
