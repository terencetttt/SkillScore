<template>
  <div id="app" :data-theme="theme">
    <!-- Animated background blobs -->
    <div class="bg-blobs" aria-hidden="true">
      <div class="blob blob-1" />
      <div class="blob blob-2" />
      <div class="blob blob-3" />
    </div>

    <nav class="navbar">
      <div class="nav-inner">
        <!-- Logo -->
        <router-link to="/" class="nav-logo">
          <div class="logo-icon">
            <svg width="22" height="24" viewBox="0 0 22 24" fill="none">
              <polygon points="11,1 21,6.5 21,17.5 11,23 1,17.5 1,6.5"
                fill="url(#logo-grad)" />
              <polygon points="11,5 18,9 18,15 11,19 4,15 4,9"
                fill="none" stroke="white" stroke-width="0.7" opacity="0.4" />
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="22" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#6C47FF" />
                  <stop offset="1" stop-color="#00C6AE" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span class="logo-text">Skill<span class="logo-accent">Score</span></span>
        </router-link>

        <!-- Nav links -->
        <div class="nav-links">
          <router-link to="/" class="nav-link">Score CV</router-link>
          <router-link to="/archive" class="nav-link">Archive</router-link>
        </div>

        <!-- Right side -->
        <div class="nav-right">
          <!-- Theme toggle -->
          <button class="theme-toggle" @click="toggleTheme" :title="theme === 'light' ? 'Switch to dark' : 'Switch to light'">
            <span class="toggle-track">
              <span class="toggle-thumb">
                <span v-if="theme === 'light'">☀️</span>
                <span v-else>🌙</span>
              </span>
            </span>
          </button>

          <!-- Wallet -->
          <div v-if="isConnected" class="wallet-pill">
            <span class="wallet-dot" />
            <span>{{ shortAddress(walletAddress) }}</span>
          </div>
          <button v-else class="btn-connect" @click="connect">Connect Wallet</button>

          <a
            :href="`https://explorer-bradbury.genlayer.com/address/${CONTRACT_ADDRESS}`"
            target="_blank"
            class="explorer-btn"
          >
            Contract ↗
          </a>
        </div>
      </div>
    </nav>

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { connectWallet, walletAddress, isConnected, shortAddress, CONTRACT_ADDRESS } from './client'

const theme = ref<'light' | 'dark'>('light')

onMounted(() => {
  const saved = localStorage.getItem('ss-theme') as 'light' | 'dark' | null
  if (saved) theme.value = saved
  else if (window.matchMedia('(prefers-color-scheme: dark)').matches) theme.value = 'dark'
})

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  localStorage.setItem('ss-theme', theme.value)
}

