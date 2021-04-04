import {Kafka} from "kafkajs";
import {storeInfoResponseInterface} from "./interfaces/Interfaces";
import {config} from "./config";
const mongoose = require('mongoose');
const Pollution = require('./services/Mongo');

export class infoStore {
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
                console.log('info', {
                    msg: `Kafka: A consumer has been subscribed to topic ${this.kafkaPollutionTopic}`,
                    topic: this.kafkaPollutionTopic,
                    res
                });
            })
            .catch(err => {
                console.log('error', {msg: `Kafka: Error subscribing to topic ${this.kafkaPollutionTopic}`, err});
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
        const totalVehiclesPM2_5 = Number(kafkaData.headers.totalVehiclesPM2_5);
        const totalCarsPM2_5 = Number(kafkaData.headers.totalCarsPM2_5);
        const totalTrucksPM2_5 = Number(kafkaData.headers.totalTrucksPM2_5);
        const totalBusesPM2_5 = Number(kafkaData.headers.totalBusesPM2_5);
        const totalMotorbikesPM2_5 = Number(kafkaData.headers.totalMotorbikesPM2_5);
        const totalVehiclesPM10 = Number(kafkaData.headers.totalVehiclesPM10);
        const totalCarsPM10 = Number(kafkaData.headers.totalCarsPM10);
        const totalTrucksPM10 = Number(kafkaData.headers.totalTrucksPM10);
        const totalBusesPM10 = Number(kafkaData.headers.totalBusesPM10);
        const totalMotorbikesPM10 = Number(kafkaData.headers.totalMotorbikesPM10);

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
            },
            pm2_5Info: {
                totalVehiclesPM2_5,
                totalCarsPM2_5,
                totalTrucksPM2_5,
                totalBusesPM2_5,
                totalMotorbikesPM2_5
            },
            pm10Info: {
                totalVehiclesPM10,
                totalCarsPM10,
                totalTrucksPM10,
                totalBusesPM10,
                totalMotorbikesPM10
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

