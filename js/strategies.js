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

// ===== ADIAR 5 MIN: MODO ONDA (fissura sobe, pica e desce) =====
const ADIAR_DURATION_S = 300; // 5 minutos
const ADIAR_CIRCUMFERENCE = 339.29;
let adiarTimerInterval = null;
let adiarFaseAtual = -1;

// Fases da onda: [fimEmMs, classe, mensagem, cor do anel, índice do marco]
// A fissura (onda) sobe até ~40% do tempo (pico), depois desce.
const ADIAR_FASES = [
  { ate: 0,     classe: 'fase-subida',  marco: 0,
    msg: 'A onda está subindo. Respire fundo e permaneça aqui.',
    ring: '#fbbf24' },
  { ate: 90000, classe: 'fase-subida',  marco: 1,
    msg: 'Subindo... desconfortável, mas normal. É só temporário.',
    ring: '#fbbf24' },
  { ate: 150000, classe: 'fase-pico',   marco: 2,
    msg: '🌊 PICO DA ONDA — o momento mais difícil. Daqui pra frente só desce!',
    ring: '#f87171' },
  { ate: 240000, classe: 'fase-descida', marco: 3,
    msg: 'A onda já está descendo. Mais rápido do que você imaginava, né?',
    ring: '#4fd1f0' },
  { ate: 300000, classe: 'fase-vitoria', marco: 4,
    msg: 'Quase na calmaria... aguenta firme!',
    ring: '#4fd1f0' },
];
const ADIAR_FASE_INICIO = {
  classe: 'fase-subida',
  msg: 'A onda está prestes a subir. Toque em começar quando estiver pronto.',
  ring: '#4fd1f0',
};
const ADIAR_VITORIA = {
  msg: '🏆 A onda passou! Você surfou a fissura inteira. Ela sempre passa.',
  ring: '#22c55e',
};

// Curva da fissura: sobe rápido até o pico (~40% do tempo), desce devagar.
// Retorna altura da onda em % (5% a 92%).
function adiarAlturaOnda(elapsedMs) {
  const total = ADIAR_DURATION_S * 1000;
  const t = Math.min(elapsedMs / total, 1);
  const PICO = 0.4; // pico em 40% do tempo (2 min)
  if (t <= PICO) {
    // subida com leve aceleração (easeInQuad)
    const p = t / PICO;
    return 12 + (92 - 12) * p * p;
  }
  // descida suave (easeOutCubic) — a fissura vai embora devagar
  const p = (t - PICO) / (1 - PICO);
  const queda = 1 - Math.pow(1 - p, 3);
  return 92 - (92 - 6) * queda;
}

function adiarAplicarFase(faseIdx, fase) {
  if (adiarFaseAtual === faseIdx) return;
  adiarFaseAtual = faseIdx;

  const waveBox = document.getElementById('adiar-wave-box');
  const faseMsg = document.getElementById('adiar-fase-msg');
  const faseText = document.getElementById('adiar-fase-text');
  const marcos = document.getElementById('adiar-marcos');
  const ring = document.getElementById('adiar-timer-ring');
  const labelEl = document.getElementById('adiar-timer-label');

  // classes de fase
  ['fase-subida', 'fase-pico', 'fase-descida', 'fase-vitoria'].forEach(c => {
    if (waveBox) waveBox.classList.remove(c);
    if (faseMsg) faseMsg.classList.remove(c);
    if (marcos) marcos.classList.remove(c);
  });
  if (waveBox) waveBox.classList.add(fase.classe);
  if (faseMsg) faseMsg.classList.add(fase.classe);
  if (marcos) marcos.classList.add(fase.classe);

  // mensagem da fase
  if (faseText) faseText.textContent = fase.msg;
  if (labelEl) labelEl.textContent = fase.classe === 'fase-pico' ? 'Pico da onda' : 'Surfando...';

  // cor do anel
  if (ring) ring.style.stroke = fase.ring;

  // marcos: marca anteriores como completos, atual como ativo
  if (marcos) {
    marcos.querySelectorAll('.adiar-marco').forEach(m => {
      const idx = parseInt(m.dataset.marco);
      m.classList.toggle('completo', idx < fase.marco);
      m.classList.toggle('ativo', idx === fase.marco);
    });
  }

  // vibração curta ao entrar na fase (se suportado)
  if (navigator.vibrate) navigator.vibrate(fase.classe === 'fase-pico' ? [80, 60, 80] : 60);
}

function adiarConfete() {
  const container = document.getElementById('adiar-confetti');
  if (!container) return;
  const cores = ['#fbbf24', '#4fd1f0', '#22c55e', '#f87171', '#a78bfa', '#f472b6'];
  container.innerHTML = '';
  for (let i = 0; i < 36; i++) {
    const p = document.createElement('div');
    p.className = 'adiar-confetti-piece';
    p.style.left = Math.random() * 100 + '%';
    p.style.background = cores[i % cores.length];
    p.style.animationDelay = (Math.random() * 0.8) + 's';
    p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    container.appendChild(p);
  }
  // limpa após a animação
  setTimeout(() => { container.innerHTML = ''; }, 4000);
}

