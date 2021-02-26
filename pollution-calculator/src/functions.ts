import {Logger} from './services/LoggerService';
import {SentryService} from "./services/SentryService";
import {AWSService} from "./services/AWSService";
import {calculatePollutionResponseInterface} from "./interfaces/Interfaces";
import {config} from "./config";
import {Kafka} from "kafkajs";

export class pollutionCalculator {
    private log;
    private aws;
    private sentry;
    private kafka;
    private kafkaDetectionTopic;
    private kafkaPollutionTopic;
    private readonly CO2Vehicles;
    private readonly CO2Cars;
    private readonly CO2Trucks;
    private readonly CO2Buses;
    private readonly CO2Motorbikes;

    constructor() {
        this.kafka = new Kafka({
            clientId: `${config.KafkaClient}`,
            brokers: [`${config.KafkaBroker}`]
        });
        this.kafkaDetectionTopic = config.KafkaDetectionTopic;
        this.kafkaPollutionTopic = config.KafkaPollutionTopic;
        this.log = new Logger();
        this.sentry = new SentryService();
        this.aws = new AWSService();
        this.CO2Vehicles = 118;
        this.CO2Cars = 100;
        this.CO2Trucks = 161;
        this.CO2Buses = 75;
        this.CO2Motorbikes = 107;
    }

    calculate = async () : Promise<calculatePollutionResponseInterface> => {
        let kafkaData = <any>{};
        const consumer = this.kafka.consumer({ groupId: 'tfm-group' });
        await consumer.connect();

        await consumer.subscribe({ topic: this.kafkaDetectionTopic ??= 'detection', fromBeginning: true })
            .then((res) => {
                this.log.send('info', {msg: `Kafka: A consumer has been subscribed to topic ${this.kafkaDetectionTopic}`, topic: this.kafkaDetectionTopic, res});
            })
            .catch(err => {
                this.log.send('error', {msg: `Kafka: Error subscribing to topic ${this.kafkaDetectionTopic}`, err});
                this.sentry.captureException(err);
            });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                kafkaData = {value: message.value, headers: message.headers};

                const contaminationData = this.calculateCO2(kafkaData);
                const kafkaHeaderResponse = { ...kafkaData.headers, ...contaminationData };

                // await this.kafka.produce(config.KafkaPollutionTopic ??= 'pollution', 'pollution', kafkaHeaderResponse);

            }
        });

        return {status: true, msg: 'OK'};
    }

    private calculateCO2 = (kafkaData: any) => {
        const totalVehiclesPollution = Number(kafkaData.value) * this.CO2Vehicles;
        const totalCarsPollution = Number(kafkaData.headers.totalCars) * this.CO2Cars;
        const totalTrucksPollution = Number(kafkaData.headers.totalTrucks) * this.CO2Trucks;
        const totalBusesPollution = Number(kafkaData.headers.totalBuses) * this.CO2Buses;
        const totalMotorbikesPollution = Number(kafkaData.headers.otalMotorbikes) * this.CO2Motorbikes;

        return {
            totalVehiclesPollution: totalVehiclesPollution.toString(),
            totalCarsPollution: totalCarsPollution.toString(),
            totalTrucksPollution: totalTrucksPollution.toString(),
            totalBusesPollution: totalBusesPollution.toString(),
            totalMotorbikesPollution: totalMotorbikesPollution.toString()
        };
    }

    private kafkaProducer = async (value: string, headers: {}) => {
        try {
            const producer = this.kafka.producer();
            await producer.connect();

            await producer.send({ topic: this.kafkaPollutionTopic ??= 'pollution', messages: [{value, headers}]})
                .then((response) => {
                    this.log.send('info', {msg: 'Kafka: Event sent to Kafka', value, headers, response});
                });

            await producer.disconnect();
        } catch (err) {
            this.log.send('error', {msg: 'Kafka: Error sending event to Kafka', value, headers, err});
            this.sentry.captureException(err);
        }
    }
}

