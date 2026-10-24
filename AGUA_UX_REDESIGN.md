# 💧 Beber Água — UX Redesign Specification

## Executive Summary

The current flow is a **6-screen linear form** with no spatial awareness, ambiguous buttons, and a jarring gulp→breathing mode-switch. The redesign merges it into a **unified guided experience** with a persistent progress rail, a single card-per-step model, breathing as an **optional inline expansion** (not a mode change), and a visible countdown timer on every breathing phase.

---

## Problem → Solution Matrix

| # | Problem | Solution |
|---|---------|----------|
| 1 | No sense of progression — user feels lost | **7-dot progress rail** fixed at top of screen |
| 2 | Breathing appears without explanation | **"Respirar entre goles" card** explains *why* before starting |
| 3 | Breathing has no countdown | **Ring timer + seconds counter** on the breath circle |
| 4 | "Pular gole" is ambiguous (skip gulp? skip breath?) | Split into **"Pular respiração"** (on breath card) and **"Avançar sem beber"** (on gulp card) |
| 5 | "Começar" doesn't explain what happens | **"Vamos beber 3 goles com respiração"** — preview of the journey |
| 6 | Preparation is a dead 1-line screen | **Merged into the variation-selection card** as a "tip" line |
| 7 | Variation buttons are plain text | **Emoji + label + brief benefit** per variation |
| 8 | Encerramento is abrupt | **Celebration micro-moment** with animation + choice |

---

## New Flow (7 steps, 0 ambiguity)

```
 ┌──────────────────────────────────────────────────────┐
 │  ❶ Intro     ❷ Choose     ❸ Gulp 1   ❹ Breath 1   │
 │  ❺ Gulp 2    ❻ Breath 2   ⓿ Gulp 3                │
 │                                                      │
 │  After Gulp 3 → automatic transition to:             │
 │  ❽ Check-in   ❾ Done                                │
 │                                                      │
 │  Total visible steps in rail: 7                      │
 │  (Gulp 3 has no breath after — user just finishes)   │
 └──────────────────────────────────────────────────────┘
```

### Progress Rail Design

```
  ●──●──●──○──○──○──○
  ❶  ❷  ❸  ❹  ❺  ❻  ⓿
```

- **Filled dot** (`●`) = completed step  
- **Current dot** (`◉`) = pulsing blue, larger  
- **Empty dot** (`○`) = upcoming step  
- **Labels** appear below dots only on hover/tap (mobile: always show current label)  
- Color: `var(--cor-secundaria)` for completed/current, `rgba(255,255,255,0.2)` for upcoming

---

## Screen-by-Screen Specification

### Step ❶ — INTRO (formerly "Abertura")

**Purpose:** Acknowledge the craving, set expectations, get consent to start.

```html
<div id="agua-step-intro" class="agua-step active">
  <!-- Progress rail: step 1 of 7 -->
  <div class="agua-rail">● ○ ○ ○ ○ ○ ○</div>
  
  <div class="agua-card">
    <div class="agua-emoji-hero">💧</div>
    <h2 class="agua-title">A fissura passa em 5 minutos</h2>
    <p class="agua-body">
      Vamos beber água devagar, gole a gole,<br>
      com respiração entre cada um.<br>
      <strong>3 goles. ~2 minutos.</strong>
    </p>
    <p class="agua-hint">Você vai sentir a fissura diminuir.</p>
  </div>
  
  <button class="btn btn-primary agua-cta">
    Começar a beber água
  </button>
</div>
```

**Text rationale:** "Começar a beber água" is **action-specific** — the user knows exactly what starts. The "3 goles. ~2 minutos." preview eliminates surprise anxiety.

**Encouragement micro-copy:** *"Você vai sentir a fissura diminuir."*

---

### Step ❷ — CHOOSE (formerly "Variação" + "Preparação" merged)

**Purpose:** Select drink type. The preparation tip is shown inline so we eliminate the dead 1-line screen.

