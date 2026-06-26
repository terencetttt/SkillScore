<template>
  <div class="page">
    <!-- Hero -->
    <div class="hero">
      <h1 class="hero-title">
        Score your CV.<br />
        <span class="hero-gradient">On-chain. For real.</span>
      </h1>
      <p class="hero-sub">
        AI validators on GenLayer Bradbury score your CV across 5 dimensions —
        technical skills, experience, education, achievements, and presentation.
        Results are immutable and publicly verifiable.
      </p>
    </div>

    <!-- Upload / Input form -->
    <div v-if="!result && !isSubmitting" class="form-section">
      <!-- PDF upload tab -->
      <div class="mode-tabs">
        <button :class="['mode-tab', inputMode === 'pdf' ? 'active' : '']" @click="inputMode = 'pdf'">
          📄 Upload PDF
        </button>
        <button :class="['mode-tab', inputMode === 'text' ? 'active' : '']" @click="inputMode = 'text'">
          ✏️ Paste Text
        </button>
      </div>

      <!-- PDF drop zone -->
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
        <div v-if="isExtracting" class="drop-content">
          <div class="spinner" />
          <span>Extracting text from PDF…</span>
        </div>
        <div v-else-if="cvFile" class="drop-content">
          <span style="font-size:28px">✅</span>
          <span class="drop-name">{{ cvFile.name }}</span>
          <span class="drop-hint">Click to replace</span>
        </div>
        <div v-else class="drop-content">
          <span style="font-size:32px">📄</span>
          <span class="drop-main">Drop your CV here, or click to browse</span>
          <span class="drop-hint">PDF only · max 10 MB</span>
        </div>
      </div>

      <!-- Text paste area -->
      <div v-if="inputMode === 'text'">
        <textarea
          v-model="cvText"
          class="cv-textarea"
          placeholder="Paste your full CV text here…"
          rows="12"
        />
      </div>

      <!-- Target role -->
      <label class="field-label">Target Role</label>
      <input
        v-model="targetRole"
        class="input-field"
        type="text"
        placeholder="e.g. Full Stack Engineer, Product Manager, Data Analyst…"
        style="margin-bottom: 16px"
        @keydown.enter="submit"
      />

      <!-- Experience level -->
      <label class="field-label">Experience Level</label>
      <div class="level-group">
        <button
          v-for="lvl in levels"
          :key="lvl.id"
          :class="['level-btn', expLevel === lvl.id ? 'active' : '']"
          @click="expLevel = lvl.id"
        >
          {{ lvl.icon }} {{ lvl.label }}
        </button>
      </div>

      <!-- Error -->
      <div v-if="error" class="error-box">⚠ {{ error }}</div>

      <!-- Submit -->
      <button class="btn-primary" :disabled="isSubmitting" @click="submit" style="margin-top: 4px">
        Submit CV to Bradbury Chain
      </button>

      <!-- Chain info pill -->
      <div class="chain-pill">
        <span class="chain-dot" />
        GenLayer Bradbury Testnet · Chain ID 4221 · Consensus takes 3–5 min
      </div>
    </div>

    <!-- Consensus tracker (while submitting) -->
    <div v-if="isSubmitting" class="consensus-section fade-up">
      <div class="card" style="text-align:center; padding: 36px 24px">
        <div class="card-label">Transaction Status</div>
        <div class="consensus-stages">
          <div
            v-for="(stage, i) in stages"
            :key="stage.name"
            class="stage"
            :class="{
              'stage-done':   currentStage > i,
              'stage-active': currentStage === i,
              'stage-pending': currentStage < i
            }"
          >
            <div class="stage-icon">
              <span v-if="currentStage > i">✓</span>
              <div v-else-if="currentStage === i" class="spinner" />
              <span v-else>{{ i + 1 }}</span>
            </div>
            <span class="stage-name">{{ stage.name }}</span>
          </div>
        </div>

        <p v-if="txHash" class="tx-hash-line">
          TX:
          <a
            :href="`https://explorer-bradbury.genlayer.com/tx/${txHash}`"
            target="_blank"
            class="tx-link"
          >{{ shortHash(txHash) }} ↗</a>
        </p>
        <p class="consensus-note">
          AI validators are independently analyzing your CV — this takes 3–5 minutes.
        </p>
      </div>
    </div>

    <!-- Results -->
    <div v-if="result" class="results-section fade-up">
      <div class="results-header">
        <div>
          <h2 class="results-title">Analysis Complete</h2>
          <p class="results-meta">
            {{ targetRole }} ·
            <span style="color: var(--muted)">{{ expLevel }} level</span>
          </p>
        </div>
        <button class="btn-ghost" @click="reset">← Analyze Another</button>
      </div>

      <!-- Score + Verdict row -->
      <div class="row-2" style="margin-bottom: 14px">
        <!-- Hex score card -->
        <div class="card" style="text-align:center; padding: 28px 20px">
          <div class="card-label">Overall Score</div>
          <div class="hex-wrap">
            <svg width="172" height="190" viewBox="0 0 172 190" fill="none">
              <polygon
                points="86,6 162,47 162,143 86,184 10,143 10,47"
                :fill="scoreColor(result.overall_score) + '14'"
                :stroke="scoreColor(result.overall_score)"
                stroke-width="1.5"
              />
              <polygon
                points="86,20 150,57 150,133 86,170 22,133 22,57"
                fill="none"
                :stroke="scoreColor(result.overall_score)"
                stroke-width="0.5"
                opacity="0.3"
              />
            </svg>
            <div class="hex-content">
              <span class="hex-score" :style="{ color: scoreColor(result.overall_score) }">
                {{ result.overall_score }}
              </span>
              <span class="hex-label">{{ scoreLabel(result.overall_score) }}</span>
            </div>
          </div>
          <span :class="verdictClass(result.verdict)">{{ result.verdict }}</span>
        </div>

        <!-- Summary + ATS -->
        <div style="display:flex; flex-direction:column; gap:12px">
          <div class="card" style="flex:1">
            <div class="card-label">Assessment</div>
            <p class="summary-text">{{ result.summary }}</p>
          </div>
          <div class="card">
            <div class="card-label">ATS Compatibility</div>
            <div class="ats-row">
              <span class="ats-dot" :style="{ background: atsColor(result.ats_compatibility) }" />
              <span class="ats-label" :style="{ color: atsColor(result.ats_compatibility) }">
                {{ result.ats_compatibility }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Score breakdown -->
      <div class="card" style="margin-bottom:14px">
        <div class="card-label">Score Breakdown</div>
        <div
          v-for="cat in categories"
          :key="cat.key"
          class="cat-bar"
        >
          <div class="cat-row">
            <span class="cat-name">{{ cat.label }}</span>
            <span class="cat-score" :style="{ color: scoreColor(result[cat.key]) }">
              {{ result[cat.key] }}
            </span>
          </div>
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{
                width: result[cat.key] + '%',
                background: `linear-gradient(90deg, ${scoreColor(result[cat.key])}55, ${scoreColor(result[cat.key])})`
              }"
            />
          </div>
        </div>
      </div>

      <!-- Skills grid -->
      <div class="row-2" style="margin-bottom:14px">
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
      <div class="row-strengths">
        <div class="card">
          <div class="card-label">Key Strengths</div>
          <div v-for="(s, i) in result.strengths" :key="i" class="strength-item">
            <span class="check">✓</span>
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
        <span>⛓ Stored on GenLayer Bradbury</span>
        <a
          :href="`https://explorer-bradbury.genlayer.com/tx/${txHash}`"
          target="_blank"
          class="tx-link"
        >View transaction ↗</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import { connectWallet, walletAddress, isConnected, writeWithRetry, readContract, pollTxStatus } from '../client'

// Worker for PDF.js (CDN)
;(pdfjsLib as any).GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${(pdfjsLib as any).version}/build/pdf.worker.min.js`

// ── State ─────────────────────────────────────────────────────────────
const inputMode = ref<'pdf' | 'text'>('pdf')
const cvFile    = ref<File | null>(null)
const cvText    = ref('')
const targetRole = ref('')
const expLevel  = ref<'entry' | 'mid' | 'senior'>('mid')
const dragOver  = ref(false)
const isExtracting = ref(false)
const isSubmitting = ref(false)
const currentStage = ref(0)
const txHash    = ref('')
const result    = ref<any>(null)
const error     = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

let statusInterval: ReturnType<typeof setInterval> | null = null

// ── Constants ─────────────────────────────────────────────────────────
const levels = [
  { id: 'entry',  icon: '🌱', label: 'Entry'     },
  { id: 'mid',    icon: '⚡', label: 'Mid-Level'  },
  { id: 'senior', icon: '🚀', label: 'Senior'    },
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

// ── PDF helpers ───────────────────────────────────────────────────────
async function extractPdf(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  const pdf = await (pdfjsLib as any).getDocument({ data: buf }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ') + '\n'
  }
  return text.trim()
}

async function handleFile(file: File) {
  if (!file) return
  if (file.type !== 'application/pdf') { error.value = 'Only PDF files are accepted.'; return }
  if (file.size > 10 * 1024 * 1024) { error.value = 'File is too large. Max 10 MB.'; return }
  cvFile.value = file
  error.value = ''
  isExtracting.value = true
  try {
    cvText.value = await extractPdf(file)
  } catch {
    error.value = 'Could not extract text. Please use the Paste Text tab instead.'
    inputMode.value = 'text'
  } finally {
    isExtracting.value = false
  }
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

// ── Submit ────────────────────────────────────────────────────────────
async function submit() {
  if (!cvText.value.trim()) { error.value = 'Please provide your CV content.'; return }
  if (!targetRole.value.trim()) { error.value = 'Please enter a target role.'; return }
  error.value = ''

  if (!isConnected.value) {
    try { await connectWallet() }
    catch (e: any) { error.value = e.message; return }
  }

  isSubmitting.value = true
  currentStage.value = 0
  result.value = null
  txHash.value = ''

  try {
    const { hash } = await writeWithRetry(
      'submit_cv',
      [cvText.value, targetRole.value, expMap[expLevel.value]],
      (h) => {
        txHash.value = h
        currentStage.value = 1

        // Poll for status updates
        statusInterval = setInterval(async () => {
          const s = await pollTxStatus(h)
          // Map GenLayer status numbers (0-5) to our 5-stage UI (0-4)
          if (s >= 1) currentStage.value = Math.min(s, 4)
          if (s >= 4) {
            if (statusInterval) clearInterval(statusInterval)
          }
        }, 8000)
      },
    )

    currentStage.value = 4
    if (statusInterval) clearInterval(statusInterval)

    // Fetch results from chain
    const data = await readContract('get_user_latest', [walletAddress.value])
    result.value = data
    txHash.value = hash
  } catch (e: any) {
    error.value = e.message
  } finally {
    isSubmitting.value = false
    if (statusInterval) clearInterval(statusInterval)
  }
}

function reset() {
  result.value = null
  cvFile.value = null
  cvText.value = ''
  targetRole.value = ''
  txHash.value = ''
  error.value = ''
  currentStage.value = 0
  inputMode.value = 'pdf'
}

onUnmounted(() => {
  if (statusInterval) clearInterval(statusInterval)
})

// ── Display helpers ───────────────────────────────────────────────────
function scoreColor(s: number): string {
  return s >= 80 ? '#34D399' : s >= 60 ? '#FBBF24' : '#F87171'
}

function scoreLabel(s: number): string {
  return s >= 85 ? 'Excellent' : s >= 70 ? 'Good' : s >= 55 ? 'Fair' : 'Needs Work'
}

function verdictClass(v: string): string {
  if (v === 'STRONG FIT')  return 'verdict verdict-STRONG'
  if (v === 'GOOD FIT')    return 'verdict verdict-GOOD'
  if (v === 'PARTIAL FIT') return 'verdict verdict-PARTIAL'
  return 'verdict verdict-NOT'
}

function atsColor(a: string): string {
  return a === 'High' ? '#34D399' : a === 'Medium' ? '#FBBF24' : '#F87171'
}

function shortHash(h: string): string {
  return h.slice(0, 8) + '...' + h.slice(-6)
}
</script>

<style scoped>
/* Hero */
.hero { text-align: center; margin-bottom: 40px; }

.hero-title {
  font-family: var(--font-head);
  font-size: 38px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -1.5px;
  margin-bottom: 14px;
}

.hero-gradient {
  background: linear-gradient(90deg, var(--violetLt), var(--cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-sub {
  color: var(--muted);
  font-size: 15px;
  line-height: 1.7;
  max-width: 560px;
  margin: 0 auto;
}

/* Form */
.form-section { max-width: 540px; margin: 0 auto; }

.mode-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
}

.mode-tab {
  flex: 1;
  padding: 9px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--muted);
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.2s;
}

.mode-tab.active {
  background: var(--violetDim);
  border-color: var(--violet);
  color: var(--violetLt);
}

/* Drop zone */
.drop-zone {
  border: 2px dashed var(--border);
  border-radius: 14px;
  padding: 36px 24px;
  text-align: center;
  cursor: pointer;
  background: var(--surface);
  transition: all 0.2s;
  margin-bottom: 18px;
}

.drop-zone.drop-over { border-color: var(--violet); background: rgba(124,58,237,0.06); }
.drop-zone.drop-done { border-color: var(--green); background: rgba(52,211,153,0.05); }

.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.drop-main { font-weight: 600; font-size: 14px; }
.drop-name { font-weight: 600; font-size: 14px; color: var(--green); }
.drop-hint { font-size: 12px; color: var(--dim); }

/* Textarea */
.cv-textarea {
  width: 100%;
  padding: 14px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  font-size: 13px;
  font-family: var(--font-body);
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
  margin-bottom: 18px;
  line-height: 1.6;
}

.cv-textarea:focus { border-color: var(--violet); }
.cv-textarea::placeholder { color: var(--dim); }

/* Fields */
.field-label {
  display: block;
  font-size: 10px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 2.5px;
  font-weight: 600;
  margin-bottom: 8px;
}

/* Level buttons */
.level-group {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.level-btn {
  flex: 1;
  padding: 10px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--muted);
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.2s;
}

.level-btn.active {
  background: var(--violetDim);
  border-color: var(--violet);
  color: var(--violetLt);
  font-weight: 600;
}

/* Error */
.error-box {
  background: rgba(248,113,113,0.08);
  border: 1px solid rgba(248,113,113,0.25);
  border-radius: 8px;
  padding: 11px 14px;
  font-size: 13px;
  color: #FCA5A5;
  margin-bottom: 16px;
}

/* Chain pill */
.chain-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-top: 16px;
  font-size: 11px;
  color: var(--dim);
}

.chain-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--green);
}

/* Consensus */
.consensus-section { max-width: 540px; margin: 0 auto; }

.consensus-stages {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 24px 0 20px;
  flex-wrap: wrap;
}

.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  flex: 1;
  min-width: 80px;
}

.stage-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.3s;
}

.stage-done .stage-icon   { background: rgba(52,211,153,0.15); border: 1px solid #34D399; color: #34D399; }
.stage-active .stage-icon { background: var(--violetDim); border: 1px solid var(--violet); }
.stage-pending .stage-icon { background: var(--surfaceHi); border: 1px solid var(--border); color: var(--dim); }

.stage-name {
  font-size: 11px;
  color: var(--muted);
}

.stage-done .stage-name   { color: #34D399; }
.stage-active .stage-name { color: var(--violetLt); }

.tx-hash-line {
  font-size: 12px;
  color: var(--dim);
  margin-top: 4px;
}

.tx-link {
  color: var(--violetLt);
  text-decoration: none;
}

.tx-link:hover { text-decoration: underline; }

.consensus-note {
  font-size: 12px;
  color: var(--dim);
  margin-top: 14px;
  line-height: 1.6;
}

/* Results */
.results-section { }

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.results-title {
  font-family: var(--font-head);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin-bottom: 4px;
}

.results-meta { font-size: 13px; color: var(--violetLt); }

.row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

/* Hex badge */
.hex-wrap {
  position: relative;
  width: 172px;
  height: 190px;
  margin: 0 auto 12px;
}

.hex-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.hex-score {
  display: block;
  font-family: var(--font-head);
  font-size: 52px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -2px;
}

.hex-label {
  display: block;
  font-size: 10px;
  color: var(--muted);
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-top: 6px;
}

/* ATS */
.ats-row { display: flex; align-items: center; gap: 8px; }
.ats-dot { width: 8px; height: 8px; border-radius: 50%; }
.ats-label { font-family: var(--font-head); font-weight: 700; font-size: 14px; }

/* Summary */
.summary-text { font-size: 13px; color: #C8D5EE; line-height: 1.75; }

/* Category bars */
.cat-bar { margin-bottom: 18px; }

.cat-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 6px;
}

.cat-name { font-size: 13px; color: var(--text); font-weight: 500; }
.cat-score { font-size: 14px; font-weight: 700; font-family: var(--font-head); }

.bar-track {
  height: 5px;
  background: var(--surfaceHi);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 3px;
  animation: barFill 1.2s cubic-bezier(0.16,1,0.3,1) forwards;
}

/* Tags */
.tag-cloud { display: flex; flex-wrap: wrap; gap: 5px; }

.tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 20px;
}

.tag-found   { background: rgba(52,211,153,0.10); border: 1px solid rgba(52,211,153,0.25); color: #34D399; }
.tag-missing { background: rgba(248,113,113,0.10); border: 1px solid rgba(248,113,113,0.25); color: #F87171; }

/* Strengths + Recs */
.row-strengths {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 14px;
  margin-bottom: 14px;
}

.strength-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-bottom: 10px;
  font-size: 13px;
  color: #C8D5EE;
  line-height: 1.65;
}

.check { color: var(--green); flex-shrink: 0; margin-top: 2px; }

.rec-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 14px;
  font-size: 13px;
  color: #C8D5EE;
  line-height: 1.7;
}

.rec-num {
  min-width: 22px;
  height: 22px;
  background: var(--violetDim);
  border: 1px solid rgba(124,58,237,0.4);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--violetLt);
  font-family: var(--font-head);
}

/* Proof bar */
.proof-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 12px;
  color: var(--dim);
}
</style>
