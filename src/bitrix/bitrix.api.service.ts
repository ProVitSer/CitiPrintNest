import { LoggerService } from '@app/logger/logger.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BitrixExternalCallFinishRequest, BitrixRegisterCallResponse, 
    Show , ExternalCallRegister, BitirxUserGet, BitrixMetod, ActiveUser, 
    BitrixRegisterCallRequest, CreateTaskType, BitrixCallType, BitrixFinishCallFields, 
    BitrixCallStatusType, CallRegisterData, CallFinishData, CreateTaskData, BitrixTasksFields, CreateTaskResponse, GetTaskResponse, BitrixAttachRecord} from './types/interfaces';
import axios, { HttpService } from '@nestjs/axios';
import * as moment from 'moment';

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
            return (await this.httpService.post(`${this.bitrixUrl}/${BitrixMetod.UserGet}?start=${startPage}`,data).toPromise()).data 
        }catch(e){
            this.log.error(`getActiveUsers ${e}`)
        }
    }

    public async externalCallRegister(callData: CallRegisterData): Promise<BitrixRegisterCallResponse>{

        try {
            const data: BitrixRegisterCallRequest = {
                "USER_ID": callData.bitrixId,
                "PHONE_NUMBER": callData.phoneNumber,
                "TYPE": callData.type,
                "CALL_START_DATE": callData.callTime,
                "CRM_CREATE": CreateTaskType.NO,
                "SHOW": Show.NO
            };    

            const { result }  = (await this.httpService.post(`${this.bitrixUrl}/${BitrixMetod.ExternalCallRegister}`,data).toPromise()).data;
            this.log.info(`Результат регистрации вызова ${JSON.stringify(result)}`);
            return result;
        }catch(e){
            this.log.error(`externalCallRegister ${e}`)
        }
    }

    public async externalCallFinish(callData: CallFinishData, recordingIp: string): Promise<BitrixFinishCallFields>{
        try {
            const data: BitrixExternalCallFinishRequest = {
                "CALL_ID": callData.callId,
                "USER_ID": callData.bitrixId,
                "DURATION": callData.bilsec,
                "STATUS_CODE": callData.callStatus,
                "TYPE": callData.callType,
            };

            this.log.info(`Информация о вызове ${JSON.stringify(data)}`)
            const { result } = (await this.httpService.post(`${this.bitrixUrl}/${BitrixMetod.ExternalCallFinish}`,data).toPromise()).data;
            this.log.info(`Результат завершения вызова ${JSON.stringify(result)}`)
            return result;
        }catch(e){
            this.log.error(`externalCallFinish ${e}`)
        }
    }

    public async attachRecord(callData: CallFinishData, recordingIp: string): Promise<BitrixFinishCallFields>{
        try {
            const data: BitrixAttachRecord = {
                "CALL_ID": callData.callId,
                "FILENAME": callData.recording,
                "RECORD_URL": `http://${recordingIp}/monitor/${callData.recording}`
            };

            this.log.info(`Добавление записи разговора к звонку ${JSON.stringify(data)}`)
            const { result } = (await this.httpService.post(`${this.bitrixUrl}/${BitrixMetod.ExternalCallAttachRecord}`,data).toPromise()).data;
            this.log.info(`Результат загрузки записи ${JSON.stringify(result)}`)
            return result;
        }catch(e){
            this.log.error(`attachRecord ${e}`)
        }
    }

    public async createTask(callData: CreateTaskData): Promise<CreateTaskResponse>{
        try {
            const daedline = moment(new Date).add(this.configService.get('bitrix.custom.daedlineMin'), 'minutes').format('YYYY-MM-DD H:mm:ss');
            const data: BitrixTasksFields = {
                "fields": {
                    "TITLE": "Пропущенный вызов",
                    "RESPONSIBLE_ID": callData.bitrixId,
                    "CREATED_BY": this.configService.get('bitrix.custom.userTaskId'),
                    "DESCRIPTION": `Пропущенный вызов от абонента ${callData.incomingNumber}`,
                    "PRIORITY": "2",
                    "GROUP_ID": this.configService.get('bitrix.custom.taskGroup'),
                    "DEADLINE": daedline
                }
            }
            const { result } = (await this.httpService.post(`${this.bitrixUrl}/${BitrixMetod.TaskAdd}`,data).toPromise()).data;
            this.log.info(`Результат createTask ${JSON.stringify(result)}`)
            return result;
        }catch(e){
            this.log.error(`createTask ${e}`)
        }
    }

    public async getTaskStatus(taskId: string): Promise<GetTaskResponse | false>{
        try {
            const data = {
                "taskId": taskId
            }
            const result = await this.httpService.post(`${this.bitrixUrl}/${BitrixMetod.TaskGet}`,data).toPromise();
            if (result.status == 400) {
                return false;
            }
            this.log.info(`Результат getTaskStatus ${result.data.result.task.id} ${result.data.result.task.status}`)
            return result.data;
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

            const { result } = (await this.httpService.post(`${this.bitrixUrl}/${BitrixMetod.TaskUpdate}`,data).toPromise()).data;
            this.log.info(`Результат addAuditorsToTask ${JSON.stringify(result)}`)
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

            const { result } = (await this.httpService.post(`${this.bitrixUrl}/${BitrixMetod.TaskUpdate}`,data).toPromise()).data;
            this.log.info(`Результат closeTask ${JSON.stringify(result)}`)
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
            }

            const { result } = (await this.httpService.post(`${this.bitrixUrl}/${BitrixMetod.TaskUpdate}`,data).toPromise()).data;
            this.log.info(`Результат updateResponsibleIdTask ${JSON.stringify(result)}`)
            return result;
        }catch(e){
            this.log.error(`updateResponsibleIdTask ${e}`)
        }
    }
}