```html
<div id="agua-step-choose" class="agua-step">
  <div class="agua-rail">● ● ○ ○ ○ ○ ○</div>
  
  <div class="agua-card">
    <h2 class="agua-title">O que você tem pra beber?</h2>
    <p class="agua-hint">Escolha e já prepare na mão.</p>
  </div>
  
  <div class="agua-choose-grid">
    <button class="agua-option" data-variation="agua_gelada">
      <span class="agua-option-emoji">🧊</span>
      <span class="agua-option-label">Água gelada</span>
      <span class="agua-option-tip">Sinta o frio no copo</span>
    </button>
    
    <button class="agua-option" data-variation="agua_temperatura_ambiente">
      <span class="agua-option-emoji">🫗</span>
      <span class="agua-option-label">Temperatura ambiente</span>
      <span class="agua-option-tip">Observe a água no copo</span>
    </button>
    
    <button class="agua-option" data-variation="agua_com_gas">
      <span class="agua-option-emoji">🫧</span>
      <span class="agua-option-label">Água com gás</span>
      <span class="agua-option-tip">Sinta as bolhas na língua</span>
    </button>
    
    <button class="agua-option" data-variation="cha">
      <span class="agua-option-emoji">🍵</span>
      <span class="agua-option-label">Chá quente</span>
      <span class="agua-option-tip">Segure a xícara com carinho</span>
    </button>
  </div>
</div>
```

**Key change:** Each button now has an **emoji** (visual anchor), a **label**, and a **tip** (replaces the old "preparação" screen). The tip tells the user what to notice *while* preparing — no separate screen needed.

**Encouragement micro-copy:** *"Escolha e já prepare na mão."* — action-oriented, reduces a step.

---

### Step ❸ — GULP 1

**Purpose:** First mindful sip instruction. This is a **calm instruction card** — no breathing on this screen.

```html
<div id="agua-step-gulp-1" class="agua-step">
  <div class="agua-rail">● ● ● ○ ○ ○ ○</div>
  
  <div class="agua-card">
    <div class="agua-gulp-badge">Gole 1 de 3</div>
    <div class="agua-emoji-hero" id="agua-gulp-emoji-1">🧊</div>
    <h2 class="agua-title" id="agua-gulp-title-1">
      Segure o copo e sinta o frio na mão
    </h2>
    <p class="agua-body">
      Não beba ainda. Apenas segure.<br>
      Sinta a temperatura. Observe.
    </p>
    <p class="agua-encourage">🎯 Foco no momento presente.</p>
  </div>
  
  <button class="btn btn-primary agua-cta" id="agua-gulp-done-1">
    Tomei o gole
  </button>
  <button class="btn btn-outline btn-sm agua-skip" id="agua-gulp-skip-1">
    Avançar sem beber
  </button>
</div>
```

**Key changes:**
- **"Tomei o gole"** replaces "Próximo gole" — it's past-tense, confirming the user *did* the action, not commanding a future one.
- **"Avançar sem beber"** replaces "Pular gole" — crystal clear: you're skipping the sip, not skipping breathing.
- **Gulp badge** ("Gole 1 de 3") provides constant position awareness.
- **Instruction is split** into title (what to do) and body (how to do it), creating a visual hierarchy.

**Dynamic content by variation:**

| Variation | Title | Body |
|-----------|-------|------|
| agua_gelada | Segure o copo e sinta o frio na mão | Não beba ainda. Apenas segure e sinta. |
| agua_temperatura_ambiente | Observe a água no copo | Olhe por um momento. Veja a clareza. |
| agua_com_gas | Observe as bolhas subindo | Elas sobem e estouram. Só observe. |
| cha | Segure a xícara com as duas mãos | Sinta o calor. O cheiro. A calma. |

**Encouragement:** Changes per gulp to stay fresh:
- Gulp 1: *"🎯 Foco no momento presente."*
- Gulp 2: *"🌿 A fissura já está mais fraca."*
- Gulp 3: *"✨ Quase lá. Último gole."*

---

