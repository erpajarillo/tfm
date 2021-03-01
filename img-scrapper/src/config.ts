require('dotenv').config();

export const config = {
    AppEnv: process.env.AppEnv,
    AWSAccessKey: process.env.AWSAccessKey,
    AWSSecretKey: process.env.AWSSecretKey,
    AWSRegion: process.env.AWSRegion,
    S3Bucket: process.env.S3Bucket,
    KafkaBroker: process.env.KafkaBroker,
    KafkaClient: process.env.KafkaClient
}