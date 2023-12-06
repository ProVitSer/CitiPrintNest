import { LoggerService } from '@app/logger/logger.service';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Endpoint1CRequest } from './types/interfaces';
import { MongoService } from '@app/mongo/services/mongo.service';
import { CollectionType, DbRequestType } from '@app/mongo/types/types';
import { BitrixApiService } from '@app/bitrix/bitrix.api.service';
import { BitirxUserGet } from '@app/bitrix/types/interfaces';
import { Phonebook, Tasks } from '@app/mongo/schemas';
import { UtilsService } from '@app/utils/utils.service';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class SyncDataService implements OnApplicationBootstrap  {
    private readonly startPage: number = 0;
    private readonly addToNextPage: number = 50;
    constructor(
        private readonly configService: ConfigService,
        private readonly log: LoggerService,
        private httpService: HttpService,
        private readonly mongo: MongoService,
        private readonly bitrix: BitrixApiService
      ) {}

    onApplicationBootstrap() {}


    @Interval(180000)
    async updateTasks(): Promise<void>{
	    try{
            const tasks = await this.getOpenTasks();

            await Promise.all(tasks.map( async (task:Tasks ) => {

                const taskStatus = await this.bitrix.getTaskStatus(task.taskId);

                if(taskStatus == false){

                    await this.deleteTask(task);

                } else if (taskStatus.result.task.status == '2'){

                    await this.bitrix.addAuditorsToTask(taskStatus.result.task.id, this.configService.get('bitrix.custom.adminId'));

                    await this.deleteTask(task);
                }
            }))	
	    }catch(e){
            this.log.error('updateTasks error:' + e)
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async syncPhonebookFrom1C(): Promise<void>{
        try {

            const response = await firstValueFrom(
                this.httpService.get<Endpoint1CRequest[]>(this.configService.get('endpoint1C')).pipe(
                    catchError((error: AxiosError) => {
                        throw error;
                    }),
                ),
            );

            if(response?.data){

                await this.dropCollection(CollectionType.phonebook);

                await this.addNewInfoToPhonebook(response.data);
            }
        }catch(e){
            this.log.error(`Проблемы с синхронизацией контактной книги 1С ${e}`)
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    async syncBitrixUserID(): Promise<void>{
        try {

            await this.updateUsersInfo(this.startPage);

        }catch(e){
            this.log.error(`Проблемы обновление данных по пользователям Bitrix ${e}`)
        }
    }

    private async updateUsersInfo(startPage: number): Promise<void>{
        try {
            const response = await this.bitrix.getActiveUsers(startPage);

            await this.dropCollection(CollectionType.bitrixUsers);

            const newUsersArray: BitirxUserGet[] = response.result;

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

                await this.mongo.mongoRequest(params);

            }));
        
            (response.next)? this.updateUsersInfo(startPage + this.addToNextPage) : this.log.info(`Выгрузка пользователей закончилась на странице ${startPage}`)

        }catch(e){
            this.log.error(`Проблемы с выгрузкой пользователей из Битрикс ${e}`)
        }

    }

    private async dropCollection(collection: CollectionType): Promise<void> {
        try {

            const params = {
                criteria: {},
                entity: collection,
                requestType: DbRequestType.deleteMany,
            };

            return await this.mongo.mongoRequest(params);

        }catch(e){
            throw e;
        }
    }

    private async getOpenTasks(): Promise<Tasks[]>{
        try {

            const params = {
                criteria: {},
                entity: CollectionType.tasks,
                requestType: DbRequestType.findAll,
            }

            return await this.mongo.mongoRequest<Tasks[]>(params);

        }catch(e){
            throw e;
        }
    }

    private async deleteTask(task: Tasks): Promise<void>{
        try {

            const params = {
                criteria: {
                    _id: task._id
                },
                entity: CollectionType.tasks,
                requestType: DbRequestType.delete,
            };

            return await this.mongo.mongoRequest(params);

        }catch(e){
            throw e;
        }
    }

    private async addNewInfoToPhonebook(contacts: Endpoint1CRequest[]): Promise<void[]>{
        try {
            return await Promise.all( contacts.map( async (contact: Endpoint1CRequest ) => {
    
                const params = {
                    criteria: {},
                    entity: CollectionType.phonebook,
                    requestType: DbRequestType.insertMany,
                    data: this.formatContact(contact)
                }

                await this.mongo.mongoRequest(params);
                
            }))
        }catch(e){
            throw e;
        }

    }

    private formatContact(contacts: Endpoint1CRequest): Phonebook {
        return { 
            _id: UtilsService.frmat1CPhone(contacts.ClientPhone), 
            company: contacts.ClientName, 
            fio: contacts.ContactName, 
            extension: contacts.ManagerLocPhone,
            create: new Date()
        }
    }

}