function adiarIniciarTimer() {
  if (adiarTimerInterval) { clearInterval(adiarTimerInterval); adiarTimerInterval = null; }

  const ring = document.getElementById('adiar-timer-ring');
  const countdownEl = document.getElementById('adiar-timer-countdown');
  const labelEl = document.getElementById('adiar-timer-label');
  const buttonsEl = document.getElementById('adiar-timer-buttons');
  const waveFill = document.getElementById('adiar-wave-fill');
  const waveLabel = document.getElementById('adiar-wave-label');
  if (!ring || !countdownEl) return;

  let elapsed = 0;
  const totalMs = ADIAR_DURATION_S * 1000;
  const tickMs = 200;

  // estado inicial: fase 0
  adiarFaseAtual = -1;
  adiarAplicarFase(0, ADIAR_FASES[0]);
  if (waveLabel) waveLabel.textContent = 'Surfe a onda — ela vai passar';
  if (buttonsEl) {
    buttonsEl.innerHTML = '<button class="btn btn-outline btn-sm" id="adiar-btn-mais">↺ Reiniciar onda</button>';
    var btnMais = document.getElementById('adiar-btn-mais');
    if (btnMais) btnMais.addEventListener('click', function() { adiarIniciarTimer(); });
  }

  adiarTimerInterval = setInterval(function() {
    elapsed += tickMs;
    if (elapsed >= totalMs) {
      clearInterval(adiarTimerInterval);
      adiarTimerInterval = null;
      countdownEl.textContent = '0:00';
      if (labelEl) labelEl.textContent = 'Onda vencida!';
      if (ring) ring.style.strokeDashoffset = String(ADIAR_CIRCUMFERENCE);
      if (ring) ring.style.stroke = ADIAR_VITORIA.ring;
      if (waveFill) waveFill.style.height = '6%';
      // vitória: mensagem, classes, confete, vibração longa
      adiarAplicarFase(ADIAR_FASES.length, { classe: 'fase-vitoria', marco: 5, msg: ADIAR_VITORIA.msg, ring: ADIAR_VITORIA.ring });
      adiarConfete();
      if (navigator.vibrate) navigator.vibrate([120, 80, 120, 80, 200]);
      if (buttonsEl) {
        buttonsEl.innerHTML = '<button class="btn btn-outline btn-sm" id="adiar-btn-mais">🌊 Adiar mais 5 min</button>';
        var btnMais = document.getElementById('adiar-btn-mais');
        if (btnMais) btnMais.addEventListener('click', function() { adiarIniciarTimer(); });
      }
      return;
    }

    // countdown
    var remaining = Math.ceil((totalMs - elapsed) / 1000);
    var min = Math.floor(remaining / 60);
    var sec = remaining % 60;
    countdownEl.textContent = min + ':' + (sec < 10 ? '0' : '') + sec;

    // anel
    var fraction = elapsed / totalMs;
    ring.style.strokeDashoffset = String(ADIAR_CIRCUMFERENCE * fraction);

    // altura da onda
    if (waveFill) waveFill.style.height = adiarAlturaOnda(elapsed) + '%';

    // fase atual
    for (var i = 0; i < ADIAR_FASES.length; i++) {
      if (elapsed < ADIAR_FASES[i].ate || i === ADIAR_FASES.length - 1) {
        adiarAplicarFase(i, ADIAR_FASES[i]);
        break;
      }
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
  var waveFill = document.getElementById('adiar-wave-fill');
  var waveLabel = document.getElementById('adiar-wave-label');
  var faseText = document.getElementById('adiar-fase-text');
  var faseMsg = document.getElementById('adiar-fase-msg');
  var waveBox = document.getElementById('adiar-wave-box');
  var marcos = document.getElementById('adiar-marcos');
  var confetti = document.getElementById('adiar-confetti');

  adiarFaseAtual = -1;
  if (ring) { ring.style.strokeDashoffset = '0'; ring.style.stroke = ADIAR_FASE_INICIO.ring; }
  if (countdown) countdown.textContent = '5:00';
  if (label) label.textContent = 'Pronto para começar';
  if (waveFill) waveFill.style.height = '12%';
  if (waveLabel) waveLabel.textContent = 'Toque em iniciar e surfe a onda';
  if (faseText) faseText.textContent = ADIAR_FASE_INICIO.msg;
  if (faseMsg) { faseMsg.classList.remove('fase-pico', 'fase-descida', 'fase-vitoria'); faseMsg.classList.add('fase-subida'); }
  if (waveBox) { waveBox.classList.remove('fase-pico', 'fase-descida', 'fase-vitoria'); waveBox.classList.add('fase-subida'); }
  if (marcos) {
    marcos.classList.remove('fase-pico', 'fase-descida', 'fase-vitoria');
    marcos.querySelectorAll('.adiar-marco').forEach(m => {
      m.classList.remove('completo');
      m.classList.toggle('ativo', m.dataset.marco === '0');
    });
  }
  if (confetti) confetti.innerHTML = '';
  if (buttons) buttons.innerHTML = '<button class="btn btn-primary btn-sm" id="adiar-btn-start">🌊 Começar a surfar</button>';
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

