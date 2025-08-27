<script setup>
import { ref } from 'vue'

// Simple state to toggle sections or open external links
const siteUrl = 'http://dfore-pknu.com/'
const showMoreAbout = ref(false)
const openSite = () => window.open(siteUrl, '_blank')
</script>

<template>
  <div class="portfolio">
    <!-- Hero -->
    <section class="hero">
      <figure class="hero-image">
        <img src="https://dfore-pknu.com/wp-content/uploads/2023/12/cropped-dfore-main-1.jpg" alt="DFORE 홈페이지 메인 이미지" onerror="this.src='https://images.unsplash.com/photo-1526378722484-bd91ca387e72?q=80&w=1600&auto=format&fit=crop'; this.onerror=null;" />
      </figure>
      <div class="hero-inner">
        <h2 class="brand">DFORE</h2>
        <p class="tagline">PKNU Digital Forensic Research & Education</p>
        <div class="actions">
          <button class="btn primary" @click="openSite">공식 사이트 바로가기</button>
          <a class="btn ghost" :href="siteUrl" target="_blank" rel="noopener">dfore-pknu.com</a>
        </div>
      </div>
      <div class="bg-gradient" aria-hidden="true" />
    </section>

    <!-- About -->
    <section class="about card">
      <h3>About DFORE</h3>
      <p>
        동의대학교·부경대학교 디지털 포렌식 연구 및 교육을 위한 허브, DFORE는
        디지털 증거 분석, 사이버 보안, 교육 콘텐츠를 통합하여 지식과 실무를 연결합니다.
      </p>
      <transition name="fade">
        <p v-if="showMoreAbout" class="more">
          연구실 프로젝트, 산학협력, 특강 및 워크숍을 통해 최신 포렌식 기법과 도구를
          실습하고 공유합니다. 아래 포트폴리오에서 최근 작업들을 확인해보세요.
        </p>
      </transition>
      <button class="link-btn" @click="showMoreAbout = !showMoreAbout">
        {{ showMoreAbout ? '간략히 보기' : '더 알아보기' }}
      </button>
    </section>

    <!-- Projects -->
    <section class="projects">
      <h3>Portfolio Highlights</h3>
      <div class="grid">
        <article class="proj card">
          <div class="badge">Research</div>
          <h4>모바일 디지털 포렌식 자동화</h4>
          <p>스마트폰 이미지 획득·파싱 파이프라인과 증거 추출 자동화 도구 프로토타입.</p>
          <div class="meta">
            <span>Python</span><span>ADB</span><span>SQLite</span>
          </div>
        </article>
        <article class="proj card">
          <div class="badge">Education</div>
          <h4>디지털 증거 분석 커리큘럼</h4>
          <p>학부/대학원 맞춤 강의 자료, 실습 이미지, 과제 템플릿 제공.</p>
          <div class="meta">
            <span>Curriculum</span><span>Hands-on</span>
          </div>
        </article>
        <article class="proj card">
          <div class="badge">Lab</div>
          <h4>포렌식 도구 벤치마킹</h4>
          <p>상용/오픈소스 도구 성능 및 정확도 비교 테스트 리포트.</p>
          <div class="meta">
            <span>Benchmark</span><span>Reporting</span>
          </div>
        </article>
        <article class="proj card">
          <div class="badge">Collab</div>
          <h4>산학협력: 사고 대응 시뮬레이션</h4>
          <p>실제 시나리오 기반 침해사고 분석 및 보고서 자동 생성 워크플로우.</p>
          <div class="meta">
            <span>IR</span><span>Automation</span>
          </div>
        </article>
      </div>
    </section>

    <!-- Skills / Focus -->
    <section class="skills card">
      <h3>Focus & Skills</h3>
      <ul class="chips">
        <li>Mobile / Cloud Forensics</li>
        <li>Incident Response</li>
        <li>Malware Triage</li>
        <li>Data Carving</li>
        <li>Timeline Analysis</li>
        <li>Teaching & Workshops</li>
      </ul>
    </section>

    <!-- CTA -->
    <section class="cta">
      <div class="cta-inner card">
        <h3>더 많은 정보가 궁금하신가요?</h3>
        <p>프로젝트 상세와 공지, 자료실은 공식 사이트에서 확인하세요.</p>
        <a class="btn primary" :href="siteUrl" target="_blank" rel="noopener">DFORE 사이트 방문</a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.portfolio { display: grid; gap: 1.25rem; padding: 0.5rem; }

