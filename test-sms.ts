import { connect, ConnectionUrl } from 'amqp-connection-manager';
import * as dotenv from 'dotenv';
import { setTimeout } from 'timers/promises';
import { Channel } from 'amqplib';

dotenv.config();

if (!process.env.AMQP_URL) {
  throw new Error('AMQP_URL environment variable is required');
}
if (!process.env.SMS_EXCHANGE) {
  throw new Error('SMS_EXCHANGE environment variable is required');
}
if (!process.env.SMS_ROUTING_KEY) {
  throw new Error('SMS_ROUTING_KEY environment variable is required');
}

const AMQP_URL = process.env.AMQP_URL as ConnectionUrl;
const SMS_EXCHANGE = process.env.SMS_EXCHANGE;
const SMS_ROUTING_KEY = process.env.SMS_ROUTING_KEY;

async function sendTestSms() {
  const logger = {
    info: (...args: any[]) =>
      console.log(new Date().toISOString(), '- INFO:', ...args),
    error: (...args: any[]) =>
      console.error(new Date().toISOString(), '- ERROR:', ...args),
  };

  try {
    logger.info('Connecting to RabbitMQ...');
    logger.info(`Exchange: ${SMS_EXCHANGE}`);
    logger.info(`Routing Key: ${SMS_ROUTING_KEY}`);

    const connection = connect([AMQP_URL]);

    connection.on('connect', () =>
      logger.info('Successfully connected to RabbitMQ!'),
    );

    const channelWrapper = connection.createChannel({
      setup: async (channel: Channel) => {
        try {
          // Assert the exchange
          logger.info(`Asserting exchange: ${SMS_EXCHANGE}`);
          await channel.assertExchange(SMS_EXCHANGE, 'topic', {
            durable: true,
          });

          // Assert the queue
          logger.info(`Asserting queue: ${SMS_EXCHANGE}`);
          await channel.assertQueue(SMS_EXCHANGE, {
            durable: true,
          });

          // Bind the queue to the exchange
          logger.info(
            `Binding queue to exchange with routing key: ${SMS_ROUTING_KEY}`,
          );
          await channel.bindQueue(SMS_EXCHANGE, SMS_EXCHANGE, SMS_ROUTING_KEY);

          const testSms = [
            {
              number: '+212641688295',
              message: 'This is a test SMS 1 from the microservice',
              date: new Date().toISOString(),
            },
            {
              number: '+212641688295',
              message: 'This is a test SMS 2 from the microservice',
              date: new Date().toISOString(),
            },
          ];

          // Publish messages with pattern property
          for (const sms of testSms) {
            logger.info(
              `Publishing message to exchange: ${SMS_EXCHANGE} with routing key: ${SMS_ROUTING_KEY}`,
            );
            const published = await channel.publish(
              SMS_EXCHANGE,
              SMS_ROUTING_KEY,
              Buffer.from(
                JSON.stringify({
                  pattern: 'send_sms',
                  data: sms,
                }),
              ),
              {
                persistent: true,
                contentType: 'application/json',
              },
            );
            logger.info('Message published:', published);
          }
        } catch (error) {
          logger.error('Error in channel setup:', error);
          throw error;
        }
      },
    });

    // Wait for messages to be processed
    await setTimeout(5000);

    // Cleanup
    logger.info('Cleaning up...');
    await channelWrapper.close();
    await connection.close();
    logger.info('Test completed successfully');
  } catch (error) {
    logger.error('Error:', error);
    process.exit(1);
  }
}

console.log('Starting SMS service test...');
sendTestSms().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
