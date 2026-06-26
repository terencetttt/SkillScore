<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-left">
        <svg width="28" height="31" viewBox="0 0 28 31" fill="none">
          <polygon points="14,2 26,8.5 26,22.5 14,29 2,22.5 2,8.5"
            fill="url(#hex-g)" />
          <polygon points="14,7 22,11.5 22,20.5 14,25 6,20.5 6,11.5"
            fill="none" stroke="white" stroke-width="0.6" opacity="0.3" />
          <defs>
            <linearGradient id="hex-g" x1="0" y1="0" x2="28" y2="31" gradientUnits="userSpaceOnUse">
              <stop stop-color="#7C3AED" />
              <stop offset="1" stop-color="#06B6D4" />
            </linearGradient>
          </defs>
        </svg>
        <span class="logo-text">Skill<span class="logo-accent">Score</span></span>
      </div>

      <div class="nav-links">
        <router-link to="/" class="nav-link">Score CV</router-link>
        <router-link to="/archive" class="nav-link">Archive</router-link>
      </div>

      <div class="nav-right">
        <span v-if="isConnected" class="wallet-badge">
          <span class="wallet-dot" />
          {{ shortAddress(walletAddress) }}
        </span>
        <button v-else class="btn-connect" @click="connect">Connect Wallet</button>
        <a
          :href="`https://explorer-bradbury.genlayer.com/address/${CONTRACT_ADDRESS}`"
          target="_blank"
          class="explorer-link"
        >
          View Contract ↗
        </a>
      </div>
    </nav>

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { connectWallet, walletAddress, isConnected, shortAddress, CONTRACT_ADDRESS } from './client'

async function connect() {
  try { await connectWallet() }
  catch (e: any) { alert(e.message) }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:        #06091A;
  --surface:   #0D1526;
  --surfaceHi: #152035;
  --border:    #1C2D46;
  --borderHi:  #263D5C;
  --text:      #EEF2FF;
  --muted:     #6B7FA8;
  --dim:       #374F6A;
  --violet:    #7C3AED;
  --violetLt:  #A78BFA;
  --violetDim: rgba(124,58,237,0.18);
  --cyan:      #06B6D4;
  --green:     #34D399;
  --amber:     #FBBF24;
  --red:       #F87171;
  --font-head: 'Space Grotesk', sans-serif;
  --font-body: 'DM Sans', system-ui, sans-serif;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  min-height: 100vh;
}

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

#app { min-height: 100vh; }

/* ── Navbar ── */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 28px;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: rgba(6,9,26,0.92);
  backdrop-filter: blur(12px);
  z-index: 50;
  gap: 16px;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.logo-text {
  font-family: var(--font-head);
  font-weight: 700;
  font-size: 17px;
  letter-spacing: -0.5px;
}

.logo-accent { color: var(--violetLt); }

.nav-links {
  display: flex;
  gap: 4px;
}

.nav-link {
  color: var(--muted);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--text);
  background: var(--surfaceHi);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.wallet-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--muted);
  background: var(--surfaceHi);
  border: 1px solid var(--border);
  padding: 5px 12px;
  border-radius: 20px;
}

.wallet-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--green);
}

.btn-connect {
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-body);
  color: var(--violetLt);
  background: var(--violetDim);
  border: 1px solid var(--violet);
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-connect:hover {
  background: rgba(124,58,237,0.28);
}

.explorer-link {
  font-size: 11px;
  color: var(--dim);
  text-decoration: none;
  transition: color 0.2s;
}

.explorer-link:hover { color: var(--muted); }

/* ── Shared layout ── */
.page { max-width: 820px; margin: 0 auto; padding: 44px 22px 64px; }

/* ── Cards ── */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
}

.card-label {
  font-size: 10px;
  color: var(--dim);
  text-transform: uppercase;
  letter-spacing: 2.5px;
  font-weight: 600;
  margin-bottom: 14px;
}

/* ── Verdict badges ── */
.verdict {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  font-family: var(--font-head);
  letter-spacing: 1px;
  padding: 4px 12px;
  border-radius: 20px;
}

.verdict-STRONG { background: rgba(52,211,153,0.12); border: 1px solid rgba(52,211,153,0.35); color: #34D399; }
.verdict-GOOD   { background: rgba(6,182,212,0.12);  border: 1px solid rgba(6,182,212,0.35);  color: #06B6D4; }
.verdict-PARTIAL{ background: rgba(251,191,36,0.12); border: 1px solid rgba(251,191,36,0.35); color: #FBBF24; }
.verdict-NOT    { background: rgba(248,113,113,0.12);border: 1px solid rgba(248,113,113,0.35);color: #F87171; }

/* ── Inputs ── */
.input-field {
  width: 100%;
  padding: 13px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  font-size: 14px;
  font-family: var(--font-body);
  outline: none;
  transition: border-color 0.2s;
}

.input-field:focus { border-color: var(--violet); }
.input-field::placeholder { color: var(--dim); }

/* ── Buttons ── */
.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #7C3AED, #5B21B6);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  font-family: var(--font-head);
  letter-spacing: 0.3px;
  cursor: pointer;
  box-shadow: 0 4px 28px rgba(124,58,237,0.40);
  transition: all 0.3s;
}

.btn-primary:disabled {
  background: var(--surfaceHi);
  color: var(--muted);
  box-shadow: none;
  cursor: not-allowed;
}

.btn-ghost {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--muted);
  font-size: 12px;
  font-family: var(--font-body);
  padding: 7px 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ghost:hover { border-color: var(--violet); color: var(--violetLt); }

/* ── Spinner ── */
@keyframes spin { to { transform: rotate(360deg); } }
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border);
  border-top-color: var(--violetLt);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* ── Animations ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-up { animation: fadeUp 0.4s ease; }

@keyframes barFill {
  from { width: 0; }
}
</style>
