
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Builder } from 'selenium-webdriver';
import { Capabilities } from './selenium.interfaces';

@Injectable()
export class SeleniumWebdriver  {
  private capabilities: Capabilities;
  constructor(private readonly configService: ConfigService) {
    this.capabilities = this.configService.get('selenium.capabilities');
  }


  public async getWebDriver() {
    try {
      console.log(this.capabilities)
      return await new Builder().usingServer(this.configService.get('selenium.host')).withCapabilities(this.capabilities).build();
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
