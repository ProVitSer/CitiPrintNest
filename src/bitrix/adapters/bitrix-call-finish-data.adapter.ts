import { BitrixAttachRecord, BitrixExternalCallFinishRequest, RegisterCallInfo } from "../types/interfaces";

export class BitrixCallFinishDataAdapter {
    public readonly finishData : BitrixExternalCallFinishRequest;
    public readonly attachRecordData: BitrixAttachRecord;
    
    constructor(callId: string, bitrixId: string, callInfo: RegisterCallInfo){
        this.finishData = {
            CALL_ID: callId,
            USER_ID: bitrixId,
            DURATION: Number(callInfo.billsec),
            STATUS_CODE: callInfo.bitrixCallStatusType,
            TYPE: callInfo.calltype,
        };

        this.attachRecordData  = {
            CALL_ID: callId,
            FILENAME: callInfo.recording,
            RECORD_URL: `http://${callInfo.recordingDomain}/monitor/${callInfo.recording}`
        }
    }

}