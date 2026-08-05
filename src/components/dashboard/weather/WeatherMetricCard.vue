<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    default: null,
  },
  unit: {
    type: String,
    default: '',
  },
  smallUnit: {
    type: Boolean,
    default: true,
  },
  variant: {
    type: String,
    required: true,
    validator: (value) => ['temperature', 'humidity', 'wind', 'visibility'].includes(value),
  },
  progress: {
    type: Number,
    default: 0,
  },
  animationDuration: {
    type: String,
    default: '3.2s',
  },
})
</script>

<template>
  <article class="highlight-card">
    <div class="highlight-card-heading">
      <span>{{ title }}</span>
    </div>

    <strong v-if="value !== null && value !== undefined">
      {{ value }}<small v-if="unit && smallUnit">{{ unit }}</small
      ><template v-else>{{ unit }}</template>
    </strong>
    <strong v-else>정보 없음</strong>

    <div
      v-if="variant === 'temperature'"
      class="highlight-visual thermometer-visual"
      :style="{ '--metric-progress': `${progress}%` }"
      aria-hidden="true"
    >
      <span class="thermometer-scale"></span>
      <span class="thermometer-tube"><i></i></span>
      <span class="thermometer-bulb"></span>
    </div>

    <div v-else-if="variant === 'humidity'" class="highlight-visual humidity-visual" aria-hidden="true">
      <svg viewBox="0 0 64 64">
        <circle class="metric-ring-track" cx="32" cy="32" r="25" pathLength="100" />
        <circle
          class="metric-ring-progress"
          cx="32"
          cy="32"
          r="25"
          pathLength="100"
          :stroke-dasharray="`${progress} 100`"
        />
        <path
          class="humidity-drop"
          d="M32 19C26 27 23 31 23 37a9 9 0 0 0 18 0c0-6-3-10-9-18Z"
        />
      </svg>
    </div>

    <div
      v-else-if="variant === 'wind'"
      class="highlight-visual wind-visual"
      :style="{ '--wind-duration': animationDuration }"
      aria-hidden="true"
    >
      <svg viewBox="0 0 72 64">
        <path class="wind-line wind-line-top" d="M8 20h31c9 0 9-11 1-11-5 0-7 3-7 6" />
        <path class="wind-line wind-line-middle" d="M5 32h49c12 0 12 15 1 15-6 0-9-4-9-8" />
        <path class="wind-line wind-line-bottom" d="M13 44h22" />
      </svg>
    </div>

    <div
      v-else
      class="highlight-visual visibility-visual"
      :style="{ '--visibility-level': progress / 100 }"
      aria-hidden="true"
    >
      <svg viewBox="0 0 72 64">
        <path
          class="visibility-eye"
          d="M7 32c8-12 18-18 29-18s21 6 29 18c-8 12-18 18-29 18S15 44 7 32Z"
        />
        <circle class="visibility-iris" cx="36" cy="32" r="9" />
        <circle class="visibility-pupil" cx="36" cy="32" r="3" />
        <path class="visibility-haze" d="M9 49h23M40 49h23" />
      </svg>
    </div>
  </article>
</template>
