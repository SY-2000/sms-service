export default () => {
  const requiredEnvVars = [
    'AMQP_URL',
    'SMS_EXCHANGE',
    'SMS_ROUTING_KEY',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_FROM_NUMBER',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`${envVar} is required`);
    }
  }

  return {
    amqp: {
      url: process.env.AMQP_URL,
      sms_exchange: process.env.SMS_EXCHANGE || 'dakaai_microservices/sms',
      sms_routing_key: process.env.SMS_ROUTING_KEY || 'send_sms',
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_FROM_NUMBER,
    },
  };
};
