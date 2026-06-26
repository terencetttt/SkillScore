<template>
  <div class="page">
    <div class="archive-header">
      <div>
        <h1 class="archive-title">On-Chain Archive</h1>
        <p class="archive-sub">
          All CV analyses stored on GenLayer Bradbury — immutable, public, verifiable.
        </p>
      </div>
      <div class="count-badge" v-if="!loading">
        {{ entries.length }} {{ entries.length === 1 ? 'analysis' : 'analyses' }}
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="empty-state">
      <div class="spinner" />
      <span>Fetching from chain…</span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-box">⚠ {{ error }}</div>

    <!-- Empty -->
    <div v-else-if="entries.length === 0" class="empty-state">
      <span style="font-size:36px">📭</span>
      <p>No analyses on chain yet. Be the first to submit a CV!</p>
      <router-link to="/" class="btn-ghost" style="display:inline-block; margin-top:8px">
        Score a CV →
      </router-link>
    </div>

    <!-- Entries -->
    <div v-else class="entries">
      <div
        v-for="entry in entries"
        :key="entry.id"
        class="entry-card card"
        @click="toggleExpand(entry.id)"
      >
        <!-- Summary row -->
        <div class="entry-row">
          <div class="entry-left">
            <span class="entry-id">#{{ entry.id + 1 }}</span>
            <div>
              <div class="entry-role">{{ entry.target_role }}</div>
              <div class="entry-sub">{{ shortAddr(entry.submitter) }}</div>
            </div>
          </div>
          <div class="entry-right">
            <div class="entry-score" :style="{ color: scoreColor(entry.overall_score) }">
              {{ entry.overall_score }}
            </div>
            <span :class="verdictClass(entry.verdict)">{{ entry.verdict }}</span>
            <span class="expand-icon">{{ expanded.has(entry.id) ? '▲' : '▼' }}</span>
          </div>
        </div>

        <!-- Expanded detail -->
        <div v-if="expanded.has(entry.id)" class="entry-detail fade-up">
          <p class="detail-summary">{{ entry.summary }}</p>

          <!-- Load full detail if not yet fetched -->
          <div v-if="loadingDetail.has(entry.id)" style="display:flex;align-items:center;gap:8px;color:var(--muted);font-size:13px;margin-top:12px">
            <div class="spinner" /> Loading full details…
          </div>
          <template v-else-if="details[entry.id]">
            <div class="detail-bars">
              <div v-for="cat in categories" :key="cat.key" class="det-bar">
                <div class="det-row">
                  <span class="det-name">{{ cat.label }}</span>
                  <span class="det-score" :style="{ color: scoreColor(details[entry.id][cat.key]) }">
                    {{ details[entry.id][cat.key] }}
                  </span>
                </div>
                <div class="bar-track">
                  <div
                    class="bar-fill"
                    :style="{
                      width: details[entry.id][cat.key] + '%',
                      background: `linear-gradient(90deg,${scoreColor(details[entry.id][cat.key])}55,${scoreColor(details[entry.id][cat.key])})`
                    }"
                  />
                </div>
              </div>
            </div>

            <div class="detail-skills">
              <div class="ds-col">
                <div class="card-label">Skills Found</div>
                <div class="tag-cloud">
                  <span v-for="s in details[entry.id].found_skills" :key="s" class="tag tag-found">{{ s }}</span>
                </div>
              </div>
              <div class="ds-col">
                <div class="card-label">Missing Skills</div>
                <div class="tag-cloud">
                  <span v-for="s in details[entry.id].missing_skills" :key="s" class="tag tag-missing">{{ s }}</span>
                </div>
              </div>
            </div>

            <div class="detail-recs">
              <div class="card-label">Recommendations</div>
              <div v-for="(r, i) in details[entry.id].recommendations" :key="i" class="rec-item">
                <div class="rec-num">{{ i + 1 }}</div>
                <span>{{ r }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <button v-if="!loading" class="btn-refresh" @click="load">↻ Refresh</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { connectWallet, isConnected, readContract, shortAddress } from '../client'

const entries     = ref<any[]>([])
const details     = ref<Record<number, any>>({})
const expanded    = ref<Set<number>>(new Set())
const loadingDetail = ref<Set<number>>(new Set())
const loading     = ref(true)
const error       = ref('')

const categories = [
  { key: 'technical_score',    label: 'Technical Skills'      },
  { key: 'experience_score',   label: 'Work Experience'       },
  { key: 'education_score',    label: 'Education & Certs'     },
  { key: 'achievements_score', label: 'Achievements & Impact' },
  { key: 'presentation_score', label: 'CV Presentation & ATS' },
]

async function load() {
  loading.value = true
  error.value = ''
  try {
    if (!isConnected.value) await connectWallet()
    const data = await readContract('get_all_analyses', [])
    entries.value = Array.isArray(data) ? data.reverse() : []
  } catch (e: any) {
    error.value = 'Could not fetch archive: ' + e.message
  } finally {
    loading.value = false
  }
}

async function toggleExpand(id: number) {
  if (expanded.value.has(id)) {
    expanded.value.delete(id)
    return
  }
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
  return s >= 80 ? '#34D399' : s >= 60 ? '#FBBF24' : '#F87171'
}

function verdictClass(v: string): string {
  if (v === 'STRONG FIT')  return 'verdict verdict-STRONG'
  if (v === 'GOOD FIT')    return 'verdict verdict-GOOD'
  if (v === 'PARTIAL FIT') return 'verdict verdict-PARTIAL'
  return 'verdict verdict-NOT'
}

function shortAddr(a: string): string {
  return shortAddress(a)
}

onMounted(load)
</script>

<style scoped>
.archive-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.archive-title {
  font-family: var(--font-head);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}

.archive-sub { font-size: 14px; color: var(--muted); }

.count-badge {
  background: var(--surfaceHi);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: var(--muted);
  font-size: 14px;
  text-align: center;
}

.error-box {
  background: rgba(248,113,113,0.08);
  border: 1px solid rgba(248,113,113,0.25);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 13px;
  color: #FCA5A5;
}

.entries { display: flex; flex-direction: column; gap: 10px; }

.entry-card {
  cursor: pointer;
  transition: border-color 0.2s;
}

.entry-card:hover { border-color: var(--borderHi); }

.entry-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.entry-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.entry-id {
  font-size: 11px;
  color: var(--dim);
  font-family: var(--font-head);
  font-weight: 600;
  flex-shrink: 0;
  width: 28px;
}

.entry-role {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.entry-sub { font-size: 11px; color: var(--dim); margin-top: 2px; }

.entry-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.entry-score {
  font-family: var(--font-head);
  font-size: 18px;
  font-weight: 800;
}

.expand-icon { font-size: 10px; color: var(--dim); }

/* Detail */
.entry-detail { margin-top: 18px; border-top: 1px solid var(--border); padding-top: 18px; }

.detail-summary {
  font-size: 13px;
  color: #C8D5EE;
  line-height: 1.7;
  margin-bottom: 16px;
}

.detail-bars { margin-bottom: 16px; }

.det-bar { margin-bottom: 14px; }

.det-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.det-name { font-size: 12px; color: var(--muted); }
.det-score { font-size: 13px; font-weight: 700; font-family: var(--font-head); }

.bar-track {
  height: 4px;
  background: var(--surfaceHi);
  border-radius: 2px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 2px;
  animation: barFill 1.2s cubic-bezier(0.16,1,0.3,1) forwards;
}

.detail-skills {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 16px;
}

.ds-col { }

.tag-cloud { display: flex; flex-wrap: wrap; gap: 5px; }

.tag {
  display: inline-block;
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 20px;
}

.tag-found   { background: rgba(52,211,153,0.10); border: 1px solid rgba(52,211,153,0.25); color: #34D399; }
.tag-missing { background: rgba(248,113,113,0.10); border: 1px solid rgba(248,113,113,0.25); color: #F87171; }

.detail-recs { }

.rec-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 12px;
  font-size: 13px;
  color: #C8D5EE;
  line-height: 1.7;
}

.rec-num {
  min-width: 20px;
  height: 20px;
  background: var(--violetDim);
  border: 1px solid rgba(124,58,237,0.4);
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: var(--violetLt);
  font-family: var(--font-head);
}

.btn-refresh {
  display: block;
  margin: 28px auto 0;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--muted);
  font-size: 12px;
  font-family: var(--font-body);
  padding: 8px 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover { border-color: var(--violet); color: var(--violetLt); }
</style>
