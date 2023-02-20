import { AsteriskHangupIncomingEventAppData, AsteriskHangupOutgoingEventAppData, getBitrixStatusByAsterisk } from '@app/asterisk/types/interfaces';
import { LoggerService } from '@app/logger/logger.service';
import { MongoService } from '@app/mongo/mongo.service';
import { Tasks } from '@app/mongo/schemas';
import { BitrixUsers } from '@app/mongo/schemas/bitrix-users.schema';
import { CollectionType, DbRequestType } from '@app/mongo/types/types';
import { PostgresService } from '@app/postgres/postgres.service';
import { UtilsService } from '@app/utils/utils.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BitrixApiService } from './bitrix.api.service';
import { BitrixCallStatusType, BitrixCallType, CallFinishData, CallRegisterData, RegisterCallInfo } from './types/interfaces';



@Injectable()
export class BitrixService {

    constructor(
        private readonly configService: ConfigService,
        private readonly log: LoggerService,
        private readonly bitrix: BitrixApiService,
        private readonly pg: PostgresService,
        private readonly mongo: MongoService
    )
    {}

    public async sendInfoByIncomingCall(appData: AsteriskHangupIncomingEventAppData): Promise<void>{
        try{
            const { unicueid, incomingNumber, billsec, disposition, recording, start, end } = appData;
            await UtilsService.sleep(20000);
            const result = await this.pg.getExternalCallInfo(incomingNumber);
            
            const callInfo: RegisterCallInfo = {
                extensionNumber: result.lastCallUser,
                phoneNumber: incomingNumber,
                calltype: BitrixCallType.incoming,
                startCall: start,
                billsec: billsec,
                bitrixCallStatusType: (result.isAnswered == true) ? BitrixCallStatusType.SuccessfulCall : BitrixCallStatusType.MissedCall,
                recording
            }

            const bitrixUserInfo = await this.registerCall(callInfo);
            if(this.configService.get("bitrix.custom.createTask") == true && callInfo.bitrixCallStatusType == BitrixCallStatusType.MissedCall){
                return await this.createOrUpdateTask(bitrixUserInfo[0].bitrixId, result.lastCallUser, incomingNumber);
            }
        }catch(e){
            this.log.info(`sendInfoByIncomingCall ${e}`)
        }
    }

    public async sendInfoByOutgoingCall(appData: AsteriskHangupOutgoingEventAppData): Promise<void>{
        try{
            const { exten /*исходящий номер*/ , unicueid, extensionNumber/*добавочный абонента*/, billsec, disposition, recording, start, end } = appData;
            await UtilsService.sleep(20000);
            const callInfo: RegisterCallInfo = {
                extensionNumber: extensionNumber,
                phoneNumber: exten,
                calltype: BitrixCallType.outgoing,
                startCall: start,
                billsec: billsec,
                bitrixCallStatusType: getBitrixStatusByAsterisk[disposition],
                recording
            }

            await this.registerCall(callInfo);
            return await this.checkCompletionTask(exten);
        }catch(e){
            this.log.info(`sendInfoByOutgoingCall ${e}`)
        }
    }

    private async registerCall(callInfo: RegisterCallInfo): Promise<BitrixUsers[]>{
        try {
            const dbResult = await this.getBitrixUserID(callInfo.extensionNumber);
            if(dbResult.length == 0 ){
                throw Error(`Не найден Bitrix ID пользователя ${callInfo.extensionNumber}, вызов не регистрируем`)
            }
            const bitrixUserId = (dbResult.length == 0)? this.configService.get("bitrix.custom.adminId") : dbResult[0].bitrixId;
    
            const callStartData: CallRegisterData = {
                bitrixId: bitrixUserId, 
                phoneNumber: callInfo.phoneNumber,
                type: callInfo.calltype, 
                callTime: callInfo.startCall
            }
            const { CALL_ID } = await this.bitrix.externalCallRegister(callStartData);
            
            const callFinishData: CallFinishData = {
                callId: CALL_ID, 
                bitrixId: bitrixUserId, 
                bilsec: Number(callInfo.billsec), 
                callStatus: callInfo.bitrixCallStatusType, 
                callType: callInfo.calltype,
                recording: callInfo.recording
            }
    
            await this.bitrix.externalCallFinish(callFinishData, this.configService.get('bitrix.custom.asteriskRecordUrl'));
            return dbResult;
        }catch(e){
            this.log.info(`registerCall ${e}`)
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
                        create: new Date()
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

    private async checkCompletionTask(incomingNumber: string){
        try {
            const result = await this.checkTaskExist(incomingNumber);
            if (result.length != 0) {
                await this.bitrix.closeTask(result[0].taskId);
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