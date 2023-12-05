import { LoggerService } from '@app/logger/logger.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BitrixRegisterCallResponse, BitrixFinishCallFields, CreateTaskData, BitrixTasksFields, CreateTaskResponse, GetTaskResponse } from './types/interfaces';
import { HttpService } from '@nestjs/axios';
import * as moment from 'moment';
import { ActiveUser, BitrixMetod } from './types/enum';
import { BitrixRegisterCallDataAdapter } from './adapters/bitrix-register-call-data.adapter';
import { BitrixCallFinishDataAdapter } from './adapters/bitrix-call-finish-data.adapter';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class BitrixApiService {
    private baseURL = this.configService.get('bitrix.domain');
    private hash = this.configService.get('bitrix.hash');
    private bitrixUrl = `${this.baseURL}${this.hash}`

    constructor(
        private readonly log: LoggerService,
        private readonly configService : ConfigService,
        private httpService: HttpService,
    ) {}

    public async getActiveUsers(startPage: number): Promise<any>{
        try {
            const data = {
                "FILTER": {
                  "ACTIVE": ActiveUser.active,
                }
            }

            const response = await firstValueFrom(
                this.httpService.post(`${this.bitrixUrl}/${BitrixMetod.UserGet}?start=${startPage}`,data ).pipe(
                    catchError((error: AxiosError) => {
                        throw error;
                    }),
                ),
            );

            return response.data;

        }catch(e){
            this.log.error(`getActiveUsers ${e}`)
        }
    }

    public async externalCallRegister(dataAdapter: BitrixRegisterCallDataAdapter): Promise<BitrixRegisterCallResponse>{
        try {

            const response = await firstValueFrom(
                this.httpService.post(`${this.bitrixUrl}/${BitrixMetod.ExternalCallRegister}`, { ...dataAdapter.registerCallData } ).pipe(
                    catchError((error: AxiosError) => {
                        throw error;
                    }),
                ),
            );

            const { result }  = response.data;

            this.log.info(`Результат регистрации вызова ${JSON.stringify(result)}`);

            return result;

        }catch(e){
            this.log.error(`externalCallRegister ${e}`)
        }
    }

    public async externalCallFinish(dataAdapter: BitrixCallFinishDataAdapter): Promise<BitrixFinishCallFields>{
        try {

            this.log.info(`Информация о вызове ${JSON.stringify(dataAdapter.finishData)}`);

            const response = await firstValueFrom(
                this.httpService.post(`${this.bitrixUrl}/${BitrixMetod.ExternalCallFinish}`, { ...dataAdapter.finishData }).pipe(
                    catchError((error: AxiosError) => {
                        throw error;
                    }),
                ),
            );

            const { result }  = response.data;

            this.log.info(`Результат завершения вызова ${JSON.stringify(result)}`);

            return result;
        }catch(e){
            this.log.error(`externalCallFinish ${e}`)
        }
    }

    public async attachRecord(dataAdapter: BitrixCallFinishDataAdapter): Promise<BitrixFinishCallFields>{
        try {
            this.log.info(`Добавление записи разговора к звонку ${JSON.stringify(dataAdapter.attachRecordData)}`);

            const response = await firstValueFrom(
                this.httpService.post(`${this.bitrixUrl}/${BitrixMetod.ExternalCallAttachRecord}`, { ...dataAdapter.attachRecordData } ).pipe(
                    catchError((error: AxiosError) => {
                        throw error;
                    }),
                ),
            );

            const { result }  = response.data;

            this.log.info(`Результат загрузки записи ${JSON.stringify(result)}`);

            return result;
        }catch(e){
            this.log.error(`attachRecord ${e}`)
        }
    }

    public async createTask(callData: CreateTaskData): Promise<CreateTaskResponse>{
        try {

            const data: BitrixTasksFields = {
                "fields": {
                    "TITLE": "Пропущенный вызов",
                    "RESPONSIBLE_ID": callData.bitrixId,
                    "CREATED_BY": this.configService.get('bitrix.custom.userTaskId'),
                    "DESCRIPTION": `Пропущенный вызов от абонента ${callData.incomingNumber}`,
                    "PRIORITY": "2",
                    "GROUP_ID": this.configService.get('bitrix.custom.taskGroup'),
                    "DEADLINE": moment(new Date).add(this.configService.get('bitrix.custom.daedlineMin'), 'minutes').format('YYYY-MM-DD H:mm:ss')
                }
            };

            const response = await firstValueFrom(
                this.httpService.post(`${this.bitrixUrl}/${BitrixMetod.TaskAdd}`, data ).pipe(
                    catchError((error: AxiosError) => {
                        throw error;
                    }),
                ),
            );

            const { result }  = response.data;

            this.log.info(`Результат createTask ${JSON.stringify(result)}`);

            return result;

        }catch(e){
            this.log.error(`createTask ${e}`)
        }
    }

    public async getTaskStatus(taskId: string): Promise<GetTaskResponse | false>{
        try {

            const response = await firstValueFrom(
                this.httpService.post(`${this.bitrixUrl}/${BitrixMetod.TaskGet}`, { "taskId": taskId } ).pipe(
                    catchError((error: AxiosError) => {
                        throw error;
                    }),
                ),
            );

            if (response.status == 400) {
                return false;
            }

            this.log.info(`Результат getTaskStatus ${response.data.result.task.id} ${response.data.result.task.status}`);

            return response.data;
        }catch(e){
            this.log.error(`getTaskStatus ${e}`)
        }
    }

    public async addAuditorsToTask(taskId: string, auditors: string): Promise<GetTaskResponse>{
        try {
            const data = {
                "taskId": taskId,
                "fields": {
                    "AUDITORS": [auditors]
                }
            }

            const response = await firstValueFrom(
                this.httpService.post(`${this.bitrixUrl}/${BitrixMetod.TaskUpdate}`, data ).pipe(
                    catchError((error: AxiosError) => {
                        throw error;
                    }),
                ),
            );

            const { result }  = response.data;

            this.log.info(`Результат addAuditorsToTask ${JSON.stringify(result)}`);

            return result;

        }catch(e){
            this.log.error(`addAuditorsToTask ${e}`)
        }
    }

    public async closeTask(taskId: string): Promise<GetTaskResponse>{
        try {
            const data = {
                "taskId": taskId,
                "fields": {
                    "STATUS": this.configService.get('bitrix.custom.taskIdClose')
                }
            }

            const response = await firstValueFrom(
                this.httpService.post(`${this.bitrixUrl}/${BitrixMetod.TaskUpdate}`,data ).pipe(
                    catchError((error: AxiosError) => {
                        throw error;
                    }),
                ),
            );

            const { result }  = response.data;

            this.log.info(`Результат closeTask ${JSON.stringify(result)}`);

            return result;

        }catch(e){
            this.log.error(`closeTask ${e}`)
        }
    }

    public async updateResponsibleIdTask(taskId: string, bitrixId: string): Promise<GetTaskResponse>{
        try {
            const data = {
                "taskId": taskId,
                "fields": {
                    "RESPONSIBLE_ID": bitrixId
                }
            };

            const response = await firstValueFrom(
                this.httpService.post(`${this.bitrixUrl}/${BitrixMetod.TaskUpdate}`, data).pipe(
                    catchError((error: AxiosError) => {
                        throw error;
                    }),
                ),
            );

            const { result }  = response.data;

            this.log.info(`Результат updateResponsibleIdTask ${JSON.stringify(result)}`);

            return result;

        }catch(e){
            this.log.error(`updateResponsibleIdTask ${e}`)
        }
    }
}
