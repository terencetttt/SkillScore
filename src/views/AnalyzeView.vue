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
    <div v-if="!isSubmitting && !timedOut" class="form-wrap">
      <div class="card form-card">
        <!-- Tabs -->
        <div class="tabs">
          <button :class="['tab', inputMode === 'pdf' ? 'tab-active' : '']" @click="inputMode = 'pdf'">
            Upload PDF
          </button>
          <button :class="['tab', inputMode === 'text' ? 'tab-active' : '']" @click="inputMode = 'text'">
            Paste Text
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
            <span>Extracting text from PDF...</span>
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
            <span class="drop-hint">PDF only - max 10 MB</span>
          </div>
        </div>

        <!-- Text area -->
        <textarea
          v-if="inputMode === 'text'"
          v-model="cvText"
          class="cv-textarea"
          placeholder="Paste your full CV text here..."
          rows="10"
        />

        <!-- Target role -->
        <div class="field-group">
          <label class="field-label">Target Role</label>
          <input
            v-model="targetRole"
            type="text"
            class="input-field"
            placeholder="e.g. Backend Engineer, Product Manager, Data Analyst..."
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
          <span>!</span> {{ error }}
        </div>

        <!-- Submit -->
        <button class="btn-primary" :disabled="isSubmitting" @click="submit">
          Submit CV to Bradbury Chain
        </button>

        <div class="chain-note">
          <span class="chain-dot" /> AI consensus - results stored on-chain
        </div>
      </div>
    </div>

    <!-- Consensus tracker -->
    <div v-if="isSubmitting" class="tracker-wrap fade-up">
      <div class="card tracker-card">
        <div class="tracker-hd">
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
              <span v-if="currentStage > i" class="node-check">&#10003;</span>
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
            {{ shortHash(txHash) }}
          </a>
        </div>
        <p class="tracker-note">AI validators are independently scoring your CV - this takes 3-5 minutes. You'll be taken to your score automatically.</p>
      </div>
    </div>

    <!-- Timed out -->
    <div v-if="timedOut && !isSubmitting" class="tracker-wrap fade-up">
      <div class="card tracker-card" style="text-align:center">
        <div class="card-label">Still Processing</div>
        <p style="font-size:13px;color:var(--muted);margin-bottom:20px;line-height:1.7">
          Your transaction is on-chain and being processed. Validators are running - click below to check if your score is ready.
        </p>
        <div v-if="error" class="error-box" style="margin-bottom:16px;text-align:left">! {{ error }}</div>
        <button class="btn-primary" @click="checkResults" style="max-width:260px;margin:0 auto">
          Check Score Now
        </button>
        <p style="font-size:11px;color:var(--dim);margin-top:12px">Try every 1-2 minutes</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as pdfjsLib from 'pdfjs-dist'
import { connectWallet, walletAddress, isConnected, writeWithRetry, pollTxStatus, resolveLatestId } from '../client'

;(pdfjsLib as any).GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${(pdfjsLib as any).version}/build/pdf.worker.min.js`

const router = useRouter()

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

const expMap: Record<string, string> = {
  entry:  'entry/graduate (0-2 years)',
  mid:    'mid-level (2-5 years)',
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

// Send the user to their score page. Uses resolveLatestId, which retries
// get_user_latest and falls back to scanning all analyses, returning a clean
// string id that the /score/:id route can use.
function goToScoreId(id: string | null) {
  if (id) {
    router.push('/score/' + id)
  } else {
    timedOut.value = true
    error.value = 'Your score is processing. Use "Check Score Now" in a moment, or open the Archive.'
  }
}

async function submit() {
  if (!cvText.value.trim()) { error.value = 'Please provide your CV.'; return }
  if (!targetRole.value.trim()) { error.value = 'Please enter a target role.'; return }
  error.value = ''

  if (!isConnected.value) {
    try { await connectWallet() }
    catch (e: any) { error.value = e.message; return }
  }

  isSubmitting.value = true; currentStage.value = 0; txHash.value = ''

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
    // Resolve the new record's id robustly, then redirect to the score page.
    const id = await resolveLatestId(walletAddress.value)
    goToScoreId(id)
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
    const id = await resolveLatestId(walletAddress.value)
    if (id) { goToScoreId(id) }
    else { timedOut.value = true; error.value = 'Not ready yet - try again in 1-2 minutes.' }
  } catch { timedOut.value = true; error.value = 'Could not fetch yet. Try again shortly.' }
}

function shortHash(h: string): string { return h.slice(0, 8) + '...' + h.slice(-6) }

onUnmounted(() => { if (statusInterval) clearInterval(statusInterval) })
</script>

<style scoped>
.hero { text-align: center; margin-bottom: 40px; }
.hero-badge { display: inline-block; font-size: 11px; font-weight: 600; color: var(--yellow); background: var(--y-dim); border: 1px solid var(--border); padding: 4px 14px; border-radius: 20px; margin-bottom: 18px; }
.hero-title { font-family: var(--font-h); font-size: 42px; font-weight: 900; line-height: 1.1; letter-spacing: -2px; color: var(--text); margin-bottom: 20px; }
.hero-gradient { color: var(--yellow); }
.hero-sub { font-size: 15px; color: var(--muted); line-height: 1.7; max-width: 540px; margin: 0 auto 22px; }
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
.drop-icon-done { width: 48px; height: 48px; border-radius: 12px; background: var(--g-dim); border: 1px solid var(--g-bdr); }
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
.node-num { font-size: 11px; }
.stage-label { font-size: 10px; color: var(--dim); text-align: center; }
.label-done,.label-active { color: var(--yellow); font-weight: 600; }
.tx-row { font-size: 12px; color: var(--dim); text-align: center; margin-bottom: 8px; }
.tx-link { color: var(--yellow); text-decoration: none; font-weight: 600; }
.tx-link:hover { text-decoration: underline; }
.tracker-note { font-size: 12px; color: var(--dim); text-align: center; line-height: 1.6; }

@media (max-width: 640px) {
  .hero-title { font-size: 32px; }
}
</style>
