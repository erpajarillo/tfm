<template>
  <div class="container">
    <div class="container">
      <img alt="Vue logo" src="../assets/cameras.png" width="1000">
    </div>

    <div class="container">
      <p>Vehicles Detected:</p>
      <p>Total: {{ pollutionGroupedData.totalVehicles }}</p>
      <p>Cars: {{ pollutionGroupedData.totalCars }}</p>
      <p>Trucks: {{ pollutionGroupedData.totalTrucks }}</p>
      <p>Buses: {{ pollutionGroupedData.totalBuses }}</p>
      <p>Motorbikes: {{ pollutionGroupedData.totalMotorbikes }}</p>

      <p>CO2 (kg/km) calculated:</p>
      <p>Total: {{ pollutionGroupedData.totalVehiclesPollution / 1000 }}</p>
      <p>Cars: {{ pollutionGroupedData.totalCarsPollution / 1000 }}</p>
      <p>Trucks: {{ pollutionGroupedData.totalTrucksPollution / 1000 }}</p>
      <p>Buses: {{ pollutionGroupedData.totalBusesPollution / 1000 }}</p>
      <p>Motorbikes: {{ pollutionGroupedData.totalMotorbikesPollution / 1000 }}</p>
    </div>

    <div class="container">
      <bar-chart :pollutionData="pollutionTodayData" charType="totalVehicles"></bar-chart>
      <bar-chart :pollutionData="pollutionTodayData" charType="totalCars"></bar-chart>
      <bar-chart :pollutionData="pollutionTodayData" charType="totalTrucks"></bar-chart>
      <bar-chart :pollutionData="pollutionTodayData" charType="totalBuses"></bar-chart>
      <bar-chart :pollutionData="pollutionTodayData" charType="totalMotorbikes"></bar-chart>
    </div>
  </div>

</template>

<script>
import axios from 'axios';
import BarChart from './BarChart';

export default {
  name: "PollutionAll",
  components: {
    BarChart
  },
  data() {
    return {
      pollutionTodayData: [],
      pollutionGroupedData: {}
    }
  },
  beforeMount() {
    this.getTodayData();
    this.getTotalGroupedData();
  },
  methods: {
    async getTodayData() {
      const data = await axios.get('http://127.0.0.1:3000/today/cameras', {});
      this.pollutionTodayData = data.data;
    },
    async getTotalGroupedData() {
      const data = await axios.get('http://127.0.0.1:3000/all/grouped', {});
      this.pollutionGroupedData = data.data[0];
    }
  }
}
</script>

<style scoped>

</style>