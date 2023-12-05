import { BitrixCallType, CreateTaskType, Show } from "../types/enum";
import { BitrixRegisterCallRequest } from "../types/interfaces";

export class BitrixRegisterCallDataAdapter {
    public readonly registerCallData : BitrixRegisterCallRequest;
    constructor(bitrixId: string, phoneNumber: string, type: BitrixCallType, callTime: string){
        this.registerCallData = {
            USER_ID: bitrixId,
            PHONE_NUMBER: phoneNumber,
            TYPE: type,
            CALL_START_DATE: callTime,
            CRM_CREATE: CreateTaskType.NO,
            SHOW: Show.NO
        }
    }

}