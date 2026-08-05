<script setup>
defineProps({
  message: {
    type: String,
    default: '불러오는 중입니다.',
  },
})
</script>

<template>
  <div class="loading-indicator" role="status" aria-live="polite">
    <span class="spinner" aria-hidden="true"></span>
    <p>{{ message }}</p>
  </div>
</template>

<style scoped>
.loading-indicator {
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #64748b;
}

.loading-indicator p {
  margin: 0;
  font-size: 14px;
}

.spinner {
  width: 22px;
  height: 22px;
  border: 2px solid #e2e8f0;
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
  }
}
</style>
