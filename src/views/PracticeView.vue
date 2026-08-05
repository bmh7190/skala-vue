<template>
  <main class="practice-page">
    <header class="practice-header">
      <RouterLink to="/" class="back-link">← 메인으로</RouterLink>

      <nav class="day-navigation" aria-label="Practice 일차 선택">
        <RouterLink to="/practice/day-1" class="day-link">1일차</RouterLink>
        <RouterLink to="/practice/day-2" class="day-link">2일차</RouterLink>
        <RouterLink to="/practice/day-3" class="day-link">3일차</RouterLink>
        <RouterLink to="/practice/day-4" class="day-link">4일차</RouterLink>
      </nav>
    </header>

    <RouterView />
  </main>
</template>

<style>
@import '@/assets/practice.css';
</style>

<style scoped>
.practice-page {
  width: 100%;
  padding: 24px 20px 60px;
}

.practice-header {
  width: 800px;
  max-width: 100%;
  margin: 0 auto 20px;
}

.back-link {
  display: inline-block;
  margin-bottom: 12px;
}

.day-navigation {
  display: flex;
  gap: 8px;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #ffffff;
}

.day-link {
  padding: 8px 16px;
  border-radius: 6px;
  color: #64748b;
  font-weight: 600;
}

.day-link.router-link-active {
  background: #e7f8ef;
  color: #2c8a5f;
}
</style>
