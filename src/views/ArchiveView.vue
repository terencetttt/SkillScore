<template>
  <div class="page">
    <!-- Header -->
    <div class="archive-head">
      <div>
        <div class="head-badge">⛓ On-Chain Archive</div>
        <h1 class="head-title">All CV Analyses</h1>
        <p class="head-sub">Every analysis stored on GenLayer Bradbury — immutable, public, verifiable.</p>
      </div>
      <div v-if="!loading" class="count-pill">
        {{ entries.length }} {{ entries.length === 1 ? 'analysis' : 'analyses' }}
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state-center">
      <div class="spinner" style="width:28px;height:28px;border-width:3px" />
      <span style="color:var(--muted)">Fetching from chain…</span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-box">⚠ {{ error }}</div>

    <!-- Empty -->
    <div v-else-if="entries.length === 0" class="state-center">
      <div class="empty-icon">📭</div>
      <p style="color:var(--muted);font-size:14px">No analyses on chain yet. Be the first!</p>
      <router-link to="/" class="btn-ghost" style="display:inline-block;margin-top:12px">Score a CV →</router-link>
    </div>

    <!-- Entry list -->
    <div v-else class="entry-list">
      <div
        v-for="entry in entries"
        :key="entry.id"
        class="card entry-card"
        @click="toggleExpand(entry.id)"
      >
        <!-- Summary row -->
        <div class="entry-row">
          <div class="entry-id">#{{ entry.id + 1 }}</div>
          <div class="entry-info">
            <div class="entry-role">{{ entry.target_role }}</div>
            <div class="entry-addr">{{ shortAddr(entry.submitter) }}</div>
          </div>
          <div class="entry-right">
            <div class="entry-score" :style="{ color: scoreColor(entry.overall_score) }">
              {{ entry.overall_score }}
            </div>
            <span :class="verdictClass(entry.verdict)">{{ entry.verdict }}</span>
            <div class="expand-btn" :class="{ 'expand-open': expanded.has(entry.id) }">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Expanded detail -->
        <div v-if="expanded.has(entry.id)" class="entry-detail fade-up">
          <p class="detail-summary">{{ entry.summary }}</p>

          <div v-if="loadingDetail.has(entry.id)" class="detail-loading">
            <div class="spinner" /> Loading full details…
          </div>

          <template v-else-if="details[entry.id]">
            <!-- Mini score bars -->
            <div class="detail-bars">
              <div v-for="cat in categories" :key="cat.key" class="mini-bar">
                <div class="mini-meta">
                  <span class="mini-name">{{ cat.label }}</span>
                  <span class="mini-val" :style="{ color: scoreColor(details[entry.id][cat.key]) }">
                    {{ details[entry.id][cat.key] }}
                  </span>
                </div>
                <div class="bar-track">
                  <div
                    class="bar-fill"
                    :style="{
                      width: details[entry.id][cat.key] + '%',
                      background: `linear-gradient(90deg, ${scoreColor(details[entry.id][cat.key])}55, ${scoreColor(details[entry.id][cat.key])})`
                    }"
                  />
                </div>
              </div>
            </div>

            <!-- Skills -->
            <div class="detail-skills">
              <div>
                <div class="card-label">Skills Found</div>
                <div class="tag-cloud">
                  <span v-for="s in details[entry.id].found_skills" :key="s" class="tag tag-found">{{ s }}</span>
                </div>
              </div>
              <div>
                <div class="card-label">Missing Skills</div>
                <div class="tag-cloud">
                  <span v-for="s in details[entry.id].missing_skills" :key="s" class="tag tag-missing">{{ s }}</span>
                </div>
              </div>
            </div>

            <!-- Recommendations -->
            <div class="card-label" style="margin-top:16px">Recommendations</div>
            <div v-for="(r, i) in details[entry.id].recommendations" :key="i" class="rec-item">
              <div class="rec-num">{{ i + 1 }}</div>
              <span>{{ r }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <button v-if="!loading" class="refresh-btn" @click="load">↻ Refresh</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { connectWallet, isConnected, readContract, shortAddress } from '../client'

const entries       = ref<any[]>([])
const details       = ref<Record<number, any>>({})
const expanded      = ref<Set<number>>(new Set())
const loadingDetail = ref<Set<number>>(new Set())
const loading       = ref(true)
const error         = ref('')

const categories = [
  { key: 'technical_score',    label: 'Technical Skills'      },
  { key: 'experience_score',   label: 'Work Experience'       },
  { key: 'education_score',    label: 'Education & Certs'     },
  { key: 'achievements_score', label: 'Achievements & Impact' },
  { key: 'presentation_score', label: 'CV Presentation & ATS' },
]

async function load() {
  loading.value = true; error.value = ''
  try {
    if (!isConnected.value) await connectWallet()
    const data = await readContract('get_all_analyses', [])
    entries.value = Array.isArray(data) ? [...data].reverse() : []
  } catch (e: any) {
    error.value = 'Could not fetch archive: ' + e.message
  } finally { loading.value = false }
}

async function toggleExpand(id: number) {
  if (expanded.value.has(id)) { expanded.value.delete(id); return }
  expanded.value.add(id)
  if (!details.value[id]) {
    loadingDetail.value.add(id)
    try {
      const full = await readContract('get_analysis', [id])
      details.value[id] = full
    } catch {}
    finally { loadingDetail.value.delete(id) }
  }
}

function scoreColor(s: number): string {
  return s >= 80 ? 'var(--green)' : s >= 60 ? 'var(--amber)' : 'var(--red)'
}
function verdictClass(v: string): string {
  if (v === 'STRONG FIT')  return 'verdict verdict-STRONG'
  if (v === 'GOOD FIT')    return 'verdict verdict-GOOD'
  if (v === 'PARTIAL FIT') return 'verdict verdict-PARTIAL'
  return 'verdict verdict-NOT'
}
function shortAddr(a: string): string { return shortAddress(a) }

onMounted(load)
</script>

<style scoped>
/* Archive header */
.archive-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 36px;
}
.head-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-dim);
  border: 1px solid var(--border2);
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 10px;
}
.head-title {
  font-family: var(--font-head);
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -1px;
  margin-bottom: 6px;
}
.head-sub { font-size: 14px; color: var(--muted); }
.count-pill {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
}

