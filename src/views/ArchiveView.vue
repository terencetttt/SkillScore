<template>
  <div class="page">
    <!-- Header -->
    <div class="archive-head">
      <div>
        <div class="head-badge">On-Chain Archive</div>
        <h1 class="head-title">All CV Analyses</h1>
        <p class="head-sub">Every analysis stored on-chain - immutable, public, verifiable.</p>
      </div>
      <div v-if="!loading" class="count-pill">
        {{ entries.length }} {{ entries.length === 1 ? 'analysis' : 'analyses' }}
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state-center">
      <div class="spinner" style="width:28px;height:28px;border-width:3px" />
      <span style="color:var(--muted)">Fetching from chain...</span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-box">! {{ error }}</div>

    <!-- Empty -->
    <div v-else-if="entries.length === 0" class="state-center">
      <div class="empty-icon">[ ]</div>
      <p style="color:var(--muted);font-size:14px">No analyses on chain yet. Be the first!</p>
      <router-link to="/" class="btn-ghost" style="display:inline-block;margin-top:12px">Score a CV -></router-link>
    </div>

    <!-- Entry list -->
    <div v-else class="entry-list">
      <div
        v-for="entry in entries"
        :key="entry.id"
        class="card entry-card"
        @click="openScore(entry.id)"
      >
        <!-- Summary row -->
        <div class="entry-row">
          <div class="entry-id">#{{ Number(entry.id) + 1 }}</div>
          <div class="entry-info">
            <div class="entry-role">{{ entry.target_role }}</div>
            <div class="entry-addr">{{ shortAddr(entry.submitter) }}</div>
          </div>
          <div class="entry-right">
            <div class="entry-score" :style="{ color: scoreColor(Number(entry.overall_score)) }">
              {{ entry.overall_score }}
            </div>
            <span :class="verdictClass(entry.verdict)">{{ entry.verdict }}</span>
            <div class="view-btn">
              View
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button v-if="!loading" class="refresh-btn" @click="load">Refresh</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { connectWallet, isConnected, readContract, shortAddress } from '../client'

const router        = useRouter()
const entries       = ref<any[]>([])
const loading       = ref(true)
const error         = ref('')

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

function openScore(id: any) {
  const sid = id != null ? String(id) : null
  if (sid) router.push('/score/' + sid)
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
  color: var(--yellow);
  background: var(--y-dim);
  border: 1px solid var(--border2);
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 10px;
}
.head-title {
  font-family: var(--font-h);
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -1px;
  margin-bottom: 6px;
}
.head-sub { font-size: 14px; color: var(--muted); }
.count-pill {
  background: var(--card2);
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
.empty-icon { font-size: 44px; color: var(--dim); }
.error-box {
  background: var(--r-dim);
  border: 1px solid var(--r-bdr);
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
.entry-card:hover {
  border-color: var(--yellow);
  box-shadow: var(--shadow);
  transform: translateY(-1px);
}

.entry-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.entry-id {
  font-family: var(--font-n);
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
  font-family: var(--font-n);
  font-size: 20px;
  font-weight: 800;
  min-width: 36px;
  text-align: right;
}
.view-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 12px;
  border-radius: 8px;
  background: var(--y-dim);
  border: 1px solid var(--border);
  color: var(--yellow);
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
}
.entry-card:hover .view-btn {
  background: var(--yellow);
  color: #070C24;
}

.refresh-btn {
  display: block;
  margin: 28px auto 0;
  background: var(--card2);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  color: var(--muted);
  font-size: 13px;
  font-family: var(--font-b);
  padding: 9px 24px;
  cursor: pointer;
  transition: all 0.2s;
}
.refresh-btn:hover { border-color: var(--yellow); color: var(--yellow); background: var(--y-dim); }
</style>
