import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Phonebook3cxService } from "./phonebook-3cx.service";

@Injectable()
export class Phonebook3cxSchedule {
    constructor(private readonly phonebook3cxService: Phonebook3cxService){}
    
    @Cron(CronExpression.EVERY_10_SECONDS)
    async updatePhonebook() {
        this.phonebook3cxService.update3cxPhonebook();
    }
}