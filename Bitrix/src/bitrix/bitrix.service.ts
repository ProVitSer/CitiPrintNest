import { AsteriskHangupIncomingEventAppData, AsteriskHangupOutgoingEventAppData, getBitrixStatusByAsterisk } from '@app/asterisk/types/interfaces';
import { LoggerService } from '@app/logger/logger.service';
import { MongoService } from '@app/mongo/mongo.service';
import { Tasks } from '@app/mongo/schemas';
import { BitrixUsers } from '@app/mongo/schemas/BitrixUsers.schema';
import { CollectionType, DbRequestType } from '@app/mongo/types/types';
import { PostgresService } from '@app/postgres/postgres.service';
import { UtilsService } from '@app/utils/utils.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BitrixApiService } from './bitrix.api.service';
import { BitrixCallStatusType, BitrixCallType, CallFinishData, CallRegisterData, GetChildrenPathResponse, RegisterCallInfo } from './types/interfaces';
import * as moment from 'moment';



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

    public async updateRecordFolder(): Promise<void>{
        try{
            const currentDate = moment().format("YYYY-MM")
            const folder = await this.getCurrentFolder();
            const result = await this.checkCurrentFolder(folder.current,folder.move)
            if (result.length == 0){
                const currentFolderID = folder.current.result.filter( folder => {
                    return folder.NAME == currentDate
                })
                const moveFolderID = folder.move.result.filter( folder => {
                    return folder.NAME == currentDate
                })
                const recordList = await this.bitrix.getChildrenRecordFolder(Number(currentFolderID[0].ID))
                await this.moveRecord(recordList,Number(moveFolderID[0].ID))
            }
        }catch(e){
            this.log.info(`moveRecord ${e}`)
        }
    }

    private async moveRecord(records: GetChildrenPathResponse, currentFolderID: number){
        return await Promise.all( records.result.map(async record => {
            await this.bitrix.moveRecord(currentFolderID, Number(record.ID))
        }))
    }

    private async getCurrentFolder(): Promise<{current: GetChildrenPathResponse, move: GetChildrenPathResponse}>{
        const currentRecordFolder = await this.bitrix.getChildrenRecordFolder(this.configService.get("bitrix.custom.idPathOriginRecord"))
        const moveRecordFolder = await this.bitrix.getChildrenRecordFolder(this.configService.get("bitrix.custom.idPathMoveRecord"))
        return {
            current: currentRecordFolder,
            move: moveRecordFolder
        }
    }

    private async checkCurrentFolder(currentRecordFolder: GetChildrenPathResponse, moveRecordFolder: GetChildrenPathResponse): Promise<GetChildrenPathResponse[] | []>{
        const newFolder = []
        const resultCheckFolde =  currentRecordFolder.result.filter(cur => !moveRecordFolder.result.map(move => move.NAME.includes(cur.NAME)))
        if (resultCheckFolde.length != 0) {
            Promise.all(resultCheckFolde.map( async folder => {
                const result = await this.createFolder(folder.NAME)
                newFolder.push(result)
            }))
        }
        return (newFolder.length == 0)? [] : newFolder
    }

    private async createFolder(folderName: string): Promise<GetChildrenPathResponse> {
        return  await this.bitrix.createSubFolder(this.configService.get("bitrix.custom.idPathMoveRecord"),folderName)
    }



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