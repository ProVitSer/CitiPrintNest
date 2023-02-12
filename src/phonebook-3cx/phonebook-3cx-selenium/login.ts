import { LoggerService } from "@app/logger/logger.service";
import { SeleniumWebdriver } from "@app/selenium/selenium-webdriver";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { By, until, WebDriver } from "selenium-webdriver";

@Injectable()
export class Login {
  private webDriver: WebDriver;
  constructor(
    private readonly seleniumWebDriver: SeleniumWebdriver,
    private readonly configService: ConfigService,
    private readonly log: LoggerService
  ) {}

  public async loginOnPbx(): Promise<WebDriver> {
    try {
      this.webDriver = await this.seleniumWebDriver.getWebDriver();
      console.log(this.webDriver)
      return await this.login();
    } catch (e) {
      throw e;
    }
  }

  private async login(): Promise<WebDriver>{
    try {
        await this.webDriver.get(`https://${this.configService.get('Pbx3CX.url')}/#/login`);
        await this.webDriver.wait(until.elementLocated(By.className('btn btn-lg btn-primary btn-block ng-scope')), 10 * 10000);
        await this.webDriver.findElement(By.xpath("//input[@placeholder='User name or extension number]")).sendKeys(this.configService.get('Pbx3CX.username'));
        await this.webDriver.findElement(By.xpath("//input[@placeholder='Password']")).sendKeys(this.configService.get('Pbx3CX.password'));
        await this.webDriver.sleep(1000);
        await this.webDriver.findElement(By.xpath("//button[@translate='LOGIN_SCREEN.LOGIN_BTN']")).click();
        await this.webDriver.sleep(50000);
        return this.webDriver;
    } catch (e) {
        this.log.error(`Ошибка авторизации на 3СХ ${JSON.stringify(e)}`);
    }
  }
}