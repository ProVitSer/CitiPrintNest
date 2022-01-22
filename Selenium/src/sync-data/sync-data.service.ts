import { LoggerService } from '@app/logger/logger.service';
import { SeleniumService } from '@app/selenium/selenium.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';


@Injectable()
export class SyncDataService {
    private isConfCreateEnd: boolean = true;
    
    constructor(
        private readonly configService: ConfigService,
        private readonly log: LoggerService,
        private readonly selenium: SeleniumService
    ){}

    onApplicationBootstrap() {}


    @Cron(CronExpression.EVERY_WEEK)
    async updatePhonebook(){
        try {

        }catch(e){
            this.log.error(JSON.stringify(e));
        }
    }
}
