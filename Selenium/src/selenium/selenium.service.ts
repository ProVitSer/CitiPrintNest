import { LoggerService } from '@app/logger/logger.service';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webdriver from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import { Builder, By, until } from 'selenium-webdriver';
import { MongoService } from '@app/mongo/mongo.service';
import { PhonebookStruct } from '@app/mongo/types/interfaces';
import { CollectionType, DbRequestType } from '@app/mongo/types/types';
import { MailService } from '@app/mail/mail.service';

@Injectable()
export class SeleniumService {
    private driver: any;

    constructor(
        private readonly configService: ConfigService,
        private readonly log: LoggerService,
        private readonly mongo: MongoService,
        private readonly mail: MailService
      ) {}

    public async updatePhonebook(){
        try { 
          const phonebook = await this.getPhonebook();
          this.driver  = await this.getDriver();
          await this.login();
          // Переходим в раздел Контакты
          await this.driver.get(`https://${this.configService.get('Pbx3CX.url')}/#/app/contacts`);
          await this.driver.sleep(5000);
          await this.deletePhonebook();
          await this.addNewPhonebook(phonebook);
          await this.logout();
          await this.driver.quit();
          await this.mail.send('Успешная синхронизация телефонной книги')
        } catch(e){
          this.log.error(`Ошибка обновление контактной книги 3сх ${JSON.stringify(e)}`);
          await this.mail.send('Проблемы синхронизации контактной книги')
          try{
            await this.driver.quit();
          }catch(e){
            this.log.error(`Ошибка выхода ${JSON.stringify(e)}`);
          }
        }
    }

    private async getDriver(){
      try{
        let chromeCapabilities = webdriver.Capabilities.chrome()
        let options: chrome.Options = new chrome.Options();
        options = options.excludeSwitches('--enable-automation')
        return await new webdriver.Builder().forBrowser('chrome').setChromeOptions(options).withCapabilities(chromeCapabilities).build();
      } catch(e){
        this.log.error(`Ошибка webdriver ${JSON.stringify(e)}`);
      }

    }

    private async login() {
      try {
          await this.driver.get(`https://${this.configService.get('Pbx3CX.url')}/#/login`);
          await this.driver.wait(until.elementLocated(By.className('btn btn-lg btn-primary btn-block ng-scope')), 10 * 10000);
          await this.driver.findElement(By.xpath("//input[@placeholder='User name or extension number]")).sendKeys(this.configService.get('Pbx3CX.username'));
          await this.driver.findElement(By.xpath("//input[@placeholder='Password']")).sendKeys(this.configService.get('Pbx3CX.password'));
          await this.driver.sleep(1000);
          await this.driver.findElement(By.xpath("//button[@translate='LOGIN_SCREEN.LOGIN_BTN']")).click();
          await this.driver.sleep(5000);
          return '';
      } catch (e) {
          this.log.error(`Ошибка авторизации на 3СХ ${JSON.stringify(e)}`);
      }
    }

    private async logout() {
      try {
          await this.driver.sleep(5000);
          await this.driver.get(`https://${this.configService.get('Pbx3CX.url')}/#/app/default`);
          await this.driver.sleep(1000);
          await this.driver.findElement(By.xpath("//a[@class='ng-binding dropdown-toggle']")).click();
          await this.driver.findElement(By.xpath("//a[@ng-click='logout()']")).click();
          return '';
      } catch (e) {
          this.log.error(`Ошибка выхода из web интерфейса 3СХ ${JSON.stringify(e)}`);
      }
    }

    private async deletePhonebook(){
       try {
          // Удаляем все данные из Контактов
          await this.driver.wait(until.elementLocated(By.id('btnOptionsDelete')), 10 * 10000);
          await this.driver.findElement(By.id('btnOptionsDelete')).click();
          await this.driver.findElement(By.id('btnDeleteAll')).click();
          await this.driver.findElement(By.id('btnOk')).click();
          await this.driver.sleep(5000);
       }catch(e){
        this.log.error(`Ошибка удаления телефонной книги ${JSON.stringify(e)}`);
       }

    }

    private async addNewPhonebook(phonebook: PhonebookStruct[]){
      try {
        // Перебираем все полученные данные из Mongo и заносим их в поля Контактов
        await Promise.all(phonebook.map(async (contact: PhonebookStruct) => {
        await this.driver.wait(until.elementLocated(By.id('btnImport')), 10 * 10000); // Ожидание загрузки последней кнопки
        await this.driver.findElement(By.id('btnAdd')).click(); // Кнопка Добавить
        await this.driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Pager']")), 10 * 10000); // Загрузка страницы
        await this.driver.findElement(By.xpath("//input[@placeholder='First Name']")).sendKeys(`${contact.fio} ${contact.company}`); // Поле Имя
        await this.driver.findElement(By.xpath("//input[@placeholder='Company']")).sendKeys(contact.company); // Поле Компания
        await this.driver.findElement(By.xpath("//input[@placeholder='Home']")).sendKeys(contact['_id']); // Поле Домашний
        await this.driver.findElement(By.id('btnSave')).click(); // Сохранение
        await this.driver.wait(until.elementLocated(By.id('btnImport')), 10 * 10000);
        await this.driver.sleep(2000);
      }))
      }catch(e){
        this.log.error(`Ошибка добавления телефонной книги ${JSON.stringify(e)}`);
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
