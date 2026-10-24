// js/strategies.js
import { db } from './firebase.js';
import { navigateTo } from './app.js';
import { iniciarRespiracao } from './subapps/respiracao.js';
import { iniciarAgua } from './subapps/agua.js';
import { atualizarContador } from './dashboard.js';
import { pedirDetalhesFissura } from './registroFissura.js';

// Cada estratégia carrega os gatilhos (definidos no onboarding, #trigger-group)
// que ela combate melhor. Usado só para REORDENAR a lista (nunca para esconder
// estratégias) quando o perfil do usuário tem gatilhos salvos.
export const strategies = [
  { id:'agua', label:'Beber água', emoji:'💧', triggers:['cafe', 'refeicao'] },
  { id:'caminhar', label:'Caminhar', emoji:'🚶', triggers:['trabalho', 'tedio'] },
  { id:'apoio', label:'Ligar para apoio', emoji:'📞', triggers:['social', 'ansiedade'] },
  { id:'chiclete', label:'Mascar chiclete', emoji:'🍬', triggers:['cafe', 'refeicao', 'direcao'] },
  { id:'banho', label:'Tomar banho', emoji:'🚿', triggers:['estresse', 'dor'] },
  { id:'audio', label:'Ouvir áudio relaxante', emoji:'🎧', triggers:['estresse', 'ansiedade'] },
  { id:'sair', label:'Sair do gatilho', emoji:'🚪', triggers:['alcool', 'social'] },
  { id:'respirar', label:'Respiração guiada', emoji:'🧘', triggers:['estresse', 'ansiedade', 'dor'] },
  { id:'adiar', label:'Adiar por 5 min', emoji:'⏳', triggers:['tedio', 'direcao', 'outro'] },
  { id:'alongar', label:'Pausa ativa', emoji:'🤸', triggers:['trabalho', 'tedio'] },
  { id:'motivo', label:'Lembrar motivo', emoji:'💪', triggers:['alcool', 'outro'] },
];
window._strategies = strategies;

let rodizioIndex = 0;
let userProfileAtual = null;
let currentUserAtual = null;

export function mostrarEstrategias(user, profile) {
  currentUserAtual = user;
  userProfileAtual = profile;
  const container = document.getElementById('strategies-list');

  const gatilhosDoUsuario = profile?.triggers || [];
  const temPersonalizacao = gatilhosDoUsuario.length > 0;

  const recomendadas = [];
  const outras = [];
  strategies.forEach(s => {
    const combate = s.triggers.some(t => gatilhosDoUsuario.includes(t));
    if (temPersonalizacao && combate) {
      recomendadas.push(s);
    } else {
      outras.push(s);
    }
  });

  function renderCard(s, destacar) {
    return `<div class="card" data-strategy-id="${s.id}" style="display:flex; align-items:center; gap:12px; ${destacar ? 'border:2px solid var(--cor-secundaria);' : ''}">
      <span style="font-size:24px;">${s.emoji}</span>
      <span style="font-size:16px; font-weight:500; flex:1;">${s.label}</span>
      ${destacar ? '<span style="font-size:11px; background:var(--cor-secundaria); color:#fff; padding:3px 8px; border-radius:10px; white-space:nowrap;">Recomendado</span>' : ''}
    </div>`;
  }

  let html;
  if (temPersonalizacao && recomendadas.length) {
    html = `<p style="font-size:13px; text-transform:uppercase; letter-spacing:0.5px; color:var(--texto-medio); margin:12px 0 6px;">Recomendado pra você</p>`
      + recomendadas.map(s => renderCard(s, true)).join('')
      + `<p style="font-size:13px; text-transform:uppercase; letter-spacing:0.5px; color:var(--texto-medio); margin:16px 0 6px;">Outras estratégias</p>`
      + outras.map(s => renderCard(s, false)).join('');
  } else {
    // Sem gatilhos salvos no perfil: comportamento idêntico ao original.
    html = strategies.map(s => renderCard(s, false)).join('');
  }
  container.innerHTML = html;

  container.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', function() {
      const id = this.dataset.strategyId;
      if (id === 'agua') { iniciarAgua(currentUserAtual, userProfileAtual); return; }
      if (id === 'respirar') {
        navigateTo('screen-respiracao');
        iniciarRespiracao(currentUserAtual, userProfileAtual, false);
        return;
      }
      // Estratégias simples -> tela dedicada (fundo temático + dica + frase do usuário)
      abrirTelaEstrategia(id);
    });
  });
  atualizarRodizio(currentUserAtual, userProfileAtual);
}

