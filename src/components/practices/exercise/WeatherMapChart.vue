<script setup>
import { LngLatBounds, Map, NavigationControl, Popup } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { feature as toGeoJSON } from 'topojson-client'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import greatBritainMap from 'apexmaps-geo/gb-admin1-10m.json'
import koreaMap from 'apexmaps-geo/kr-admin1-10m.json'
import unitedStatesMap from 'apexmaps-geo/us-states-10m.json'
import japanMap from 'apexmaps-geo/jp-admin1-10m.json'
import franceMap from 'apexmaps-geo/fr-admin1-10m.json'
import australiaMap from 'apexmaps-geo/au-admin1-10m.json'
import worldMap from 'apexmaps-geo/world-countries-110m.json'

import { useConfigStore } from '@/stores/configStore'

const props = defineProps({
  weatherList: {
    type: Array,
    required: true,
  },

  selectedCityId: {
    type: [String, Number],
    default: null,
  },

  selectedCountryCode: {
    type: String,
    default: '',
  },

  selectedCountryName: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['select-city', 'select-country'])
const configStore = useConfigStore()
const mapContainer = ref(null)

const SOURCE_ID = 'weather-areas'
const FILL_LAYER_ID = 'weather-areas-fill'
const BORDER_LAYER_ID = 'weather-areas-border'
const SELECTED_LAYER_ID = 'weather-area-selected'
const POINT_SOURCE_ID = 'weather-points'
const POINT_LAYER_ID = 'weather-points-circle'
const SELECTED_POINT_LAYER_ID = 'weather-point-selected'
const WORLD_CENTER = [127.5, 18]
const WORLD_TILE_SIZE = 512

const createMapConfig = (topology, object, keyField, nameField, bounds = null) => ({
  geoJSON: toGeoJSON(topology, topology.objects[object]),
  keyField,
  nameField,
  bounds,
})

// 지도 엔진과 경계 데이터를 분리해 국가 전환 시 MapLibre 인스턴스는 그대로 유지
const mapRegistry = {
  world: createMapConfig(worldMap, 'countries', 'iso_a3', 'name'),
  KOR: createMapConfig(koreaMap, 'admin1', 'iso_3166_2', 'name_local'),
  GBR: createMapConfig(greatBritainMap, 'admin1', 'iso_3166_2', 'name'),
  USA: createMapConfig(unitedStatesMap, 'states', 'abbr', 'name', [
    [-125, 24],
    [-66, 50],
  ]),
  JPN: createMapConfig(japanMap, 'admin1', 'iso_3166_2', 'name_local', [
    [128, 30],
    [146, 46],
  ]),
  FRA: createMapConfig(franceMap, 'admin1', 'iso_3166_2', 'name', [
    [-5, 41],
    [10, 52],
  ]),
  AUS: createMapConfig(australiaMap, 'admin1', 'iso_3166_2', 'name', [
    [112, -44],
    [154, -10],
  ]),
}

let map = null
let popup = null
let resizeObserver = null
let initialBounds = null
let resizeFrame = null
let countryTransitionTimer = null
let isCountryTransitioning = false

const activeMap = computed(() => mapRegistry[props.selectedCountryCode] ?? mapRegistry.world)
const mapTitle = computed(() =>
  props.selectedCountryName ? `${props.selectedCountryName} 지역 날씨 지도` : '전 세계 날씨 지도',
)
const mapDescription = computed(() =>
  props.selectedCountryCode
    ? '색칠된 지역을 선택해 상세 날씨 확인'
    : '국가를 선택해 지역 날씨 확인',
)

const displayTemperature = (temperature) => {
  return configStore.unit === 'fahrenheit' ? Math.round((temperature * 9) / 5 + 32) : temperature
}

const findWeather = (mapKey) => props.weatherList.find((item) => item.mapKey === mapKey)

const createWeatherGeoJSON = () => {
  const { geoJSON, keyField, nameField } = activeMap.value

  return {
    type: 'FeatureCollection',
    features: geoJSON.features.map((item) => {
      const mapKey = item.properties[keyField]
      const weather = findWeather(mapKey)

      return {
        ...item,
        properties: {
          ...item.properties,
          mapKey,
          displayName: item.properties[nameField] ?? item.properties.name ?? mapKey,
          hasWeather: Boolean(weather),
          temperature: weather ? displayTemperature(weather.temp) : 0,
        },
      }
    }),
  }
}

const createWeatherPointGeoJSON = () => ({
  type: 'FeatureCollection',
  features: props.weatherList
    .filter((item) => !item.mapKey && Number.isFinite(item.lon) && Number.isFinite(item.lat))
    .map((item) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [item.lon, item.lat],
      },
      properties: {
        weatherId: String(item.id),
        displayName: item.name,
        temperature: displayTemperature(item.temp),
      },
    })),
})

