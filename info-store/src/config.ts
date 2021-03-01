require('dotenv').config();

export const config = {
    AppEnv: process.env.AppEnv,
    KafkaBroker: process.env.KafkaBroker,
    KafkaClient: process.env.KafkaClient,
    KafkaPollutionTopic: process.env.KafkaPollutionTopic,
    MongoConnection: process.env.MongoConnection,
    DBMongo: process.env.DBMongo,
    DBCollectionMongo: process.env.DBCollectionMongo
}