function abrirTelaEstrategia(id) {
  window._selectedStrategyId = id;
  const fraseEl = document.querySelector(`.estrategia-frase-usuario[data-strategy-id="${id}"]`);
  if (fraseEl) {
    const frases = userProfileAtual?.frases || [];
    fraseEl.textContent = frases.length
      ? `"${frases[Math.floor(Math.random() * frases.length)]}"`
      : '"Você é mais forte que a fissura"';
  }
  navigateTo(`screen-estrategia-${id}`);
}

function atualizarRodizio(user, profile) {
  const fotoEl = document.getElementById('strategies-foto');
  const fraseEl = document.getElementById('strategies-frase');
  
  if (!profile) {
    fotoEl.style.backgroundImage = '';
    fraseEl.textContent = '"Sua motivação aqui"';
    return;
  }
  
  const frases = profile.frases || [];
  if (frases.length) {
    const idx = rodizioIndex % frases.length;
    fraseEl.textContent = `"${frases[idx]}"`;
  } else {
    fraseEl.textContent = '"Você é mais forte que a fissura"';
  }
  
  const fotos = profile.fotos || [];
  if (fotos.length) {
    const idx = rodizioIndex % fotos.length;
    fotoEl.style.backgroundImage = `url(${fotos[idx]})`;
  } else {
    fotoEl.style.backgroundImage = '';
  }
  rodizioIndex++;
  if (window._rodizioInterval) clearInterval(window._rodizioInterval);
  window._rodizioInterval = setInterval(() => {
    if (document.getElementById('screen-strategies').classList.contains('active')) {
      atualizarRodizio(currentUserAtual, userProfileAtual);
    } else {
      clearInterval(window._rodizioInterval);
    }
  }, 8000);
}

export function voltarEstrategias() {
  if (window._rodizioInterval) clearInterval(window._rodizioInterval);
}

// ===== TELAS DE ESTRATÉGIA: voltar / resisti / fumei =====
document.querySelectorAll('.btn-estrategia-voltar').forEach(btn => {
  btn.addEventListener('click', () => navigateTo('screen-strategies'));
});

document.querySelectorAll('.estrategia-btn-venceu').forEach(btn => {
  btn.addEventListener('click', async function() {
    const strategyId = this.dataset.strategyId;
    if (!strategyId || !currentUserAtual || this.disabled) return;
    const detalhes = await pedirDetalhesFissura('Registrar fissura vencida');
    if (!detalhes) return; // cancelou: fica na tela da estratégia
    this.disabled = true;
    try {
      await saveCravingLog(strategyId, detalhes.intensidade, detalhes.gatilho, false, currentUserAtual);
      window._selectedStrategyId = null;
      await atualizarContador(currentUserAtual.uid, userProfileAtual);
      navigateTo('screen-dashboard');
    } catch (e) {
      console.error('Erro ao registrar fissura:', e);
      alert('Não foi possível salvar. Verifique a conexão e tente de novo.');
    } finally {
      this.disabled = false;
    }
  });
});

document.querySelectorAll('.estrategia-btn-fumou').forEach(btn => {
  btn.addEventListener('click', async function() {
    const strategyId = this.dataset.strategyId;
    if (strategyId && currentUserAtual) {
      const strategyLabel = strategies.find(s => s.id === strategyId)?.label || strategyId;
      await registerCigarroAutomatico(`Fissura - não resistiu (${strategyLabel})`, currentUserAtual);
      window._selectedStrategyId = null;
      navigateTo('screen-relapse');
    }
  });
});

// ===== ADIAR 5 MIN: CRONÔMETRO REGRESSIVO =====
const ADIAR_DURATION_S = 300; // 5 minutos
const ADIAR_CIRCUMFERENCE = 339.29;
let adiarTimerInterval = null;

const ADIAR_MOTIVACOES = [
  'A fissura já está diminuindo.',
  'Respire fundo. Você está no controle.',
  'Cada segundo sem fumar é uma vitória.',
  'A vontade passa. Você permanece.',
  'Faltam poucos minutos. Continue forte!',
  'Seu corpo está agradecendo.',
  'A fissura perde força a cada momento.',
  'Você é mais forte que a vontade.',
];

