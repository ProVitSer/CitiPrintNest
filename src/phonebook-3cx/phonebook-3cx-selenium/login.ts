import { LoggerService } from '@app/logger/logger.service';
import { SeleniumWebdriver } from '@app/selenium/selenium-webdriver';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { By, until, WebDriver } from 'selenium-webdriver';
import { LOGIN_ERROR } from '../phonebook-3cx.consts';

@Injectable()
export class Login {
  private webDriver: WebDriver;
  constructor(
    private readonly seleniumWebDriver: SeleniumWebdriver,
    private readonly configService: ConfigService,
    private readonly log: LoggerService,
  ) {}

  public async loginOnPbx(): Promise<WebDriver> {
    try {
      this.webDriver = await this.seleniumWebDriver.getWebDriver();
      await this.webDriver.manage().window().maximize();
      return await this.login()
    } catch (e) {
      !!this.webDriver ? await this.webDriver.quit() : '';
      this.log.error(e);
    }
  }

  private async login(): Promise<WebDriver> {
    try {
      await this.webDriver.get(`https://${this.configService.get('Pbx3CX.url')}/#/login`);
      await this.checkPrivacy();
      await this.webDriver.wait(until.elementLocated(By.className('btn btn-lg btn-primary btn-block ng-scope')), 10 * 10000);
      await this.webDriver
        .findElement(By.xpath("//input[@placeholder='User name or extension number']"))
        .sendKeys(this.configService.get('Pbx3CX.username'));
      await this.webDriver.findElement(By.xpath("//input[@placeholder='Password']")).sendKeys(this.configService.get('Pbx3CX.password'));
      await this.webDriver.sleep(1000);
      await this.webDriver.findElement(By.xpath("//button[@translate='LOGIN_SCREEN.LOGIN_BTN']")).click();
      await this.webDriver.sleep(5000);
      return this.webDriver;
    } catch (e) {
      throw new Error(`${LOGIN_ERROR}: ${e}`)
    }
  }

  private async checkPrivacy(): Promise<void> {
    try {
      await this.webDriver.sleep(10000);
      await this.webDriver.findElement(By.xpath("//h1[contains(text(), 'Your connection is not private')]"));
      await this.webDriver.findElement(By.xpath("//button[@id='details-button']")).click();
      await this.webDriver.sleep(5000);
      await this.webDriver.findElement(By.xpath("//a[@id='proceed-link']")).click();
      await this.webDriver.sleep(5000);
      return
    } catch (e) {
      return;
    }
  }
}
