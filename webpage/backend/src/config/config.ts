require('dotenv').config();

export const config = {
    AppEnv: process.env.AppEnv,
    ExpressPort: process.env.ExpressPort,
    MongoConnection: process.env.MongoConnection,
    DBMongo: process.env.DBMongo,
    DBCollectionMongo: process.env.DBCollectionMongo
}