// js/subapps/agua.js — Beber Água sub-app (rewritten)
import { db } from '../firebase.js';
import { navigateTo } from '../app.js';
import { atualizarContador } from '../dashboard.js';

// ===== STATE =====
let aguaUser = null;
let aguaProfile = null;
let aguaVariacao = null;
let aguaCurrentStep = 0;
let aguaBreathTimers = [];

// Step order: 0=intro, 1=choose, 2=gulp1, 3=breath1, 4=gulp2, 5=breath2, 6=gulp3, 7=checkin, 8=done
const STEP_IDS = [
  'agua-step-intro',
  'agua-step-choose',
  'agua-step-gulp1',
  'agua-step-breath1',
  'agua-step-gulp2',
  'agua-step-breath2',
  'agua-step-gulp3',
  'agua-step-checkin',
  'agua-step-done'
];

// ===== VARIATION DATA =====
const VARIATION_EMOJIS = {
  agua_gelada: '🧊',
  agua_temperatura_ambiente: '🫗',
  agua_com_gas: '🫧',
  cha: '🍵'
};

const GULP_INSTRUCTIONS = {
  1: {
    agua_gelada:               { title: 'Segure o copo e sinta o frio na mão', body: 'Não beba ainda. Apenas segure e sinta.' },
    agua_temperatura_ambiente: { title: 'Observe a água no copo', body: 'Olhe por um momento. Veja a clareza.' },
    agua_com_gas:              { title: 'Observe as bolhas subindo', body: 'Elas sobem e estouram. Só observe.' },
    cha:                       { title: 'Segure a xícara com as duas mãos', body: 'Sinta o calor. O cheiro. A calma.' }
  },
  2: {
    agua_gelada:               { title: 'Tome um gole pequeno, devagar', body: 'Deixe a água gelada percorrer a boca.' },
    agua_temperatura_ambiente: { title: 'Tome um gole e sinta a textura', body: 'A água é suave. Sinta isso.' },
    agua_com_gas:              { title: 'Tome um gole e sinta a efervescência', body: 'As bolhas formigam. Deixe acontecer.' },
    cha:                       { title: 'Assopre e tome um gole pequeno', body: 'Sabor, calor, calma.' }
  },
  3: {
    agua_gelada:               { title: 'Tome o último gole, devagar', body: 'Saboreie. A água está te ajudando.' },
    agua_temperatura_ambiente: { title: 'Beba o restante com calma', body: 'Sem pressa. A fissura já enfraqueceu.' },
    agua_com_gas:              { title: 'Termine a água', body: 'As bolhas acalmam. Você está no controle.' },
    cha:                       { title: 'Tome o último gole do chá', body: 'O calor fica. A vontade passa.' }
  }
};

const GULP_ENCOURAGEMENT = {
  1: '🎯 Foco no momento presente.',
  2: '🌿 A fissura já está mais fraca.',
  3: '✨ Quase lá. Último gole.'
};

const GULP_BADGES = {
  1: 'Gole 1 de 3',
  2: 'Gole 2 de 3',
  3: 'Gole 3 de 3 — o último!'
};

// ===== PROGRESS RAIL =====
function railDotState(dotIndex, currentStep) {
  if (currentStep >= 7) return 'done';
  if (dotIndex < currentStep) return 'done';
  if (dotIndex === currentStep) return 'current';
  return 'future';
}

function renderRail(containerId, currentStep) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const dot = document.createElement('span');
    dot.className = 'agua-rail-dot ' + railDotState(i, currentStep);
    container.appendChild(dot);
  }
}

