import {calculatePollutionResponseInterface} from "./interfaces/Interfaces";
import {config} from "./config";
import {Kafka} from "kafkajs";

export class pollutionCalculator {
    private kafka;
    private readonly kafkaDetectionTopic;
    private readonly kafkaPollutionTopic;
    private readonly kafkaGroup;
    private readonly CO2Vehicles;
    private readonly CO2Cars;
    private readonly CO2Trucks;
    private readonly CO2Buses;
    private readonly CO2Motorbikes;

    private readonly PM2_5Vehicles;
    private readonly PM10Vehicles;

    constructor() {
        this.kafka = new Kafka({
            clientId: `${config.KafkaClient}`,
            brokers: [`${config.KafkaBroker}`]
        });
        this.kafkaDetectionTopic = config.KafkaDetectionTopic ??= 'detections';
        this.kafkaPollutionTopic = config.KafkaPollutionTopic ??= 'pollution';
        this.kafkaGroup = 'detections-group';
        this.CO2Vehicles = 118;
        this.CO2Cars = 100;
        this.CO2Trucks = 161;
        this.CO2Buses = 75;
        this.CO2Motorbikes = 107;

        /** https://www.adeq.state.ar.us/air/planning/ozone/cars.aspx */
        this.PM2_5Vehicles = 0.0041;
        this.PM10Vehicles = 0.0044;
    }

    calculate = async (): Promise<calculatePollutionResponseInterface> => {
        let kafkaData = <any>{};
        const consumer = await this.kafkaConsumer();

        await consumer.run({
            eachMessage: async ({topic, partition, message}) => {
                kafkaData = {value: message.value, headers: message.headers};

                const CO2Data = this.calculateCO2(kafkaData);
                const PM2_5Data = this.calculatePM2_5(kafkaData);
                const PM10Data = this.calculatePM10(kafkaData);
                const kafkaHeaderResponse = {...kafkaData.headers, ...CO2Data, ...PM2_5Data, ...PM10Data};

                await this.kafkaProducer('pollution', kafkaHeaderResponse);
                console.log(kafkaHeaderResponse);
            }
        });

        return {status: true, msg: 'OK'};
    }

    private calculateCO2 = (kafkaData: any) => {
        const totalVehiclesPollution = Number(kafkaData.headers.totalVehicles) * this.CO2Vehicles;
        const totalCarsPollution = Number(kafkaData.headers.totalCars) * this.CO2Cars;
        const totalTrucksPollution = Number(kafkaData.headers.totalTrucks) * this.CO2Trucks;
        const totalBusesPollution = Number(kafkaData.headers.totalBuses) * this.CO2Buses;
        const totalMotorbikesPollution = Number(kafkaData.headers.totalMotorbikes) * this.CO2Motorbikes;

        return {
            totalVehiclesPollution: totalVehiclesPollution.toString(),
            totalCarsPollution: totalCarsPollution.toString(),
            totalTrucksPollution: totalTrucksPollution.toString(),
            totalBusesPollution: totalBusesPollution.toString(),
            totalMotorbikesPollution: totalMotorbikesPollution.toString()
        };
    }

    private calculatePM2_5 = (kafkaData: any) => {
        const totalVehiclesPM2_5 = Number(kafkaData.headers.totalVehicles) * this.PM2_5Vehicles;
        const totalCarsPM2_5 = Number(kafkaData.headers.totalCars) * this.PM2_5Vehicles;
        const totalTrucksPM2_5 = Number(kafkaData.headers.totalTrucks) * this.PM2_5Vehicles;
        const totalBusesPM2_5 = Number(kafkaData.headers.totalBuses) * this.PM2_5Vehicles;
        const totalMotorbikesPM2_5 = Number(kafkaData.headers.totalMotorbikes) * this.PM2_5Vehicles;

        return {
            totalVehiclesPM2_5: totalVehiclesPM2_5.toString(),
            totalCarsPM2_5: totalCarsPM2_5.toString(),
            totalTrucksPM2_5: totalTrucksPM2_5.toString(),
            totalBusesPM2_5: totalBusesPM2_5.toString(),
            totalMotorbikesPM2_5: totalMotorbikesPM2_5.toString()
        };
    }

    private calculatePM10 = (kafkaData: any) => {
        const totalVehiclesPM10 = Number(kafkaData.headers.totalVehicles) * this.PM10Vehicles;
        const totalCarsPM10 = Number(kafkaData.headers.totalCars) * this.PM10Vehicles;
        const totalTrucksPM10 = Number(kafkaData.headers.totalTrucks) * this.PM10Vehicles;
        const totalBusesPM10 = Number(kafkaData.headers.totalBuses) * this.PM10Vehicles;
        const totalMotorbikesPM10 = Number(kafkaData.headers.totalMotorbikes) * this.PM10Vehicles;

        return {
            totalVehiclesPM10: totalVehiclesPM10.toString(),
            totalCarsPM10: totalCarsPM10.toString(),
            totalTrucksPM10: totalTrucksPM10.toString(),
            totalBusesPM10: totalBusesPM10.toString(),
            totalMotorbikesPM10: totalMotorbikesPM10.toString()
        };
    }

    private kafkaConsumer = async () => {
        const consumer = this.kafka.consumer({groupId: this.kafkaGroup});
        await consumer.connect();

        await consumer.subscribe({topic: this.kafkaDetectionTopic, fromBeginning: true})
            .then((res) => {
                console.log('info', {
                    msg: `Kafka: A consumer has been subscribed to topic ${this.kafkaDetectionTopic}`,
                    topic: this.kafkaDetectionTopic,
                    res
                });
            })
            .catch(err => {
                console.log('error', {msg: `Kafka: Error subscribing to topic ${this.kafkaDetectionTopic}`, err});
            });

        return consumer;
    }

    private kafkaProducer = async (value: string, headers: {}) => {
        try {
            const producer = this.kafka.producer();
            await producer.connect();

            await producer.send({topic: this.kafkaPollutionTopic, messages: [{value, headers}]})
                .then((response) => {
                    console.log('info', {msg: 'Kafka: Event sent to Kafka', value, headers, response});
                });

            await producer.disconnect();
        } catch (err) {
            console.log('error', {msg: 'Kafka: Error sending event to Kafka', value, headers, err});
        }
    }
}

