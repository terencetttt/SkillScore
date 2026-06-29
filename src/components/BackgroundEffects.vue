<template>
  <div class="bg-effects">
    <!-- Canvas particle layer -->
    <canvas ref="particleCanvas" class="particle-layer"></canvas>

    <!-- Hex grid overlay -->
    <div class="hex-grid"></div>

    <!-- Floating energy orbs -->
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>

    <!-- Scan line sweep -->
    <div class="scan-line"></div>

    <!-- Vignette -->
    <div class="vignette"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const particleCanvas = ref<HTMLCanvasElement | null>(null)
let animationId = 0
let particles: Particle[] = []

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  pulse: number
  pulseSpeed: number
}

function initCanvas() {
  const canvas = particleCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Match canvas to window size
  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  // Create particles
  const count = Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 15000))
  particles = []
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.005
    })
  }

  const CONNECTION_DIST = 150

  function draw() {
    if (!ctx || !canvas) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Update & draw particles
    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      p.pulse += p.pulseSpeed

      // Wrap around edges
      if (p.x < 0) p.x = canvas.width
      if (p.x > canvas.width) p.x = 0
      if (p.y < 0) p.y = canvas.height
      if (p.y > canvas.height) p.y = 0

      const glow = Math.sin(p.pulse) * 0.3 + 0.7
      const currentOpacity = p.opacity * glow

      // Particle dot
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 215, 0, ${currentOpacity})`
      ctx.fill()

      // Outer glow
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 215, 0, ${currentOpacity * 0.1})`
      ctx.fill()
    }

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.15
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(255, 215, 0, ${alpha})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    }

    animationId = requestAnimationFrame(draw)
  }

  draw()
}

onMounted(() => {
  initCanvas()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
})
</script>

<style scoped>
.bg-effects {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  background: #070C24;
}

/* ---- Canvas particle layer ---- */
.particle-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* ---- Hex grid pattern ---- */
.hex-grid {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image:
    linear-gradient(30deg, #FFD700 12%, transparent 12.5%, transparent 87%, #FFD700 87.5%, #FFD700),
    linear-gradient(150deg, #FFD700 12%, transparent 12.5%, transparent 87%, #FFD700 87.5%, #FFD700),
    linear-gradient(30deg, #FFD700 12%, transparent 12.5%, transparent 87%, #FFD700 87.5%, #FFD700),
    linear-gradient(150deg, #FFD700 12%, transparent 12.5%, transparent 87%, #FFD700 87.5%, #FFD700),
    linear-gradient(60deg, #FFD70077 25%, transparent 25.5%, transparent 75%, #FFD70077 75%, #FFD70077),
    linear-gradient(60deg, #FFD70077 25%, transparent 25.5%, transparent 75%, #FFD70077 75%, #FFD70077);
  background-size: 80px 140px;
  background-position: 0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px;
}

/* ---- Floating energy orbs ---- */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0;
  animation: orbFloat 12s ease-in-out infinite;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.15), transparent 70%);
  top: 10%;
  left: -5%;
  animation-delay: 0s;
  animation-duration: 14s;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.1), transparent 70%);
  top: 50%;
  right: -5%;
  animation-delay: -5s;
  animation-duration: 18s;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.08), transparent 70%);
  bottom: 5%;
  left: 30%;
  animation-delay: -9s;
  animation-duration: 16s;
}

@keyframes orbFloat {
  0%, 100% {
    opacity: 0.3;
    transform: translate(0, 0) scale(1);
  }
  25% {
    opacity: 0.7;
    transform: translate(30px, -20px) scale(1.1);
  }
  50% {
    opacity: 0.4;
    transform: translate(-10px, 15px) scale(0.95);
  }
  75% {
    opacity: 0.8;
    transform: translate(15px, 25px) scale(1.05);
  }
}

/* ---- Scan line sweep ---- */
.scan-line {
  position: absolute;
  top: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(255, 215, 0, 0) 10%,
    rgba(255, 215, 0, 0.6) 50%,
    rgba(255, 215, 0, 0) 90%,
    transparent 100%
  );
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3), 0 0 60px rgba(255, 215, 0, 0.1);
  animation: scanSweep 8s linear infinite;
  opacity: 0.6;
}

@keyframes scanSweep {
  0% { top: -2px; }
  100% { top: 100%; }
}

/* ---- Vignette ---- */
.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 50%,
    rgba(7, 12, 36, 0.5) 100%
  );
}

/* ---- Reduced motion ---- */
@media (prefers-reduced-motion: reduce) {
  .orb,
  .scan-line {
    animation: none;
    opacity: 0.3;
  }
  .particle-layer {
    display: none;
  }
}
</style>
