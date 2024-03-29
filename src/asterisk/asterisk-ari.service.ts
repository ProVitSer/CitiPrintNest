import { LoggerService } from '@app/logger/logger.service';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AsteriskARIStasisStartEvent } from './types/interfaces';
import * as Ari from 'ari-client';
import { MongoService } from '@app/mongo/services/mongo.service';
import { CollectionType, DbRequestType } from '@app/mongo/types/types';
import { Phonebook } from '@app/mongo/schemas';
import { UtilsService } from '@app/utils/utils.service';
import { GET_ROUTE_INFO } from './types/consts';
import { Context } from './types/enum';


@Injectable()
export class AriService implements OnApplicationBootstrap {
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
        this.client.ariClient.start(this.configService.get('asterisk.ari.application') );
        this.client.ariClient.on('StasisStart', async (stasisStartEvent: AsteriskARIStasisStartEvent, dialed: Ari.Channel) => {
            try{
                this.log.info(`Событие входящего вызова ${JSON.stringify(stasisStartEvent)}`);

                const result = await this.searchExtByIncomNumber(UtilsService.normalizePhoneNumber(stasisStartEvent.channel.caller.number));

                await this.routingCall(stasisStartEvent, result);

            }catch(e){
                this.log.error(`ariClient ${e}`)
            }
        });
    };


    private async routingCall(event: AsteriskARIStasisStartEvent, result: Phonebook | null): Promise<void> {
        const routeInfo = GET_ROUTE_INFO[event.channel.dialplan.exten];
        
        if(result === null || result.extension == ''){
            this.log.info(`Привязка не найдена ${result} вызов пошел по маршруту ${routeInfo.defaultContext}`);
            return await this.continueDialplan(event.channel.id, routeInfo.defaultContext, routeInfo.trunkId);
        } else {
            this.log.info(`Была найден привязанный внутренний номер ${result} вызов пошел по маршруту ${routeInfo.localContext}`);
            return await this.continueDialplan( event.channel.id, routeInfo.localContext, result.extension);
        }

    }

    private async continueDialplan(channelId: string, dialplanContext: Context, dialExtension: string): Promise<void>{
        return await this.client.ariClient.channels.continueInDialplan({ channelId: channelId, context: dialplanContext, extension: dialExtension })
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
            const result = await this.mongo.mongoRequest<Phonebook | null>(params);
            this.log.info(`Со стороны базы вернулся результат ${JSON.stringify(result)}`);
            return result;
        } catch(e){
            this.log.error(`Ошибка поиска в Mongo ${e}`);
        }
    }
}
