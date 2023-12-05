import { RegisterCallInfo } from "@app/bitrix/types/interfaces";
import { Injectable } from "@nestjs/common";
import { BitrixCallStatusType, BitrixCallType } from "@app/bitrix/types/enum";
import { LocalCallInfo } from "@app/postgres/types/interfaces";
import * as moment from 'moment';

@Injectable()
export class RegisterPbxOutboundCallInfoAdapter {
    constructor(){}

    public getRegisterCallInfo(callCDR: string[], localCallInfo: LocalCallInfo, recordingDomain: string): RegisterCallInfo{

        return {
            extensionNumber: callCDR[3],
            phoneNumber: callCDR[4].match(/(\d*)\r\n/)[1],
            calltype: BitrixCallType.outgoing,
            startCall: moment(new Date(callCDR[1])).add(3, 'hour').format('YYYY-MM-DD H:mm:ss'),
            billsec: String(moment.duration(callCDR[2]).asSeconds()),
            bitrixCallStatusType: (localCallInfo?.isAnswered == true) ? BitrixCallStatusType.SuccessfulCall : BitrixCallStatusType.MissedCall,
            recording: localCallInfo?.recording,
            recordingDomain
        }
    }
}