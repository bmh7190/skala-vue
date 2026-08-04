<script setup>
import EventBasic from '@/components/practices/basic/EventBasic.vue'
import EventModifier from '@/components/practices/basic/EventModifier.vue'
import EventObject from '@/components/practices/basic/EventObject.vue'
import ModelBasic from '@/components/practices/basic/ModelBasic.vue'
import ModelForm from '@/components/practices/basic/ModelForm.vue'
import ModelModifier from '@/components/practices/basic/ModelModifier.vue'
import ReactiveReactive from '@/components/practices/composition/ReactiveReactive.vue'
import ReactiveRef from '@/components/practices/composition/ReactiveRef.vue'
import SampleOne from '@/components/practices/basic/SampleOne.vue'
import SampleTwo from '@/components/practices/basic/SampleTwo.vue'
import StyleScoped from '@/components/practices/basic/StyleScoped.vue'
import VueBind from '@/components/practices/basic/VueBind.vue'
import VueBindClass from '@/components/practices/basic/VueBindClass.vue'
import VueBindShorthand from '@/components/practices/basic/VueBindShorthand.vue'
import VueBindStyle from '@/components/practices/basic/VueBindStyle.vue'
import VueCloak from '@/components/practices/basic/VueCloak.vue'
import VueFor from '@/components/practices/basic/VueFor.vue'
import VueHTML from '@/components/practices/basic/VueHTML.vue'
import VueHtmlXss from '@/components/practices/basic/VueHtmlXss.vue'
import VueIf from '@/components/practices/basic/VueIf.vue'
import VueMemo from '@/components/practices/basic/VueMemo.vue'
import VueOnce from '@/components/practices/basic/VueOnce.vue'
import VuePre from '@/components/practices/basic/VuePre.vue'
import VueShow from '@/components/practices/basic/VueShow.vue'
import VueText from '@/components/practices/basic/VueText.vue'
</script>

<template>
  <div class="practice-container">
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
    <ModelBasic />
    <ModelForm />
    <ModelModifier />
    <StyleScoped />
    <ReactiveReactive />
    <ReactiveRef />
  </div>
</template>