function adiarIniciarTimer() {
  if (adiarTimerInterval) { clearInterval(adiarTimerInterval); adiarTimerInterval = null; }

  const ring = document.getElementById('adiar-timer-ring');
  const countdownEl = document.getElementById('adiar-timer-countdown');
  const labelEl = document.getElementById('adiar-timer-label');
  const motivacaoEl = document.getElementById('adiar-motivacao');
  const buttonsEl = document.getElementById('adiar-timer-buttons');
  if (!ring || !countdownEl) return;

  let elapsed = 0;
  let motivIndex = 0;
  const totalMs = ADIAR_DURATION_S * 1000;
  const tickMs = 200;

  // Show "Adiar mais" button
  buttonsEl.innerHTML = '<button class="btn btn-outline btn-sm" id="adiar-btn-mais">Adiar mais 5 min</button>';
  var btnMais = document.getElementById('adiar-btn-mais');
  if (btnMais) btnMais.addEventListener('click', function() {
    elapsed = 0; // reset to start
    motivIndex = 0;
    if (motivacaoEl) motivacaoEl.textContent = ADIAR_MOTIVACOES[0];
  });

  if (labelEl) labelEl.textContent = 'Esperando...';
  if (motivacaoEl) motivacaoEl.textContent = ADIAR_MOTIVACOES[0];

  adiarTimerInterval = setInterval(function() {
    elapsed += tickMs;
    if (elapsed >= totalMs) {
      clearInterval(adiarTimerInterval);
      adiarTimerInterval = null;
      countdownEl.textContent = '0:00';
      if (labelEl) labelEl.textContent = 'Tempo esgotado!';
      if (motivacaoEl) motivacaoEl.textContent = 'Você conseguiu! A fissura já passou.';
      ring.style.strokeDashoffset = String(ADIAR_CIRCUMFERENCE);
      buttonsEl.innerHTML = '<button class="btn btn-outline btn-sm" id="adiar-btn-mais">Adiar mais 5 min</button>';
      var btnMais2 = document.getElementById('adiar-btn-mais');
      if (btnMais2) btnMais2.addEventListener('click', function() {
        elapsed = 0;
        motivIndex = 0;
        adiarIniciarTimer();
      });
      return;
    }

    // Update countdown
    var remaining = Math.ceil((totalMs - elapsed) / 1000);
    var min = Math.floor(remaining / 60);
    var sec = remaining % 60;
    countdownEl.textContent = min + ':' + (sec < 10 ? '0' : '') + sec;

    // Update ring
    var fraction = elapsed / totalMs;
    ring.style.strokeDashoffset = String(ADIAR_CIRCUMFERENCE * fraction);

    // Rotate motivation every 30s
    var newMotivIndex = Math.floor(elapsed / 30000) % ADIAR_MOTIVACOES.length;
    if (newMotivIndex !== motivIndex) {
      motivIndex = newMotivIndex;
      if (motivacaoEl) motivacaoEl.textContent = ADIAR_MOTIVACOES[motivIndex];
    }
  }, tickMs);
}

// Wire adiar start button
var adiarStartBtn = document.getElementById('adiar-btn-start');
if (adiarStartBtn) adiarStartBtn.addEventListener('click', adiarIniciarTimer);

// Reset timer when entering the screen
function adiarReset() {
  if (adiarTimerInterval) { clearInterval(adiarTimerInterval); adiarTimerInterval = null; }
  var ring = document.getElementById('adiar-timer-ring');
  var countdown = document.getElementById('adiar-timer-countdown');
  var label = document.getElementById('adiar-timer-label');
  var buttons = document.getElementById('adiar-timer-buttons');
  if (ring) ring.style.strokeDashoffset = '0';
  if (countdown) countdown.textContent = '5:00';
  if (label) label.textContent = 'Esperando...';
  if (buttons) buttons.innerHTML = '<button class="btn btn-primary btn-sm" id="adiar-btn-start">Iniciar cronômetro</button>';
  var btn = document.getElementById('adiar-btn-start');
  if (btn) btn.addEventListener('click', adiarIniciarTimer);
}

// Patch abrirTelaEstrategia to add enhanced behaviors (see full patch below)

