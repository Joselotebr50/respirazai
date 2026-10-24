// js/subapps/respiracao.js — Respiração 4-7-8 (redesigned with circular timer)
import { db } from '../firebase.js';
import { navigateTo } from '../app.js';
import { pedirDetalhesFissura } from '../registroFissura.js';

let intervalo = null;
let isSOS = false;
let userAtual = null;
let profileAtual = null;

var BREATH_CIRCUMFERENCE = 339.29; // 2 * π * 54
var BREATH_PHASES = [
  { label: 'Inspire', duration: 4, phaseIndex: 0 },
  { label: 'Segure',  duration: 7, phaseIndex: 1 },
  { label: 'Expire',  duration: 8, phaseIndex: 2 }
];
var BREATH_CYCLES = 3;

var BREATH_PHASE_INSTRUCTIONS = [
  'Inspire lentamente pelo nariz',
  'Segure o ar nos pulmões',
  'Expire pela boca, lentamente'
];

export function iniciarRespiracao(user, profile, sos) {
  userAtual = user;
  profileAtual = profile;
  isSOS = sos;
  if (intervalo) { clearInterval(intervalo); intervalo = null; }

  // Hide result buttons, show skip button
  document.getElementById('btn-respiracao-consegui').style.display = 'none';
  document.getElementById('btn-respiracao-falhei').style.display = 'none';
  var btnPular = document.getElementById('btn-respiracao-pular');
  if (btnPular) btnPular.style.display = 'inline-block';

  startBreathingTimer();
}

function startBreathingTimer() {
  if (intervalo) { clearInterval(intervalo); intervalo = null; }

  var ring = document.getElementById('respiracao-ring');
  var countdown = document.getElementById('respiracao-countdown');
  var labelEl = document.getElementById('respiracao-texto');
  var cycleEl = document.getElementById('respiracao-ciclo');
  var phasesEl = document.getElementById('respiracao-fases');
  var instructionEl = document.getElementById('respiracao-instruction');
  var remainingEl = document.getElementById('respiracao-remaining');
  var progressFill = document.getElementById('respiracao-progress-fill');

  if (!ring || !countdown || !labelEl) return;

  ring.style.strokeDashoffset = '0';

  var currentCycle = 0;
  var totalElapsedMs = 0;
  var cycleDurationMs = (4 + 7 + 8) * 1000; // 19000ms
  var totalDurationMs = cycleDurationMs * BREATH_CYCLES; // 57000ms

  function updatePhasePills(activePhaseIndex) {
    if (!phasesEl) return;
    var pills = phasesEl.querySelectorAll('span');
    pills.forEach(function(pill, i) {
      if (i === activePhaseIndex) {
        pill.classList.add('ativo');
      } else {
        pill.classList.remove('ativo');
      }
    });
  }

  function updateInstruction(phaseIndex) {
    if (!instructionEl) return;
    instructionEl.textContent = BREATH_PHASE_INSTRUCTIONS[phaseIndex] || '';
  }

  function updateRemaining(elapsedMs) {
    if (!remainingEl) return;
    var remainingSec = Math.ceil((totalDurationMs - elapsedMs) / 1000);
    remainingEl.textContent = '~' + remainingSec + 's restantes';
  }

  function updateProgress(elapsedMs) {
    if (!progressFill) return;
    var pct = Math.min(100, (elapsedMs / totalDurationMs) * 100);
    progressFill.style.width = pct + '%';
  }

  var tickInterval = 100;
  var tickTimer;

  function tick() {
    totalElapsedMs += tickInterval;
    if (totalElapsedMs >= totalDurationMs) {
      clearInterval(tickTimer);
      intervalo = null;
      countdown.textContent = '\u2713';
      labelEl.textContent = 'Concluído';
      ring.style.strokeDashoffset = String(BREATH_CIRCUMFERENCE);
      updatePhasePills(-1);
      if (instructionEl) instructionEl.textContent = 'Respiração concluída!';
      if (remainingEl) remainingEl.textContent = '';
      updateProgress(totalDurationMs);

      // Show result buttons, hide skip
      document.getElementById('btn-respiracao-consegui').style.display = 'inline-block';
      document.getElementById('btn-respiracao-falhei').style.display = 'inline-block';
      var btnPular = document.getElementById('btn-respiracao-pular');
      if (btnPular) btnPular.style.display = 'none';
      return;
    }

    // Current cycle
    var cycleElapsed = totalElapsedMs % cycleDurationMs;
    var newCycle = Math.floor(totalElapsedMs / cycleDurationMs);
    if (newCycle !== currentCycle) {
      currentCycle = newCycle;
      if (cycleEl) cycleEl.textContent = 'Ciclo ' + (currentCycle + 1) + ' de ' + BREATH_CYCLES;
    }

    // Determine phase
    var phaseElapsed = cycleElapsed;
    var currentPhase = BREATH_PHASES[0];
    for (var i = 0; i < BREATH_PHASES.length; i++) {
      if (phaseElapsed < BREATH_PHASES[i].duration * 1000) {
        currentPhase = BREATH_PHASES[i];
        break;
      }
      phaseElapsed -= BREATH_PHASES[i].duration * 1000;
    }

    // Countdown
    var secsRemaining = Math.ceil((currentPhase.duration * 1000 - phaseElapsed) / 1000);
    countdown.textContent = String(secsRemaining);
    labelEl.textContent = currentPhase.label;
    updatePhasePills(currentPhase.phaseIndex);
    updateInstruction(currentPhase.phaseIndex);
    updateRemaining(totalElapsedMs);
    updateProgress(totalElapsedMs);

    // Ring animation
    var fraction = totalElapsedMs / totalDurationMs;
    ring.style.strokeDashoffset = String(BREATH_CIRCUMFERENCE * fraction);
  }

  // Initial state
  if (cycleEl) cycleEl.textContent = 'Ciclo 1 de ' + BREATH_CYCLES;
  updatePhasePills(0);
  updateInstruction(0);
  updateRemaining(0);
  updateProgress(0);
  countdown.textContent = '4';
  labelEl.textContent = 'Inspire';

  tickTimer = setInterval(tick, tickInterval);
  intervalo = tickTimer;
}

