import { LoggerService } from '@app/logger/logger.service';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { AsteriskARIStasisStartEvent, Context, trunkId } from './types/interfaces';
import * as Ari from 'ari-client';
import { MongoService } from '@app/mongo/mongo.service';
import { CollectionType, DbRequestType } from '@app/mongo/types/types';
import { Phonebook } from '@app/mongo/schemas/Phonebook.schema';

@Injectable()
export class AriService {
    private client: any;


    constructor(
        @Inject('ARI') private readonly ari: any, 
        private readonly configService: ConfigService,
        private readonly log: LoggerService,
        private readonly mongo: MongoService
    ) {
    }

    public async onApplicationBootstrap() {
        this.client = await this.ari;
        this.client.ariClient.once('StasisStart', async (stasisStartEvent: AsteriskARIStasisStartEvent, dialed: Ari.Channel) => {
            this.log.info(`Событие входящего вызова ${stasisStartEvent}`);
            const timestamp = moment().format('YYYY-MM-DDTHH:mm:ss');
            this.routingCall(stasisStartEvent);
        });
        this.client.ariClient.start(this.configService.get('asterisk.ari.application') );
    };

    private async routingCall(event: AsteriskARIStasisStartEvent){
        const result = await this.searchExtByIncomNumber('7' + event.channel.caller.number);
        if(result === null || result.extension == ''){
            this.log.info(`Привязка не найдена ${result} вызов пошел по маршруту ${Context.default}`)
            await this.continueDialplan(event.channel.id, Context.default, trunkId);
        } else {
            this.log.info(`Была найден привязанный внутренний номер ${result} вызов пошел по маршруту ${Context.local}`)
            await this.continueDialplan( event.channel.id, Context.local, result.extension);
        }

    }

    private async continueDialplan(channelId: string, dialplanContext: Context, dialExtension: string){
        await this.client.channels.continueInDialplan({ channelId: channelId, context: dialplanContext, extension: dialExtension })
    }

    private async searchExtByIncomNumber(number: string): Promise<Phonebook | null>{
        try {
            const params = {
                criteria: {
                    id: number.trim()
                },
                entity: CollectionType.phonebook,
                requestType: DbRequestType.findById
              };
            const result = await this.mongo.mongoRequest(params);
            this.log.info(`Со стороны базы вернулся результат ${JSON.stringify(result)}`);
            return result;
        } catch(e){
            this.log.error(`Ошибка поиска в Mongo ${e}`);
        }
    }
}