// ===== POPULATE GULP SCREEN =====
function populateGulp(gulpNum) {
  const prefix = 'agua-gulp' + gulpNum;
  const variation = aguaVariacao || 'agua_gelada';
  const instr = GULP_INSTRUCTIONS[gulpNum][variation];

  const badge = document.getElementById(prefix + '-badge');
  const emoji = document.getElementById(prefix + '-emoji');
  const title = document.getElementById(prefix + '-title');
  const body  = document.getElementById(prefix + '-body');
  const encourage = document.getElementById(prefix + '-encourage');

  if (badge) badge.textContent = GULP_BADGES[gulpNum];
  if (emoji) emoji.textContent = VARIATION_EMOJIS[variation];
  if (title) title.textContent = instr.title;
  if (body)  body.textContent = instr.body;
  if (encourage) encourage.textContent = GULP_ENCOURAGEMENT[gulpNum];
}

// ===== STEP NAVIGATION =====
function mostrarStep(stepIndex) {
  aguaCurrentStep = stepIndex;

  // Hide all steps
  document.querySelectorAll('#screen-agua .agua-step').forEach(function(el) {
    el.classList.remove('active');
  });

  // Show target step
  var target = document.getElementById(STEP_IDS[stepIndex]);
  if (target) {
    target.classList.add('active');
  }

  // Update rail
  var railId = STEP_IDS[stepIndex].replace('agua-step-', 'agua-rail-');
  renderRail(railId, stepIndex);

  // Populate gulp content
  if (stepIndex === 2) populateGulp(1);
  if (stepIndex === 4) populateGulp(2);
  if (stepIndex === 6) populateGulp(3);

  // Start breathing when entering breath steps
  if (stepIndex === 3) startBreathing(1);
  if (stepIndex === 5) startBreathing(2);
}

// ===== BREATHING TIMER =====
var BREATH_CIRCUMFERENCE = 339.29; // 2 * π * 54
var BREATH_PHASES = [
  { label: 'Inspire', duration: 4, phaseIndex: 0 },
  { label: 'Segure',  duration: 7, phaseIndex: 1 },
  { label: 'Expire',  duration: 8, phaseIndex: 2 }
];
var BREATH_CYCLES = 2;

function clearBreathTimers() {
  aguaBreathTimers.forEach(function(t) { clearTimeout(t); });
  aguaBreathTimers = [];
}

