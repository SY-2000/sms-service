import { IsString, IsPhoneNumber, IsDateString } from 'class-validator';

export class SmsDto {
  @IsPhoneNumber()
  number: string;

  @IsString()
  message: string;

  @IsDateString()
  date: string;
}
