require('dotenv').config();

export const config = {
    AppEnv: process.env.AppEnv,
    AccessKey: process.env.AccessKey,
    SecretKey: process.env.SecretKey,
    AWSRegion: process.env.AWSRegion,
    LogglyKey: process.env.LogglyKey,
    LogglySubdomain: process.env.LogglySubdomain,
    S3Bucket: process.env.S3Bucket,
    KafkaBroker: process.env.KafkaBroker,
    KafkaClient: process.env.KafkaClient,
    KafkaDetectionTopic: process.env.KafkaDetectionsTopic,
    KafkaPollutionTopic: process.env.KafkaPollutionTopic,
    SentryDNS: process.env.SentryDNS
}