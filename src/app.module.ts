import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './services/app.service';
import { ConfigModule } from '@nestjs/config';
import { DataIntegrityServiceClient } from './services/dip.service.wrapper';
import { NestjsFormDataModule } from 'nestjs-form-data';

@Module({
  imports: [NestjsFormDataModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService,DataIntegrityServiceClient],
})
export class AppModule {}
