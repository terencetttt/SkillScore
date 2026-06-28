<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-inner">
        <router-link to="/" class="nav-logo">
          <div class="logo-hex">S</div>
          <span class="logo-text">Skill<span class="logo-y">Score</span></span>
        </router-link>
        <div class="nav-links">
          <router-link to="/" class="nav-link">Score CV</router-link>
          <router-link to="/archive" class="nav-link">Archive</router-link>
        </div>
        <div class="nav-right">
          <div v-if="isConnected" class="wallet-pill">
            <span class="w-dot" />{{ shortAddress(walletAddress) }}
          </div>
          <button v-else class="btn-connect" @click="connect">Connect Wallet</button>
        </div>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { connectWallet, walletAddress, isConnected, shortAddress } from './client'

async function connect() {
  try { await connectWallet() } catch (e: any) { alert(e.message) }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Space+Grotesk:wght@500;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:      #070C24;
  --card:    #0D1540;
  --card2:   #111A4A;
  --border:  rgba(255,215,0,0.22);
  --border2: rgba(255,215,0,0.40);
  --text:    #F0F4FF;
  --muted:   rgba(240,244,255,0.65);
  --dim:     rgba(240,244,255,0.30);
  --yellow:  #FFD700;
  --y-dim:   rgba(255,215,0,0.14);
  --y-str:   rgba(255,215,0,0.35);
  --green:   #34D399;
  --g-dim:   rgba(52,211,153,0.14);
  --g-bdr:   rgba(52,211,153,0.32);
  --red:     #FF5555;
  --r-dim:   rgba(255,85,85,0.14);
  --r-bdr:   rgba(255,85,85,0.32);
  --shadow:  0 8px 32px rgba(0,0,0,0.50);
  --font-h:  'Outfit', sans-serif;
  --font-b:  'Inter', system-ui, sans-serif;
  --font-n:  'Space Grotesk', sans-serif;
}

body { background: #070C24; color: var(--text); font-family: var(--font-b); min-height: 100vh; }
#app { min-height: 100vh; }

.navbar { position: sticky; top: 0; z-index: 100; background: var(--card); border-bottom: 1px solid var(--border); }
.nav-inner { max-width: 1000px; margin: 0 auto; padding: 0 24px; height: 58px; display: flex; align-items: center; gap: 16px; }
.nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; }
.logo-hex { width: 32px; height: 32px; background: var(--yellow); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: var(--font-h); font-weight: 900; font-size: 16px; color: #070C24; flex-shrink: 0; }
.logo-text { font-family: var(--font-h); font-weight: 800; font-size: 17px; color: var(--text); letter-spacing: -.3px; }
.logo-y { color: var(--yellow); }
.nav-links { display: flex; gap: 2px; flex: 1; justify-content: center; }
.nav-link { color: var(--muted); text-decoration: none; font-size: 13px; font-weight: 500; padding: 6px 14px; border-radius: 8px; transition: all .2s; }
.nav-link:hover { color: var(--text); background: var(--y-dim); }
.nav-link.router-link-active { color: var(--yellow); background: var(--y-dim); font-weight: 600; }
.nav-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.wallet-pill { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); background: var(--card2); border: 1px solid var(--border); padding: 5px 12px; border-radius: 20px; }
.w-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); box-shadow: 0 0 6px var(--green); flex-shrink: 0; }
.btn-connect { font-size: 12px; font-weight: 700; font-family: var(--font-b); color: #070C24; background: var(--yellow); border: none; padding: 7px 16px; border-radius: 20px; cursor: pointer; transition: all .2s; }
.btn-connect:hover { opacity: 0.9; transform: translateY(-1px); }

.page { max-width: 820px; margin: 0 auto; padding: 44px 24px 80px; }
.card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 22px; transition: box-shadow .2s; }
.card:hover { box-shadow: var(--shadow); }
.card-label { font-size: 10px; color: var(--dim); text-transform: uppercase; letter-spacing: 2.5px; font-weight: 700; margin-bottom: 12px; }

.btn-primary { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px; background: var(--yellow); border: none; border-radius: 12px; color: #070C24; font-size: 15px; font-weight: 800; font-family: var(--font-h); cursor: pointer; box-shadow: 0 4px 20px var(--y-str); transition: all .2s; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px var(--y-str); }
.btn-primary:disabled { background: var(--card2); color: var(--dim); box-shadow: none; cursor: not-allowed; transform: none; }
.btn-ghost { background: transparent; border: 1px solid var(--border); border-radius: 10px; color: var(--muted); font-size: 12px; font-family: var(--font-b); padding: 8px 16px; cursor: pointer; transition: all .2s; }
.btn-ghost:hover { border-color: var(--yellow); color: var(--yellow); background: var(--y-dim); }

.input-field { width: 100%; padding: 12px 14px; background: var(--card2); border: 1.5px solid var(--border); border-radius: 10px; color: var(--text); font-size: 14px; font-family: var(--font-b); outline: none; transition: all .2s; }
.input-field:focus { border-color: var(--yellow); box-shadow: 0 0 0 3px var(--y-dim); }
.input-field::placeholder { color: var(--dim); }

.verdict { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; font-family: var(--font-h); letter-spacing: .5px; padding: 4px 12px; border-radius: 20px; }
.verdict::before { content: ''; width: 6px; height: 6px; border-radius: 50%; }
.verdict-STRONG { background: var(--g-dim); border: 1px solid var(--g-bdr); color: var(--green); }
.verdict-STRONG::before { background: var(--green); }
.verdict-GOOD { background: var(--y-dim); border: 1px solid var(--y-str); color: var(--yellow); }
.verdict-GOOD::before { background: var(--yellow); }
.verdict-PARTIAL { background: rgba(255,180,0,0.12); border: 1px solid rgba(255,180,0,0.30); color: #FFB800; }
.verdict-PARTIAL::before { background: #FFB800; }
.verdict-NOT { background: var(--r-dim); border: 1px solid var(--r-bdr); color: var(--red); }
.verdict-NOT::before { background: var(--red); }

@keyframes spin { to { transform: rotate(360deg); } }
.spinner { width: 16px; height: 16px; border: 2px solid var(--border); border-top-color: var(--yellow); border-radius: 50%; animation: spin .7s linear infinite; flex-shrink: 0; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
.fade-up { animation: fadeUp .4s cubic-bezier(.16,1,.3,1); }
@keyframes barFill { from { width: 0; } }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
</style>
