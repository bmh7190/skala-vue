<script setup>
import VueApexCharts from 'vue3-apexcharts'
import { computed } from 'vue'

import { useConfigStore } from '@/stores/configStore'

const props = defineProps({
  forecastList: {
    type: Array,
    required: true,
  },
  height: {
    type: [Number, String],
    default: 320,
  },
})

const configStore = useConfigStore()

const convertTemperature = (temperature) => {
  return configStore.unit === 'fahrenheit'
    ? Math.round((temperature * 9) / 5 + 32)
    : temperature
}

const formatForecastTime = (timestamp) => {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'UTC',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

const chartSeries = computed(() => [
  {
    name: '기온',
    data: props.forecastList.map((item) => convertTemperature(item.temp)),
  },
  {
    name: '체감온도',
    data: props.forecastList.map((item) => convertTemperature(item.feelsLike)),
  },
])

const chartOptions = computed(() => ({
  chart: {
    id: 'weather-forecast-chart',
    type: 'area',
    background: 'transparent',
    toolbar: {
      show: false,
    },
    animations: {
      enabled: true,
      speed: 450,
    },
  },
  colors: ['#38bdf8', '#f59e0b'],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth',
    width: [3, 2],
    dashArray: [0, 5],
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 0.2,
      opacityFrom: 0.3,
      opacityTo: 0.02,
      stops: [0, 90, 100],
    },
  },
  grid: {
    borderColor: 'rgba(148, 163, 184, 0.14)',
    strokeDashArray: 4,
  },
  legend: {
    position: 'top',
    horizontalAlign: 'right',
    labels: {
      colors: '#cbd5e1',
    },
  },
  markers: {
    size: 3,
    strokeWidth: 0,
    hover: {
      size: 6,
    },
  },
  tooltip: {
    shared: true,
    theme: 'dark',
    y: {
      formatter: (value) => `${value}${configStore.unitSymbol}`,
    },
  },
  xaxis: {
    categories: props.forecastList.map((item) => formatForecastTime(item.localTimestamp)),
    axisBorder: {
      color: 'rgba(148, 163, 184, 0.2)',
    },
    axisTicks: {
      color: 'rgba(148, 163, 184, 0.2)',
    },
    labels: {
      rotate: 0,
      style: {
        colors: '#94a3b8',
        fontSize: '11px',
      },
    },
  },
  yaxis: {
    tickAmount: 4,
    labels: {
      formatter: (value) => `${Math.round(value)}${configStore.unitSymbol}`,
      style: {
        colors: '#94a3b8',
      },
    },
  },
}))
</script>

<template>
  <section class="forecast-chart-card" aria-labelledby="forecast-chart-title">
    <header class="forecast-chart-heading">
      <h3 id="forecast-chart-title">24시간 기온 변화</h3>
      <p>3시간 간격 예보</p>
    </header>

    <VueApexCharts
      type="area"
      :height="height"
      :options="chartOptions"
      :series="chartSeries"
    />
  </section>
</template>

<style scoped>
.forecast-chart-card {
  padding: 20px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 18px;
  background: linear-gradient(155deg, rgba(20, 35, 58, 0.94), rgba(12, 23, 40, 0.96));
}

.forecast-chart-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
}

.forecast-chart-heading h3 {
  margin: 0;
  color: #f8fafc;
  font-size: 18px;
}

.forecast-chart-heading p {
  margin: 5px 0 0;
  color: #8291a8;
  font-size: 12px;
}

@media (max-width: 600px) {
  .forecast-chart-card {
    padding: 14px;
  }

  .forecast-chart-heading p {
    display: none;
  }
}
</style>
