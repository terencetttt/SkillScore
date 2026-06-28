<template>
  <div class="page">
    <!-- Hero -->
    <div class="hero">
      <div class="hero-badge">Powered by GenLayer Bradbury</div>
      <h1 class="hero-title">
        Know your CV score<br />
        <span class="hero-gradient">before the interview.</span>
      </h1>
      <p class="hero-sub">
        Score your CV against any role using AI validators.
        Results are immutable, verifiable, and stored on-chain forever.
      </p>
      <div class="hero-features">
        <span class="feat">PDF Upload</span>
        <span class="feat">Role-Specific</span>
        <span class="feat">On-Chain Results</span>
        <span class="feat">AI Validators</span>
        <span class="feat">5 Dimensions</span>
      </div>
    </div>

    <!-- Input form -->
    <div v-if="!result && !isSubmitting && !timedOut" class="form-wrap">
      <div class="card form-card">
        <!-- Tabs -->
        <div class="tabs">
          <button :class="['tab', inputMode === 'pdf' ? 'tab-active' : '']" @click="inputMode = 'pdf'">
            <span>📄</span> Upload PDF
          </button>
          <button :class="['tab', inputMode === 'text' ? 'tab-active' : '']" @click="inputMode = 'text'">
            <span>✏️</span> Paste Text
          </button>
        </div>

        <!-- PDF drop -->
        <div
          v-if="inputMode === 'pdf'"
          class="drop-zone"
          :class="{ 'drop-over': dragOver, 'drop-done': cvFile && !isExtracting }"
          @click="fileInput?.click()"
          @dragover.prevent="dragOver = true"
          @dragleave="dragOver = false"
          @drop.prevent="onDrop"
        >
          <input ref="fileInput" type="file" accept=".pdf" style="display:none" @change="onFileChange" />
          <div v-if="isExtracting" class="drop-inner">
            <div class="spinner" />
            <span>Extracting text from PDF…</span>
          </div>
          <div v-else-if="cvFile" class="drop-inner">
            <div class="drop-icon drop-icon-done"></div>
            <span class="drop-name">{{ cvFile.name }}</span>
            <span class="drop-hint">Click to replace</span>
          </div>
          <div v-else class="drop-inner">
            <div class="drop-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <span class="drop-main">Drop your CV here or click to browse</span>
            <span class="drop-hint">PDF only · max 10 MB</span>
          </div>
        </div>

        <!-- Text area -->
        <textarea
          v-if="inputMode === 'text'"
          v-model="cvText"
          class="cv-textarea"
          placeholder="Paste your full CV text here…"
          rows="10"
        />

        <!-- Target role -->
        <div class="field-group">
          <label class="field-label">Target Role</label>
          <input
            v-model="targetRole"
            type="text"
            class="input-field"
            placeholder="e.g. Backend Engineer, Product Manager, Data Analyst…"
            @keydown.enter="submit"
          />
        </div>

        <!-- Experience level -->
        <div class="field-group">
          <label class="field-label">Experience Level</label>
          <div class="level-group">
            <button
              v-for="lvl in levels"
              :key="lvl.id"
              :class="['level-btn', expLevel === lvl.id ? 'level-active' : '']"
              @click="expLevel = lvl.id"
            >
              {{ lvl.label }}
            </button>
          </div>
        </div>

        <!-- Error -->
        <div v-if="error" class="error-box">
          <span>⚠</span> {{ error }}
        </div>

        <!-- Submit -->
        <button class="btn-primary" :disabled="isSubmitting" @click="submit">
          Submit CV to Bradbury Chain
        </button>

        <div class="chain-note">
          <span class="chain-dot-live" /> AI consensus · results stored on-chain
        </div>
      </div>
    </div>

    <!-- Consensus tracker -->
    <div v-if="isSubmitting" class="tracker-wrap fade-up">
      <div class="card tracker-card">
        <div class="tracker-header">
          <div class="tracker-pulse" />
          <span class="tracker-title">AI Validators Working</span>
        </div>
        <div class="stages">
          <div v-for="(stage, i) in stages" :key="stage.name" class="stage">
            <div class="stage-line" v-if="i > 0" :class="{ 'line-done': currentStage > i }" />
            <div class="stage-node" :class="{
              'node-done':    currentStage > i,
              'node-active':  currentStage === i,
              'node-pending': currentStage < i,
            }">
              <span v-if="currentStage > i" class="node-check">✓</span>
              <div v-else-if="currentStage === i" class="spinner" />
              <span v-else class="node-num">{{ i + 1 }}</span>
            </div>
            <span class="stage-label" :class="{
              'label-done':   currentStage > i,
              'label-active': currentStage === i,
            }">{{ stage.name }}</span>
          </div>
        </div>
        <div v-if="txHash" class="tx-row">
          TX: <a :href="`https://explorer-bradbury.genlayer.com/tx/${txHash}`" target="_blank" class="tx-link">
            {{ shortHash(txHash) }} ↗
          </a>
        </div>
        <p class="tracker-note">AI validators are independently scoring your CV</p>
      </div>
    </div>

    <!-- Timed out -->
    <div v-if="timedOut && !isSubmitting && !result" class="tracker-wrap fade-up">
      <div class="card tracker-card" style="text-align:center">
        <div style="font-size:40px;margin-bottom:12px">⏳</div>
        <div class="card-label">Still Processing</div>
        <p style="font-size:13px;color:var(--muted);margin-bottom:20px;line-height:1.7">
          Your transaction is on-chain and being processed. Validators are running — click below to check if results are ready.
        </p>
        <div v-if="error" class="error-box" style="margin-bottom:16px;text-align:left">⚠ {{ error }}</div>
        <button class="btn-primary" @click="checkResults" style="max-width:260px;margin:0 auto">
          Check Results Now
        </button>
        <p style="font-size:11px;color:var(--dim);margin-top:12px">Try every 1–2 minutes</p>
      </div>
    </div>

    <!-- Results -->
    <div v-if="result" class="results fade-up">
      <div class="results-header">
        <div>
          <h2 class="results-title">Analysis Complete</h2>
          <p class="results-meta">
            <span class="meta-role">{{ targetRole }}</span>
            · {{ expLevel }} level
          </p>
        </div>
        <button class="btn-ghost" @click="reset">← Analyze Another</button>
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
                  stroke: scoreColor(result.overall_score),
                  strokeDashoffset: ringOffset(result.overall_score)
                }"
              />
              <defs>
                <filter id="glow-filter">
                  <feGaussianBlur stdDeviation="3" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
            </svg>
            <div class="ring-inner">
              <span class="ring-score" :style="{ color: scoreColor(result.overall_score) }">
                {{ result.overall_score }}
              </span>
              <span class="ring-label">{{ scoreLabel(result.overall_score) }}</span>
            </div>
          </div>
          <div class="score-footer">
            <span :class="verdictClass(result.verdict)">{{ result.verdict }}</span>
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
              <div class="ats-dot-big" :style="{ background: atsColor(result.ats_compatibility) }" />
              <span class="ats-score" :style="{ color: atsColor(result.ats_compatibility) }">
                {{ result.ats_compatibility }}
              </span>
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
              <span class="bar-val" :style="{ color: scoreColor(result[cat.key]) }">
                {{ result[cat.key] }}
              </span>
            </div>
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{
                  width: result[cat.key] + '%',
                  background: `linear-gradient(90deg, ${scoreColor(result[cat.key])}66, ${scoreColor(result[cat.key])})`,
                  boxShadow: `0 0 12px ${scoreColor(result[cat.key])}40`,
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
            <span v-for="s in result.found_skills" :key="s" class="tag tag-found">{{ s }}</span>
          </div>
        </div>
        <div class="card">
          <div class="card-label">Missing for Role</div>
          <div class="tag-cloud">
            <span v-for="s in result.missing_skills" :key="s" class="tag tag-missing">{{ s }}</span>
          </div>
        </div>
      </div>

      <!-- Strengths + Recommendations -->
      <div class="bottom-grid">
        <div class="card">
          <div class="card-label">Key Strengths</div>
          <div v-for="(s, i) in result.strengths" :key="i" class="strength-item">
            <div class="strength-icon">✓</div>
            <span>{{ s }}</span>
          </div>
        </div>
        <div class="card">
          <div class="card-label">How to Improve</div>
          <div v-for="(r, i) in result.recommendations" :key="i" class="rec-item">
            <div class="rec-num">{{ i + 1 }}</div>
            <span>{{ r }}</span>
          </div>
        </div>
      </div>

      <!-- On-chain proof -->
      <div v-if="txHash" class="proof-bar">
        
        <span>Analysis stored on-chain — immutable & publicly verifiable</span>
        <a :href="`https://explorer-bradbury.genlayer.com/tx/${txHash}`" target="_blank" class="tx-link">
          View on explorer ↗
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import { connectWallet, walletAddress, isConnected, writeWithRetry, readContract, pollTxStatus } from '../client'

;(pdfjsLib as any).GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${(pdfjsLib as any).version}/build/pdf.worker.min.js`

const inputMode   = ref<'pdf' | 'text'>('pdf')
const cvFile      = ref<File | null>(null)
const cvText      = ref('')
const targetRole  = ref('')
const expLevel    = ref('mid')
const dragOver    = ref(false)
const isExtracting = ref(false)
const isSubmitting = ref(false)
const currentStage = ref(0)
const txHash      = ref('')
const result      = ref<any>(null)
const error       = ref('')
const timedOut    = ref(false)
const fileInput   = ref<HTMLInputElement | null>(null)

let statusInterval: ReturnType<typeof setInterval> | null = null

const levels = [
  { id: 'entry',  label: 'Entry'     },
  { id: 'mid',    label: 'Mid-Level' },
  { id: 'senior', label: 'Senior'    },
]

const stages = [
  { name: 'Submitted'  },
  { name: 'Proposing'  },
  { name: 'Committing' },
  { name: 'Revealing'  },
  { name: 'Accepted'   },
]

const categories = [
  { key: 'technical_score',    label: 'Technical Skills'      },
  { key: 'experience_score',   label: 'Work Experience'       },
  { key: 'education_score',    label: 'Education & Certs'     },
  { key: 'achievements_score', label: 'Achievements & Impact' },
  { key: 'presentation_score', label: 'CV Presentation & ATS' },
]

const expMap: Record<string, string> = {
  entry:  'entry/graduate (0–2 years)',
  mid:    'mid-level (2–5 years)',
  senior: 'senior (5+ years)',
}

async function extractPdf(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  const pdf = await (pdfjsLib as any).getDocument({ data: buf }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((item: any) => ('str' in item ? item.str : '')).join(' ') + '\n'
  }
  return text.trim()
}

async function handleFile(file: File) {
  if (!file) return
  if (file.type !== 'application/pdf') { error.value = 'Only PDF files are accepted.'; return }
  if (file.size > 10 * 1024 * 1024) { error.value = 'File too large. Max 10 MB.'; return }
  cvFile.value = file; error.value = ''; isExtracting.value = true
  try { cvText.value = await extractPdf(file) }
  catch { error.value = 'Could not extract text. Use Paste Text instead.'; inputMode.value = 'text' }
  finally { isExtracting.value = false }
}

function onFileChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) handleFile(f)
}
function onDrop(e: DragEvent) {
  dragOver.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) handleFile(f)
}

async function submit() {
  if (!cvText.value.trim()) { error.value = 'Please provide your CV.'; return }
  if (!targetRole.value.trim()) { error.value = 'Please enter a target role.'; return }
  error.value = ''

  if (!isConnected.value) {
    try { await connectWallet() }
    catch (e: any) { error.value = e.message; return }
  }

  isSubmitting.value = true; currentStage.value = 0; result.value = null; txHash.value = ''

  try {
    const { hash } = await writeWithRetry(
      'submit_cv',
      [cvText.value, targetRole.value, expMap[expLevel.value]],
      (h) => {
        txHash.value = h; currentStage.value = 1
        statusInterval = setInterval(async () => {
          const s = await pollTxStatus(h)
          if (s >= 1) currentStage.value = Math.min(s, 4)
          if (s >= 4 && statusInterval) clearInterval(statusInterval)
        }, 8000)
      },
    )
    currentStage.value = 4
    if (statusInterval) clearInterval(statusInterval)
    const data = await readContract('get_user_latest', [walletAddress.value])
    result.value = data; txHash.value = hash
  } catch (e: any) {
    const msg = e.message || ''
    if (msg.includes('Timed out') || msg.includes('timeout') || msg.includes('current status')) {
      timedOut.value = true
    } else { error.value = msg }
  } finally {
    isSubmitting.value = false
    if (statusInterval) clearInterval(statusInterval)
  }
}

async function checkResults() {
  if (!walletAddress.value) return
  timedOut.value = false; error.value = ''
  try {
    const data = await readContract('get_user_latest', [walletAddress.value])
    if (data) { result.value = data }
    else { timedOut.value = true; error.value = 'Not ready yet — try again in 1–2 minutes.' }
  } catch { timedOut.value = true; error.value = 'Could not fetch yet. Try again shortly.' }
}

function reset() {
  result.value = null; cvFile.value = null; cvText.value = ''
  targetRole.value = ''; txHash.value = ''; error.value = ''
  timedOut.value = false; currentStage.value = 0; inputMode.value = 'pdf'
}

onUnmounted(() => { if (statusInterval) clearInterval(statusInterval) })

function scoreColor(s: number): string {
  return 'var(--accent)'
}
function scoreLabel(s: number): string {
  return s >= 85 ? 'Excellent' : s >= 70 ? 'Good' : s >= 55 ? 'Fair' : 'Needs Work'
}
function verdictClass(v: string): string {
  return 'verdict verdict-all'
}
function atsColor(a: string): string {
  return 'var(--accent)'
}
function shortHash(h: string): string { return h.slice(0, 8) + '…' + h.slice(-6) }

const CIRCUMFERENCE = 2 * Math.PI * 58 // ≈ 364.4
function ringOffset(score: number): number {
  return CIRCUMFERENCE * (1 - score / 100)
}
</script>

<style scoped>
.hero { text-align: center; margin-bottom: 40px; }
.hero-badge { display: inline-block; font-size: 11px; font-weight: 600; color: var(--yellow); background: var(--y-dim); border: 1px solid var(--border); padding: 4px 14px; border-radius: 20px; margin-bottom: 18px; }
.hero-title { font-family: var(--font-h); font-size: 42px; font-weight: 900; line-height: 1.1; letter-spacing: -2px; color: var(--text); margin-bottom: 20px; }
.hero-gradient { color: var(--yellow); }
.hero-features { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.feat { font-size: 12px; color: var(--muted); background: var(--card); border: 1px solid var(--border); padding: 5px 14px; border-radius: 20px; font-weight: 500; }

.form-wrap { max-width: 540px; margin: 0 auto; }
.form-card { padding: 26px; }

.tabs { display: flex; gap: 4px; margin-bottom: 18px; background: var(--card2); border-radius: 10px; padding: 3px; }
.tab { flex: 1; padding: 9px; background: transparent; border: none; border-radius: 8px; color: var(--muted); font-size: 13px; font-family: var(--font-b); cursor: pointer; transition: all .2s; font-weight: 500; }
.tab-active { background: var(--card); color: var(--yellow); font-weight: 700; }

.drop-zone { border: 2px dashed var(--border); border-radius: 14px; padding: 32px 20px; text-align: center; cursor: pointer; background: var(--card2); transition: all .2s; margin-bottom: 18px; }
.drop-zone:hover, .drop-over { border-color: var(--yellow); background: var(--y-dim); }
.drop-done { border-color: var(--green) !important; border-style: solid !important; background: var(--g-dim) !important; }
.drop-inner { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.drop-icon { width: 48px; height: 48px; border-radius: 12px; background: var(--y-dim); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--yellow); margin-bottom: 4px; }
.drop-main { font-weight: 600; font-size: 14px; color: var(--text); }
.drop-name { font-weight: 600; font-size: 14px; color: var(--green); }
.drop-hint { font-size: 12px; color: var(--dim); }

.cv-textarea { width: 100%; padding: 12px 14px; background: var(--card2); border: 1.5px solid var(--border); border-radius: 10px; color: var(--text); font-size: 13px; font-family: var(--font-b); resize: vertical; outline: none; transition: all .2s; margin-bottom: 18px; line-height: 1.6; }
.cv-textarea:focus { border-color: var(--yellow); box-shadow: 0 0 0 3px var(--y-dim); }
.cv-textarea::placeholder { color: var(--dim); }

.field-group { margin-bottom: 16px; }
.field-label { display: block; font-size: 10px; color: var(--dim); font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }

.level-group { display: flex; gap: 8px; }
.level-btn { flex: 1; padding: 10px; background: var(--card2); border: 1.5px solid var(--border); border-radius: 10px; color: var(--muted); font-size: 13px; font-family: var(--font-b); cursor: pointer; transition: all .2s; }
.level-btn:hover { border-color: var(--yellow); color: var(--yellow); background: var(--y-dim); }
.level-active { background: var(--y-dim) !important; border-color: var(--yellow) !important; color: var(--yellow) !important; font-weight: 700; }

.error-box { display: flex; align-items: center; gap: 8px; background: var(--r-dim); border: 1px solid var(--r-bdr); border-radius: 10px; padding: 10px 14px; font-size: 13px; color: var(--red); margin-bottom: 14px; }
.chain-note { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 12px; font-size: 11px; color: var(--dim); }
.chain-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); box-shadow: 0 0 6px var(--green); animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }

.tracker-wrap { max-width: 540px; margin: 0 auto; }
.tracker-card { padding: 30px; }
.tracker-hd { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 26px; }
.tracker-pulse { width: 10px; height: 10px; border-radius: 50%; background: var(--yellow); animation: pulse-ring 1.5s ease-in-out infinite; }
@keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(255,215,0,.5); } 70% { box-shadow: 0 0 0 10px rgba(255,215,0,0); } 100% { box-shadow: 0 0 0 0 rgba(255,215,0,0); } }
.tracker-title { font-family: var(--font-h); font-size: 16px; font-weight: 700; }
.stages { display: flex; align-items: flex-start; justify-content: center; margin-bottom: 20px; }
.stage { display: flex; flex-direction: column; align-items: center; gap: 7px; flex: 1; position: relative; }
.stage-line { position: absolute; top: 16px; left: -50%; right: 50%; height: 2px; background: var(--border); z-index: 0; transition: background .3s; }
.line-done { background: var(--yellow); }
.stage-node { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; position: relative; z-index: 1; transition: all .3s; }
.node-done   { background: var(--yellow); color: #070C24; }
.node-active { background: var(--y-dim); border: 2px solid var(--yellow); }
.node-pending{ background: var(--card2); border: 2px solid var(--border); color: var(--dim); }
.node-check  { color: #070C24; font-size: 14px; }
.stage-label { font-size: 10px; color: var(--dim); text-align: center; }
.label-done,.label-active { color: var(--yellow); font-weight: 600; }
.tx-row { font-size: 12px; color: var(--dim); text-align: center; margin-bottom: 8px; }
.tx-link { color: var(--yellow); text-decoration: none; font-weight: 600; }
.tx-link:hover { text-decoration: underline; }
.tracker-note { font-size: 12px; color: var(--dim); text-align: center; }

.results {}
.results-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; }
.results-title { font-family: var(--font-h); font-size: 22px; font-weight: 800; letter-spacing: -.5px; margin-bottom: 4px; }
.results-meta { font-size: 13px; color: var(--muted); }
.meta-role { color: var(--yellow); font-weight: 600; }

.top-grid { display: grid; grid-template-columns: 210px 1fr; gap: 14px; margin-bottom: 14px; }
.score-card { text-align: center; padding: 24px 16px; }
.ring-wrap { position: relative; width: 150px; height: 150px; margin: 0 auto 14px; }
.score-ring { width: 100%; height: 100%; transform: rotate(-90deg); }
.ring-track { fill: none; stroke: var(--card2); stroke-width: 10; }
.ring-fill { fill: none; stroke-width: 10; stroke-linecap: round; stroke-dasharray: 364.4; stroke-dashoffset: 364.4; transition: stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1); }
.ring-inner { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); text-align: center; }
.ring-score { display: block; font-family: var(--font-n); font-size: 40px; font-weight: 800; line-height: 1; letter-spacing: -2px; }
.ring-label { display: block; font-size: 10px; color: var(--dim); text-transform: uppercase; letter-spacing: 2px; margin-top: 3px; }
.score-footer {}
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

.bottom-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 14px; margin-bottom: 14px; }
.strength-item { display: flex; gap: 9px; align-items: flex-start; margin-bottom: 10px; font-size: 13px; color: var(--muted); line-height: 1.65; }
.s-icon { width: 18px; height: 18px; background: var(--g-dim); border: 1px solid var(--g-bdr); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--green); font-size: 9px; flex-shrink: 0; margin-top: 1px; }
.rec-item { display: flex; gap: 9px; align-items: flex-start; margin-bottom: 12px; font-size: 13px; color: var(--muted); line-height: 1.7; }
.rec-num { min-width: 20px; height: 20px; background: var(--y-dim); border: 1px solid var(--border); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: var(--yellow); font-family: var(--font-n); flex-shrink: 0; }

.proof-bar { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 12px; background: var(--card); border: 1px solid var(--border); border-radius: 12px; font-size: 12px; color: var(--dim); }
</style>
