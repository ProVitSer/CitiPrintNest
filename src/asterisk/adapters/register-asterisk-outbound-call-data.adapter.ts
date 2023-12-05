import { RegisterCallInfo } from "@app/bitrix/types/interfaces";
import { AsteriskHangupOutgoingEventAppData } from "../types/interfaces";
import { Injectable } from "@nestjs/common";
import { ASTERISK_CALL_STATUS_BITRIX_MAP } from "../types/consts";
import { BitrixCallType } from "@app/bitrix/types/enum";

@Injectable()
export class RegisterAsteriskOutboundCallInfoAdapter {
    constructor(){}

    public getRegisterCallInfo(phoneEvent: AsteriskHangupOutgoingEventAppData, recordingDomain: string): RegisterCallInfo {

        return {
            extensionNumber: phoneEvent.extensionNumber,
            phoneNumber: phoneEvent.exten,
            calltype: BitrixCallType.outgoing,
            startCall: phoneEvent.start,
            billsec: phoneEvent.billsec,
            bitrixCallStatusType: ASTERISK_CALL_STATUS_BITRIX_MAP[phoneEvent.disposition],
            recording: phoneEvent.recording,
            recordingDomain 
        }
    }
}
