<script setup>
import LifeCycleChild from './components/practices/component/LifeCycleChild.vue'
import LifecycleParent from './components/practices/component/LifecycleParent.vue'
import ComputedBasic from './components/practices/composition/ComputedBasic.vue'
import ReactiveReactive from './components/practices/composition/ReactiveReactive.vue'
import ReactiveRef from './components/practices/composition/ReactiveRef.vue'
import WatchersBasic from './components/practices/composition/WatchersBasic.vue'
import WatchersDeep from './components/practices/composition/WatchersDeep.vue'
import WatchersMulti from './components/practices/composition/WatchersMulti.vue'
import WatchersReactive from './components/practices/composition/WatchersReactive.vue'
import WatchersWatchEffect from './components/practices/composition/WatchersWatchEffect.vue'
import WeatherComposition from './components/practices/exercise/WeatherComposition.vue'

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
    <ComputedBasic />
    <WatchersBasic />
    <WatchersMulti />
    <WatchersDeep />
    <WatchersReactive />
    <WatchersWatchEffect />

    <h1>2.1 Weather Composition</h1>
    <hr />
    <WeatherComposition />

    <h1>3. Component Lifecycle</h1>
    <hr />
    <LifecycleParent />

    <h1>4. Props & Emits</h1>
    <hr />

    <h1>5. Component Slot</h1>
    <hr />
  </div>
</template>

<style>
@import '@/assets/practice.css';
@import '@/assets/exercise.css';
</style>