### Step ❹ — BREATH 1 (between Gulp 1 and Gulp 2)

**Purpose:** Guided 4-7-8 breathing with **visible countdown**, **cycle indicator**, and **option to skip**.

```html
<div id="agua-step-breath-1" class="agua-step">
  <div class="agua-rail">● ● ● ● ○ ○ ○</div>
  
  <div class="agua-card agua-breath-card">
    <div class="agua-breath-header">
      <span class="agua-breath-why">Respirar acalma a fissura</span>
      <span class="agua-breath-cycle">Ciclo 1 de 2</span>
    </div>
    
    <!-- Breath circle with RING TIMER -->
    <div class="agua-breath-ring-container">
      <svg class="agua-breath-ring" viewBox="0 0 120 120">
        <!-- Background ring -->
        <circle cx="60" cy="60" r="54" 
                stroke="rgba(255,255,255,0.1)" stroke-width="6" fill="none"/>
        <!-- Progress ring (animated via stroke-dashoffset) -->
        <circle id="agua-ring-progress-1" cx="60" cy="60" r="54" 
                stroke="var(--cor-secundaria)" stroke-width="6" fill="none"
                stroke-linecap="round" stroke-dasharray="339.29" stroke-dashoffset="0"
                transform="rotate(-90 60 60)"/>
      </svg>
      <div class="agua-breath-circle-inner" id="agua-breath-circle-1">
        <span class="agua-breath-countdown" id="agua-countdown-1">4</span>
        <span class="agua-breath-label" id="agua-breath-label-1">Inspire</span>
      </div>
    </div>
    
    <!-- Phase indicator -->
    <div class="agua-breath-phases" id="agua-phases-1">
      <span class="agua-phase active" data-phase="inspire">Inspire 4s</span>
      <span class="agua-phase" data-phase="segure">Segure 7s</span>
      <span class="agua-phase" data-phase="expire">Expire 8s</span>
    </div>
    
    <p class="agua-encourage">Siga o ritmo. Sem pressa.</p>
  </div>
  
  <button class="btn btn-outline btn-sm agua-skip-breath" id="agua-skip-breath-1">
    Pular respiração
  </button>
</div>
```

**Key design elements:**

#### A. Ring Timer (SVG progress ring)
- The **stroke-dashoffset** animates from 0 → 339.29 over the phase duration
- This creates a **visual countdown ring** around the breath circle
- The ring color matches the phase:
  - **Inspire:** `#3b82f6` (blue)
  - **Segure:** `#8b5cf6` (purple)  
  - **Expire:** `#22c55e` (green)

#### B. Countdown Number
- Large centered number (`4` → `3` → `2` → `1`) counting down each second
- **Font:** 32px, bold, white
- Below it: the phase label ("Inspire", "Segure", "Expire")

#### C. Phase Indicator
- Three inline pills showing the current phase
- **Active phase** gets `background: var(--cor-primaria); color: white`
- Inactive phases are `background: rgba(255,255,255,0.08); color: var(--texto-fraco)`

#### D. Cycle Counter
- Shows "Ciclo 1 de 2" (reduced from 3 cycles to 2 — shorter for anxious users)
- Each cycle = Inspire(4s) + Segure(7s) + Expire(8s) = 19s
- 2 cycles = ~38 seconds total (reasonable for a craving moment)

#### E. "Pular respiração"
- **Clearly labeled** — you're skipping the breathing exercise, not the gulp
- Goes directly to the next gulp step

#### F. "Respirar acalma a fissura"
- Brief explanation of *why* — this was the missing "why am I breathing?" answer

---

### Step ❺ — GULP 2

Same structure as Step ❸, but:
- Badge: "Gole 2 de 3"
- Title/body per variation (see table below)
- Encouragement: *"🌿 A fissura já está mais fraca."*
- Button: **"Tomei o gole"** → goes to Breath 2
- Skip: **"Avançar sem beber"**

**Dynamic content for Gulp 2:**

