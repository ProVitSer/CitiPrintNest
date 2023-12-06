import { RegisterCallInfo } from "@app/bitrix/types/interfaces";
import { AsteriskHangupIncomingEventAppData } from "../types/interfaces";
import { Injectable } from "@nestjs/common";
import { PostgresService } from "@app/postgres/postgres.service";
import { BitrixCallStatusType, BitrixCallType } from "@app/bitrix/types/enum";

@Injectable()
export class RegisterAsteriskIncomingCallInfoAdapter {
    constructor(private readonly pg: PostgresService){}

    public async getRegisterCallInfo(phoneEvent: AsteriskHangupIncomingEventAppData, recordingDomain: string): Promise<RegisterCallInfo>{
        const result = await this.pg.getExternalCallInfo(phoneEvent.incomingNumber);

        return {
            extensionNumber: result.lastCallUser,
            phoneNumber: phoneEvent.incomingNumber,
            calltype: BitrixCallType.incoming,
            startCall: phoneEvent.start,
            billsec: phoneEvent.billsec,
            bitrixCallStatusType: (result.isAnswered == true) ? BitrixCallStatusType.SuccessfulCall : BitrixCallStatusType.MissedCall,
            recording: phoneEvent.recording,
            recordingDomain
        }
    }

}