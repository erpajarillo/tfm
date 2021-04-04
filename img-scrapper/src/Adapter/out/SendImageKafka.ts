import { Kafka } from "kafkajs";
import { config } from "../../config";
import { SendImageEventsPort } from "../../Application/port/out/SendImageEventsPort";

export class SendImageKafka implements SendImageEventsPort {

  private kafka;
  private readonly topic;

  constructor() {
    this.kafka = new Kafka({
      clientId: `${config.KafkaClient}`,
      brokers: [`${config.KafkaBroker}`],
    });
    this.topic = "images";
  }

  sendImageEvent = async(value: string, headers: any): Promise<any> => {
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
}