import {Kafka} from "kafkajs";
import {config} from "../config";
import {SentryService} from './SentryService';
import {Logger} from './LoggerService';
import {EventServiceInterface} from "../interfaces/Interfaces";
import {pollutionCalculator} from "../functions";

interface responseKafkaInterface {
    value: any,
    headers: any
}

export class KafkaService implements EventServiceInterface {

    private kafka;
    private log;
    private sentry;
    private pollCalc;

    constructor() {
        this.kafka = new Kafka({
            clientId: `${config.KafkaClient}`,
            brokers: [`${config.KafkaBroker}`]
        });
        this.log = new Logger();
        this.sentry = new SentryService();
        this.pollCalc = new pollutionCalculator();
    }

    produce = async (topic: string, value: string, headers: {}) => {
        try {
            const producer = this.kafka.producer();
            await producer.connect();

            await producer.send({ topic, messages: [{value, headers}]})
                .then((response) => {
                    this.log.send('info', {msg: 'Kafka: Event sent to Kafka', value, headers, response});
                });

            await producer.disconnect();
        } catch (err) {
            this.log.send('error', {msg: 'Kafka: Error sending event to Kafka', value, headers, err});
            this.sentry.captureException(err);
        }
    }

    consume = async(topic: string) => {
        let response: responseKafkaInterface;
        const consumer = this.kafka.consumer({ groupId: 'tfm-group' });
        await consumer.connect();

        await consumer.subscribe({ topic, fromBeginning: true })
            .then((res) => {
                this.log.send('info', {msg: `Kafka: A consumer has been subscribed to topic ${topic}`, topic, res});
            })
            .catch(err => {
                this.log.send('error', {msg: `Kafka: Error subscribing to topic ${topic}`, err});
                this.sentry.captureException(err);
            });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                console.log(message);
                response = {
                    value: message.toString(),
                    headers: message.headers
                }
                // await this.pollCalc.calculate(message);
            }
        });
    }
}