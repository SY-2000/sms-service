import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';
import { SmsDto } from './dto/sms.dto';

@Injectable()
export class SmsService {
  private readonly twilioClient: twilio.Twilio;
  private readonly logger = new Logger(SmsService.name);

  constructor(private configService: ConfigService) {
    this.twilioClient = twilio(
      this.configService.get('twilio.accountSid'),
      this.configService.get('twilio.authToken'),
    );
  }

  async sendSms(smsData: SmsDto): Promise<void> {
    try {
      // Format the phone number to E.164 format
      const formattedNumber = this.formatPhoneNumber(smsData.number);

      this.logger.log(`Attempting to send SMS to ${formattedNumber}`);

      await this.twilioClient.messages.create({
        body: smsData.message,
        to: formattedNumber,
        from: this.configService.get('twilio.fromNumber'),
      });

      this.logger.log(`SMS sent successfully to ${formattedNumber}`);
    } catch (error) {
      this.logger.error('Failed to send SMS:', {
        error: error.message,
        code: error.code,
        details: error.moreInfo,
        number: smsData.number,
      });
      throw error;
    }
  }

  private formatPhoneNumber(number: string): string {
    // If number already starts with +, return it as is
    if (number.startsWith('+')) {
      return number;
    }

    // Remove any non-digit characters
    let cleaned = number.replace(/\D/g, '');

    // Remove leading zero if present
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

    // Add country code if not present
    if (!cleaned.startsWith('212')) {
      cleaned = '212' + cleaned;
    }

    // Add + prefix
    return '+' + cleaned;
  }
}
