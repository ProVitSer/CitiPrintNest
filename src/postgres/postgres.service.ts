import { LoggerService } from '@app/logger/logger.service';
import { Injectable } from '@nestjs/common';
import { QueryService } from './query.service';
import { ExternalCallInfo, LocalCallInfo } from './types/interfaces';


@Injectable()
export class PostgresService {
    constructor(
        private readonly log: LoggerService,
        private readonly query: QueryService
      ) {}

    public async getExternalCallInfo(incomingNumber: string): Promise<ExternalCallInfo>{
        try {
            const first3CXId = await this.query.searchFirstIncomingId(incomingNumber);
            const callInfoRecord = await this.query.searchCallInfoRecord(first3CXId.id);
            const end3CXId = await this.query.searchEndIncomingId(callInfoRecord.callId);
            const callInfo = await this.query.searchCallInfo(callInfoRecord.callId); 
            const lastCallUser = await this.query.searchLastUserRing(end3CXId.infoId);
            return {
                id: first3CXId.id,
                callId: callInfoRecord.callId,
                infoId: end3CXId.infoId,
                startTime: callInfo.startTime,
                isAnswered: callInfo.isAnswered,
                talkingDur: callInfo.talkingDur,
                lastCallUser: lastCallUser.dn
            }
        }catch(e){
            throw e;
        }
    }

    public async getLocalCallInfo(id: number): Promise<LocalCallInfo>{
        //const end3CXId = await this.query.searchEndIncomingId(id);
        const recording = await this.query.searchRecordingByCallID(id);
        const callInfo = await this.query.searchCallInfo(id); 
        return {
            isAnswered: callInfo.isAnswered,
            recording: recording?.recordingUrl
        }

    }
}