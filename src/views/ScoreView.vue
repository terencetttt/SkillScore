<template>
  <div class="page">
    <!-- Loading -->
    <div v-if="loading" class="state-wrap fade-up">
      <div class="card state-card">
        <div class="spinner-lg" />
        <div class="card-label" style="margin-top:18px">Fetching from Bradbury Chain</div>
        <p class="state-text">Reading your analysis from the on-chain record…</p>
      </div>
    </div>

    <!-- Not found / error -->
    <div v-else-if="error" class="state-wrap fade-up">
      <div class="card state-card" style="text-align:center">
        <div style="font-size:40px;margin-bottom:12px">🔍</div>
        <div class="card-label">Analysis Not Found</div>
        <p class="state-text">{{ error }}</p>
        <router-link to="/" class="btn-primary" style="max-width:240px;margin:18px auto 0;text-decoration:none">
          Score a CV
        </router-link>
      </div>
    </div>

    <!-- Results -->
    <div v-else-if="result" class="results fade-up">
      <div class="results-header">
        <div>
          <h2 class="results-title">CV Score</h2>
          <p class="results-meta">
            <span class="meta-role">{{ result.target_role }}</span>
            · {{ result.experience_level }}
          </p>
        </div>
        <div class="header-actions">
          <router-link to="/archive" class="btn-ghost" style="text-decoration:none">Archive</router-link>
          <router-link to="/" class="btn-ghost" style="text-decoration:none">Score Another →</router-link>
        </div>
      </div>

      <!-- Score + Summary -->
      <div class="top-grid">
        <!-- Circular score -->
        <div class="card score-card">
          <div class="card-label">Overall Score</div>
          <div class="ring-wrap">
            <svg class="score-ring" viewBox="0 0 140 140">
              <circle class="ring-track" cx="70" cy="70" r="58" />
              <circle
                class="ring-fill"
                cx="70" cy="70" r="58"
                :style="{
                  stroke: 'var(--yellow)',
                  strokeDashoffset: ringOffset(num(result.overall_score))
                }"
              />
            </svg>
            <div class="ring-inner">
              <span class="ring-score" style="color:var(--yellow)">{{ num(result.overall_score) }}</span>
              <span class="ring-label">{{ scoreLabel(num(result.overall_score)) }}</span>
            </div>
          </div>
          <div class="score-footer">
            <span class="verdict verdict-all">{{ result.verdict }}</span>
          </div>
        </div>

        <!-- Summary + ATS -->
        <div class="side-col">
          <div class="card summary-card">
            <div class="card-label">AI Assessment</div>
            <p class="summary-text">{{ result.summary }}</p>
          </div>
          <div class="card ats-card">
            <div class="card-label">ATS Compatibility</div>
            <div class="ats-row">
              <div class="ats-dot" style="background:var(--yellow)" />
              <span class="ats-score" style="color:var(--yellow)">{{ result.ats_compatibility }}</span>
              <span class="ats-sub">Applicant Tracking System</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Score breakdown -->
      <div class="card breakdown-card">
        <div class="card-label">Score Breakdown</div>
        <div class="bars">
          <div v-for="(cat, i) in categories" :key="cat.key" class="bar-item">
            <div class="bar-meta">
              <span class="bar-name">{{ cat.label }}</span>
              <span class="bar-val" style="color:var(--yellow)">{{ num(result[cat.key]) }}</span>
            </div>
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{
                  width: num(result[cat.key]) + '%',
                  background: 'linear-gradient(90deg, var(--y-str), var(--yellow))',
                  boxShadow: '0 0 12px var(--y-str)',
                  animationDelay: (i * 0.12) + 's'
                }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Skills -->
      <div class="skills-grid">
        <div class="card">
          <div class="card-label">Skills Found</div>
          <div class="tag-cloud">
            <span v-for="s in arr(result.found_skills)" :key="s" class="tag tag-found">{{ s }}</span>
            <span v-if="!arr(result.found_skills).length" class="empty-note">None detected</span>
          </div>
        </div>
        <div class="card">
          <div class="card-label">Missing for Role</div>
          <div class="tag-cloud">
            <span v-for="s in arr(result.missing_skills)" :key="s" class="tag tag-missing">{{ s }}</span>
            <span v-if="!arr(result.missing_skills).length" class="empty-note">None — great coverage</span>
          </div>
        </div>
      </div>

      <!-- Strengths + Recommendations -->
      <div class="bottom-grid">
        <div class="card">
          <div class="card-label">Key Strengths</div>
          <div v-for="(s, i) in arr(result.strengths)" :key="i" class="strength-item">
            <div class="s-icon">✓</div>
            <span>{{ s }}</span>
          </div>
        </div>
        <div class="card">
          <div class="card-label">How to Improve</div>
          <div v-for="(r, i) in arr(result.recommendations)" :key="i" class="rec-item">
            <div class="rec-num">{{ i + 1 }}</div>
            <span>{{ r }}</span>
          </div>
        </div>
      </div>

      <!-- On-chain proof -->
      <div class="proof-bar">
        <span>Analysis stored on-chain — immutable &amp; publicly verifiable</span>
        <span class="proof-id">Record #{{ result.id }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { readContract } from '../client'

const route = useRoute()
const loading = ref(true)
const error = ref('')
const result = ref<any>(null)

const categories = [
  { key: 'technical_score',    label: 'Technical Skills'      },
  { key: 'experience_score',   label: 'Work Experience'       },
  { key: 'education_score',    label: 'Education & Certs'     },
  { key: 'achievements_score', label: 'Achievements & Impact' },
  { key: 'presentation_score', label: 'CV Presentation & ATS' },
]

