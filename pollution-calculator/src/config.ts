require('dotenv').config();

export const config = {
    AppEnv: process.env.AppEnv,
    KafkaBroker: process.env.KafkaBroker,
    KafkaClient: process.env.KafkaClient,
    KafkaDetectionTopic: process.env.KafkaDetectionsTopic,
    KafkaPollutionTopic: process.env.KafkaPollutionTopic
}