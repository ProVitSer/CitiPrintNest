import { LoggerService } from "@app/logger/logger.service";
import { MongoService } from "@app/mongo/mongo.service";
import { PhonebookStruct } from "@app/mongo/types/interfaces";
import { CollectionType, DbRequestType } from "@app/mongo/types/types";
import { SeleniumWebdriver } from "@app/selenium/selenium-webdriver";
import { Injectable } from "@nestjs/common";
import { Login } from "./phonebook-3cx-selenium";

@Injectable()
export class Phonebook3cxService {
    constructor(
        private readonly log: LoggerService, 
        private readonly mongo: MongoService,
        private readonly login: Login){}

    public async update3cxPhonebook(){
        const phonebook = await this.getPhonebook();
        await this.login.loginOnPbx();
    }


    private async getPhonebook(): Promise<PhonebookStruct[]>{
        const params = {
          criteria: {},
          entity: CollectionType.phonebook,
          requestType: DbRequestType.findAll
        };
        return await this.mongo.mongoRequest(params);
      }

}