/* States */
.state-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 60px 20px;
  text-align: center;
}
.empty-icon { font-size: 44px; }
.error-box {
  background: var(--red-dim);
  border: 1px solid var(--red-bdr);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 13px;
  color: var(--red);
}

/* Entry list */
.entry-list { display: flex; flex-direction: column; gap: 10px; }

.entry-card {
  cursor: pointer;
  border-radius: 16px;
  transition: all 0.2s;
}

.entry-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.entry-id {
  font-family: var(--font-num);
  font-size: 11px;
  font-weight: 700;
  color: var(--dim);
  width: 28px;
  flex-shrink: 0;
}
.entry-info { flex: 1; min-width: 0; }
.entry-role {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.entry-addr { font-size: 11px; color: var(--dim); margin-top: 2px; }
.entry-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.entry-score {
  font-family: var(--font-num);
  font-size: 20px;
  font-weight: 800;
  min-width: 36px;
  text-align: right;
}
.expand-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--surf2);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dim);
  transition: all 0.2s;
}
.expand-open {
  background: var(--accent-dim);
  border-color: var(--border2);
  color: var(--accent);
  transform: rotate(180deg);
}

/* Detail panel */
.entry-detail {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}
.detail-summary {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.7;
  margin-bottom: 18px;
}
.detail-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 13px;
}

.detail-bars { margin-bottom: 16px; }
.mini-bar { margin-bottom: 12px; }
.mini-meta { display: flex; justify-content: space-between; margin-bottom: 4px; }
.mini-name { font-size: 12px; color: var(--muted); }
.mini-val { font-size: 12px; font-weight: 700; font-family: var(--font-num); }

.detail-skills {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 4px;
}
.tag-cloud { display: flex; flex-wrap: wrap; gap: 5px; }
.tag { font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 20px; }
.tag-found   { background: var(--green-dim); border: 1px solid var(--green-bdr); color: var(--green); }
.tag-missing { background: var(--red-dim);   border: 1px solid var(--red-bdr);   color: var(--red); }

.rec-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 10px;
  font-size: 13px;
  color: var(--muted);
  line-height: 1.7;
}
.rec-num {
  min-width: 20px;
  height: 20px;
  background: var(--accent-dim);
  border: 1px solid var(--border2);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: var(--accent);
  font-family: var(--font-num);
  flex-shrink: 0;
}

/* Bar components */
.bar-track { height: 6px; background: var(--surf2); border-radius: 3px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 3px; animation: barFill 1s cubic-bezier(0.16,1,0.3,1) both; }

.refresh-btn {
  display: block;
  margin: 28px auto 0;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  color: var(--muted);
  font-size: 13px;
  font-family: var(--font-body);
  padding: 9px 24px;
  cursor: pointer;
  transition: all 0.2s;
}
.refresh-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
</style>
