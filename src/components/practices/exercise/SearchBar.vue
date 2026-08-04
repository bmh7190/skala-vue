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
})

defineEmits(['update-query', 'search'])
</script>

<template>
  <div class="search-inner">
    <h3>🔍 도시 검색</h3>

    <input
      type="text"
      :value="currentQuery"
      placeholder="검색할 도시 이름 입력"
      @input="$emit('update-query', $event.target.value)"
      @keyup.enter="$emit('search')"
    />

    <template v-if="showResultMessage">
      <p v-if="searchResults.length !== 0">
        검색 중인 도시:
        <strong>{{ currentQuery }}</strong>
      </p>

      <p v-else>검색 결과와 일치하는 도시가 없습니다.</p>
    </template>
  </div>
</template>
