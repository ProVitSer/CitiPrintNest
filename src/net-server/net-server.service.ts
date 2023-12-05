import * as net from 'net';
import { OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@app/logger/logger.service';
import { PostgresService } from '@app/postgres/postgres.service';
import { CollectionType, DbRequestType } from '@app/mongo/types/types';
import { MongoService } from '@app/mongo/services/mongo.service';
import { BitrixUsers } from '@app/mongo/schemas/bitrix-users.schema';
import { UtilsService } from '@app/utils/utils.service'
import { RegisterPbxOutboundCallInfoAdapter } from './adapters/register-pbx-outbound-call-data.adapter';
import { BitrixService } from '@app/bitrix/bitrix.service';

@WebSocketGateway()
export class NetServerService implements OnGatewayInit {
    private localExtensionNumberLength: number = 3;
    constructor(
        private readonly configService: ConfigService,
        private readonly log: LoggerService,
        private readonly pg: PostgresService,
        private readonly mongo: MongoService,
        private readonly registerOutgoing: RegisterPbxOutboundCallInfoAdapter,
        private readonly bitrix: BitrixService,
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

    private async parseCDR(data: Array<string>): Promise<void>{
        /* [ 'Call 52501',
            '2021/02/15 07:02:39',
            '00:00:15',
            '565',
            '101\r\n' ]*/
        const callCDR = data.toString().split(",");

        const localExtensionB = callCDR[4].match(/(\d*)\r\n/);   

    	if (callCDR[3].length == this.localExtensionNumberLength && localExtensionB[1].length == this.localExtensionNumberLength) {

            this.log.info(callCDR);

            await UtilsService.sleep(20000);

            await this.sendLocalCallInfo(callCDR);
        }
    }

    private async sendLocalCallInfo(callCDR: string[]): Promise<void>{
        try {

            const Id3CXcall = callCDR[0].match(/Call (\d*)/);

            const localCallInfo = await this.pg.getLocalCallInfo(Number(Id3CXcall[1]));
 
            this.bitrix.registerCall(this.registerOutgoing.getRegisterCallInfo(callCDR, localCallInfo, this.configService.get('bitrix.custom.pbx3CXRecordUrl')));

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
