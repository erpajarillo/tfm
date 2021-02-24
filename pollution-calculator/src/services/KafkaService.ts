import {Kafka} from "kafkajs";
import {config} from "../config";
import {SentryService} from './SentryService';
import {Logger} from './LoggerService';
import {EventServiceInterface} from "../interfaces/Interfaces";

export class KafkaService implements EventServiceInterface {

    private kafka;
    private log;
    private sentry;

    constructor() {
        this.kafka = new Kafka({
            clientId: `${config.KafkaClient}`,
            brokers: [`${config.KafkaBroker}`]
        });
        this.log = new Logger();
        this.sentry = new SentryService();
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
        const response = <any>[];
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
                response.push([{value: message.value, headers: message.headers}]);
            }
        });

        return response;
    }
}