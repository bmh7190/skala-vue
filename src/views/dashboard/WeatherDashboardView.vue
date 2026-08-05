<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import UnitToggle from '@/components/dashboard/common/UnitToggle.vue'

const isHeaderInitiallyVisible = ref(true)
const route = useRoute()
const isDashboardHome = computed(() => route.name === 'WeatherDashboard')
let headerTimer

onMounted(() => {
  headerTimer = window.setTimeout(() => {
    isHeaderInitiallyVisible.value = false
  }, 1800)
})

onBeforeUnmount(() => {
  window.clearTimeout(headerTimer)
})
</script>

<template>
  <main
    class="weather-dashboard-page"
    :class="{ 'dashboard-home-page': isDashboardHome }"
  >
    <section class="app-container task-five-container full-page-dashboard">
      <div class="dashboard-wrapper task-five-dashboard">
        <header
          class="task-five-topbar"
          :class="{ 'initially-visible': isHeaderInitiallyVisible }"
        >
          <div class="dashboard-leading">
            <RouterLink to="/" class="dashboard-brand">
              <span class="brand-mark" aria-hidden="true">✦</span>
              <strong>Weatherly</strong>
            </RouterLink>
          </div>

          <nav class="task-five-navigation" aria-label="Weatherly 주요 메뉴">
            <RouterLink to="/" class="nav-item">대시보드</RouterLink>
            <RouterLink to="/about" class="nav-item">서비스 소개</RouterLink>
            <RouterLink to="/practice" class="nav-item">실습</RouterLink>
            <RouterLink to="/weather" class="nav-item">과제</RouterLink>
          </nav>

          <UnitToggle />
        </header>

        <RouterView v-slot="{ Component, route }">
          <KeepAlive>
            <component :is="Component" v-if="route.meta.keepAlive" />
          </KeepAlive>
          <component :is="Component" v-if="!route.meta.keepAlive" />
        </RouterView>
      </div>
    </section>
  </main>
</template>

<style scoped>
.weather-dashboard-page {
  min-height: 100vh;
  overflow-x: hidden;
  background: #08111f;
}

.weather-dashboard-page.dashboard-home-page {
  height: 100dvh;
  min-height: 0;
  overflow: hidden;
}

.app-container.task-five-container {
  --dashboard-bg: #08111f;
  --dashboard-panel: #101c2f;
  --dashboard-panel-soft: #14233a;
  --dashboard-border: rgba(148, 163, 184, 0.16);
  --dashboard-text: #f8fafc;
  --dashboard-muted: #91a1b8;
  --dashboard-accent: #38bdf8;
  --dashboard-deep-panel:
    radial-gradient(circle at 52% 45%, rgba(14, 165, 233, 0.14), transparent 45%),
    rgba(6, 14, 27, 0.58);

  width: 100%;
  max-width: none;
  margin: 24px 0 40px;
  padding: 0;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 24px;
  background:
    radial-gradient(circle at 78% 15%, rgba(14, 165, 233, 0.13), transparent 34%),
    var(--dashboard-bg);
  box-shadow: 0 28px 70px rgba(15, 23, 42, 0.25);
  color: var(--dashboard-text);
}

.task-five-dashboard {
  width: 100%;
  margin: 0;
}

.task-five-topbar {
  display: grid;
  grid-template-columns: minmax(170px, 1fr) auto minmax(170px, 1fr);
  align-items: center;
  gap: 24px;
  min-height: 76px;
  padding: 0 28px;
  border-bottom: 1px solid var(--dashboard-border);
  background: rgba(8, 17, 31, 0.74);
  backdrop-filter: blur(14px);
}

.dashboard-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--dashboard-text);
  font-size: 17px;
  letter-spacing: -0.02em;
}

.dashboard-brand strong {
  font-weight: 750;
}

.brand-mark {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid rgba(125, 211, 252, 0.3);
  border-radius: 11px;
  background: linear-gradient(145deg, #0ea5e9, #2563eb);
  box-shadow: 0 8px 18px rgba(14, 165, 233, 0.24);
}

.task-five-navigation {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px;
  border: 1px solid var(--dashboard-border);
  border-radius: 999px;
  background: rgba(15, 29, 49, 0.72);
}

.task-five-navigation .nav-item {
  padding: 7px 14px;
  border-radius: 999px;
  color: var(--dashboard-muted);
  font-size: 13px;
  font-weight: 650;
}

.task-five-navigation .nav-item:hover,
.task-five-navigation .router-link-exact-active {
  border: none;
  background: rgba(56, 189, 248, 0.12);
  color: #7dd3fc;
}

.dashboard-leading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-container.task-five-container.full-page-dashboard {
  width: 100%;
  max-width: none;
  min-height: 100vh;
  margin: 0;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.dashboard-home-page .full-page-dashboard,
.dashboard-home-page .task-five-dashboard {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.dashboard-brand {
  text-decoration: none;
}

@media (hover: hover) and (min-width: 901px) {
  .task-five-topbar {
    position: fixed;
    z-index: 20;
    top: 0;
    right: 0;
    left: 0;
    box-shadow: 0 16px 36px rgba(2, 8, 23, 0.28);
    transform: translateY(calc(-100% + 9px));
    transition:
      transform 0.28s ease,
      box-shadow 0.28s ease;
  }

  .task-five-topbar::after {
    position: absolute;
    bottom: 2px;
    left: 50%;
    width: 42px;
    height: 3px;
    border-radius: 999px;
    background: rgba(125, 211, 252, 0.5);
    content: '';
    transform: translateX(-50%);
  }

  .task-five-topbar:hover,
  .task-five-topbar:focus-within,
  .task-five-topbar.initially-visible {
    box-shadow: 0 20px 44px rgba(2, 8, 23, 0.42);
    transform: translateY(0);
  }
}

@media (max-width: 600px) {
  .dashboard-leading {
    gap: 8px;
  }
}

@media (max-width: 900px) {
  .weather-dashboard-page.dashboard-home-page {
    height: auto;
    min-height: 100dvh;
    overflow-y: auto;
  }

  .dashboard-home-page .full-page-dashboard,
  .dashboard-home-page .task-five-dashboard {
    height: auto;
    min-height: 100dvh;
    overflow: visible;
  }

  .task-five-topbar {
    grid-template-columns: 1fr auto;
    gap: 10px 16px;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .task-five-navigation {
    display: flex;
    grid-column: 1 / -1;
    grid-row: 2;
    justify-content: center;
    overflow-x: auto;
  }
}

@media (max-width: 600px) {
  .app-container.task-five-container {
    border-radius: 16px;
  }

  .task-five-topbar {
    gap: 12px;
    padding: 0 16px;
  }
}
</style>
