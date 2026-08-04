<script setup>
import ComputedBasic from '@/components/practices/composition/ComputedBasic.vue'
import LifecycleParent from '@/components/practices/component/LifecycleParent.vue'
import PropsEmitsParent from '@/components/practices/component/PropsEmitsParent.vue'
import ReactiveReactive from '@/components/practices/composition/ReactiveReactive.vue'
import ReactiveRef from '@/components/practices/composition/ReactiveRef.vue'
import SlotDefaultParent from '@/components/practices/component/SlotDefaultParent.vue'
import SlotNamedParent from '@/components/practices/component/SlotNamedParent.vue'
import SlotScopedParent from '@/components/practices/component/SlotScopedParent.vue'
import WatchersBasic from '@/components/practices/composition/WatchersBasic.vue'
import WatchersDeep from '@/components/practices/composition/WatchersDeep.vue'
import WatchersMulti from '@/components/practices/composition/WatchersMulti.vue'
import WatchersReactive from '@/components/practices/composition/WatchersReactive.vue'
import WatchersWatchEffect from '@/components/practices/composition/WatchersWatchEffect.vue'
</script>

<template>
  <div class="practice-container">
    <h1>1. Reactive State</h1>
    <hr />
    <ReactiveRef />
    <ReactiveReactive />

    <h1>2. Computed &amp; Watchers</h1>
    <hr />
    <ComputedBasic />
    <WatchersBasic />
    <WatchersMulti />
    <WatchersDeep />
    <WatchersReactive />
    <WatchersWatchEffect />

    <h1>3. Component Lifecycle</h1>
    <hr />
    <LifecycleParent />

    <h1>4. Props &amp; Emits</h1>
    <hr />
    <PropsEmitsParent />

    <h1>5. Component Slot</h1>
    <hr />
    <SlotDefaultParent />
    <SlotNamedParent />
    <SlotScopedParent />
  </div>
</template>
