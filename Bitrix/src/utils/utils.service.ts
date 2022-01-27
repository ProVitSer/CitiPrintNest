import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {

    static replaceChannel(channel: string){
        return channel.replace(/(SIP\/)(\d{3})-(.*)/, `$2`);
    };

    static async sleep(ms: number) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

}
