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
                  <stop stop-color="#E8A800" />
                  <stop offset="1" stop-color="#C48C0A" />
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
          <button class="theme-toggle" @click="toggleTheme" :title="theme === 'light' ? 'Dark mode' : 'Light mode'">
            <span class="toggle-track">
              <span class="toggle-thumb">
                <svg v-if="theme === 'light'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <circle cx="12" cy="12" r="4"/>
                  <line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
                  <line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/>
                  <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
                  <line x1="6.34" y1="17.66" x2="4.93" y2="19.07"/><line x1="19.07" y1="4.93" x2="17.66" y2="6.34"/>
                </svg>
                <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
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

/* ── Light mode — warm white + gold ─────────────────── */
:root {
  --bg:         #FDFBF5;
  --surface:    #FFFFFF;
  --surf2:      #FFF8E8;
  --border:     rgba(196,140,10,0.18);
  --border2:    rgba(196,140,10,0.32);
  --text:       #1A1200;
  --muted:      #7A6020;
  --dim:        #C4A855;
  --accent:     #C48C0A;
  --accent-lt:  #E8A800;
  --accent-dim: rgba(196,140,10,0.10);
  --accent2:    #D4720A;
  --green:      #059669;
  --green-dim:  rgba(5,150,105,0.10);
  --green-bdr:  rgba(5,150,105,0.28);
  --amber:      #B45309;
  --amber-dim:  rgba(180,83,9,0.10);
  --amber-bdr:  rgba(180,83,9,0.28);
  --red:        #DC2626;
  --red-dim:    rgba(220,38,38,0.10);
  --red-bdr:    rgba(220,38,38,0.28);
  --shadow-sm:  0 2px 8px rgba(196,140,10,0.10);
  --shadow-md:  0 8px 28px rgba(196,140,10,0.15);
  --shadow-lg:  0 20px 60px rgba(196,140,10,0.18);
  --glass-bg:   rgba(255,255,255,0.85);
  --glass-bdr:  rgba(196,140,10,0.20);
  --font-head:  'Outfit', sans-serif;
  --font-body:  'Inter', system-ui, sans-serif;
  --font-num:   'Space Grotesk', sans-serif;
}

/* ── Dark mode — pure black + gold only ─────────────── */
[data-theme="dark"] {
  --bg:         #080600;
  --surface:    #120E00;
  --surf2:      #1A1400;
  --border:     rgba(200,150,0,0.22);
  --border2:    rgba(200,150,0,0.38);
  --text:       #FFF5CC;
  --muted:      #B89820;
  --dim:        #4A3C00;
  --accent:     #E8B000;
  --accent-lt:  #FFD000;
  --accent-dim: rgba(232,176,0,0.14);
  --accent2:    #E8B000;
  --green:      #A8D400;
  --green-dim:  rgba(168,212,0,0.12);
  --green-bdr:  rgba(168,212,0,0.28);
  --amber:      #E8B000;
  --amber-dim:  rgba(232,176,0,0.12);
  --amber-bdr:  rgba(232,176,0,0.28);
  --red:        #FF5533;
  --red-dim:    rgba(255,85,51,0.12);
  --red-bdr:    rgba(255,85,51,0.30);
  --shadow-sm:  0 2px 8px rgba(0,0,0,0.60);
  --shadow-md:  0 8px 28px rgba(0,0,0,0.70);
  --shadow-lg:  0 20px 60px rgba(0,0,0,0.80);
  --glass-bg:   rgba(10,8,0,0.96);
  --glass-bdr:  rgba(200,150,0,0.18);
}

/* ── Dark mode — pure black + neon cyan ─────────────── */
[data-theme="dark"] {
  --bg:         #050812;
  --surface:    #08141E;
  --surf2:      #0C1C28;
  --border:     rgba(0,212,240,0.22);
  --border2:    rgba(0,212,240,0.40);
  --text:       #D8F8FF;
  --muted:      #5AAFBF;
  --dim:        #204A58;
  --accent:     #00D4F0;
  --accent-lt:  #00EEFF;
  --accent-dim: rgba(0,212,240,0.15);
  --accent2:    #00FFE0;
  --green:      #00E5B4;
  --green-dim:  rgba(0,229,180,0.12);
  --green-bdr:  rgba(0,229,180,0.32);
  --amber:      #FFB800;
  --amber-dim:  rgba(255,184,0,0.12);
  --amber-bdr:  rgba(255,184,0,0.32);
  --red:        #FF3366;
  --red-dim:    rgba(255,51,102,0.12);
  --red-bdr:    rgba(255,51,102,0.32);
  --shadow-sm:  0 2px 8px rgba(0,0,0,0.55);
  --shadow-md:  0 8px 28px rgba(0,212,240,0.10);
  --shadow-lg:  0 20px 60px rgba(0,0,0,0.75);
  --glass-bg:   rgba(6,14,22,0.95);
  --glass-bdr:  rgba(0,212,240,0.18);
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
  background: radial-gradient(circle, #E8A800, transparent 70%);
  top: -200px; left: -150px;
  animation-delay: 0s;
}

.blob-2 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, #C48C0A, transparent 70%);
  top: 30%; right: -150px;
  animation-delay: -4s;
}

.blob-3 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, #F0C030, transparent 70%);
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
  box-shadow: 0 2px 12px rgba(196,140,10,0.35);
}
.btn-connect:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(196,140,10,0.45); }

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
  background: linear-gradient(135deg, #E8A800, #C47800);
  border: none;
  border-radius: 14px;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  font-family: var(--font-head);
  cursor: pointer;
  box-shadow: 0 4px 24px rgba(196,140,10,0.40);
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
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(196,140,10,0.50); }
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
