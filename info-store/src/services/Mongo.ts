import {config} from "../config";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dataSchema = new Schema({
    imgName: String,
    url: String,
    cameraName: String,
    date: Date,
    vehiclesInfo: {
        totalVehicles: Number,
        totalCars: Number,
        totalTrucks: Number,
        totalBuses: Number,
        totalMotorbikes: Number,
    },
    pollutionInfo: {
        totalVehiclesPollution: Number,
        totalCarsPollution: Number,
        totalTrucksPollution: Number,
        totalBusesPollution: Number,
        totalMotorbikesPollution: Number,
    },
    pm2_5Info: {
        totalVehiclesPM2_5: Number,
        totalCarsPM2_5: Number,
        totalTrucksPM2_5: Number,
        totalBusesPM2_5: Number,
        totalMotorbikesPM2_5: Number
    },
    pm10Info: {
        totalVehiclesPM10: Number,
        totalCarsPM10: Number,
        totalTrucksPM10: Number,
        totalBusesPM10: Number,
        totalMotorbikesPM10: Number
    }
});

dataSchema.index({ cameraName: 1, date: -1 });

module.exports = mongoose.model(config.DBCollectionMongo ??= 'pollutions', dataSchema);