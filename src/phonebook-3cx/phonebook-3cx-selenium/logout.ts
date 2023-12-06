import { LoggerService } from '@app/logger/logger.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { By, WebDriver } from 'selenium-webdriver';
import { LOGOUT_ERROR } from '../phonebook-3cx.consts';

@Injectable()
export class Logout {
  private webDriver: WebDriver;
  constructor(
    private readonly configService: ConfigService,
    private readonly log: LoggerService,
  ) {}

  public async logout(webDriver: WebDriver): Promise<void> {
    try {
        this.webDriver = webDriver;
        return await this._logout()
    } catch (e) {
        !!this.webDriver ? await this.webDriver.quit() : '';
        this.log.error(e);
    }
  }

  private async _logout(): Promise<void> {
    try {
        await this.webDriver.sleep(5000);
        await this.webDriver.get(`https://${this.configService.get('Pbx3CX.url')}/#/app/default`);
        await this.webDriver.sleep(1000);
        await this.webDriver.findElement(By.xpath("//a[@class='ng-binding dropdown-toggle']")).click();
        await this.webDriver.findElement(By.xpath("//a[@ng-click='logout()']")).click();
        await this.webDriver.quit();
    } catch (e) {
        throw new Error(`${LOGOUT_ERROR}: ${e}`)
    }
  }
}
