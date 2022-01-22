import { LoggerService } from '@app/logger/logger.service';
import { SeleniumService } from '@app/selenium/selenium.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';


@Injectable()
export class SyncDataService {    
    constructor(
        private readonly configService: ConfigService,
        private readonly log: LoggerService,
        private readonly selenium: SeleniumService
    ){}

    onApplicationBootstrap() {}


    @Cron(CronExpression.EVERY_MINUTE)
    async updatePhonebook(){
        try {
            await this.selenium.updatePhonebook();
        }catch(e){
            this.log.error(JSON.stringify(e));
        }
    }
}
