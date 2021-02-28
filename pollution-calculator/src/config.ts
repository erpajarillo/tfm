require('dotenv').config();

export const config = {
    AppEnv: process.env.AppEnv,
    LogglyKey: process.env.LogglyKey,
    LogglySubdomain: process.env.LogglySubdomain,
    KafkaBroker: process.env.KafkaBroker,
    KafkaClient: process.env.KafkaClient,
    KafkaDetectionTopic: process.env.KafkaDetectionsTopic,
    KafkaPollutionTopic: process.env.KafkaPollutionTopic,
    SentryDNS: process.env.SentryDNS
}