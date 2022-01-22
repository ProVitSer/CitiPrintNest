import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@app/logger/logger.service';


@Injectable()
export class MailService {
    constructor(
        private mailerService: MailerService,
        private readonly configService: ConfigService,
        private readonly log: LoggerService 
      ) {}
  
    async send(message: string) {
        try{
          const result = await this.mailerService.sendMail({
              to: this.configService.get('mail.toEmail'),
              subject: this.configService.get('mail.subject'),
              template: this.configService.get('mail.template'), 
              context: {
                text: message,
              },
            });
          this.log.info('Письмо успешно отправлено');
        }catch(e){
          this.log.error(`Проблемы с отправкой письма ${e}`);
        }
  
    }
  
}
