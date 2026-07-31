<script setup>
import SampleOne from './components/practices/basic/SampleOne.vue'
import SampleTwo from './components/practices/basic/SampleTwo.vue'
import VueHtmlXss from './components/practices/basic/VueHtmlXss.vue'
import VueHTML from './components/practices/basic/VueHTML.vue'
import VueText from './components/practices/basic/VueText.vue'
import VueBind from './components/practices/basic/VueBind.vue'
import VueBindClass from './components/practices/basic/VueBindClass.vue'
import VueBindStyle from './components/practices/basic/VueBindStyle.vue'
import VueBindShorthand from './components/practices/basic/VueBindShorthand.vue'
import VueIf from './components/practices/basic/VueIf.vue'
import VueShow from './components/practices/basic/VueShow.vue'
import VueFor from './components/practices/basic/VueFor.vue'
import VueMemo from './components/practices/basic/VueMemo.vue'
import VueOnce from './components/practices/basic/VueOnce.vue'
import VuePre from './components/practices/basic/VuePre.vue'
import VueCloak from './components/practices/basic/VueCloak.vue'
import EventBasic from './components/practices/basic/EventBasic.vue'
import EventObject from './components/practices/basic/EventObject.vue'
import EventModifier from './components/practices/basic/EventModifier.vue'
</script>

<template>
  <SampleOne />
  <SampleTwo />

  <VueHtmlXss />
  <VueHTML />
  <VueText />
  <VueBind />
  <VueBindClass />
  <VueBindStyle />
  <VueBindShorthand />
  <VueIf />
  <VueShow />
  <VueFor />
  <VuePre />
  <VueCloak />
  <VueOnce />
  <VueMemo />

  <EventBasic />
  <EventObject />
  <EventModifier />
</template>

<style>
@import '@/assets/practice.css';
</style>
