<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const activePracticePath = computed(() => route.path)
</script>

<template>
  <el-container class="practice-page">
    <el-header class="practice-header" height="auto">
      <el-card shadow="never" class="practice-navigation-card">
        <el-page-header title="메인" content="Vue 실습" @back="router.push('/')" />

        <el-menu
          :default-active="activePracticePath"
          mode="horizontal"
          router
          :ellipsis="false"
          aria-label="Practice 일차 선택"
        >
          <el-menu-item index="/practice/day-1">1일차</el-menu-item>
          <el-menu-item index="/practice/day-2">2일차</el-menu-item>
          <el-menu-item index="/practice/day-3">3일차</el-menu-item>
          <el-menu-item index="/practice/day-4">4일차</el-menu-item>
        </el-menu>
      </el-card>
    </el-header>

    <el-main class="practice-content">
      <RouterView />
    </el-main>
  </el-container>
</template>

<style>
@import '@/assets/practice.css';
</style>

<style scoped>
.practice-page {
  width: 100%;
  min-height: 100vh;
  padding: 24px 20px 60px;
  background: #f5f7fa;
}

.practice-header {
  width: 800px;
  max-width: 100%;
  padding: 0;
  margin: 0 auto 20px;
}

.practice-navigation-card {
  border-radius: 12px;
}

.practice-navigation-card :deep(.el-card__body) {
  padding-bottom: 0;
}

.practice-navigation-card :deep(.el-menu) {
  margin-top: 16px;
  border-bottom: 0;
}

.practice-navigation-card :deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
  font-weight: 650;
}

.practice-content {
  padding: 0;
}

@media (max-width: 600px) {
  .practice-page {
    padding: 16px 12px 40px;
  }

  .practice-navigation-card :deep(.el-card__body) {
    padding: 16px 12px 0;
  }

  .practice-navigation-card :deep(.el-menu-item) {
    min-width: 0;
    padding: 0 12px;
  }
}
</style>
