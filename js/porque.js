// js/porque.js
// LEMBRAR POR QUÊ: slideshow em tela cheia com as fotos e frases motivacionais
// cadastradas no onboarding (userMedia.fotos + users.frases).
// É um OVERLAY fixo — não é uma .screen: não mexe no roteador showScreen e
// não pausa timers, por isso pode ser aberto por cima do Adiar 5-4-3-2-1
// sem atrapalhar o relógio dos 5 minutos.

const PORQUE_PAUSA_MS = 5000; // cada slide fica 5s na tela

let porquePerfil = null;
let porqueSlides = [];
let porqueIdx = 0;
let porqueAutoTimer = null;

function porqueTemConteudo(p) {
  return !!(p && ((p.fotos && p.fotos.length) || (p.frases && p.frases.length)));
}

// Monta os slides juntando as duas listas do cadastro:
// slide i = foto[i] (se existir) + frase[i % frases.length] (se houver frases).
// Só frases -> slides de texto no escuro. Só fotos -> fotos sem legenda.
function porqueMontarSlides() {
  var p = porquePerfil || {};
  var fotos = p.fotos || [];
  var frases = p.frases || [];
  var total = Math.max(fotos.length, frases.length);
  var slides = [];
  for (var i = 0; i < total; i++) {
    slides.push({
      foto: fotos[i] || null,
      frase: frases.length ? frases[i % frases.length] : null
    });
  }
  return slides;
}

function porqueEls() {
  return {
    overlay: document.getElementById('porque-overlay'),
    img: document.getElementById('porque-foto'),
    frase: document.getElementById('porque-frase'),
    contador: document.getElementById('porque-contador'),
    dots: document.getElementById('porque-dots')
  };
}

function porqueMostrar(i) {
  var els = porqueEls();
  if (!els.overlay || !porqueSlides.length) return;
  porqueIdx = ((i % porqueSlides.length) + porqueSlides.length) % porqueSlides.length;
  var slide = porqueSlides[porqueIdx];

  // conteúdo do slide
  if (slide.foto) {
    els.img.style.display = 'block';
    if (els.img.getAttribute('src') !== slide.foto) els.img.src = slide.foto;
  } else {
    els.img.style.display = 'none';
    els.img.removeAttribute('src');
  }
  var txt = slide.frase ? '\u201C' + slide.frase + '\u201D' : '';
  els.frase.textContent = txt;
  els.frase.style.display = txt ? 'block' : 'none';

  // reinicia o fade (remove -> reflow -> re-adiciona a classe)
  els.img.classList.remove('visivel');
  els.frase.classList.remove('visivel');
  void els.img.offsetWidth;
  if (slide.foto) els.img.classList.add('visivel');
  if (txt) els.frase.classList.add('visivel');

  els.contador.textContent = (porqueIdx + 1) + ' / ' + porqueSlides.length;

  els.dots.innerHTML = '';
  porqueSlides.forEach(function (_, k) {
    var d = document.createElement('span');
    d.className = 'porque-dot' + (k === porqueIdx ? ' ativo' : '');
    d.addEventListener('click', function (e) {
      e.stopPropagation();
      porqueMostrar(k);
      porqueAutoReiniciar();
    });
    els.dots.appendChild(d);
  });

  porqueProgIniciar();
}

// barrinha de progresso do slide atual (reinicia a cada troca)
function porqueProgIniciar() {
  var bar = document.getElementById('porque-prog-bar');
  if (!bar) return;
  bar.style.transition = 'none';
  bar.style.width = '0%';
  void bar.offsetWidth; // força reflow para a transição recomeçar do zero
  bar.style.transition = 'width ' + PORQUE_PAUSA_MS + 'ms linear';
  bar.style.width = '100%';
}

function porqueAutoReiniciar() {
  if (porqueAutoTimer) { clearInterval(porqueAutoTimer); porqueAutoTimer = null; }
  if (porqueSlides.length <= 1) return; // um slide só não precisa girar
  porqueAutoTimer = setInterval(function () { porqueMostrar(porqueIdx + 1); }, PORQUE_PAUSA_MS);
}

export function porqueAbrir(perfil) {
  if (perfil) porquePerfil = perfil;
  if (!porqueTemConteudo(porquePerfil)) {
    alert('Você ainda não cadastrou fotos ou frases motivacionais. Toque na engrenagem (editar perfil) para adicionar.');
    return;
  }
  porqueSlides = porqueMontarSlides();
  document.getElementById('porque-overlay').classList.add('aberto');
  porqueMostrar(0);
  porqueAutoReiniciar();
}

function porqueFechar() {
  document.getElementById('porque-overlay').classList.remove('aberto');
  if (porqueAutoTimer) { clearInterval(porqueAutoTimer); porqueAutoTimer = null; }
  var els = porqueEls();
  els.img.classList.remove('visivel');
  els.frase.classList.remove('visivel');
}

// Mostra/esconde o botão da home conforme o perfil tem fotos ou frases.
export function porqueSetPerfil(p) {
  porquePerfil = p || null;
  var btn = document.getElementById('btn-porque');
  if (btn) btn.style.display = porqueTemConteudo(porquePerfil) ? 'block' : 'none';
}

// Verdade única sobre "o usuário tem fotos/frases cadastradas?":
// porquePerfil é sincronizado pelo app.js no login/logout/onboarding,
// independente de a tela de estratégias já ter sido aberta ou não.
export function porqueTemMidia() {
  return porqueTemConteudo(porquePerfil);
}

// wiring único (módulo ES: é avaliado uma vez só)
(function porqueWiring() {
  var btn = document.getElementById('btn-porque');
  if (btn) btn.addEventListener('click', function () { porqueAbrir(porquePerfil); });

  var overlay = document.getElementById('porque-overlay');
  if (overlay) {
    // toque: terço esquerdo volta, resto avança (padrão de stories)
    overlay.addEventListener('click', function (e) {
      if (e.target.closest('#porque-btn-fechar')) { porqueFechar(); return; }
      if (e.target.closest('.porque-dot')) return;
      var x = e.clientX / window.innerWidth;
      if (x < 0.33) porqueMostrar(porqueIdx - 1); else porqueMostrar(porqueIdx + 1);
      porqueAutoReiniciar();
    });
  }

  document.addEventListener('keydown', function (e) {
    var aberto = document.getElementById('porque-overlay').classList.contains('aberto');
    if (!aberto) return;
    if (e.key === 'Escape') porqueFechar();
    if (e.key === 'ArrowRight') { porqueMostrar(porqueIdx + 1); porqueAutoReiniciar(); }
    if (e.key === 'ArrowLeft') { porqueMostrar(porqueIdx - 1); porqueAutoReiniciar(); }
  });
})();

// Ponte para outras telas (atalho no Adiar) e para os testes
window._porqueAbrir = porqueAbrir;
window._porqueSetPerfil = porqueSetPerfil;
