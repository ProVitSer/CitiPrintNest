import { LoggerService } from "@app/logger/logger.service";
import { PhonebookStruct } from "@app/mongo/types/interfaces";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { By, until, WebDriver } from "selenium-webdriver";
import { ADD_PHONEBOOK_ERROR, DEL_PHONEBOOK_ERROR, GET_PHONEBOOK_ERROR } from "../phonebook-3cx.consts";

@Injectable()
export class Phonebook {
  private webDriver: WebDriver;
  constructor(
    private readonly configService: ConfigService,
    private readonly log: LoggerService,
  ) {}


  public async updatePhonebook(webDriver: WebDriver, phonebook: PhonebookStruct[]){
    try{
        this.webDriver = webDriver;
        await this.getPhonebook();
        await this.deletePhonebook();
        await this.addNewPhonebook(phonebook);
    }catch(e){
        !!this.webDriver ? await this.webDriver.quit() : '';
        this.log.error(e);
    }
  }

  private async getPhonebook(){
    try {
        // Переходим в раздел Контакты
        await this.webDriver.get(`https://${this.configService.get('Pbx3CX.url')}/#/app/contacts`);
        await this.webDriver.sleep(5000);
    } catch(e){
        throw new Error(`${GET_PHONEBOOK_ERROR}: ${e}`)
    }
  }

  private async deletePhonebook(){
    try {
        // Удаляем все данные из Контактов
        await this.webDriver.wait(until.elementLocated(By.id('btnOptionsDelete')), 10 * 10000);
        await this.webDriver.findElement(By.id('btnOptionsDelete')).click();
        await this.webDriver.findElement(By.id('btnDeleteAll')).click();
        await this.webDriver.findElement(By.id('btnOk')).click();
        await this.webDriver.sleep(5000);
    }catch(e){
        throw new Error(`${DEL_PHONEBOOK_ERROR}: ${e}`)
    }
  }

  private async addNewPhonebook(phonebook: PhonebookStruct[]){
    try {
        for (const contact of phonebook) {
            await this.webDriver.wait(until.elementLocated(By.id('btnImport')), 10 * 10000); // Ожидание загрузки последней кнопки
            await this.webDriver.findElement(By.id('btnAdd')).click(); // Кнопка Добавить
            await this.webDriver.wait(until.elementLocated(By.xpath("//input[@placeholder='Pager']")), 10 * 10000); // Загрузка страницы
            await this.webDriver.findElement(By.xpath("//input[@placeholder='First Name']")).sendKeys(`${contact.fio} ${contact.company}`); // Поле Имя
            await this.webDriver.findElement(By.xpath("//input[@placeholder='Company']")).sendKeys(contact.company); // Поле Компания
            await this.webDriver.findElement(By.xpath("//input[@placeholder='Home']")).sendKeys(contact['_id']); // Поле Домашний
            await this.webDriver.findElement(By.id('btnSave')).click(); // Сохранение
            await this.webDriver.wait(until.elementLocated(By.id('btnImport')), 10 * 10000);
        }
      }catch(e){
        throw new Error(`${ADD_PHONEBOOK_ERROR}: ${e}`)
      }
  }
}