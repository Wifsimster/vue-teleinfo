<template>  
  <div v-if="linky">
    <div class="text-3xl font-bold">Linky <span class="text-base">{{ linky.serialNumber }}</span></div>
    <div class="flex gap-4 justify-center">
      <div><span class="font-semibold">Index</span> {{ linky.index.value }}{{ linky.index.unit }}</div>
      <div><span class="font-semibold">Intensité souscrite</span> {{ linky.subscribedIntensity.value }}{{ linky.subscribedIntensity.unit }}</div>
      <div><span class="font-semibold">Puissance max</span> {{ linky.maximumPower.value }}{{ linky.maximumPower.unit }}</div>
      <div>
        <span class="font-semibold">Nb données</span> 
        <select v-model="limit">
          <option v-for="option in limits" :value="option">{{ option }}</option>
        </select>
      </div>
    </div>      
  </div>

  <div class="shadow-lg rounded-lg overflow-hidden">
    <apexchart type="area" height="350" :options="options" :series="series" />
  </div>
</template>

<script>
import config from '../../config'
import { format } from 'date-fns'
import fr from "apexcharts/dist/locales/fr.json"

export default {
  data() {
    return {
      limits: [1000, 2000, 3000, 4000, 5000, 7500, 10000, 20000],
      limit: 2000,
      linky: null,
      options: {    
        chart: {
          id: 'area',
          type: 'area',
          height: 350,
          zoom: {
            autoScaleYaxis: true
          },
          locales: [fr],
          defaultLocale: 'fr',
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
          labels: {
            datetimeUTC: false
          }
        },
        tooltip: {
          x: {
            format: 'dd/MM/yyyy HH:mm:ss'
          }
        },
      },
      series: [{
        name: 'Puissance apparente (VA)',
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
    }, 30000)
  },
  watch: {
    limit() {
      this.refreshChart()
    }
  },
  methods: {
    async getLinkyInfo() {
      const response = await fetch(`http://${config.host}:${config.port}/linky`)
      return await response.json()
    },
    async getTeleinfo() {
      const response = await fetch(`http://${config.host}:${config.port}/teleinfo?sort=createdAt&order=-1&limit=${this.limit}`)
      let result = await response.json()
      
      let previous03
      let data = [], labels = []

      // Keep only different values
      for(let i in result) {
        let obj = result[i]
        if(obj.apparentPower.value !== previous03) {
          if(result[i - 1]) {
            data.push(result[i - 1].apparentPower.value)
            labels.push(format(new Date(result[i - 1].createdAt), 'MM/dd/yyyy HH:mm:ss'))
          }          
          data.push(obj.apparentPower.value)
          labels.push(format(new Date(obj.createdAt), 'MM/dd/yyyy HH:mm:ss'))
        }
        previous03 = obj.apparentPower.value
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