async function connect() {
  try { await connectWallet() }
  catch (e: any) { alert(e.message) }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Light mode (default) ───────────────────────────── */
:root {
  --bg:         #EDF0FF;
  --surface:    #FFFFFF;
  --surf2:      #F4F5FF;
  --border:     rgba(108,71,255,0.12);
  --border2:    rgba(108,71,255,0.22);
  --text:       #0D0D2B;
  --muted:      #6B6F94;
  --dim:        #A8ABCC;
  --accent:     #6C47FF;
  --accent-lt:  #8B6FFF;
  --accent-dim: rgba(108,71,255,0.10);
  --accent2:    #00C6AE;
  --green:      #059669;
  --green-dim:  rgba(5,150,105,0.10);
  --green-bdr:  rgba(5,150,105,0.25);
  --amber:      #D97706;
  --amber-dim:  rgba(217,119,6,0.10);
  --amber-bdr:  rgba(217,119,6,0.25);
  --red:        #E11D48;
  --red-dim:    rgba(225,29,72,0.10);
  --red-bdr:    rgba(225,29,72,0.25);
  --shadow-sm:  0 2px 8px rgba(108,71,255,0.08);
  --shadow-md:  0 8px 28px rgba(108,71,255,0.12);
  --shadow-lg:  0 20px 60px rgba(108,71,255,0.18);
  --glass-bg:   rgba(255,255,255,0.75);
  --glass-bdr:  rgba(255,255,255,0.6);
  --font-head:  'Outfit', sans-serif;
  --font-body:  'Inter', system-ui, sans-serif;
  --font-num:   'Space Grotesk', sans-serif;
}

/* ── Dark mode ──────────────────────────────────────── */
[data-theme="dark"] {
  --bg:         #050812;
  --surface:    #0C0F28;
  --surf2:      #131735;
  --border:     rgba(140,110,255,0.25);
  --border2:    rgba(140,110,255,0.38);
  --text:       #F0F2FF;
  --muted:      #9498C8;
  --dim:        #565880;
  --accent:     #8B6FFF;
  --accent-lt:  #A892FF;
  --accent-dim: rgba(139,111,255,0.20);
  --accent2:    #00E4C8;
  --green:      #34D399;
  --green-dim:  rgba(52,211,153,0.14);
  --green-bdr:  rgba(52,211,153,0.32);
  --amber:      #FBBF24;
  --amber-dim:  rgba(251,191,36,0.14);
  --amber-bdr:  rgba(251,191,36,0.32);
  --red:        #FF6B8A;
  --red-dim:    rgba(255,107,138,0.14);
  --red-bdr:    rgba(255,107,138,0.32);
  --shadow-sm:  0 2px 8px rgba(0,0,0,0.50);
  --shadow-md:  0 8px 28px rgba(0,0,0,0.60);
  --shadow-lg:  0 20px 60px rgba(0,0,0,0.70);
  --glass-bg:   rgba(8,10,28,0.94);
  --glass-bdr:  rgba(139,111,255,0.18);
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  min-height: 100vh;
  transition: background 0.35s ease, color 0.35s ease;
}

#app {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* ── Animated background blobs ──────────────────────── */
.bg-blobs {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
  animation: blobFloat 12s ease-in-out infinite;
}

[data-theme="dark"] .blob { display: none; }
[data-theme="dark"] body { background: #050812; }

.blob-1 {
  width: 600px; height: 600px;
  background: radial-gradient(circle, #6C47FF, transparent 70%);
  top: -200px; left: -150px;
  animation-delay: 0s;
}

.blob-2 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, #00C6AE, transparent 70%);
  top: 30%; right: -150px;
  animation-delay: -4s;
}

.blob-3 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, #8B6FFF, transparent 70%);
  bottom: -100px; left: 30%;
  animation-delay: -8s;
}

@keyframes blobFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%       { transform: translate(30px, -40px) scale(1.05); }
  66%       { transform: translate(-20px, 30px) scale(0.95); }
}

/* ── Navbar ─────────────────────────────────────────── */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: var(--glass-bg);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 1px 0 var(--border);
  transition: background 0.35s ease;
}

.nav-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-dim);
  border: 1px solid var(--border2);
  border-radius: 10px;
  transition: transform 0.2s;
}
.nav-logo:hover .logo-icon { transform: rotate(-8deg) scale(1.05); }

.logo-text {
  font-family: var(--font-head);
  font-weight: 800;
  font-size: 18px;
  letter-spacing: -0.5px;
  color: var(--text);
}
.logo-accent { color: var(--accent); }

.nav-links {
  display: flex;
  gap: 2px;
  flex: 1;
  justify-content: center;
}

.nav-link {
  color: var(--muted);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 16px;
  border-radius: 8px;
  transition: all 0.2s;
}
.nav-link:hover { color: var(--text); background: var(--accent-dim); }
.nav-link.router-link-active {
  color: var(--accent);
  background: var(--accent-dim);
  font-weight: 600;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

/* Theme toggle */
.theme-toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}
.toggle-track {
  display: flex;
  align-items: center;
  width: 48px;
  height: 26px;
  background: var(--accent-dim);
  border: 1px solid var(--border2);
  border-radius: 20px;
  padding: 2px;
  transition: all 0.3s;
}
[data-theme="dark"] .toggle-track { background: var(--accent-dim); }
.toggle-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
  transform: translateX(0);
}
[data-theme="dark"] .toggle-thumb { transform: translateX(22px); }

