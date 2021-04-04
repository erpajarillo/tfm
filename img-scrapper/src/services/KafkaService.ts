import { Kafka } from "kafkajs";
import { config } from "../config";
import { EventServiceInterface } from "../interfaces/Interfaces";

export class KafkaService implements EventServiceInterface {
  private kafka;
  private readonly topic;

  constructor() {
    this.kafka = new Kafka({
      clientId: `${config.KafkaClient}`,
      brokers: [`${config.KafkaBroker}`],
    });
    this.topic = "images";
  }

  produce = async (value: string, headers: any) => {
    try {
      const producer = this.kafka.producer();
      await producer.connect();

      await producer
        .send({ topic: this.topic, messages: [{ value, headers }] })
        .then((response) => {
          console.log("info", {
            msg: "Kafka: Event sent to Kafka",
            value,
            headers,
            response,
          });
        });

      await producer.disconnect();
    } catch (err) {
      console.log("error", {
        msg: "Kafka: Error sending event to Kafka",
        value,
        headers,
        err,
      });
    }
  };

  consume = async () => {
    const response = <any>[];
    const consumer = this.kafka.consumer({ groupId: "tfm-group" });
    await consumer.connect();

    await consumer
      .subscribe({ topic: this.topic, fromBeginning: true })
      .then((res) => {
        console.log("info", {
          msg: `Kafka: A consumer has been subscribed to topic ${this.topic}`,
          topic: this.topic,
          res,
        });
      })
      .catch((err) => {
        console.log("error", {
          msg: `Kafka: Error subscribing to topic ${this.topic}`,
          err,
        });
      });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        response.push([{ value: message.value, headers: message.headers }]);
      },
    });

    return response;
  };
}
