import { Module } from '@nestjs/common';
import { SmsController } from './sms/sms.controller';
import { SmsService } from './sms/sms.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
  ],
  controllers: [SmsController],
  providers: [SmsService],
})
export class SmsModule {}