const visitCoordinates = (coordinates, bounds) => {
  if (typeof coordinates[0] === 'number') {
    bounds.extend(coordinates)
    return
  }

  coordinates.forEach((coordinate) => visitCoordinates(coordinate, bounds))
}

const getGeoJSONBounds = (geoJSON) => {
  const bounds = new LngLatBounds()

  geoJSON.features.forEach((item) => visitCoordinates(item.geometry.coordinates, bounds))
  return bounds
}

const selectedMapKey = () => {
  return props.weatherList.find((item) => item.id === props.selectedCityId)?.mapKey ?? ''
}

const getResponsivePadding = (maximum) => {
  if (!map) return maximum

  const container = map.getContainer()
  const shortestSide = Math.min(container.clientWidth, container.clientHeight)

  return Math.min(maximum, Math.max(12, Math.floor(shortestSide * 0.12)))
}

// 왼쪽 카드 선택과 지도 테두리 강조 상태 동기화
const syncSelection = () => {
  if (!map?.getLayer(SELECTED_LAYER_ID)) return

  map.setFilter(SELECTED_LAYER_ID, ['==', ['get', 'mapKey'], selectedMapKey()])
  map.setFilter(SELECTED_POINT_LAYER_ID, [
    '==',
    ['get', 'weatherId'],
    props.selectedCityId == null ? '' : String(props.selectedCityId),
  ])
}

// 카드와 지도에서 선택한 지역을 동일한 경계로 확대
const focusSelectedWeather = (animate = true) => {
  if (!map || props.selectedCityId == null) return

  const selectedWeather = props.weatherList.find((item) => item.id === props.selectedCityId)

  if (!selectedWeather) return

  if (selectedWeather.mapKey) {
    const { geoJSON, keyField } = activeMap.value
    const selectedFeature = geoJSON.features.find(
      (item) => item.properties[keyField] === selectedWeather.mapKey,
    )

    if (selectedFeature) {
      const bounds = new LngLatBounds()
      visitCoordinates(selectedFeature.geometry.coordinates, bounds)
      map.fitBounds(bounds, {
        padding: getResponsivePadding(84),
        maxZoom: 7,
        duration: animate ? 650 : 0,
      })
      return
    }
  }

  if (Number.isFinite(selectedWeather.lon) && Number.isFinite(selectedWeather.lat)) {
    map.flyTo({
      center: [selectedWeather.lon, selectedWeather.lat],
      zoom: 7,
      duration: animate ? 650 : 0,
    })
  }
}

const fitCurrentMap = (animate = true) => {
  if (!map || !initialBounds || initialBounds.isEmpty()) return

  map.fitBounds(initialBounds, {
    padding: getResponsivePadding(props.selectedCountryCode ? 58 : 34),
    duration: animate ? 650 : 0,
  })
}

// 세계 지도 한 바퀴만 화면 너비에 맞추고 대한민국을 중앙 기준으로 배치
const focusWorldMap = (animate = true) => {
  if (!map) return

  const containerWidth = map.getContainer().clientWidth
  const worldZoom = Math.max(0, Math.log2(containerWidth / WORLD_TILE_SIZE) + 0.04)

  map.setMinZoom(worldZoom)
  map.easeTo({
    center: WORLD_CENTER,
    zoom: worldZoom,
    duration: animate ? 650 : 0,
  })
}

const finishCountryTransition = () => {
  countryTransitionTimer = null
  isCountryTransitioning = false
  updateMapData(false)
}

// 세계 국가 경계까지 먼저 이동한 뒤 지역 경계 데이터로 자연스럽게 전환
const transitionToCountryMap = (countryCode) => {
  if (!map) return

  const worldConfig = mapRegistry.world
  const countryFeature = worldConfig.geoJSON.features.find(
    (item) => item.properties[worldConfig.keyField] === countryCode,
  )

  if (!countryFeature) {
    updateMapData()
    return
  }

  const bounds = new LngLatBounds()
  visitCoordinates(countryFeature.geometry.coordinates, bounds)
  isCountryTransitioning = true
  map.setMinZoom(0)

  map.fitBounds(bounds, {
    padding: getResponsivePadding(72),
    maxZoom: 3.5,
    duration: 750,
  })
  countryTransitionTimer = window.setTimeout(finishCountryTransition, 780)
}

