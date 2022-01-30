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
import { format } from 'date-fns'

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
            autoScaleYaxis: true
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
          type: 'datetime'
        },
        tooltip: {
          x: {
            format: 'dd/MM/yyyy HH:mm:ss'
          }
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
        name: 'Phase 3 (A)',
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
    }, 15000)
  },
  methods: {
    async getLinkyInfo() {
      const response = await fetch('http://localhost:3001/linky')
      return await response.json()
    },
    async getTeleinfo() {
      const response = await fetch('http://localhost:3001/teleinfo?sort=createdAt&order=-1&limit=10000')
      let result = await response.json()
      
      let previous03
      let data = [], labels = []

      // Keep only different values
      for(let i in result) {
        let obj = result[i]
        if(obj.instantaneousIntensity03.value !== previous03) {
          if(result[i - 1]) {
            data.push(result[i - 1].instantaneousIntensity03.value)
            labels.push(format(new Date(result[i - 1].createdAt), 'MM/dd/yyyy HH:mm:ss'))
          }          
          data.push(obj.instantaneousIntensity03.value)
          labels.push(format(new Date(obj.createdAt), 'MM/dd/yyyy HH:mm:ss'))
        }
        previous03 = obj.instantaneousIntensity03.value
      }

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