.wallet-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--muted);
  background: var(--glass-bg);
  border: 1px solid var(--border);
  padding: 5px 12px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}
.wallet-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 6px var(--green);
}

.btn-connect {
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-body);
  color: #fff;
  background: var(--accent);
  border: none;
  padding: 7px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 12px rgba(108,71,255,0.35);
}
.btn-connect:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(108,71,255,0.45); }

.explorer-btn {
  font-size: 11px;
  color: var(--dim);
  text-decoration: none;
  transition: color 0.2s;
}
.explorer-btn:hover { color: var(--accent); }

/* ── Shared page layout ─────────────────────────────── */
.page {
  position: relative;
  z-index: 1;
  max-width: 860px;
  margin: 0 auto;
  padding: 48px 24px 80px;
}

/* ── Glass card ─────────────────────────────────────── */
.card {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
  transition: all 0.35s ease;
}
.card:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }

.card-label {
  font-size: 10px;
  color: var(--dim);
  text-transform: uppercase;
  letter-spacing: 2.5px;
  font-weight: 700;
  margin-bottom: 14px;
}

/* ── Verdict badges ─────────────────────────────────── */
.verdict {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  font-family: var(--font-head);
  letter-spacing: 0.5px;
  padding: 5px 14px;
  border-radius: 20px;
}
.verdict::before { content: ''; width: 6px; height: 6px; border-radius: 50%; }
.verdict-STRONG { background: var(--green-dim); border: 1px solid var(--green-bdr); color: var(--green); }
.verdict-STRONG::before { background: var(--green); box-shadow: 0 0 6px var(--green); }
.verdict-GOOD   { background: rgba(0,198,174,0.10); border: 1px solid rgba(0,198,174,0.25); color: var(--accent2); }
.verdict-GOOD::before { background: var(--accent2); box-shadow: 0 0 6px var(--accent2); }
.verdict-PARTIAL{ background: var(--amber-dim); border: 1px solid var(--amber-bdr); color: var(--amber); }
.verdict-PARTIAL::before { background: var(--amber); box-shadow: 0 0 6px var(--amber); }
.verdict-NOT    { background: var(--red-dim); border: 1px solid var(--red-bdr); color: var(--red); }
.verdict-NOT::before { background: var(--red); box-shadow: 0 0 6px var(--red); }

/* ── Input fields ───────────────────────────────────── */
.input-field {
  width: 100%;
  padding: 13px 16px;
  background: var(--surf2);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  color: var(--text);
  font-size: 14px;
  font-family: var(--font-body);
  outline: none;
  transition: all 0.2s;
}
.input-field:focus {
  border-color: var(--accent);
  background: var(--surface);
  box-shadow: 0 0 0 4px var(--accent-dim);
}
.input-field::placeholder { color: var(--dim); }

/* ── Primary button ─────────────────────────────────── */
.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, var(--accent), #5B35E8);
  border: none;
  border-radius: 14px;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  font-family: var(--font-head);
  cursor: pointer;
  box-shadow: 0 4px 24px rgba(108,71,255,0.40);
  transition: all 0.25s;
  position: relative;
  overflow: hidden;
}
.btn-primary::before {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  transition: left 0.5s;
}
.btn-primary:hover::before { left: 100%; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(108,71,255,0.50); }
.btn-primary:disabled {
  background: var(--surf2);
  color: var(--dim);
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}

/* ── Ghost button ───────────────────────────────────── */
.btn-ghost {
  background: transparent;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  color: var(--muted);
  font-size: 12px;
  font-family: var(--font-body);
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-ghost:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }

/* ── Spinner ─────────────────────────────────────────── */
@keyframes spin { to { transform: rotate(360deg); } }
.spinner {
  width: 16px; height: 16px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

/* ── Animations ─────────────────────────────────────── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-up { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1); }

@keyframes barFill {
  from { width: 0; }
}

::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 3px; }
</style>