// ===== ÁUDIO: PLAYER EMBUTIDO =====
document.querySelectorAll('.audio-link').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var src = btn.getAttribute('data-src');
    var player = document.getElementById('audio-player');
    if (player && src) {
      player.src = src;
      player.play().catch(function() {}); // autoplay may be blocked
    }
    // Highlight selected
    document.querySelectorAll('.audio-link').forEach(function(b) {
      b.style.borderColor = '';
      b.style.borderWidth = '';
    });
    btn.style.borderColor = 'var(--cor-secundaria)';
    btn.style.borderWidth = '2px';
  });
});

// ===== LEMBRAR MOTIVO: MOSTRAR FOTOS DO USUÁRIO =====
let motivoFotoIndex = 0;
function motivoMostrarFotos() {
  var container = document.getElementById('motivo-fotos-container');
  if (!container) return;
  var fotos = userProfileAtual?.fotos || [];
  var frases = userProfileAtual?.frases || [];
  container.innerHTML = '';

  if (fotos.length === 0 && frases.length === 0) {
    container.innerHTML = '<p style="font-size:13px;color:var(--texto-fraco);text-align:center;padding:12px;">Adicione fotos e frases motivacionais no onboarding para ver aqui.</p>';
    return;
  }

  // Show photo if available
  if (fotos.length > 0) {
    var idx = motivoFotoIndex % fotos.length;
    var img = document.createElement('img');
    img.src = fotos[idx];
    img.style.cssText = 'width:100%;max-width:300px;border-radius:16px;margin:0 auto 8px;display:block;object-fit:cover;max-height:200px;';
    container.appendChild(img);
  }

  // Show rotating phrase
  if (frases.length > 0) {
    var fidx = motivoFotoIndex % frases.length;
    var p = document.createElement('p');
    p.style.cssText = 'font-style:italic;text-align:center;color:var(--texto-medio);font-size:15px;margin:8px 0;';
    p.textContent = '"' + frases[fidx] + '"';
    container.appendChild(p);
  }

  // Navigation dots if multiple
  if (fotos.length > 1 || frases.length > 1) {
    var dots = document.createElement('div');
    dots.style.cssText = 'display:flex;justify-content:center;gap:6px;margin-top:8px;';
    var total = Math.max(fotos.length, frases.length);
    for (var i = 0; i < total; i++) {
      var dot = document.createElement('span');
      dot.style.cssText = 'width:8px;height:8px;border-radius:50%;background:' + (i === motivoFotoIndex % total ? 'var(--cor-secundaria)' : 'rgba(255,255,255,0.2)') + ';cursor:pointer;';
      dot.addEventListener('click', (function(idx) { return function() { motivoFotoIndex = idx; motivoMostrarFotos(); }; })(i));
      dots.appendChild(dot);
    }
    container.appendChild(dots);
  }

  motivoFotoIndex++;
}

// ===== BOTÃO "ACABEI FUMANDO": CONFIRMAÇÃO =====
document.querySelectorAll('.estrategia-btn-fumou').forEach(function(btn) {
// Confirmation layer: first tap shows warning, second tap fires original
  var originalHandler = btn.onclick;
  btn.addEventListener('click', function(e) {
    if (!btn.dataset._confirmShown) {
      e.stopImmediatePropagation();
      btn.dataset._confirmShown = '1';
      var originalText = btn.textContent;
      btn.textContent = '⚠️ Tem certeza? Toque de novo';
      btn.style.background = '#dc2626';
      setTimeout(function() {
        btn.dataset._confirmShown = '';
        btn.textContent = originalText;
        btn.style.background = '';
      }, 3000);
    }
  }, true); // capture phase
});

// ===== TIMERS SIMPLES PARA CAMINHAR, CHICLETE, BANHO =====
var SIMPLE_TIMERS = {
  caminhar: { duration: 120, label: 'Caminhando' },
  chiclete: { duration: 60, label: 'Mastigando' },
  banho: { duration: 300, label: 'No banho' }
};

