import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { SmsModule } from './sms.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(SmsModule);
  const configService = app.get(ConfigService);

  // Configure microservice
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('amqp.url')],
      queue: configService.get<string>('amqp.sms_exchange'),
      queueOptions: {
        durable: true,
      },
      exchange: configService.get<string>('amqp.sms_exchange'),
      routingKey: configService.get<string>('amqp.sms_routing_key'),
      noAck: false,
      prefetchCount: 5,
    },
  });

  // Start microservice and HTTP server
  try {
    await app.startAllMicroservices();
    await app.listen(3001);
    logger.log(`SMS microservice is running on port 3000`);
    logger.log(
      `RabbitMQ connected to ${configService.get<string>('amqp.url')}`,
    );
  } catch (error) {
    logger.error('Failed to start the application:', error);
    process.exit(1);
  }
}

bootstrap();
