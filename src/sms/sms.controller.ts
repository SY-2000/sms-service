import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { SmsService } from './sms.service';
import { SmsDto } from './dto/sms.dto';

@Controller()
export class SmsController {
  private readonly logger = new Logger(SmsController.name);

  constructor(private readonly smsService: SmsService) {}

  @EventPattern('send_sms')
  async handleSmsSending(@Payload() data: SmsDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    this.logger.log('Received SMS request:', {
      number: data.number,
      date: data.date,
    });

    try {
      await this.smsService.sendSms(data);
      channel.ack(originalMsg);
      this.logger.log('Successfully sent SMS and acknowledged message');
      return { success: true };
    } catch (error) {
      this.logger.error('Failed to process SMS request:', error);
      channel.nack(originalMsg, false, false);
      throw error;
    }
  }
}