| Variation | Title | Body |
|-----------|-------|------|
| agua_gelada | Tome um gole pequeno, devagar | Deixe a água gelada percorrer a boca. |
| agua_temperatura_ambiente | Tome um gole e sinta a textura | A água é suave. Sinta isso. |
| agua_com_gas | Tome um gole e sinta a efervescência | As bolhas formigam. Deixe acontecer. |
| cha | Assopre e tome um gole pequeno | Sabor, calor, calma. |

---

### Step ❻ — BREATH 2 (between Gulp 2 and Gulp 3)

Same structure as Step ❹ but:
- Progress rail: `● ● ● ● ● ● ○`
- Cycle label: "Ciclo 2 de 2" (same 2-cycle pattern)
- After completing → auto-transitions to Gulp 3 after a 1.5s pause with a ✨ fade

---

### Step ⓿ — GULP 3 (final gulp, no breathing after)

```html
<div id="agua-step-gulp-3" class="agua-step">
  <div class="agua-rail">● ● ● ● ● ● ●</div>
  
  <div class="agua-card">
    <div class="agua-gulp-badge">Gole 3 de 3 — o último!</div>
    <div class="agua-emoji-hero" id="agua-gulp-emoji-3">🧊</div>
    <h2 class="agua-title" id="agua-gulp-title-3">
      Tome o último gole, devagar
    </h2>
    <p class="agua-body">
      Saboreie. Sem pressa.<br>
      A água está te ajudando agora.
    </p>
    <p class="agua-encourage">✨ Quase lá. Último gole.</p>
  </div>
  
  <button class="btn btn-primary agua-cta" id="agua-gulp-done-3">
    Terminei de beber
  </button>
  <button class="btn btn-outline btn-sm agua-skip" id="agua-gulp-skip-3">
    Avançar sem beber
  </button>
</div>
```

**Key:** "Terminei de beber" — signals completion. No breathing after this gulp. The progress rail is now fully filled (7/7), giving a sense of accomplishment.

---

### Step ❽ — CHECK-IN (formerly "Registro")

**Purpose:** Register fissura intensity. This is now framed as a **check-in**, not a clinical form.

```html
<div id="agua-step-checkin" class="agua-step">
  <div class="agua-rail">● ● ● ● ● ● ●</div>  <!-- all filled = done! -->
  
  <div class="agua-card">
    <div class="agua-emoji-hero">🩺</div>
    <h2 class="agua-title">Como está a fissura agora?</h2>
    <p class="agua-hint">Compare com antes de começar.</p>
  </div>
  
  <div class="agua-checkin-grid">
    <button class="agua-checkin-btn" data-intensity="passou">
      <span class="agua-checkin-emoji">😊</span>
      <span class="agua-checkin-label">Passou!</span>
    </button>
    <button class="agua-checkin-btn" data-intensity="fraca">
      <span class="agua-checkin-emoji">😌</span>
      <span class="agua-checkin-label">Fraca</span>
    </button>
    <button class="agua-checkin-btn" data-intensity="moderada">
      <span class="agua-checkin-emoji">😐</span>
      <span class="agua-checkin-label">Moderada</span>
    </button>
    <button class="agua-checkin-btn" data-intensity="forte">
      <span class="agua-checkin-emoji">😟</span>
      <span class="agua-checkin-label">Ainda forte</span>
    </button>
  </div>
</div>
```

**Key changes:**
- **Emojis** for emotional anchoring (😊😌😐😟)
- **"Ainda forte"** instead of "Forte" — acknowledges it might still be strong, less discouraging
- **Grid layout** (2×2) instead of vertical list — faster visual scan
- **"Passou!"** has the happiest emoji and is first (top-left) — rewarding if craving passed
- **"Compare com antes de começar."** — frames this as a before/after comparison, not an interrogation

---

### Step ❾ — DONE (formerly "Encerramento")

**Purpose:** Celebrate, offer next actions.