Object.keys(SIMPLE_TIMERS).forEach(function(strategyId) {
  var config = SIMPLE_TIMERS[strategyId];
  var timerId = strategyId + '-simple-timer';

  // Add timer HTML after the dica
  var dicaEl = document.querySelector('#screen-estrategia-' + strategyId + ' .estrategia-dica');
  if (dicaEl) {
    var timerDiv = document.createElement('div');
    timerDiv.id = timerId;
    timerDiv.style.cssText = 'text-align:center;margin:12px 0;';
    timerDiv.innerHTML =
      '<span id="' + timerId + '-display" style="font-size:32px;font-weight:700;color:var(--cor-secundaria);">0:00</span>' +
      '<span id="' + timerId + '-status" style="display:block;font-size:12px;color:var(--texto-fraco);margin-top:4px;">de ' + Math.floor(config.duration / 60) + ':' + (config.duration % 60 < 10 ? '0' : '') + (config.duration % 60) + ' min</span>' +
      '<div style="display:flex;gap:8px;justify-content:center;margin-top:8px;">' +
        '<button class="btn btn-primary btn-sm" id="' + timerId + '-start">Iniciar</button>' +
        '<button class="btn btn-outline btn-sm" id="' + timerId + '-stop" style="display:none;">Parar</button>' +
      '</div>';
    dicaEl.parentNode.insertBefore(timerDiv, dicaEl.nextSibling);
  }
});

// Wire simple timer buttons
Object.keys(SIMPLE_TIMERS).forEach(function(strategyId) {
  var config = SIMPLE_TIMERS[strategyId];
  var timerId = strategyId + '-simple-timer';
  var interval = null;
  var elapsed = 0;

  var startBtn = document.getElementById(timerId + '-start');
  var stopBtn = document.getElementById(timerId + '-stop');
  var display = document.getElementById(timerId + '-display');
  var status = document.getElementById(timerId + '-status');

  if (startBtn) startBtn.addEventListener('click', function() {
    if (interval) return;
    elapsed = 0;
    startBtn.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'inline-block';
    interval = setInterval(function() {
      elapsed++;
      var min = Math.floor(elapsed / 60);
      var sec = elapsed % 60;
      if (display) display.textContent = min + ':' + (sec < 10 ? '0' : '') + sec;
      if (elapsed >= config.duration && status) status.textContent = '✓ Tempo mínimo atingido!';
    }, 1000);
  });

  if (stopBtn) stopBtn.addEventListener('click', function() {
    clearInterval(interval);
    interval = null;
    if (startBtn) startBtn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
  });
});

// ===== PAUSA ATIVA: ALONGAMENTOS GUIADOS =====
var ALONGAMENTOS = [
  { emoji: '🙆', title: 'Braços para cima', desc: 'Levante os braços acima da cabeça, entrelace os dedos e estique. Sinta o alongamento dos ombros.', duration: 15 },
  { emoji: '🔄', title: 'Rotação de pescoço', desc: 'Gire a cabeça lentamente para a direita, depois para a esquerda. Mantenha os ombros relaxados.', duration: 15 },
  { emoji: '🧎', title: 'Torção de tronco', desc: 'Sentado, gire o tronco para a direita e segure. Depois para a esquerda. Respire durante o movimento.', duration: 15 },
  { emoji: '🦵', title: 'Pernas e panturrilhas', desc: 'Levante e estique uma perna de cada vez. Faça círculos com o pé para soltar o tornozelo.', duration: 15 }
];
var alongarCurrent = 0;
var alongarInterval = null;

function alongarShowStep(index) {
  if (index >= ALONGAMENTOS.length) {
    // All done
    var stepEl = document.getElementById('alongar-step');
    var startBtn = document.getElementById('alongar-btn-start');
    if (stepEl) stepEl.style.display = 'none';
    if (startBtn) { startBtn.style.display = 'inline-block'; startBtn.textContent = '✓ Concluído! Fazer de novo'; }
    return;
  }
  var a = ALONGAMENTOS[index];
  var emojiEl = document.getElementById('alongar-emoji');
  var titleEl = document.getElementById('alongar-title');
  var descEl = document.getElementById('alongar-desc');
  var timerEl = document.getElementById('alongar-timer');
  var progressEl = document.getElementById('alongar-progress');
  var nextBtn = document.getElementById('alongar-btn-next');

  if (emojiEl) emojiEl.textContent = a.emoji;
  if (titleEl) titleEl.textContent = a.title;
  if (descEl) descEl.textContent = a.desc;
  if (progressEl) progressEl.textContent = (index + 1) + ' de ' + ALONGAMENTOS.length;
  if (nextBtn) nextBtn.textContent = index < ALONGAMENTOS.length - 1 ? 'Próximo →' : '✓ Finalizar';

  // Countdown timer
  if (alongarInterval) clearInterval(alongarInterval);
  var remaining = a.duration;
  if (timerEl) timerEl.textContent = '0:' + (remaining < 10 ? '0' : '') + remaining;

  alongarInterval = setInterval(function() {
    remaining--;
    if (remaining <= 0) {
      clearInterval(alongarInterval);
      alongarInterval = null;
      if (timerEl) timerEl.textContent = '✓';
      return;
    }
    if (timerEl) timerEl.textContent = '0:' + (remaining < 10 ? '0' : '') + remaining;
  }, 1000);
}

