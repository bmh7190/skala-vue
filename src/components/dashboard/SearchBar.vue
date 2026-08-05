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
