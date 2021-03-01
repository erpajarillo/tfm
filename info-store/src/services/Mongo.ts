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
    }
});

dataSchema.index({ cameraName: 1, date: -1 });

module.exports = mongoose.model(config.DBCollectionMongo ??= 'pollutions', dataSchema);