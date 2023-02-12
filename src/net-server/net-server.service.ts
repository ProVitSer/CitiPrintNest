import { Injectable } from '@nestjs/common';
import * as net from 'net';
import { OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@app/logger/logger.service';
import * as moment from 'moment';
import { PostgresService } from '@app/postgres/postgres.service';
import { BitrixCallStatusType, CallRegisterData, BitrixCallType, CallFinishData } from '@app/bitrix/types/interfaces';
import { BitrixApiService } from '@app/bitrix/bitrix.api.service';
import { CollectionType, DbRequestType } from '@app/mongo/types/types';
import { MongoService } from '@app/mongo/mongo.service';
import { BitrixUsers } from '@app/mongo/schemas/BitrixUsers.schema';
import { UtilsService } from '@app/utils/utils.service'

@WebSocketGateway()
export class NetServerService implements OnGatewayInit {
    constructor(
        private readonly configService: ConfigService,
        private readonly log: LoggerService,
        private readonly pg: PostgresService,
        private readonly bitrix: BitrixApiService,
        private readonly mongo: MongoService
    ){}
    
    @WebSocketServer()
    server: Server;

    public afterInit() {
        this.initListenTCP();
    }

    private initListenTCP() {
        const clientTcp = net.createServer((connection) => {
            console.log('TCP Server init');
            connection.on('data', (data: Array<string>) => {
                this.log.info(`Получены CDR данные от АТС ${(data.toString())}`);
                this.parseCDR(data);
            })
        }).listen(this.configService.get('tcpServer'));

        clientTcp.on('error', (error: any) => {
            if (error.code == 'EADDRINUSE') {
                console.log(`Address or port ${this.configService.get('tcpServer')} in use, retrying...`);
                setTimeout(() => {
                    clientTcp.close();
                    clientTcp.listen(this.configService.get('tcpServer'));
                }, 5000);
            } else {
                this.log.error(error);
            }
        });
      
        clientTcp.on('close', () => {
            console.log('Connection closed!');
        });
    }

    private async parseCDR(data: Array<string>){
        /* [ 'Call 52501',
            '2021/02/15 07:02:39',
            '00:00:15',
            '565',
            '101\r\n' ]*/
        const callCDR = data.toString().split(",");
        const localExtensionB = callCDR[4].match(/(\d*)\n/);
        if (callCDR[3].length == 3 && localExtensionB[1].length == 3) {
            const Id3CXcall = callCDR[0].match(/Call (\d*)/);
            const startCall = moment(new Date(callCDR[1])).add(3, 'hour').format('YYYY-MM-DD H:mm:ss');
            const duration = moment.duration(callCDR[2]).asSeconds();
            //52506 2021-02-15 10:27:33 0 565 104
            this.log.info(`${Id3CXcall[1]} ${startCall} ${duration} ${callCDR[3]} ${localExtensionB[1]}`);
            await UtilsService.sleep(20000)
            await this.sendInfoByLocalCall(Id3CXcall[1], startCall, duration, callCDR[3], localExtensionB[1])
        }
    }

    private async sendInfoByLocalCall(Id3CX: string, startCall: string, duration: number, localExtensionA: string, localExtensionB: string){
        try {
            const { isAnswered, recording } = await this.pg.getLocalCallInfo(Number(Id3CX));
            const bitrixCallStatusType = (isAnswered == true) ? BitrixCallStatusType.SuccessfulCall : BitrixCallStatusType.MissedCall;
            const bitrixUserId = await this.getBitrixUserID(localExtensionA);

            const callStartData: CallRegisterData = {
                bitrixId: bitrixUserId[0].bitrixId, 
                phoneNumber: localExtensionB,
                type: BitrixCallType.outgoing, 
                callTime: startCall
            }

            const { CALL_ID } = await this.bitrix.externalCallRegister(callStartData);
            const callFinishData: CallFinishData = {
                callId: CALL_ID, 
                bitrixId: bitrixUserId[0].bitrixId, 
                bilsec: duration, 
                callStatus: bitrixCallStatusType, 
                callType: BitrixCallType.outgoing,
                recording: recording
            }

            return await this.bitrix.externalCallFinish(callFinishData, this.configService.get('bitrix.custom.pbx3CXRecordUrl'));
        }catch(e){
            this.log.error(`sendInfoByLocalCall ${e}`)
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
            return this.mongo.mongoRequest(params);
        } catch(e){
            this.log.error(`getBitrixUserID ${e}`)
        }
    }
}
