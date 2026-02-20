<template>
  <div class="home-shell">
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap");

.home-shell {
  --home-ink: #0f172a;
  --home-muted: #51606f;
  --home-accent: #0ea5a4;
  --home-accent-strong: #0f766e;
  --home-card: #ffffff;
  --home-border: #e2e8f0;
  --home-bg: radial-gradient(1200px 500px at 10% -10%, rgba(14, 165, 164, 0.16), transparent 60%),
    radial-gradient(900px 400px at 90% 10%, rgba(56, 189, 248, 0.15), transparent 55%), #f8fafc;

  min-height: 100vh;
  background: var(--home-bg);
  color: var(--home-ink);
  font-family: "Plus Jakarta Sans", ui-sans-serif, system-ui;
}

.home-shell .font-display {
  font-family: "Space Grotesk", "Plus Jakarta Sans", ui-sans-serif, system-ui;
}

.home-shell .home-container {
  margin-left: auto;
  margin-right: auto;
  max-width: 1120px;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.home-shell .glass-card {
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(16px);
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.home-shell .fade-up {
  animation: fadeUp 0.8s ease-out both;
}

.home-shell .delay-1 {
  animation-delay: 0.08s;
}

.home-shell .delay-2 {
  animation-delay: 0.18s;
}

.home-shell .delay-3 {
  animation-delay: 0.28s;
}
</style>
