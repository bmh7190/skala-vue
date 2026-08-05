import { computed, unref } from 'vue'

import { useWeatherUnitStore } from '@/stores/dashboard/weatherUnitStore'

export const useDashboardTemperature = (temperature) => {
  const weatherUnitStore = useWeatherUnitStore()

  const displayTemp = computed(() => {
    const rawTemperature = unref(temperature)

    return weatherUnitStore.unit === 'fahrenheit'
      ? Math.round((rawTemperature * 9) / 5 + 32)
      : rawTemperature
  })

  const displayUnit = computed(() => weatherUnitStore.unitSymbol)

  return {
    displayTemp,
    displayUnit,
  }
}
