import { LoggerService } from '@app/logger/logger.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityRepository, Repository } from "typeorm";
import { CallcentQueuecalls } from "./entities/CallcentQueuecalls";
import { ClCalls } from "./entities/ClCalls";
import { ClParticipants } from "./entities/ClParticipants";
import { ClPartyInfo } from "./entities/ClPartyInfo";
import { ClSegments } from "./entities/ClSegments";

@Injectable()
export class QueryService {
    constructor(
        private readonly log: LoggerService,
        @InjectRepository(ClParticipants)
        private callParticipants: Repository<ClParticipants>,
        @InjectRepository(ClPartyInfo)
        private callPartyInfo: Repository<ClPartyInfo>,
        @InjectRepository(ClSegments)
        private callSegments: Repository<ClSegments>,
        @InjectRepository(ClCalls)
        private calls: Repository<ClCalls>,
        @InjectRepository(CallcentQueuecalls)
        private queue: Repository<CallcentQueuecalls>
      ) {}
    

      //Поиск первый ID вызова в базе 3сх
      public async searchFirstIncomingId(incomingNumber: string): Promise<ClPartyInfo>{
        try {
          return await this.callPartyInfo
          .createQueryBuilder("cl_party_info")
          .select("cl_party_info.id")
          .where("cl_party_info.callerNumber like :number", {
            number: incomingNumber,
          })
          .orderBy("cl_party_info.id", "DESC")
          .getOne();
        } catch(e){
          this.log.error(`searchFirstIncomingId ${e}`)
        }

      }

       //Поиск уникальный ID вызова в базе 3сх
      public async searchCallInfoRecord(id: number): Promise<ClParticipants>{
        try {
          return await this.callParticipants
          .createQueryBuilder("cl_participants")
          .select([
              "cl_participants.callId",
              "cl_participants.recordingUrl",
            ])
          .where("cl_participants.info_id = :id", { id: id })
          .getOne();
        } catch(e){
          this.log.error(`searchCallifoRecord ${e}`);
          throw e;
        }
      }

       //Поиск последнего ID вызова в базе 3сх
      public async searchEndIncomingId(callId: number): Promise<ClParticipants>{
        try {
          return await this.callParticipants
          .createQueryBuilder("cl_participants")
          .select("cl_participants.infoId")
          .where("cl_participants.call_id = :callId", {
            callId: callId,
          })
          .orderBy("cl_participants.info_id", "DESC")
          .getOne();
        }catch(e){
          this.log.error(`searchEndIncomingId ${e}`);
          throw e;
        }
      }

      //Поиска информации по вызову на стороне 3сх
      public async searchCallInfo(callId: number): Promise<ClCalls>{
        try {
          return await this.calls
          .createQueryBuilder("cl_calls")
          .select([
            "cl_calls.startTime",
            "cl_calls.talkingDur",
            "cl_calls.isAnswered",
          ])
          .where("cl_calls.id = :id", { id: callId })
          .getOne();

        } catch(e) {
          this.log.error(`searchCallInfo ${e}`);
          throw e;
        } 
      }

       //Последнийответивший согласно 3сх
      public async searchLastUserRing(infoId: number): Promise<ClPartyInfo> {
        try {
          return await this.callPartyInfo
          .createQueryBuilder("cl_party_info")
          .select("cl_party_info.dn")
          .where("cl_party_info.id = :id", { id: infoId })
          .getOne();
        } catch(e){
          this.log.error(`getLastUserRing ${e}`);
          throw e;
        }
      }

      public async searchRecordingByCallID(callId: number): Promise<ClParticipants> {
        try {
          return await this.callParticipants
          .createQueryBuilder("cl_participants")
          .select("cl_participants.recordingUrl")
          .where("cl_participants.call_id = :callId", {
            callId: callId,
          })
          .andWhere('cl_participants.recording_url is not null')
          .getOne();
        }catch(e){
          this.log.error(`searchRecordingByCallID ${e}`);
          throw e;
        }
      }

}
