<script setup>
import ReactiveReactive from './components/practices/composition/ReactiveReactive.vue'
import ReactiveRef from './components/practices/composition/ReactiveRef.vue'

// 1. Reactive State
// 2. Computed & Watchers
</script>

<template>
  <div class="practice-container">
    <h1>1. Reactive State</h1>
    <hr />
    <ReactiveRef />
    <ReactiveReactive />
    <h1>2. Computed & Watchers</h1>
    <hr />

    <h1>3. Component Lifecycle</h1>
    <hr />

    <h1>4. Props & Emits</h1>
    <hr />

    <h1>5. Component Slot</h1>
    <hr />
  </div>
</template>

<style>
@import '@/assets/practice.css';
</style>