// Contract stores some fields as JSON strings; coerce safely for display.
function arr(v: any): string[] {
  if (Array.isArray(v)) return v
  if (typeof v === 'string') {
    try { const p = JSON.parse(v); return Array.isArray(p) ? p : [] } catch { return [] }
  }
  return []
}
function num(v: any): number {
  const n = typeof v === 'string' ? parseInt(v, 10) : Number(v)
  return isNaN(n) ? 0 : n
}

function scoreLabel(s: number): string {
  return s >= 85 ? 'Excellent' : s >= 70 ? 'Good' : s >= 55 ? 'Fair' : 'Needs Work'
}

const CIRCUMFERENCE = 2 * Math.PI * 58
function ringOffset(score: number): number {
  return CIRCUMFERENCE * (1 - score / 100)
}

onMounted(async () => {
  const id = route.params.id as string
  if (!id) { error.value = 'No analysis ID provided.'; loading.value = false; return }
  try {
    const data = await readContract('get_analysis', [id])
    if (data && (data.id !== undefined && data.id !== null)) {
      result.value = data
    } else {
      error.value = 'No record exists for this ID. It may still be processing on-chain.'
    }
  } catch (e: any) {
    error.value = e?.message || 'Could not read this analysis from the chain.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.state-wrap { max-width: 540px; margin: 60px auto 0; }
.state-card { padding: 40px 30px; text-align: center; }
.state-text { font-size: 13px; color: var(--muted); line-height: 1.7; margin-top: 6px; }
.spinner-lg { width: 36px; height: 36px; border: 3px solid var(--border); border-top-color: var(--yellow); border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto; }

.results-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; gap: 12px; flex-wrap: wrap; }
.results-title { font-family: var(--font-h); font-size: 22px; font-weight: 800; letter-spacing: -.5px; margin-bottom: 4px; }
.results-meta { font-size: 13px; color: var(--muted); }
.meta-role { color: var(--yellow); font-weight: 600; }
.header-actions { display: flex; gap: 8px; }

.top-grid { display: grid; grid-template-columns: 210px 1fr; gap: 14px; margin-bottom: 14px; }
.score-card { text-align: center; padding: 24px 16px; }
.ring-wrap { position: relative; width: 150px; height: 150px; margin: 0 auto 14px; }
.score-ring { width: 100%; height: 100%; transform: rotate(-90deg); }
.ring-track { fill: none; stroke: var(--card2); stroke-width: 10; }
.ring-fill { fill: none; stroke-width: 10; stroke-linecap: round; stroke-dasharray: 364.4; stroke-dashoffset: 364.4; transition: stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1); }
.ring-inner { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); text-align: center; }
.ring-score { display: block; font-family: var(--font-n); font-size: 40px; font-weight: 800; line-height: 1; letter-spacing: -2px; }
.ring-label { display: block; font-size: 10px; color: var(--dim); text-transform: uppercase; letter-spacing: 2px; margin-top: 3px; }
.side-col { display: flex; flex-direction: column; gap: 12px; }
.summary-text { font-size: 13px; color: var(--muted); line-height: 1.75; }
.ats-row { display: flex; align-items: center; gap: 10px; }
.ats-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.ats-score { font-family: var(--font-n); font-size: 16px; font-weight: 700; }
.ats-sub { font-size: 11px; color: var(--dim); }

.breakdown-card { margin-bottom: 14px; }
.bar-item { margin-bottom: 14px; }
.bar-meta { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px; }
.bar-name { font-size: 13px; color: var(--text); font-weight: 500; }
.bar-val { font-family: var(--font-n); font-size: 13px; font-weight: 700; }
.bar-track { height: 7px; background: var(--card2); border-radius: 4px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 4px; animation: barFill 1.2s cubic-bezier(.16,1,.3,1) both; }

.skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
.tag-cloud { display: flex; flex-wrap: wrap; gap: 6px; }
.tag { font-size: 11px; font-weight: 500; padding: 4px 11px; border-radius: 20px; }
.tag-found   { background: var(--g-dim); border: 1px solid var(--g-bdr); color: var(--green); }
.tag-missing { background: var(--r-dim); border: 1px solid var(--r-bdr); color: var(--red); }
.empty-note { font-size: 12px; color: var(--dim); }

.bottom-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 14px; margin-bottom: 14px; }
.strength-item { display: flex; gap: 9px; align-items: flex-start; margin-bottom: 10px; font-size: 13px; color: var(--muted); line-height: 1.65; }
.s-icon { width: 18px; height: 18px; background: var(--g-dim); border: 1px solid var(--g-bdr); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--green); font-size: 9px; flex-shrink: 0; margin-top: 1px; }
.rec-item { display: flex; gap: 9px; align-items: flex-start; margin-bottom: 12px; font-size: 13px; color: var(--muted); line-height: 1.7; }
.rec-num { min-width: 20px; height: 20px; background: var(--y-dim); border: 1px solid var(--border); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: var(--yellow); font-family: var(--font-n); flex-shrink: 0; }

.proof-bar { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 12px; background: var(--card); border: 1px solid var(--border); border-radius: 12px; font-size: 12px; color: var(--dim); flex-wrap: wrap; }
.proof-id { color: var(--yellow); font-family: var(--font-n); font-weight: 600; }

@media (max-width: 640px) {
  .top-grid, .skills-grid, .bottom-grid { grid-template-columns: 1fr; }
}
</style>
