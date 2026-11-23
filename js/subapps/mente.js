// js/subapps/mente.js
// OCUPAR A MENTE: números invertidos (reverse digit span).
// O app mostra um número; o usuário digita de trás para frente.
// Acertou -> o próximo número ganha um dígito. Errou -> mostra o número
// certo e o próximo fica um dígito menor (mín. 3). Sem placar, sem punição.
// Objetivo: ocupar a memória de trabalho por 1-2 min para a fissura perder força.

const MENTE_DIGITOS_INICIO = 3;
const MENTE_DIGITOS_MAX = 9;
const MENTE_FEEDBACK_MS = 1600; // auto-avanço após acerto/erro (com atalho por toque)

let menteDigitos = MENTE_DIGITOS_INICIO;
let menteNumeroAtual = '';
let menteAcertos = 0;
let menteFase = 'intro'; // intro | memorizar | digitar | resultado
let menteAutoTimer = null;

function mentePalco() {
  return document.getElementById('mente-palco');
}

function menteGerarNumero(digitos) {
  var n = '';
  for (var i = 0; i < digitos; i++) {
    // primeiro dígito nunca é zero (evita número "menor" visualmente)
    n += i === 0 ? String(Math.floor(Math.random() * 9) + 1) : String(Math.floor(Math.random() * 10));
  }
  return n;
}

// número renderizado dígito a dígito, com entrada suave em cascata
function menteNumeroHtml(numero) {
  return numero.split('').map(function (d, i) {
    return '<span style="animation-delay:' + (i * 110) + 'ms">' + d + '</span>';
  }).join('');
}

function menteLimparAuto() {
  if (menteAutoTimer) { clearTimeout(menteAutoTimer); menteAutoTimer = null; }
}

function menteCardBase() {
  return '<div class="mente-card" id="mente-card">';
}

function menteRenderIntro() {
  menteFase = 'intro';
  menteLimparAuto();
  mentePalco().innerHTML =
    menteCardBase() +
      '<div class="mente-nivel">Desafio de foco</div>' +
      '<p class="mente-sub">Vou mostrar um número. Memorize-o e digite <b>de trás para frente</b>.' +
      ' A cada acerto, ele cresce um dígito. Errou? Nada acontece — o próximo fica menor.</p>' +
      '<button class="btn btn-primary" id="mente-btn-start">Começar</button>' +
    '</div>';
  document.getElementById('mente-btn-start').addEventListener('click', function () {
    menteDigitos = MENTE_DIGITOS_INICIO;
    menteAcertos = 0;
    menteRenderMemorizar();
  });
}

function menteRenderMemorizar() {
  menteFase = 'memorizar';
  menteLimparAuto();
  menteNumeroAtual = menteGerarNumero(menteDigitos);
  mentePalco().innerHTML =
    menteCardBase() +
      '<div class="mente-nivel">' + menteDigitos + ' dígitos · memorize</div>' +
      '<div class="mente-numero" id="mente-numero">' + menteNumeroHtml(menteNumeroAtual) + '</div>' +
      '<p class="mente-sub">No tempo que você precisar. Toque em "Já guardei" quando estiver na cabeça.</p>' +
      '<button class="btn btn-primary" id="mente-btn-pronto">Já guardei</button>' +
    '</div>';
  document.getElementById('mente-btn-pronto').addEventListener('click', menteRenderDigitar);
}

function menteRenderDigitar() {
  menteFase = 'digitar';
  mentePalco().innerHTML =
    menteCardBase() +
      '<div class="mente-nivel">' + menteDigitos + ' dígitos · invertido</div>' +
      '<input class="mente-input" id="mente-input" inputmode="numeric" autocomplete="off"' +
        ' maxlength="' + (MENTE_DIGITOS_MAX + 2) + '" placeholder="···" aria-label="Digite o número invertido" />' +
      '<p class="mente-sub">Digite o número de trás para frente</p>' +
      '<button class="btn btn-primary" id="mente-btn-ver">Verificar</button>' +
      '<div class="mente-feedback" id="mente-feedback"></div>' +
    '</div>';
  var input = document.getElementById('mente-input');
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') menteVerificar();
  });
  document.getElementById('mente-btn-ver').addEventListener('click', menteVerificar);
  // teclado numérico abre já focado no celular
  if (input.focus) input.focus();
}

function menteVerificar() {
  var input = document.getElementById('mente-input');
  if (!input) return;
  var resposta = input.value.replace(/\D/g, '');
  if (!resposta) return; // nada digitado: espera
  var esperado = menteNumeroAtual.split('').reverse().join('');

  if (resposta === esperado) {
    menteAcertos++;
    menteResultado(true, esperado);
  } else {
    menteResultado(false, esperado);
  }
}

function menteResultado(acertou, esperado) {
  menteFase = 'resultado';
  var card = document.getElementById('mente-card');
  var fb = document.getElementById('mente-feedback');
  if (card) card.classList.add(acertou ? 'ok' : 'erro');
  if (fb) {
    fb.className = 'mente-feedback ' + (acertou ? 'ok' : 'erro');
    fb.textContent = acertou
      ? 'Correto! Próximo: ' + Math.min(menteDigitos + 1, MENTE_DIGITOS_MAX) + ' dígitos'
      : 'Quase! O número era ' + esperado;
  }
  // desabilita botão de verificar durante o resultado
  var btnVer = document.getElementById('mente-btn-ver');
  if (btnVer) btnVer.disabled = true;
  var inputEl = document.getElementById('mente-input');
  if (inputEl) inputEl.disabled = true;

  var proximoDigitos = acertou
    ? Math.min(menteDigitos + 1, MENTE_DIGITOS_MAX)
    : Math.max(MENTE_DIGITOS_INICIO, menteDigitos - 1);

  var rodape = document.createElement('div');
  rodape.className = 'mente-rodape';
  rodape.innerHTML =
    (menteAcertos > 0 ? 'Acertos nesta sessão: ' + menteAcertos + ' · ' : '') +
    '<button class="btn btn-outline btn-sm" id="mente-btn-proximo" style="margin-left:6px;">Continuar →</button>';
  var fbEl = document.getElementById('mente-feedback');
  if (fbEl && fbEl.parentNode) fbEl.parentNode.appendChild(rodape);
  document.getElementById('mente-btn-proximo').addEventListener('click', function () {
    menteDigitos = proximoDigitos;
    menteRenderMemorizar();
  });

  // auto-avanço suave (o toque em "Continuar" adianta)
  menteAutoTimer = setTimeout(function () {
    menteAutoTimer = null;
    if (menteFase !== 'resultado') return;
    menteDigitos = proximoDigitos;
    menteRenderMemorizar();
  }, MENTE_FEEDBACK_MS);
}

export function menteIniciar() {
  menteDigitos = MENTE_DIGITOS_INICIO;
  menteNumeroAtual = '';
  menteAcertos = 0;
  menteRenderIntro();
}

// ponte para testes
window._menteIniciar = menteIniciar;
window._menteEstado = function () {
  return { fase: menteFase, digitos: menteDigitos, numero: menteNumeroAtual, acertos: menteAcertos };
};
