import { LoggerService } from "@app/logger/logger.service";
import { MongoService } from "@app/mongo/mongo.service";
import { PhonebookStruct } from "@app/mongo/types/interfaces";
import { CollectionType, DbRequestType } from "@app/mongo/types/types";
import { Injectable } from "@nestjs/common";
import { WebDriver } from "selenium-webdriver";
import { Login, Logout } from "./phonebook-3cx-selenium";
import { Phonebook } from "./phonebook-3cx-selenium/phonebook";

@Injectable()
export class Phonebook3cxService {
    private webDriver: WebDriver;
    constructor(
        private readonly log: LoggerService, 
        private readonly mongo: MongoService,
        private readonly login: Login,
        private readonly phonebook: Phonebook,
        private readonly logout: Logout,
        ){}

    public async update3cxPhonebook(){
        try {
          const phonebook = await this.getPhonebook();
          this.webDriver = await this.login.loginOnPbx();
          await this.phonebook.updatePhonebook(this.webDriver,phonebook);
          await this.logout.logout(this.webDriver);
        }catch(e){
          return;
        }
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