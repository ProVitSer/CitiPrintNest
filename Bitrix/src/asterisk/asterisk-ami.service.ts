import { BitrixApiService } from '@app/bitrix/bitrix.api.service';
import { LoggerService } from '@app/logger/logger.service';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AsteriskHangupIncomingEventAppData, AsteriskHangupOutgoingEventAppData, AsteriskHangupEvent, CallTypeContext, getBitrixStatusByAsterisk } from './types/interfaces';
import { UtilsService } from '@app/utils/utils.service'
import { PostgresService } from '@app/postgres/postgres.service';
import { BitrixCallStatusType, BitrixCallType, CallFinishData, CallRegisterData, GetTaskResponse } from '@app/bitrix/types/interfaces';
import { CollectionType, DbRequestType } from '@app/mongo/types/types';
import { BitrixUsers, Tasks } from '@app/mongo/schemas';
import { MongoService } from '@app/mongo/mongo.service';

@Injectable()
export class AmiService {
    private client: any;
    

    constructor(
        @Inject('AMI') private readonly ami: any,
        private readonly configService: ConfigService,
        private readonly log: LoggerService,
        private readonly bitrix: BitrixApiService,
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
            this.sendInfoByIncomingCall(phoneEvent);
        }
        else if(event.context == CallTypeContext.Outgoing && event.application == 'NoOp'){
            this.log.info(`Завершился исходящие вызов на Asterisk ${event.appdata}`);
            const phoneEvent: AsteriskHangupOutgoingEventAppData = JSON.parse(event.appdata);
            this.sendInfoByOutgoingCall(phoneEvent);

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

    private async sendInfoByOutgoingCall(appData: AsteriskHangupOutgoingEventAppData): Promise<void>{
        try {
            const { exten /*исходящий номер*/ , unicueid, extensionNumber/*добавочный абонента*/, billsec, disposition, recording, start, end } = appData;
            await UtilsService.sleep(20000);
            const dbResult = await this.getBitrixUserID(extensionNumber);
            const bitrixUserId = (dbResult.length == 0)? this.configService.get("bitrix.custom.adminId") : dbResult[0].bitrixId;

            const callStartData: CallRegisterData = {
                bitrixId: bitrixUserId, 
                phoneNumber: exten,
                type: BitrixCallType.outgoing, 
                callTime: start
            }
            const { CALL_ID } = await this.bitrix.externalCallRegister(callStartData);
            
            const callFinishData: CallFinishData = {
                callId: CALL_ID, 
                bitrixId: bitrixUserId, 
                bilsec: Number(billsec), 
                callStatus: getBitrixStatusByAsterisk[disposition], 
                callType: BitrixCallType.outgoing,
                recording: recording
            }
    
            await this.bitrix.externalCallFinish(callFinishData);
            return await this.checkCompletionTask(exten);
        }catch(e){
            this.log.error(`sendInfoByOutgoingCall ${e}`)
        }
    }

    private async checkCompletionTask(incomingNumber: string){
        try {
            const result = await this.checkTaskExist(incomingNumber);
            if (result.length != 0) {
                await this.bitrix.closeTask(result[0]._id);
                const params = {
                    criteria: {
                        _id: incomingNumber
                    },
                    entity: CollectionType.tasks,
                    requestType: DbRequestType.delete,
                }
                return await this.mongo.mongoRequest(params);
            }
        }catch(e){
            this.log.error(`checkCompletionTask ${e}`)
        }
    }

    private async sendInfoByIncomingCall(appData: AsteriskHangupIncomingEventAppData): Promise<void>{
        try {
            const { unicueid, incomingNumber, billsec, disposition, recording, start, end } = appData;
            await UtilsService.sleep(20000);
            const result = await this.pg.getExternalCallInfo(incomingNumber);
            const bitrixCallStatusType = (result.isAnswered == true) ? BitrixCallStatusType.SuccessfulCall : BitrixCallStatusType.MissedCall;
            const dbResult = await this.getBitrixUserID(result.lastCallUser);
            const bitrixUserId = (dbResult.length == 0)? this.configService.get("bitrix.custom.adminId") : dbResult[0].bitrixId;
            const callStartData: CallRegisterData = {
                bitrixId: bitrixUserId, 
                phoneNumber: incomingNumber,
                type: BitrixCallType.incoming, 
                callTime: start
            }
            const { CALL_ID } = await this.bitrix.externalCallRegister(callStartData);
            
            const callFinishData: CallFinishData = {
                callId: CALL_ID, 
                bitrixId: bitrixUserId, 
                bilsec: Number(billsec), 
                callStatus: bitrixCallStatusType, 
                callType: BitrixCallType.incoming,
                recording: recording
            }

            await this.bitrix.externalCallFinish(callFinishData);
            if(this.configService.get("bitrix.custom.createTask") == true && bitrixCallStatusType == BitrixCallStatusType.MissedCall){
                await this.createOrUpdateTask(bitrixUserId, result.lastCallUser, incomingNumber);
            }
        }catch(e){
            this.log.error(`sendInfoByIncomingCall ${e}`)
        }
    }

    private async createOrUpdateTask(bitrixId: string, extension: string, incomingNumber: string): Promise<any>{
        try {
            const result = await this.checkTaskExist(incomingNumber);
            if(result.length == 0){
                const resultCreateTask = await this.bitrix.createTask({bitrixId: Number(bitrixId), incomingNumber: incomingNumber });
                const params = {
                    criteria: {},
                    entity: CollectionType.tasks,
                    requestType: DbRequestType.insertMany,
                    data:  {
                        _id: incomingNumber,
                        taskId: resultCreateTask.task.id,
                        bitrixUserId: bitrixId,
                        extension: extension,
                    }
                }
                return await this.mongo.mongoRequest(params)
            } else {
                return await this.updateTask(result[0]._id, bitrixId, incomingNumber, extension);
            }
        }catch(e){
            this.log.error(`checkIfTaskExist ${e}`)
        }
    }

    private async updateTask(taskId: string, bitrixId: string, incomingNumber: string, extension: string): Promise<any>{
        try {
            const status = await this.bitrix.getTaskStatus(taskId);
            if(status != false){
                //Проверка один и тот же пользователь не ответил по данному вызову 
                const task = status.result.task;
                if(task.status == this.configService.get("bitrix.custom.taskIdStart") && task.responsibleId == bitrixId){
                    return;
                } else { //Другой пользователь не ответил на вызов, меняем ответственного
                    await this.bitrix.updateResponsibleIdTask(taskId, bitrixId);
                    const params = {
                        criteria: {
                            _id: incomingNumber
                        },
                        entity: CollectionType.tasks,
                        requestType: DbRequestType.updateById,
                        data:  {
                            $set: { bitrixUserId: bitrixId, 
                                    extension: extension 
                                }
                        }
                    };
                    return await this.mongo.mongoRequest(params);
                }
            }
        }catch(e){
            this.log.error(`updateTask ${e}`)
        }
    }

    private async checkTaskExist(incomingNumber: string): Promise<Tasks[]>{
        try {
            const params = {
                criteria: {
                    _id: incomingNumber
                },
                entity: CollectionType.tasks,
                requestType: DbRequestType.findAll,
            }
            return await this.mongo.mongoRequest(params);
        } catch(e){
            this.log.error(`checkTaskExist ${e}`)
        }
    }

    private async getBitrixUserID(userExtension: string): Promise<BitrixUsers[]>{
        try {
            const params = {
                criteria: {
                    extension: userExtension
                },
                entity: CollectionType.bitrixUsers,
                requestType: DbRequestType.findAll,
            }
            return await this.mongo.mongoRequest(params);
        } catch(e){
            this.log.error(`getBitrixUserID ${e}`)
        }
    }
}
