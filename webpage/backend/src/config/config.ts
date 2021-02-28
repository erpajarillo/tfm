require('dotenv').config();

export const config = {
    AppEnv: process.env.AppEnv,
    ExpressPort: process.env.ExpressPort,
    SentryDNS: process.env.SentryDNS,
    MongoConnection: process.env.MongoConnection,
    DBMongo: process.env.DBMongo
}