<script setup>
import AxiosJson from '@/components/practices/library/AxiosJson.vue'
import AxiosWeather from '@/components/practices/library/AxiosWeather.vue'
import StoreCounter from '@/components/practices/library/StoreCounter.vue'
</script>

<template>
  <div class="practice-container">
    <h1>1. Pinia</h1>
    <hr />
    <StoreCounter />

    <h1>2. Axios</h1>
    <hr />
    <AxiosWeather />
    <AxiosJson />
  </div>
</template>
