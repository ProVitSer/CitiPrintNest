import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongoService } from './services/mongo.service';
import schemas from './provider/mongo.provider';

@Module({
    imports: [
      MongooseModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
            uri: configService.get<string>('mongodbUri'),
        }),
        inject: [ConfigService],
      }),
      MongooseModule.forFeature([...schemas()]),
    ],
    exports: [MongoService],
    providers: [MongoService],
  })
export class MongoModule {}
