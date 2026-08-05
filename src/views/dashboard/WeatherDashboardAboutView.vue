<script setup>
const capabilities = [
  {
    icon: '⌖',
    title: '세계 날씨 탐색',
    description: '세계 지도에서 국가와 지역을 선택해 현재 날씨를 한눈에 살펴봅니다.',
  },
  {
    icon: '⌁',
    title: '실시간 기상 정보',
    description: 'OpenWeather 데이터를 기반으로 기온, 습도, 풍속과 가시거리를 제공합니다.',
  },
  {
    icon: '↗',
    title: '예보와 변화 추이',
    description: '시간별 차트와 일별 예보를 함께 보여 주어 날씨의 흐름을 파악할 수 있습니다.',
  },
]
</script>

<template>
  <section class="weatherly-about" aria-labelledby="weatherly-about-title">
    <div class="about-hero">
      <span class="about-kicker">ABOUT WEATHERLY</span>
      <h1 id="weatherly-about-title">날씨를 더 넓게 보고,<br />더 빠르게 이해하세요.</h1>
      <p>
        Weatherly는 도시 검색, 인터랙티브 지도, 상세 예보를 하나의 흐름으로 연결한
        날씨 탐색 대시보드입니다.
      </p>
      <RouterLink to="/" class="about-cta">대시보드 둘러보기 <span>→</span></RouterLink>
    </div>

    <div class="about-capabilities">
      <article v-for="capability in capabilities" :key="capability.title" class="capability-card">
        <span class="capability-icon" aria-hidden="true">{{ capability.icon }}</span>
        <h2>{{ capability.title }}</h2>
        <p>{{ capability.description }}</p>
      </article>
    </div>

    <div class="about-principle">
      <div>
        <span>WEATHER AT A GLANCE</span>
        <h2>복잡한 기상 데이터를<br />명확한 시각 정보로.</h2>
      </div>
      <p>
        필요한 지역을 찾고, 지도에서 비교하고, 예보까지 이어서 확인할 수 있도록
        정보의 우선순위와 화면 흐름을 설계했습니다.
      </p>
    </div>
  </section>
</template>

<style scoped>
.weatherly-about {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: 150px 0 72px;
  color: #f8fafc;
}

.about-hero {
  max-width: 780px;
}

.about-kicker,
.about-principle span {
  color: #38bdf8;
  font-size: 12px;
  font-weight: 750;
  letter-spacing: 0.18em;
}

.about-hero h1 {
  margin: 18px 0 22px;
  font-size: clamp(42px, 7vw, 78px);
  line-height: 1.02;
  letter-spacing: -0.055em;
}

.about-hero > p {
  max-width: 650px;
  margin: 0;
  color: #91a1b8;
  font-size: 17px;
  line-height: 1.8;
}

.about-cta {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
  padding: 12px 18px;
  border: 1px solid rgba(56, 189, 248, 0.32);
  border-radius: 12px;
  background: rgba(14, 165, 233, 0.12);
  color: #7dd3fc;
  font-weight: 700;
}

.about-capabilities {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 88px;
}

.capability-card {
  min-height: 240px;
  padding: 28px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 20px;
  background: rgba(16, 28, 47, 0.74);
}

.capability-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 12px;
  background: linear-gradient(145deg, #0ea5e9, #2563eb);
  color: white;
  font-size: 20px;
}

.capability-card h2 {
  margin: 42px 0 10px;
  font-size: 20px;
}

.capability-card p,
.about-principle > p {
  margin: 0;
  color: #91a1b8;
  line-height: 1.75;
}

.about-principle {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: end;
  gap: 48px;
  margin-top: 72px;
  padding: 44px 0 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.16);
}

.about-principle h2 {
  margin: 14px 0 0;
  font-size: clamp(30px, 4vw, 48px);
  line-height: 1.15;
  letter-spacing: -0.04em;
}

@media (max-width: 760px) {
  .weatherly-about {
    width: min(100% - 28px, 1180px);
    padding-top: 56px;
  }

  .about-capabilities,
  .about-principle {
    grid-template-columns: 1fr;
  }

  .about-capabilities {
    margin-top: 56px;
  }

  .capability-card {
    min-height: 0;
  }
}
</style>
