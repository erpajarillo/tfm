const mongoose = require('mongoose');
import {config} from '../config/config';

mongoose.connect(config.MongoConnection,
    {
        useNewUrlParser: true,
        seUnifiedTopology: true,
        dbName: config.DBMongo
    });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Mongo Connected');
});

module.exports = db;