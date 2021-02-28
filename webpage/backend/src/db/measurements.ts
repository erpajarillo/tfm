const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const db = require('./connection');

export class Measurements {

    private readonly dataSchema;

    constructor() {
        this.dataSchema = new Schema({
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

        this.dataSchema.index({ cameraName: 1, date: -1 });
    }


    findAll = async () => {
        const model = mongoose.model('pollutions', this.dataSchema);
        return await model.find({});
    }

    findToday = async () => {
        const dateToday = this.buildTodayDate();

        const model = mongoose.model('pollutions', this.dataSchema);
        return await model.find({"date" : { "$gte" : dateToday}});
    }

    findAllPerCamera = async () => {
        const model = mongoose.model('pollutions', this.dataSchema);
        return await model.aggregate([
            this.getGroupByCamera()
        ]);
    }

    findAllPerCameraGrouped = async () => {
        const model = mongoose.model('pollutions', this.dataSchema);
        return await model.aggregate([
            this.getGroupTotal()
        ]);
    }

    findTodayPerCamera = async () => {
        const dateToday = this.buildTodayDate();

        const model = mongoose.model('pollutions', this.dataSchema);
        return await model.aggregate([
            {
                $match: {
                    "date": {"$gte": dateToday}
                },
            },
            this.getGroupByCamera(),
            {
                $sort: {
                    "_id": 1
                }
            }
        ]);
    }

    private buildTodayDate = () => {
        const date = new Date();
        const month = date.getMonth();
        const year = date.getFullYear();
        const day = date.getDate();

        return new Date(year, month, day, 0, 0, 0);
    }

    private getGroupByCamera = () => {
        return {
            $group: {
                _id: "$cameraName",
                    url: {
                    $first: "$url"
                },
                totalVehicles: {
                    $sum: "$vehiclesInfo.totalVehicles"
                },
                totalCars: {
                    $sum: "$vehiclesInfo.totalCars"
                },
                totalTrucks: {
                    $sum: "$vehiclesInfo.totalTrucks"
                },
                totalBuses: {
                    $sum: "$vehiclesInfo.totalBuses"
                },
                totalMotorbikes: {
                    $sum: "$vehiclesInfo.totalMotorbikes"
                },
                totalVehiclesPollution: {
                    $sum: "$pollutionInfo.totalVehiclesPollution"
                },
                totalCarsPollution: {
                    $sum: "$pollutionInfo.totalCarsPollution"
                },
                totalTrucksPollution: {
                    $sum: "$pollutionInfo.totalTrucksPollution"
                },
                totalBusesPollution: {
                    $sum: "$pollutionInfo.totalBusesPollution"
                },
                totalMotorbikesPollution: {
                    $sum: "$pollutionInfo.totalMotorbikesPollution"
                },
            }
        }
    }

    private getGroupTotal = () => {
        return {
            $group: {
                _id: "total",
                totalVehicles: {
                    $sum: "$vehiclesInfo.totalVehicles"
                },
                totalCars: {
                    $sum: "$vehiclesInfo.totalCars"
                },
                totalTrucks: {
                    $sum: "$vehiclesInfo.totalTrucks"
                },
                totalBuses: {
                    $sum: "$vehiclesInfo.totalBuses"
                },
                totalMotorbikes: {
                    $sum: "$vehiclesInfo.totalMotorbikes"
                },
                totalVehiclesPollution: {
                    $sum: "$pollutionInfo.totalVehiclesPollution"
                },
                totalCarsPollution: {
                    $sum: "$pollutionInfo.totalCarsPollution"
                },
                totalTrucksPollution: {
                    $sum: "$pollutionInfo.totalTrucksPollution"
                },
                totalBusesPollution: {
                    $sum: "$pollutionInfo.totalBusesPollution"
                },
                totalMotorbikesPollution: {
                    $sum: "$pollutionInfo.totalMotorbikesPollution"
                },
            }
        }
    }
}