```html
<div id="agua-step-done" class="agua-step">
  <div class="agua-rail">● ● ● ● ● ● ●</div>
  
  <div class="agua-card agua-card-celebration">
    <div class="agua-emoji-hero agua-emoji-bounce">🎉</div>
    <h2 class="agua-title" id="agua-done-title">
      Você cuidou de si!
    </h2>
    <p class="agua-body" id="agua-done-body">
      A fissura perde força quando você age.<br>
      Cada gole foi uma vitória.
    </p>
    <div class="agua-done-stat">
      <span class="agua-done-stat-number">+1</span>
      <span class="agua-done-stat-label">cigarro evitado</span>
    </div>
  </div>
  
  <button class="btn btn-primary agua-cta" onclick="window.aguaRepetir()">
    🔄 Fazer de novo
  </button>
  <button class="btn btn-outline" onclick="window.aguaSairParaEstrategias()">
    Ver outras estratégias
  </button>
</div>
```

**Key changes:**
- **🎉 celebration emoji** with bounce animation (CSS `@keyframes bounce`)
- **"+1 cigarro evitado"** — positive reinforcement, mirrors the dashboard counter
- **Dynamic message:** If intensity was "passou" or "fraca": *"A fissura perde força quando você age."* If "moderada" or "forte": *"Tentar outra atividade pode ajudar."*
- **"Fazer de novo"** with 🔄 — clearer than "Repetir"
- **"Ver outras estratégias"** — clearer than "Voltar às estratégias"

---

## Visual Design Specification

### Color Palette (within agua theme)

| Element | Color | Token |
|---------|-------|-------|
| Card background | `rgba(16,31,51,0.85)` with blur | `var(--bg-card)` + `backdrop-filter` |
| Card border | `rgba(79,209,240,0.2)` | Water-tinted border |
| Primary CTA | `#3b82f6` | `var(--cor-primaria)` |
| Skip/secondary | `rgba(255,255,255,0.08)` bg + `var(--texto-fraco)` | Muted |
| Progress dot (done) | `#4fd1f0` | `var(--cor-secundaria)` |
| Progress dot (current) | `#4fd1f0` + pulse animation | `var(--cor-secundaria)` + glow |
| Progress dot (future) | `rgba(255,255,255,0.15)` | Dim |
| Breath ring (inspire) | `#3b82f6` | Blue |
| Breath ring (segure) | `#8b5cf6` | Purple |
| Breath ring (expire) | `#22c55e` | Green |
| Encouragement text | `#4fd1f0` | `var(--cor-secundaria)` |
| Hint text | `rgba(255,255,255,0.5)` | `var(--texto-fraco)` |

### Card Component

```css
.agua-card {
  background: rgba(16, 31, 51, 0.85);
  backdrop-filter: blur(16px) saturate(150%);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  border: 1px solid rgba(79, 209, 240, 0.2);
  border-radius: 24px;
  padding: 28px 24px;
  margin: 0 auto 20px;
  max-width: 360px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### Progress Rail

```css
.agua-rail {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 16px 0 8px;
  max-width: 360px;
  margin: 0 auto;
}

.agua-rail-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.agua-rail-dot.done {
  background: var(--cor-secundaria);
}

.agua-rail-dot.current {
  background: var(--cor-secundaria);
  width: 14px;
  height: 14px;
  box-shadow: 0 0 12px rgba(79, 209, 240, 0.5);
  animation: agua-pulse 1.5s ease-in-out infinite;
}

.agua-rail-dot.future {
  background: rgba(255, 255, 255, 0.15);
}

@keyframes agua-pulse {
  0%, 100% { box-shadow: 0 0 8px rgba(79, 209, 240, 0.3); }
  50% { box-shadow: 0 0 16px rgba(79, 209, 240, 0.7); }
}
```

### Breathing Ring Timer

```css
.agua-breath-ring-container {
  position: relative;
  width: 140px;
  height: 140px;
  margin: 20px auto;
}

.agua-breath-ring {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
}

