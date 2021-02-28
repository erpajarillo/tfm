<template>
  <div class="small">
    <h3>{{this.charType}} & CO2 Pollution</h3>
    <bar-chart :chart-data="buildBarData"></bar-chart>
  </div>
</template>

<script>
import BarChart from '../BarChart';

export default {
  components: {
    BarChart
  },
  props: ['pollutionData', 'charType'],
  data () {
    return {
      barData: {},
      labels: ["Cameras"],
      datasets: []
    }
  },
  computed: {
    buildBarData () {
      let dataset = {};
      let color = [];
      this.pollutionData.forEach((item) => {
        color = [this.getRandomInt(255), this.getRandomInt(255), this.getRandomInt(255)]
        color = `rgba(${color[0]},${color[1]},${color[2]},0.7)`;

        dataset = {
          label: `Camera ${item._id}`,
          backgroundColor: color,
          data: [item[this.charType]]
        }
        this.datasets.push(dataset);

        dataset = {
          label: `Camera ${item._id} CO2 (kg/Km)`,
          backgroundColor: color,
          data: [Math.round(item[`${this.charType}Pollution`]/1000)]
        }
        this.datasets.push(dataset);
      });

      return {
        labels: this.labels,
        datasets: this.datasets
      };
    }
  },
  methods: {
    getRandomInt(max) {
      return Math.floor(Math.random() * Math.floor(max));
    }
  }
}
</script>

<style scoped>
.small {
  max-width: 600px;
  margin:  150px auto;
}
</style>