/* Hero */
.hero { position: relative; overflow: hidden; border-radius: 16px; border: 1px solid #e6e6e6; }
.hero-image { width: 100%; aspect-ratio: 16 / 6; max-height: 360px; overflow: hidden; display: block; }
.hero-image img { width: 100%; height: 100%; object-fit: cover; display: block; filter: saturate(1.05) contrast(1.02); }
.hero-inner { position: relative; padding: 1.25rem 1rem 1.75rem; text-align: center; z-index: 1; }
.brand { font-size: 2.25rem; letter-spacing: 2px; margin: 0; font-weight: 800; background: linear-gradient(90deg,#2f80ed,#00b894); -webkit-background-clip: text; background-clip: text; color: transparent; }
.tagline { margin: 0.5rem 0 1rem; color: #334155; font-weight: 500; }
.actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
.bg-gradient { position: absolute; inset: -20%; background: radial-gradient(1000px 500px at 10% 10%, rgba(47,128,237,0.12), transparent), radial-gradient(800px 400px at 80% 30%, rgba(0,184,148,0.12), transparent), radial-gradient(600px 300px at 40% 80%, rgba(255, 159, 67, 0.12), transparent); filter: blur(10px); }

/* Cards */
.card { border: 1px solid #e6e6e6; border-radius: 16px; padding: 1rem; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.03); transition: transform .2s ease, box-shadow .2s ease; }
.card:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(0,0,0,0.06); }

/* About */
.about h3, .projects h3, .skills h3 { margin: 0 0 0.5rem; }
.about p { margin: 0.25rem 0; color: #475569; }
.about .more { margin-top: 0.25rem; }
.link-btn { background: transparent; border: none; color: #0ea5e9; cursor: pointer; padding: 0.25rem 0; }
.link-btn:hover { text-decoration: underline; }

/* Projects */
.projects .grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 1rem; }
.proj { position: relative; grid-column: span 12; }
@media (min-width: 640px) { .proj { grid-column: span 6; } }
@media (min-width: 1024px) { .proj { grid-column: span 3; } }
.proj h4 { margin: 0.25rem 0 0.35rem; font-size: 1.05rem; }
.proj p { margin: 0; color: #475569; min-height: 2.4em; }
.badge { position: absolute; top: -10px; left: -10px; background: #111827; color: #fff; padding: 2px 8px; border-radius: 999px; font-size: 12px; }
.meta { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 0.5rem; }
.meta span { background: #f1f5f9; color: #0f172a; border: 1px solid #e2e8f0; border-radius: 999px; padding: 2px 8px; font-size: 12px; }

/* Skills */
.skills .chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 0; margin: 0; list-style: none; }
.skills .chips li { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 999px; padding: 6px 10px; font-size: 13px; }

/* CTA */
.cta { display: grid; }
.cta-inner { text-align: center; }

/* Buttons */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 10px; padding: 0.6rem 1rem; font-weight: 600; border: 1px solid transparent; text-decoration: none; }
.btn.primary { background: linear-gradient(90deg,#2f80ed,#00b894); color: #fff; }
.btn.primary:hover { filter: brightness(1.05); }
.btn.ghost { background: #fff; border-color: #e2e8f0; color: #0f172a; }
.btn.ghost:hover { background: #f8fafc; }

/* Animations */
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