const focusCurrentData = (animate = true, pointGeoJSON = createWeatherPointGeoJSON()) => {
  if (!props.selectedCountryCode) {
    focusWorldMap(animate)
    return
  }

  map.setMinZoom(0)

  if (pointGeoJSON.features.length === 1) {
    map.flyTo({
      center: pointGeoJSON.features[0].geometry.coordinates,
      zoom: 4,
      duration: animate ? 650 : 0,
    })
    return
  }

  fitCurrentMap(animate)
}

class ResetViewControl {
  onAdd() {
    const group = document.createElement('div')
    const button = document.createElement('button')

    group.className = 'maplibregl-ctrl maplibregl-ctrl-group weather-reset-control'
    button.type = 'button'
    button.title = '지도 초기화'
    button.setAttribute('aria-label', '지도 초기화')
    button.textContent = '⌖'
    button.addEventListener('click', () => focusCurrentData())
    group.append(button)

    this.container = group
    return group
  }

  onRemove() {
    this.container?.remove()
  }
}

const addWeatherLayers = (geoJSON) => {
  map.addSource(SOURCE_ID, {
    type: 'geojson',
    data: geoJSON,
  })

  map.addLayer({
    id: FILL_LAYER_ID,
    type: 'fill',
    source: SOURCE_ID,
    paint: {
      'fill-color': [
        'case',
        ['get', 'hasWeather'],
        [
          'interpolate',
          ['linear'],
          ['get', 'temperature'],
          0,
          '#38bdf8',
          20,
          '#60a5fa',
          25,
          '#f59e0b',
          30,
          '#fb7185',
          40,
          '#ef4444',
        ],
        '#F2EDE6',
      ],
      'fill-opacity': ['case', ['get', 'hasWeather'], 0.88, 0.92],
    },
  })

  map.addLayer({
    id: BORDER_LAYER_ID,
    type: 'line',
    source: SOURCE_ID,
    paint: {
      'line-color': '#344868',
      'line-width': 0.8,
      'line-opacity': 0.9,
    },
  })

  map.addLayer({
    id: SELECTED_LAYER_ID,
    type: 'line',
    source: SOURCE_ID,
    filter: ['==', ['get', 'mapKey'], ''],
    paint: {
      'line-color': '#f8fafc',
      'line-width': 3,
    },
  })

  map.addSource(POINT_SOURCE_ID, {
    type: 'geojson',
    data: createWeatherPointGeoJSON(),
  })

  map.addLayer({
    id: POINT_LAYER_ID,
    type: 'circle',
    source: POINT_SOURCE_ID,
    paint: {
      'circle-radius': 10,
      'circle-color': '#38bdf8',
      'circle-opacity': 0.9,
      'circle-stroke-color': '#f8fafc',
      'circle-stroke-width': 2,
    },
  })

  map.addLayer({
    id: SELECTED_POINT_LAYER_ID,
    type: 'circle',
    source: POINT_SOURCE_ID,
    filter: ['==', ['get', 'weatherId'], ''],
    paint: {
      'circle-radius': 15,
      'circle-color': 'rgba(56, 189, 248, 0.18)',
      'circle-stroke-color': '#7dd3fc',
      'circle-stroke-width': 2,
    },
  })
}

const showPopup = (event) => {
  const mapKey = event.features?.[0]?.properties?.mapKey
  const weatherId = event.features?.[0]?.properties?.weatherId
  const weather = weatherId
    ? props.weatherList.find((item) => String(item.id) === weatherId)
    : findWeather(mapKey)
  const displayName = event.features?.[0]?.properties?.displayName ?? mapTitle.value
  const content = document.createElement('div')
  const title = document.createElement('strong')
  const description = document.createElement('span')

  title.textContent = weather
    ? `${weather.name} ${displayTemperature(weather.temp)}${configStore.unitSymbol}`
    : displayName
  description.textContent = weather
    ? `${weather.status} · 습도 ${weather.humidity}% · 풍속 ${weather.wind}m/s`
    : '클릭해 실시간 날씨를 불러올 수 있습니다.'
  content.append(title, description)

  popup.setLngLat(event.lngLat).setDOMContent(content).addTo(map)
}

