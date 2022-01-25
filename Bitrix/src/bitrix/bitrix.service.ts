import { LoggerService } from '@app/logger/logger.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BitrixExternalCallFinishRequest, BitrixRegisterCallResponse, Show , ExternalCallRegister} from './types/interfaces';

@Injectable()
export class BitrixService {
    private baseURL = this.configService.get('bitrix.url');
    private hash = this.configService.get('bitrix.hash');
    private bitrixUrl = `${this.baseURL}${this.hash}`

    constructor(
        private readonly log: LoggerService,
        private readonly configService : ConfigService,
    ) {}

    public async externalCallRegister(data: ExternalCallRegister): Promise<BitrixRegisterCallResponse>{
        try {

        }catch(e){

        }
    }
}
