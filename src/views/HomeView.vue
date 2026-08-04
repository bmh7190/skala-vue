<template>
  <main class="home-page">
    <section class="home-panel">
      <h1>실습 페이지 선택</h1>
      <p class="description">확인할 실습 영역을 선택하세요.</p>

      <div class="page-links">
        <RouterLink to="/practice" class="page-link">
          <strong>Practice</strong>
          <span>실습 예제 확인</span>
        </RouterLink>

        <RouterLink to="/weather" class="page-link weather-link">
          <strong>Weather</strong>
          <span>날씨 대시보드 실습</span>
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px 20px;
}

.home-panel {
  width: min(720px, 100%);
  padding: 48px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 18px 45px rgba(44, 62, 80, 0.1);
}

h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.description {
  margin: 10px 0 30px;
  color: #6b7280;
}

.page-links {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.page-link {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 140px;
  padding: 24px;
  border: 1px solid #b7dfce;
  border-radius: 14px;
  background: #f1fbf6;
  color: #1f2937;
}

.page-link:hover {
  border-color: #42b883;
  background: #e7f8ef;
}

.page-link strong {
  font-size: 1.35rem;
  font-weight: 700;
}

.page-link span {
  color: #64748b;
}

.weather-link {
  border-color: #bfdbfe;
  background: #eff6ff;
}

.weather-link:hover {
  border-color: #3498db;
  background: #e4f1ff;
}

@media (max-width: 640px) {
  .home-panel {
    padding: 32px 24px;
  }

  .page-links {
    grid-template-columns: 1fr;
  }
}
</style>