const handleMapClick = (event) => {
  const properties = event.features?.[0]?.properties
  const mapKey = properties?.mapKey
  const weatherId = properties?.weatherId
  const weather = weatherId
    ? props.weatherList.find((item) => String(item.id) === weatherId)
    : findWeather(mapKey)
  const selectedArea = weather ?? {
    id: `map-${props.selectedCountryCode || 'world'}-${mapKey}`,
    name: properties?.displayName ?? mapKey,
    countryCode: props.selectedCountryCode || mapKey,
    mapKey,
    lat: event.lngLat.lat,
    lon: event.lngLat.lng,
  }

  if (props.selectedCountryCode) {
    emit('select-city', selectedArea)
  } else {
    emit('select-country', selectedArea)
  }
}

const updateMapData = (animate = true) => {
  if (!map) return

  const geoJSON = createWeatherGeoJSON()
  const pointGeoJSON = createWeatherPointGeoJSON()
  const source = map.getSource(SOURCE_ID)
  const pointSource = map.getSource(POINT_SOURCE_ID)

  if (!source || !pointSource) return

  source.setData(geoJSON)
  pointSource.setData(pointGeoJSON)
  initialBounds = activeMap.value.bounds
    ? new LngLatBounds(activeMap.value.bounds[0], activeMap.value.bounds[1])
    : getGeoJSONBounds(geoJSON)
  syncSelection()

  focusCurrentData(animate, pointGeoJSON)
}

onMounted(() => {
  map = new Map({
    container: mapContainer.value,
    style: {
      version: 8,
      sources: {},
      layers: [
        {
          id: 'dashboard-background',
          type: 'background',
          paint: {
            'background-color': 'rgba(0, 0, 0, 0)',
          },
        },
      ],
    },
    center: WORLD_CENTER,
    zoom: 1,
    attributionControl: false,
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
  })

  popup = new Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 12,
    className: 'weather-map-popup',
  })

  map.addControl(new NavigationControl({ showCompass: false }), 'top-right')
  map.addControl(new ResetViewControl(), 'top-right')

  map.on('load', () => {
    const geoJSON = createWeatherGeoJSON()

    addWeatherLayers(geoJSON)
    updateMapData(false)

    if (props.selectedCityId != null) {
      focusSelectedWeather(false)
    }

    map.on('mouseenter', FILL_LAYER_ID, () => {
      map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseleave', FILL_LAYER_ID, () => {
      map.getCanvas().style.cursor = ''
      popup.remove()
    })
    map.on('mousemove', FILL_LAYER_ID, showPopup)
    map.on('click', FILL_LAYER_ID, handleMapClick)
    map.on('mouseenter', POINT_LAYER_ID, () => {
      map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseleave', POINT_LAYER_ID, () => {
      map.getCanvas().style.cursor = ''
      popup.remove()
    })
    map.on('mousemove', POINT_LAYER_ID, showPopup)
    map.on('click', POINT_LAYER_ID, handleMapClick)
  })

  // 패널 레이아웃 전환 후 변경된 지도 크기를 기준으로 선택 영역 재맞춤
  resizeObserver = new ResizeObserver(() => {
    map?.resize()
    window.cancelAnimationFrame(resizeFrame)
    resizeFrame = window.requestAnimationFrame(() => {
      if (isCountryTransitioning) return

      if (props.selectedCityId == null) {
        focusCurrentData(false)
        return
      }

      focusSelectedWeather(false)
    })
  })
  resizeObserver.observe(mapContainer.value)
})

watch(
  () => props.selectedCountryCode,
  (countryCode, previousCountryCode) => {
    if (countryCode && !previousCountryCode) {
      transitionToCountryMap(countryCode)
      return
    }

    if (countryTransitionTimer) {
      window.clearTimeout(countryTransitionTimer)
      countryTransitionTimer = null
    }

    isCountryTransitioning = false
    updateMapData()
  },
)
watch(
  () => [props.weatherList, configStore.unit],
  () => {
    if (!isCountryTransitioning) updateMapData()
  },
  { deep: true },
)
watch(
  () => props.selectedCityId,
  () => {
    syncSelection()

    if (props.selectedCityId == null) {
      focusCurrentData()
      return
    }

    focusSelectedWeather()
  },
)

onBeforeUnmount(() => {
  window.cancelAnimationFrame(resizeFrame)
  window.clearTimeout(countryTransitionTimer)
  resizeObserver?.disconnect()
  popup?.remove()
  map?.remove()
})
</script>

<template>
  <section class="weather-map-chart">
    <div class="map-title">
      <h3>{{ mapTitle }}</h3>
      <p>{{ mapDescription }}</p>
    </div>

    <div ref="mapContainer" class="maplibre-weather-map" :aria-label="mapTitle" />
  </section>
</template>