var alongarStartBtn = document.getElementById('alongar-btn-start');
if (alongarStartBtn) alongarStartBtn.addEventListener('click', function() {
  alongarCurrent = 0;
  var stepEl = document.getElementById('alongar-step');
  if (stepEl) stepEl.style.display = 'block';
  alongarStartBtn.style.display = 'none';
  alongarShowStep(0);
});

var alongarNextBtn = document.getElementById('alongar-btn-next');
if (alongarNextBtn) alongarNextBtn.addEventListener('click', function() {
  alongarCurrent++;
  alongarShowStep(alongarCurrent);
});

// ===== APOIO: CONTATO CONFIGURÁVEL =====
var apoioConfigBtn = document.getElementById('apoio-btn-config');
if (apoioConfigBtn) apoioConfigBtn.addEventListener('click', function() {
  var phone = prompt('Digite o número de telefone (com DDI, ex: +5511999999999):', userProfileAtual?.apoioTelefone || '');
  if (phone) {
    var clean = phone.replace(/\D/g, '');
    userProfileAtual = userProfileAtual || {};
    userProfileAtual.apoioTelefone = clean;
    // Save to Firestore
    if (currentUserAtual) {
      db.collection('users').doc(currentUserAtual.uid).set({ apoioTelefone: clean }, { merge: true }).catch(function() {});
    }
    // Update links
    var ligarLink = document.getElementById('apoio-link-ligar');
    var zapLink = document.getElementById('apoio-link-zap');
    if (ligarLink) ligarLink.href = 'tel:+' + clean;
    if (zapLink) zapLink.href = 'https://wa.me/' + clean;
  }
});

// Populate apoio links from profile when entering screen
var _origAbrirTela2 = abrirTelaEstrategia;
abrirTelaEstrategia = function(id) {
  _origAbrirTela2(id);
  if (id === 'adiar') adiarReset();
  if (id === 'motivo') motivoMostrarFotos();
  if (id === 'apoio') {
    var phone = userProfileAtual?.apoioTelefone || '';
    if (phone) {
      var ligarLink = document.getElementById('apoio-link-ligar');
      var zapLink = document.getElementById('apoio-link-zap');
      if (ligarLink) ligarLink.href = 'tel:+' + phone;
      if (zapLink) zapLink.href = 'https://wa.me/' + phone;
    }
  }
  if (id === 'alongar') {
    // Reset alongar
    alongarCurrent = 0;
    if (alongarInterval) { clearInterval(alongarInterval); alongarInterval = null; }
    var stepEl = document.getElementById('alongar-step');
    var startBtn = document.getElementById('alongar-btn-start');
    if (stepEl) stepEl.style.display = 'none';
    if (startBtn) { startBtn.style.display = 'inline-block'; startBtn.textContent = 'Iniciar alongamentos'; }
  }
};

// ===== FIX: ÁGUA — SKIP GOLE DEVE IR AO PRÓXIMO GOLE, NÃO À RESPIRAÇÃO =====
// (This is handled in agua.js - skipGulp1/2 now go to breath, which is correct
//  because the flow is: gole → respiração → gole. Skipping a gole still does
//  the breathing exercise, which is the core of the strategy. But we add a
//  "skip all" option by making the skip buttons go directly to next gulp.)
// NOTE: We'll update agua.js skip logic separately.
// 'gatilho' guarda o gatilho da situação (id de GATILHOS) e 'origem' de onde veio o registro.
async function saveCravingLog(strategyId, intensity, gatilho, smoked, user) {
  await db.collection('cravingLogs').add({
    userId: user.uid,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    trigger: 'Estratégia: ' + (strategies.find(s => s.id === strategyId)?.label || strategyId),
    gatilho: gatilho || null,
    origem: 'estrategia',
    intensity: Number.isFinite(intensity) ? intensity : 6,
    strategyUsed: strategyId,
    smoked: smoked || false
  });
  if (!smoked) {
    const counterRef = db.collection('counters').doc(user.uid);
    const cost = userProfileAtual?.costPerPack || 12.00;
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

