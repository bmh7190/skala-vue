<script setup>
defineProps({
  cityItem: {
    type: Object,
    required: true,
  },

  isSelected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select-card', 'click-detail'])
</script>

<template>
  <div class="weather-card" :class="{ selected: isSelected }" @click="emit('select-card')">
    <h4>{{ cityItem.name }} ({{ cityItem.status }})</h4>

    <p>현재 기온: {{ cityItem.temp }}°C</p>

    <span v-if="cityItem.temp >= 25" class="badge hot"> 🔥 더움 </span>

    <span v-else-if="cityItem.temp >= 20" class="badge common"> 🍃 보통 </span>

    <span v-else class="badge cool"> ❄️ 선선함 </span>

    <button class="btn-detail" @click.stop="emit('click-detail', cityItem.name, cityItem.status)">
      상세보기
    </button>
  </div>
</template>

<style scoped>
.weather-card {
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
  transition: 0.2s;
}

.weather-card.selected {
  border-color: #3498db;
  background-color: #eaf4ff;
}
</style>