.agua-breath-circle-inner {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.agua-breath-countdown {
  font-size: 36px;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.agua-breath-label {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
}
```

**Ring animation math:**
- Circle circumference = 2 × π × 54 ≈ 339.29
- `stroke-dashoffset` goes from `0` (full ring) to `339.29` (empty ring)
- For a phase of `T` seconds, each second decrements by `339.29 / T`
- JS updates `stroke-dashoffset` every 100ms for smooth animation

### Choose Grid (2×2)

```css
.agua-choose-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  max-width: 360px;
  margin: 0 auto;
}

.agua-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 12px;
  border-radius: 20px;
  border: 1px solid var(--borda);
  background: var(--bg-card);
  color: var(--texto-principal);
  cursor: pointer;
  transition: all 0.2s;
}

.agua-option:active {
  transform: scale(0.97);
  border-color: var(--cor-secundaria);
  background: var(--hover-card);
}

.agua-option-emoji { font-size: 32px; margin-bottom: 8px; }
.agua-option-label { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.agua-option-tip { font-size: 12px; color: var(--texto-fraco); }
```

### Check-in Grid (2×2)

```css
.agua-checkin-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  max-width: 360px;
  margin: 0 auto;
}

.agua-checkin-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 12px;
  border-radius: 20px;
  border: 1px solid var(--borda);
  background: var(--bg-card);
  color: var(--texto-principal);
  cursor: pointer;
  transition: all 0.2s;
}

.agua-checkin-emoji { font-size: 36px; margin-bottom: 6px; }
.agua-checkin-label { font-size: 15px; font-weight: 600; }
```

### Gulp Badge

```css
.agua-gulp-badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 50px;
  background: rgba(79, 209, 240, 0.15);
  color: var(--cor-secundaria);
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 12px;
}
```

### Celebration Animation

```css
.agua-emoji-bounce {
  animation: agua-bounce 0.6s ease;
}

@keyframes agua-bounce {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}
```

### Done Stat

```css
.agua-done-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 16px;
  padding: 12px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 16px;
}

.agua-done-stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #22c55e;
}

