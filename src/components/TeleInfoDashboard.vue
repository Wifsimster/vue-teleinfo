<template>  
  <div v-if="linky">
    <div class="text-3xl font-bold">Linky <span class="text-base">{{ linky.serialNumber }}</span></div>
    <div><span class="font-semibold">Index</span> {{ linky.index.value }}{{ linky.index.unit }}</div>
  </div>

  <div class="shadow-lg rounded-lg overflow-hidden">
    <apexchart type="area" height="350" :options="options" :series="series" />
  </div>
</template>

<script>
import { subMinutes, format } from 'date-fns'

export default {
  data() {
    return {
      linky: null,
      options: {    
        chart: {
          id: 'area',
          type: 'area',
          height: 350,
          zoom: {
            enabled: false
          }
        },
        xaxis: {
          categories: []
        },
        stroke: {
          curve: 'straight'
        },
        dataLabels: {
          enabled: false
        },
        markers: {
          size: 0,
          style: 'hollow',
        },
        labels: [],
        xaxis: {
          type: 'datetime',
        },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.9,
            stops: [0, 100]
          }
        },
      },
      series: [{
        name: 'Teleinfo',
        data: [],
      }]
    }
  },
  async mounted() {
    this.linky = await this.getLinkyInfo()
    setInterval(async () => {
      this.linky = await this.getLinkyInfo()
    }, 30000)

    await this.refreshChart()
    setInterval(async () => {
      await this.refreshChart()
    }, 10000)
  },
  methods: {
    async getLinkyInfo() {
      const response = await fetch('http://localhost:3001/linky')
      return await response.json()
    },
    async getTeleinfo() {
      const response = await fetch('http://localhost:3001/teleinfo?sort=createdAt&order=1&limit=6000')
      let result = await response.json()
      result = result.filter((i) => new Date(i.createdAt).getTime() >= subMinutes(new Date(), 10).getTime())
      
      const labels = result.map((i) => format(new Date(i.createdAt), 'MM/dd/yyyy HH:mm:ss'))
      const data = result.map((i) => i.instantaneousIntensity03.value * 230)

      return { labels, data }
    },
    async refreshChart() {
      let result = await this.getTeleinfo()
      this.options = { labels: result.labels }
      this.series = [{ data: result.data }]
    }
  }
}
</script>
