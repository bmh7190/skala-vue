import { computed, unref } from 'vue'
import { useConfigStore } from '@/stores/configStore'

export function useTemperature(temperature) {
  const configStore = useConfigStore()

  const displayTemp = computed(() => {
    const rawTemp = unref(temperature)

    if (configStore.unit === 'fahrenheit') {
      return Math.round((rawTemp * 9) / 5 + 32)
    }

    return rawTemp
  })

  const displayUnit = computed(() => {
    return configStore.unit === 'fahrenheit' ? '℉' : '℃'
  })

  return {
    displayTemp,
    displayUnit,
  }
}