.agua-done-stat-label {
  font-size: 13px;
  color: var(--texto-fraco);
}
```

### Screen Transitions

```css
.agua-step {
  display: none;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.agua-step.active {
  display: block;
  opacity: 1;
  transform: translateY(0);
}

/* Staggered entrance for card children */
.agua-step.active .agua-card > * {
  animation: agua-fade-up 0.4s ease both;
}
.agua-step.active .agua-card > *:nth-child(1) { animation-delay: 0s; }
.agua-step.active .agua-card > *:nth-child(2) { animation-delay: 0.06s; }
.agua-step.active .agua-card > *:nth-child(3) { animation-delay: 0.12s; }
.agua-step.active .agua-card > *:nth-child(4) { animation-delay: 0.18s; }

@keyframes agua-fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## Breathing Timer — Implementation Detail

### State Machine

```
IDLE → INSPIRE(4s) → SEGURE(7s) → EXPIRE(8s) → [next cycle or DONE]
```

### JS Pseudocode

```javascript
function runBreathPhase(circleEl, ringEl, countdownEl, labelEl, phasesEl, onDone) {
  const phases = [
    { name: 'inspire', label: 'Inspire', color: '#3b82f6', duration: 4000, scale: 1.25 },
    { name: 'segure', label: 'Segure',  color: '#8b5cf6', duration: 7000, scale: 1.25 },
    { name: 'expire', label: 'Expire',  color: '#22c55e', duration: 8000, scale: 0.80 },
  ];
  const TOTAL_CYCLES = 2;
  const CIRCUMFERENCE = 2 * Math.PI * 54; // ≈ 339.29
  
  let cycle = 0;
  let phaseIdx = 0;
  let elapsed = 0;
  let timer = null;
  
  function tick() {
    const phase = phases[phaseIdx];
    const remaining = Math.ceil((phase.duration - elapsed) / 1000);
    
    // Update countdown
    countdownEl.textContent = remaining;
    
    // Update ring progress
    const progress = elapsed / phase.duration;
    ringEl.setAttribute('stroke-dashoffset', CIRCUMFERENCE * progress);
    ringEl.setAttribute('stroke', phase.color);
    
    // Update label
    labelEl.textContent = phase.label;
    
    // Update phase pills
    phasesEl.querySelectorAll('.agua-phase').forEach((el, i) => {
      el.classList.toggle('active', i === phaseIdx);
    });
    
    elapsed += 100;
    
    if (elapsed >= phase.duration) {
      // Next phase
      phaseIdx++;
      elapsed = 0;
      
      if (phaseIdx >= phases.length) {
        phaseIdx = 0;
        cycle++;
        
        if (cycle >= TOTAL_CYCLES) {
          // Done!
          clearInterval(timer);
          onDone();
          return;
        }
      }
    }
  }
  
  // Set initial circle appearance
  const firstPhase = phases[0];
  circleEl.style.background = firstPhase.color;
  circleEl.style.transform = `scale(${firstPhase.scale})`;
  
  timer = setInterval(tick, 100);
  return timer; // for cleanup
}
```

---

## Step Mapping: Old → New

| Old Screen | New Step(s) | Change |
|------------|-------------|--------|
| Abertura | ❶ Intro | Better preview text, action-specific CTA |
| Variação | ❷ Choose | 2×2 grid with emojis + inline tips |
| Preparação | *(merged into ❷)* | Eliminated — tip is on the option button |
| Gole 1 | ❸ Gulp 1 | Badge, encouragement, "Tomei o gole" |
| (breathing) | ❹ Breath 1 | Dedicated screen with ring timer + countdown |
| Gole 2 | ❺ Gulp 2 | Same pattern as Gulp 1 |
| (breathing) | ❻ Breath 2 | Same pattern as Breath 1 |
| Gole 3 | ⓿ Gulp 3 | "Terminei de beber" — no breath after |
| Registro | ❽ Check-in | 2×2 emoji grid, "Compare com antes" |
| Encerramento | ❾ Done | Celebration, +1 stat, better CTAs |

**Net result:** Same essential flow, but **every screen has purpose, position awareness, and unambiguous actions**. The old 6-step sequence is now 9 screens but each is simpler and shorter — the user always knows where they are and what's next.

---

## Firebase Logging — No Changes Required

The `saveFissura()` function in `agua.js` already logs:
- `cravingLogs` collection with `origem: 'agua'`, `variacao`, `intensity`, `strategyUsed: 'agua'`
- `counters` collection with `cigarettesAvoided` increment

The redesign **does not change the data schema**. The only code change is that `aguaGoleAtual` now maps to step numbers ❸❺⓿ (1, 2, 3) instead of being tied to screen toggling, and the breathing cycles are reduced from 3 to 2 (configurable).

---

## Accessibility Notes

- All buttons have descriptive text (no icon-only buttons)
- Breath circle has `aria-live="polite"` on the countdown + label for screen readers
- Progress rail has `aria-label="Progresso: passo X de 7"`
- Color is never the sole indicator (countdown numbers + text labels accompany colors)
- Skip buttons are always visible (never hidden inside a menu)

---

## Implementation Checklist

- [ ] Add new CSS classes to `index.html` `<style>` block
- [ ] Replace `#screen-agua` HTML with new step structure
- [ ] Rewrite `agua.js` with step-based navigation (replacing `mostrarEtapa` with `mostrarStep`)
- [ ] Implement SVG ring timer animation
- [ ] Implement 100ms tick-based countdown
- [ ] Add `agua-rail` component with dynamic dot states
- [ ] Merge "preparação" logic into variation selection
- [ ] Update `aguaInstrucoes` to new title/body format per gulp
- [ ] Add `agua-encourage` array with per-gulp messages
- [ ] Add celebration animation on Done screen
- [ ] Verify Firebase logging still works (same `saveFissura` call)
- [ ] Test on 320px viewport (iPhone SE)
- [ ] Test with VoiceOver/TalkBack
