import { LoggerService } from '@app/logger/logger.service';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AsteriskHungupEvent, CallTypeContext } from './types/interfaces';

@Injectable()
export class AmiService {
    private client: any;
    

    constructor(
        @Inject('AMI') private readonly ami: any,
        private readonly configService: ConfigService,
        private readonly log: LoggerService,
        
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
            this.client.on('namiEventNewexten', (event: AsteriskHungupEvent) => this.parseAmiEvent(event));
        } catch (e) {
            this.log.error(`AMI onApplicationBootstrap ${e}`)
        }

    };

    private async parseAmiEvent(event: AsteriskHungupEvent): Promise<void>{
        if(event.context == CallTypeContext.Incoming && event.application == 'NoOp'){
            this.log.info(`Завершился входящий вызов на Asterisk ${event.appdata}`);
            const phoneEvent = JSON.parse(event.appdata);
        }
        else if(event.context == CallTypeContext.Outgoing && event.application == 'NoOp'){
            this.log.info(`Завершился исходящие вызов на Asterisk ${event.appdata}`);
            const phoneEvent = JSON.parse(event.appdata);
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
