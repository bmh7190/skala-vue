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

<style scoped>
.highlight-card {
  position: relative;
  box-sizing: border-box;
  min-height: 92px;
  padding: 10px clamp(70px, 5.6vw, 84px) 10px 10px;
  overflow: hidden;
  border: 1px solid var(--dashboard-border);
  border-radius: 14px;
  background: linear-gradient(145deg, rgba(12, 28, 48, 0.92), rgba(7, 17, 30, 0.82));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025);
}

.highlight-card-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--dashboard-muted);
  font-size: clamp(11px, 0.8vw, 13px);
  font-weight: 650;
}

.highlight-card > strong {
  display: block;
  margin-top: 6px;
  color: var(--dashboard-text);
  font-size: clamp(24px, 1.9vw, 30px);
  font-weight: 600;
  letter-spacing: -0.04em;
  white-space: nowrap;
}

.highlight-card small {
  margin-left: 4px;
  color: var(--dashboard-muted);
  font-size: clamp(11px, 0.8vw, 13px);
  font-weight: 500;
}

.highlight-visual {
  position: absolute;
  top: 50%;
  right: 8px;
  display: grid;
  width: clamp(58px, 4.8vw, 76px);
  height: clamp(58px, 4.8vw, 76px);
  place-items: center;
  transform: translateY(-54%);
}

.highlight-visual svg {
  width: 86%;
  height: 86%;
  overflow: visible;
}

.thermometer-visual {
  display: block;
}

.thermometer-tube {
  position: absolute;
  bottom: 14px;
  left: 50%;
  width: 10px;
  height: 34px;
  overflow: hidden;
  transform: translateX(-50%);
  border: 2px solid rgba(186, 230, 253, 0.78);
  border-bottom: 0;
  border-radius: 8px 8px 2px 2px;
  background: rgba(7, 17, 30, 0.78);
}

.thermometer-tube i {
  position: absolute;
  right: 2px;
  bottom: 0;
  left: 2px;
  height: var(--metric-progress);
  min-height: 4px;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(0deg, #fb7185, #fbbf24);
  transition: height 420ms ease;
}

.thermometer-bulb {
  position: absolute;
  bottom: 7px;
  left: 50%;
  width: 18px;
  height: 18px;
  transform: translateX(-50%);
  border: 2px solid rgba(186, 230, 253, 0.78);
  border-radius: 50%;
  background: #fb7185;
  box-shadow: 0 0 12px rgba(251, 113, 133, 0.38);
}

.thermometer-scale {
  position: absolute;
  top: 14px;
  right: 9px;
  width: 8px;
  height: 28px;
  opacity: 0.55;
  background: repeating-linear-gradient(
    to bottom,
    rgba(186, 230, 253, 0.9) 0 1px,
    transparent 1px 7px
  );
}

.metric-ring-track,
.metric-ring-progress {
  fill: none;
  stroke-width: 6;
}

.metric-ring-track {
  stroke: rgba(125, 211, 252, 0.13);
}

.metric-ring-progress {
  transform: rotate(-90deg);
  transform-origin: center;
  stroke: #38bdf8;
  stroke-linecap: round;
  filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.48));
  transition: stroke-dasharray 420ms ease;
}

.humidity-drop {
  fill: rgba(125, 211, 252, 0.84);
}

.wind-line {
  fill: none;
  stroke: #7dd3fc;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 7 5;
  animation: dashboard-wind-flow var(--wind-duration) linear infinite;
  filter: drop-shadow(0 0 3px rgba(56, 189, 248, 0.35));
}

.wind-line-middle {
  animation-delay: -0.35s;
}

.wind-line-bottom {
  animation-delay: -0.7s;
}

.visibility-eye,
.visibility-haze {
  fill: none;
  stroke: rgba(125, 211, 252, calc(0.34 + var(--visibility-level) * 0.66));
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 calc(7px - var(--visibility-level) * 5px) rgba(56, 189, 248, 0.45));
}

.visibility-iris {
  fill: rgba(56, 189, 248, calc(0.16 + var(--visibility-level) * 0.56));
  stroke: #7dd3fc;
  stroke-width: 2;
}

.visibility-pupil {
  fill: #e0f2fe;
}

.visibility-haze {
  opacity: calc(0.82 - var(--visibility-level) * 0.62);
}

@keyframes dashboard-wind-flow {
  to {
    stroke-dashoffset: -24;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wind-line {
    animation: none;
  }
}

@media (min-width: 901px) {
  .highlight-card {
    height: auto;
    min-height: 132px;
  }
}

@media (min-width: 901px) and (max-height: 800px) {
  .highlight-card {
    min-height: 100px;
  }
}

@media (min-width: 901px) and (max-height: 680px) {
  .highlight-card {
    min-height: 90px;
    padding: 8px clamp(58px, 4.8vw, 70px) 8px 8px;
  }

  .highlight-card > strong {
    margin-top: 4px;
    font-size: 24px;
  }

  .highlight-visual {
    right: 6px;
    width: 54px;
    height: 54px;
  }
}
</style>
