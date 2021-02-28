import {Logger} from './services/LoggerService';
import {SentryService} from "./services/SentryService";
import {storeInfoResponseInterface} from "./interfaces/Interfaces";
import {config} from "./config";
import {Kafka} from "kafkajs";
const mongoose = require('mongoose');
const Pollution = require('./services/Mongo');

export class infoStore {
    private log;
    private sentry;
    private kafka;
    private readonly kafkaPollutionTopic;
    private readonly kafkaGroup;

    constructor() {
        this.kafka = new Kafka({
            clientId: `${config.KafkaClient}`,
            brokers: [`${config.KafkaBroker}`]
        });
        this.kafkaPollutionTopic = config.KafkaPollutionTopic ??= 'pollution';
        this.kafkaGroup = 'pollution-group';
        this.log = new Logger();
        this.sentry = new SentryService();
    }

    store = async (): Promise<storeInfoResponseInterface> => {
        const consumer = await this.kafkaConsumer();

        await consumer.run({
            eachMessage: async ({topic, partition, message}) => {
                await this.storeInfoMongo({value: message.value, headers: message.headers});
            }
        });

        return {status: true, msg: 'OK'};
    }

    private kafkaConsumer = async () => {
        const consumer = this.kafka.consumer({groupId: this.kafkaGroup});
        await consumer.connect();

        await consumer.subscribe({topic: this.kafkaPollutionTopic, fromBeginning: true})
            .then((res) => {
                this.log.send('info', {
                    msg: `Kafka: A consumer has been subscribed to topic ${this.kafkaPollutionTopic}`,
                    topic: this.kafkaPollutionTopic,
                    res
                });
            })
            .catch(err => {
                this.log.send('error', {msg: `Kafka: Error subscribing to topic ${this.kafkaPollutionTopic}`, err});
                this.sentry.captureException(err);
            });

        return consumer;
    }

    private storeInfoMongo = async (kafkaData: any) => {
        const mongoData = await this.buildMongoData(kafkaData);
        await this.storeMongoDocument(mongoData);
    }

    private buildMongoData = (kafkaData: any) => {
        const imgName = kafkaData.headers.imgName.toString();
        const url = kafkaData.headers.url.toString();
        const cameraName = kafkaData.headers.cameraName.toString();
        const totalVehicles = Number(kafkaData.headers.totalVehicles);
        const totalCars = Number(kafkaData.headers.totalCars);
        const totalTrucks = Number(kafkaData.headers.totalTrucks);
        const totalBuses = Number(kafkaData.headers.totalBuses);
        const totalMotorbikes = Number(kafkaData.headers.totalMotorbikes);
        const totalVehiclesPollution = Number(kafkaData.headers.totalVehiclesPollution);
        const totalCarsPollution = Number(kafkaData.headers.totalCarsPollution);
        const totalTrucksPollution = Number(kafkaData.headers.totalTrucksPollution);
        const totalBusesPollution = Number(kafkaData.headers.totalBusesPollution);
        const totalMotorbikesPollution = Number(kafkaData.headers.totalMotorbikesPollution);

        return {
            imgName,
            url,
            cameraName,
            date: new Date(),
            vehiclesInfo: {
                totalVehicles,
                totalCars,
                totalTrucks,
                totalBuses,
                totalMotorbikes
            },
            pollutionInfo: {
                totalVehiclesPollution,
                totalCarsPollution,
                totalTrucksPollution,
                totalBusesPollution,
                totalMotorbikesPollution
            }
        };
    }

    private storeMongoDocument = async(mongoData: any) => {
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

        const doc = new Pollution(mongoData);

        await doc.save()
            .then(() => {
                console.log("Document stored")
            })
            .catch((err: any) => {
                console.log(err);
            });
    }
}

