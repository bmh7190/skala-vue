<script setup>
defineProps({
  currentQuery: {
    type: String,
    default: '',
  },

  searchResults: {
    type: Array,
    required: true,
  },

  showResultMessage: {
    type: Boolean,
    default: true,
  },

  dashboard: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update-query', 'search'])
</script>

<template>
  <div class="search-inner" :class="{ 'dashboard-search': dashboard }">
    <h3>{{ dashboard ? '도시 검색' : '🔍 도시 검색' }}</h3>

    <div class="search-field">
      <span v-if="dashboard" class="search-icon" aria-hidden="true">⌕</span>
      <input
        type="text"
        :value="currentQuery"
        placeholder="도시 이름을 입력하고 Enter"
        aria-label="검색할 도시 이름"
        @input="$emit('update-query', $event.target.value)"
        @keyup.enter="$emit('search')"
      />
    </div>

    <template v-if="showResultMessage">
      <p v-if="searchResults.length !== 0">
        검색 중인 도시:
        <strong>{{ currentQuery }}</strong>
      </p>

      <p v-else>검색 결과와 일치하는 도시가 없습니다.</p>
    </template>
  </div>
</template>

<style scoped>
.dashboard-search h3 {
  margin-bottom: 9px;
  color: var(--dashboard-text);
  font-size: 12px;
  font-weight: 700;
}

.search-field {
  position: relative;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 15px;
  color: #7dd3fc;
  font-size: 24px;
  transform: translateY(-52%);
  pointer-events: none;
}

.dashboard-search input {
  width: 100%;
  height: 48px;
  padding: 0 16px 0 46px;
  border: 1px solid var(--dashboard-border);
  border-radius: 14px;
  outline: none;
  background: rgba(16, 28, 47, 0.86);
  color: var(--dashboard-text);
  font-size: 14px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.dashboard-search input::placeholder {
  color: #6f8098;
}

.dashboard-search input:focus {
  border-color: rgba(56, 189, 248, 0.7);
  box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.09);
}
</style>
