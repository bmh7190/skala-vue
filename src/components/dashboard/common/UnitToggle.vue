<script setup>
import { useConfigStore } from '@/stores/configStore'

const configStore = useConfigStore()
</script>

<template>
  <div class="unit-toggle">
    <span
      >날씨단위: <strong>{{ configStore.unit === 'celsius' ? '섭씨(℃)' : '화씨(℉)' }}</strong></span
    >
    <button @click="configStore.toggleUnit" class="toggle-btn">단위변경</button>
  </div>
</template>

<style scoped>
.unit-toggle {
  display: inline-flex;
  align-items: center;
  justify-self: end;
  gap: 10px;
  color: var(--dashboard-muted);
  font-size: 12px;
}

.unit-toggle strong {
  color: var(--dashboard-text);
  font-weight: 700;
}

.toggle-btn {
  padding: 7px 10px;
  border: 1px solid var(--dashboard-border);
  border-radius: 9px;
  background: var(--dashboard-panel-soft);
  color: var(--dashboard-text);
  cursor: pointer;
}

@media (max-width: 600px) {
  .unit-toggle > span {
    display: none;
  }
}
</style>