function startBreathing(breathNum) {
  clearBreathTimers();

  var ring = document.getElementById('agua-breath' + breathNum + '-ring');
  var countdown = document.getElementById('agua-breath' + breathNum + '-countdown');
  var labelEl = document.getElementById('agua-breath' + breathNum + '-label');
  var cycleEl = document.getElementById('agua-breath' + breathNum + '-cycle');
  var phasesEl = document.getElementById('agua-breath' + breathNum + '-phases');

  if (!ring || !countdown || !labelEl) return;

  // Reset ring
  ring.style.strokeDashoffset = '0';

  var currentCycle = 0;
  var totalElapsedMs = 0;
  var cycleDurationMs = (4 + 7 + 8) * 1000; // 19000ms per cycle
  var totalDurationMs = cycleDurationMs * BREATH_CYCLES; // 38000ms total

  function updatePhasePills(activePhaseIndex) {
    if (!phasesEl) return;
    var pills = phasesEl.querySelectorAll('.agua-phase');
    pills.forEach(function(pill, i) {
      if (i === activePhaseIndex) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  var tickInterval = 100;
  var tickTimer;

  function tick() {
    totalElapsedMs += tickInterval;
    if (totalElapsedMs >= totalDurationMs) {
      clearInterval(tickTimer);
      countdown.textContent = '✓';
      labelEl.textContent = 'Concluído';
      ring.style.strokeDashoffset = String(BREATH_CIRCUMFERENCE);
      updatePhasePills(-1);
      // Auto-advance after 1.5s
      var advTimer = setTimeout(function() {
        var nextStep = breathNum === 1 ? 4 : 6;
        mostrarStep(nextStep);
      }, 1500);
      aguaBreathTimers.push(advTimer);
      return;
    }

    // Current cycle
    var cycleElapsed = totalElapsedMs % cycleDurationMs;
    var newCycle = Math.floor(totalElapsedMs / cycleDurationMs);
    if (newCycle !== currentCycle) {
      currentCycle = newCycle;
      if (cycleEl) cycleEl.textContent = 'Ciclo ' + (currentCycle + 1) + ' de ' + BREATH_CYCLES;
    }

    // Determine which phase we're in
    var phaseElapsed = cycleElapsed;
    var currentPhase = BREATH_PHASES[0];
    for (var i = 0; i < BREATH_PHASES.length; i++) {
      if (phaseElapsed < BREATH_PHASES[i].duration * 1000) {
        currentPhase = BREATH_PHASES[i];
        break;
      }
      phaseElapsed -= BREATH_PHASES[i].duration * 1000;
    }

    // Countdown seconds remaining
    var secsRemaining = Math.ceil((currentPhase.duration * 1000 - phaseElapsed) / 1000);
    countdown.textContent = String(secsRemaining);
    labelEl.textContent = currentPhase.label;
    updatePhasePills(currentPhase.phaseIndex);

    // Ring animation
    var fraction = totalElapsedMs / totalDurationMs;
    ring.style.strokeDashoffset = String(BREATH_CIRCUMFERENCE * fraction);
  }

  // Initial state
  if (cycleEl) cycleEl.textContent = 'Ciclo 1 de ' + BREATH_CYCLES;
  updatePhasePills(0);
  countdown.textContent = '4';
  labelEl.textContent = 'Inspire';

  tickTimer = setInterval(tick, tickInterval);
  aguaBreathTimers.push(tickTimer);
}

function skipBreathing(breathNum) {
  clearBreathTimers();
  var nextStep = breathNum === 1 ? 4 : 6;
  mostrarStep(nextStep);
}

// ===== SAVE FISSURA (same Firebase logic) =====
async function saveFissura(intensidade) {
  if (!aguaUser) return;
  try {
    await db.collection('cravingLogs').add({
      userId: aguaUser.uid,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      trigger: 'Água - ' + aguaVariacao,
      gatilho: null,
      origem: 'agua',
      variacao: aguaVariacao,
      intensity: intensidade === 'passou' ? 2 : intensidade === 'fraca' ? 4 : intensidade === 'moderada' ? 6 : 8,
      strategyUsed: 'agua',
      smoked: false
    });
    var counterRef = db.collection('counters').doc(aguaUser.uid);
    var cost = aguaProfile?.costPerPack || 12.00;
    await counterRef.set({
      cigarettesAvoided: firebase.firestore.FieldValue.increment(1),
      moneySaved: firebase.firestore.FieldValue.increment(cost / 20)
    }, { merge: true });
  } catch (e) {
    console.error('Erro ao salvar fissura:', e);
  }
}

// ===== REGISTRAR FISSURA (double-click protection) =====
let aguaSalvando = false;

async function aguaRegistrarFissura(intensidade) {
  if (aguaSalvando) return;
  aguaSalvando = true;
  try {
    await saveFissura(intensidade);
    if (aguaUser) {
      try { await atualizarContador(aguaUser.uid, aguaProfile); }
      catch (e) { console.warn('Erro ao atualizar contador:', e); }
    }
  } catch (e) {
    console.error('Erro ao registrar fissura:', e);
  } finally {
    aguaSalvando = false;
  }

  // Update done screen dynamically
  var doneTitle = document.getElementById('agua-done-title');
  var doneBody = document.getElementById('agua-done-body');
  if (intensidade === 'passou' || intensidade === 'fraca') {
    if (doneTitle) doneTitle.textContent = 'Você cuidou de si!';
    if (doneBody) doneBody.innerHTML = 'A fissura perde força quando você age.<br>Cada gole foi uma vitória.';
  } else {
    if (doneTitle) doneTitle.textContent = 'Você tentou!';
    if (doneBody) doneBody.innerHTML = 'Tentar outra atividade pode ajudar.<br>Cada tentativa conta.';
  }

  mostrarStep(8);
}

// ===== PUBLIC FUNCTIONS =====

export function iniciarAgua(user, profile) {
  aguaUser = user;
  aguaProfile = profile;
  aguaVariacao = null;
  aguaCurrentStep = 0;
  clearBreathTimers();
  navigateTo('screen-agua');
  mostrarStep(0);
}

export function sairAgua() {
  clearBreathTimers();
}

export function aguaRepetir() {
  clearBreathTimers();
  aguaVariacao = null;
  aguaCurrentStep = 0;
  mostrarStep(0);
}

export async function aguaSairParaEstrategias() {
  clearBreathTimers();
  if (aguaUser) {
    try { await atualizarContador(aguaUser.uid, aguaProfile); }
    catch (e) { console.warn('Erro ao atualizar contador:', e); }
  }
  navigateTo('screen-strategies');
}

// Window globals for compatibility
window.aguaRepetir = aguaRepetir;
window.aguaSairParaEstrategias = aguaSairParaEstrategias;
window.aguaRegistrarFissura = aguaRegistrarFissura;

// ===== EVENT LISTENERS =====
(function wireEvents() {
  // Intro → Choose
  var btnStart = document.getElementById('agua-btn-start');
  if (btnStart) btnStart.addEventListener('click', function() { mostrarStep(1); });

  // Choose options → Gulp 1
  document.querySelectorAll('#screen-agua .agua-option').forEach(function(btn) {
    btn.addEventListener('click', function() {
      aguaVariacao = btn.getAttribute('data-variation');
      mostrarStep(2);
    });
  });

  // Gulp buttons
  var btnGulp1 = document.getElementById('agua-btn-gulp1');
  if (btnGulp1) btnGulp1.addEventListener('click', function() { mostrarStep(3); });

  var btnGulp2 = document.getElementById('agua-btn-gulp2');
  if (btnGulp2) btnGulp2.addEventListener('click', function() { mostrarStep(5); });

  var btnGulp3 = document.getElementById('agua-btn-gulp3');
  if (btnGulp3) btnGulp3.addEventListener('click', function() { mostrarStep(7); });

  // Skip gulp buttons
  var skipGulp1 = document.getElementById('agua-skip-gulp1');
  if (skipGulp1) skipGulp1.addEventListener('click', function() { mostrarStep(4); });

  var skipGulp2 = document.getElementById('agua-skip-gulp2');
  if (skipGulp2) skipGulp2.addEventListener('click', function() { mostrarStep(6); });

  var skipGulp3 = document.getElementById('agua-skip-gulp3');
  if (skipGulp3) skipGulp3.addEventListener('click', function() { mostrarStep(7); });

  // Skip breath buttons
  var skipBreath1 = document.getElementById('agua-skip-breath1');
  if (skipBreath1) skipBreath1.addEventListener('click', function() { skipBreathing(1); });

  var skipBreath2 = document.getElementById('agua-skip-breath2');
  if (skipBreath2) skipBreath2.addEventListener('click', function() { skipBreathing(2); });

  // Check-in buttons
  document.querySelectorAll('#screen-agua .agua-checkin-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var intensity = btn.getAttribute('data-intensity');
      aguaRegistrarFissura(intensity);
    });
  });

  // Done buttons
  var btnRepeat = document.getElementById('agua-btn-repeat');
  if (btnRepeat) btnRepeat.addEventListener('click', function() { aguaRepetir(); });

  var btnOther = document.getElementById('agua-btn-other-strategies');
  if (btnOther) btnOther.addEventListener('click', function() { aguaSairParaEstrategias(); });

  // Back button in header
  var btnSair = document.getElementById('btn-agua-sair');
  if (btnSair) btnSair.addEventListener('click', function() { aguaSairParaEstrategias(); });
})();
