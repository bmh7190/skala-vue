<script setup>
const welcomeMesage = 'Welcom to Skala Vue'
</script>

<template>
  <div class="practice-section">
    <h2>{{ welcomeMesage }}</h2>
    <p>{{ welcomeMesage.toUpperCase() }}</p>
    <p>{{ 'Random number: ' + Math.ceil(Math.random() * 100) }}</p>
  </div>
</template>
