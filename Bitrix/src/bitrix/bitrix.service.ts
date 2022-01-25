import { LoggerService } from '@app/logger/logger.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BitrixExternalCallFinishRequest, BitrixRegisterCallResponse, 
    Show , ExternalCallRegister, BitirxUserGet, BitrixMetod, ActiveUser} from './types/interfaces';
import axios, { HttpService } from '@nestjs/axios';

@Injectable()
export class BitrixService {
    private baseURL = this.configService.get('bitrix.url');
    private hash = this.configService.get('bitrix.hash');
    private bitrixUrl = `${this.baseURL}${this.hash}`

    constructor(
        private readonly log: LoggerService,
        private readonly configService : ConfigService,
        private httpService: HttpService,
    ) {}

    public async getActiveUsers(startPage: number): Promise<any>{
        try {
            const data = {
                "FILTER": {
                  "ACTIVE": ActiveUser.active,
                }
              }

            return (await this.httpService.post(`${this.bitrixUrl}${BitrixMetod.UserGet}?start=${startPage}`,data).toPromise()).data 
        }catch(e){
            this.log.error(`getActiveUsers ${e}`)
        }
    }
}