export function finalizarRespiracao() {
  if (intervalo) { clearInterval(intervalo); intervalo = null; }
  var ring = document.getElementById('respiracao-ring');
  if (ring) ring.style.strokeDashoffset = '0';
  var countdown = document.getElementById('respiracao-countdown');
  if (countdown) countdown.textContent = '4';
  var texto = document.getElementById('respiracao-texto');
  if (texto) texto.textContent = 'Inspire';
  document.getElementById('btn-respiracao-consegui').style.display = 'none';
  document.getElementById('btn-respiracao-falhei').style.display = 'none';
  var btnPular = document.getElementById('btn-respiracao-pular');
  if (btnPular) btnPular.style.display = 'none';
}

// Skip breathing → go directly to result
var btnPularResp = document.getElementById('btn-respiracao-pular');
if (btnPularResp) btnPularResp.addEventListener('click', function() {
  if (intervalo) { clearInterval(intervalo); intervalo = null; }
  // Show result buttons
  document.getElementById('btn-respiracao-consegui').style.display = 'inline-block';
  document.getElementById('btn-respiracao-falhei').style.display = 'inline-block';
  var btnPular = document.getElementById('btn-respiracao-pular');
  if (btnPular) btnPular.style.display = 'none';
  var countdown = document.getElementById('respiracao-countdown');
  if (countdown) countdown.textContent = '\u2713';
  var texto = document.getElementById('respiracao-texto');
  if (texto) texto.textContent = 'Pulado';
  var instruction = document.getElementById('respiracao-instruction');
  if (instruction) instruction.textContent = 'Respiração interrompida';
  var remaining = document.getElementById('respiracao-remaining');
  if (remaining) remaining.textContent = '';
});

// Botões de resultado
let salvandoRespiracao = false;

document.getElementById('btn-respiracao-consegui').addEventListener('click', async () => {
  if (!userAtual || salvandoRespiracao) return;
  const detalhes = await pedirDetalhesFissura(isSOS ? 'Registrar fissura vencida (SOS)' : 'Registrar fissura vencida');
  if (!detalhes) return;
  salvandoRespiracao = true;
  try {
    await saveCravingLog(isSOS ? 'respirar_sos' : 'respirar', detalhes.intensidade, detalhes.gatilho, false, userAtual);
    finalizarRespiracao();
    navigateTo('screen-dashboard');
  } catch (e) {
    console.error('Erro ao registrar fissura:', e);
    alert('Não foi possível salvar. Verifique a conexão e tente de novo.');
  } finally {
    salvandoRespiracao = false;
  }
});

document.getElementById('btn-respiracao-falhei').addEventListener('click', async () => {
  if (!userAtual || salvandoRespiracao) return;
  salvandoRespiracao = true;
  try {
    await registerCigarroAutomatico('Fissura - não resistiu (respiração)', userAtual);
    finalizarRespiracao();
    navigateTo('screen-relapse');
  } finally {
    salvandoRespiracao = false;
  }
});

async function saveCravingLog(strategyId, intensity, gatilho, smoked, user) {
  await db.collection('cravingLogs').add({
    userId: user.uid,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    trigger: isSOS ? 'SOS - Respiração' : 'Estratégia: Respiração guiada',
    gatilho: gatilho || null,
    origem: isSOS ? 'sos' : 'estrategia',
    intensity: Number.isFinite(intensity) ? intensity : 6,
    strategyUsed: strategyId,
    smoked: smoked || false,
    urgente: isSOS
  });
  if (!smoked) {
    const counterRef = db.collection('counters').doc(user.uid);
    const cost = profileAtual?.costPerPack || 12.00;
    await counterRef.set({
      cigarettesAvoided: firebase.firestore.FieldValue.increment(1),
      moneySaved: firebase.firestore.FieldValue.increment(cost / 20)
    }, { merge: true });
  }
}

async function registerCigarroAutomatico(trigger, user) {
  await db.collection('cigaretteLogs').add({
    userId: user.uid,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    context: trigger || 'Fissura - não resistiu',
    craving: 8,
    emotion: 'Frustração'
  });
}
