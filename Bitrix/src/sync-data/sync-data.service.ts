import { LoggerService } from '@app/logger/logger.service';
import { MongoModule } from '@app/mongo/mongo.module';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios, { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Endpoint1CRequest } from './types/interfaces';
import { MongoService } from '@app/mongo/mongo.service';
import { CollectionType, DbRequestType } from '@app/mongo/types/types';
import { Phonebook } from '@app/mongo/schemas/Phonebook.schema';
import { create } from 'domain';
import { BitrixApiService } from '@app/bitrix/bitrix.api.service';
import { BitirxUserGet } from '@app/bitrix/types/interfaces';

@Injectable()
export class SyncDataService implements OnApplicationBootstrap  {
    constructor(
        private readonly configService: ConfigService,
        private readonly log: LoggerService,
        private httpService: HttpService,
        private readonly mongo: MongoService,
        private readonly bitrix: BitrixApiService
      ) {}

    onApplicationBootstrap() {}

    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async syncPhonebookFrom1C(){
        try {
            const header =  {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            const response: Endpoint1CRequest[] = (await this.httpService.get(this.configService.get('endpoint1C'),header).toPromise()).data
            await this.dropCollection();
            await this.addNewInfoToPhonebook(response);
        }catch(e){
            this.log.error(`Проблемы с синхронизацией контактной книги 1С ${e}`)
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    async syncBitrixUserID(){
        try {
            await this.updateUsersInfo(0);

        }catch(e){
            this.log.error(`Проблемы обновление данных по пользователям Bitrix ${e}`)
        }
    }

    private async updateUsersInfo(startPage: number){
        try {
            const response = await this.bitrix.getActiveUsers(startPage);
            const newUsersArray : BitirxUserGet[] = response.result;
            const next = response.next;
            Promise.all(newUsersArray.map(async (user: BitirxUserGet) => {

                const params = {
                    criteria: {},
                    entity: CollectionType.bitrixUsers,
                    requestType: DbRequestType.insertMany,
                    data: {
                        extension: user.UF_PHONE_INNER,
                        bitrixId: user.ID
                    }
                }
                await this.mongo.mongoRequest(params)
            }));
        
            (response.next)? this.updateUsersInfo(startPage + 50) : this.log.info(`Выгрузка пользователей закончилась на странице ${startPage}`)

        }catch(e){
            this.log.error(`Проблемы с синхронизацией контактной книги 1С ${e}`)
        }

    }

    private async dropCollection(){
        try {
            const params = {
                criteria: {},
                entity: CollectionType.phonebook,
                requestType: DbRequestType.deleteMany,
            }
            return await this.mongo.mongoRequest(params);
        }catch(e){
            throw e;
        }
    }

    private async addNewInfoToPhonebook(contacts: Endpoint1CRequest[]){
        try {
            return await Promise.all( contacts.map( async (contact: Endpoint1CRequest ) => {
                contact.ClientPhone = contact.ClientPhone.replace(/\)/g, '').replace(/\(/g, '');
                contact.ClientPhone  = (contact.ClientPhone.length == 10)? `7${contact.ClientPhone}` : `7${contact.ClientPhone.slice(1,11)}`;
                const info = this.formatContact(contact);
    
                const params = {
                    criteria: {},
                    entity: CollectionType.phonebook,
                    requestType: DbRequestType.insertMany,
                    data: info
                }
                await this.mongo.mongoRequest(params);
            }))
        }catch(e){
            throw e;
        }

    }

    private formatContact(contacts: Endpoint1CRequest): Phonebook{
        return { _id: contacts.ClientPhone, 
                company: contacts.ClientName, 
                fio: contacts.ContactName, 
                extension: contacts.ManagerLocPhone,
                create: new Date()}
    }

}
