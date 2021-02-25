import axios from 'axios';
import {Logger} from './services/LoggerService';
import {SentryService} from "./services/SentryService";
import {AWSService} from "./services/AWSService";
import {KafkaService} from "./services/KafkaService";
import {calculatePollutionResponseInterface} from "./interfaces/Interfaces";
import {config} from "./config";

export class pollutionCalculator {
    private log;
    private aws;
    private sentry;
    private kafka;
    private readonly CO2Vehicles;
    private readonly CO2Cars;
    private readonly CO2Trucks;
    private readonly CO2Buses;
    private readonly CO2Motorbikes;

    constructor() {
        this.log = new Logger();
        this.sentry = new SentryService();
        this.aws = new AWSService();
        this.kafka = new KafkaService();
        this.CO2Vehicles = 118;
        this.CO2Cars = 100;
        this.CO2Trucks = 161;
        this.CO2Buses = 75;
        this.CO2Motorbikes = 107;
    }

    calculate = async () : Promise<calculatePollutionResponseInterface> => {
        const kafkaData = <any>{};
        const totalVehiclesPollution = Number(kafkaData.totalVehicles) * this.CO2Vehicles;
        const totalCarsPollution = Number(kafkaData.totalCars) * this.CO2Cars;
        const totalTrucksPollution = Number(kafkaData.totalTrucks) * this.CO2Trucks;
        const totalBusesPollution = Number(kafkaData.totalBuses) * this.CO2Buses;
        const totalMotorbikesPollution = Number(kafkaData.totalMotorbikes) * this.CO2Motorbikes;

        // Add totalVehiclesPollution
        const contaminationData = {
            totalVehiclesPollution: totalVehiclesPollution.toString(),
            totalCarsPollution: totalCarsPollution.toString(),
            totalTrucksPollution: totalTrucksPollution.toString(),
            totalBusesPollution: totalBusesPollution.toString(),
            totalMotorbikesPollution: totalMotorbikesPollution.toString()
        }

        const kafkaDataResponse = { ...kafkaData, ...contaminationData };

        await this.kafka.produce(config.KafkaPollutionTopic ??= 'pollution', 'pollution', kafkaDataResponse);


        return {status: true, msg: 'OK'};
    }
}

