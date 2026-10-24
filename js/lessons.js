// js/lessons.js — Lições com conteúdo rico, progresso, categorias e quiz

import { db } from './firebase.js';

// ===== DADOS DAS LIÇÕES (conteúdo expandido) =====
const lessons = [
  {
    id: 'gatilhos',
    title: 'Conhecendo seus gatilhos',
    emoji: '🎯',
    category: 'conhecimento',
    intro: [
      'Gatilhos são situações, emoções, lugares ou pessoas que "disparam" a vontade de fumar. Eles são automáticos — você nem percebe que foi ativado, só sente a fissura chegando.',
      'Os gatilhos mais comuns são: café da manhã, após refeições, dirigir, pausa no trabalho, álcool, estresse, tédio e conversas sociais. Mas cada pessoa tem seus próprios gatilhos únicos.',
      'O primeiro passo para vencer é reconhecer seus gatilhos. Quando você sabe o que dispara a vontade, pode se preparar antes que ela apareça.'
    ],
    tip: 'Anote os 3 momentos em que você mais sente vontade de fumar. Só de identificar, você já metade do caminho andado.',
    exercise: {
      type: 'text',
      prompt: 'Quais são seus 3 principais gatilhos?',
      placeholder: 'Ex: café da manhã, após almoço, dirigindo...'
    },
    strategy: { id: 'sair', label: 'Sair do gatilho', emoji: '🚪' },
    quiz: {
      question: 'O que é um gatilho para fumar?',
      options: [
        'Um tipo especial de cigarro',
        'Uma situação ou emoção que ativa a vontade de fumar',
        'Um remédio para parar de fumar'
      ],
      correct: 1
    }
  },
  {
    id: 'respiracao-478',
    title: 'Respiração 4-7-8',
    emoji: '🧘',
    category: 'ferramenta',
    intro: [
      'A respiração 4-7-8 é uma técnica do Dr. Andrew Weil que acalma o sistema nervoso em segundos. Funciona porque respirar lentamente ativa o nervo vago, que é o "freio" do corpo — ele reduz a frequência cardíaca e diminui a ansiedade.',
      'A fissura de fumar é uma resposta do sistema nervoso simpático (o "acelerador"). A respiração 4-7-8 ativa o parassimpático (o "freio"), cancelando o efeito da fissura.',
      'Estudos mostram que após 3 ciclos de respiração 4-7-8, a intensidade da fissura cai em média 50%. É a ferramenta mais rápida que existe.'
    ],
    tip: 'Faça pelo menos 3 ciclos completos. O primeiro ciclo sempre parece estranho — é no terceiro que você sente o efeito.',
    exercise: {
      type: 'action',
      prompt: 'Que tal praticar agora mesmo?',
      buttonText: '🧘 Praticar Respiração',
      strategyId: 'respirar'
    },
    strategy: { id: 'respirar', label: 'Respiração guiada', emoji: '🧘' },
    quiz: {
      question: 'Por que a respiração 4-7-8 ajuda na fissura?',
      options: [
        'Porque distrai a mente por alguns segundos',
        'Porque ativa o nervo vago, acalmando o sistema nervoso',
        'Porque substitui o ar do cigarro'
      ],
      correct: 1
    }
  },
  {
    id: 'desarmando-ambiente',
    title: 'Desarmando o ambiente',
    emoji: '🛡️',
    category: 'ferramenta',
    intro: [
      'Seu ambiente influencia mais do que sua força de vontade. Pesquisas mostram que pessoas que removem cigarros e cinzeiros de casa têm 2x mais chance de sucesso nos primeiros 7 dias.',
      'O princípio é simples: dificulte o acesso. Se fumar exigir esforço (sair de casa, encontrar isqueiro, comprar cigarro), você ganha tempo precioso — e a fissura passa enquanto você busca.',
      'Não é vergonha nenhuma pedir ajuda. Jogar fora cinzeiros, guardar isqueiros, avisar colegas — tudo conta.'
    ],
    tip: 'Jogue fora TODOS os cinzeiros e guardanapos. Deixe isqueiros em locais difíceis de alcançar. Lave roupas que cheiram cigarro — o cheiro é um gatilho invisível.',
    exercise: {
      type: 'checklist',
      prompt: 'Marque o que você já fez:',
      items: ['Joguei fora cinzeiros', 'Guardei isqueiros fora do alcance', 'Avisei amigos/familiares', 'Lavei roupas com cheiro de cigarro', 'Limpei carro/casa']
    },
    strategy: { id: 'sair', label: 'Sair do gatilho', emoji: '🚪' },
    quiz: {
      question: 'Por que limpar o ambiente é tão importante?',
      options: [
        'Porque sujeira faz mal à saúde',
        'Porque removing gatilhos visuais e olfativos reduz fissura automaticamente',
        'Porque é bom ter a casa organizada'
      ],
      correct: 1
    }
  },
  {
    id: 'plano-se-entao',
    title: 'Plano Se... Então...',
    emoji: '📋',
    category: 'ferramenta',
    intro: [
      'O "Plano Se-Então" é a técnica mais eficaz da ciência do comportamento para criar novos hábitos. Em vez de confiar na força de vontade (que falha), você cria automaticidades: "SE acontecer X, ENTÃO eu faço Y".',
      'Exemplo: "SE eu sentir vontade após o almoço, ENTÃO eu masco um chiclete e caminho 5 minutos." O cérebro aprende a rota alternativa e, com repetição, ela se torna automática.',
      'Estudos da University of Hertfordshire mostram que pessoas com plano Se-Então têm 3x mais chance de sucesso do que quem só "decide parar".'
    ],
    tip: 'Crie pelo menos 3 planos para seus gatilhos mais frequentes. Escreva e deixe visível (papel na geladeira, nota no celular).',
    exercise: {
      type: 'text',
      prompt: 'Crie seu primeiro plano Se-Então:',
      placeholder: 'SE [gatilho], ENTÃO [ação alternativa]'
    },
    strategy: { id: 'adiar', label: 'Adiar por 5 min', emoji: '⏳' },
    quiz: {
      question: 'O Plano Se-Então funciona porque:',
      options: [
        'É uma promessa que você faz para si mesmo',
        'Cria automaticidade no cérebro, substituindo a força de vontade',
        'Deixa o plano escrito para não esquecer'
      ],
      correct: 1
    }
  },
  {
    id: 'fissura-5min',
    title: 'Fissura passa em 5 min',
    emoji: '🌊',
    category: 'conhecimento',
    intro: [
      'A fissura é como uma onda: sobe, atinge o pico e desce. Dura em média 3 a 5 minutos. Depois, ela diminui sozinha — mesmo que você não faça nada. Isso é neurociência, não motivação.',
      'Quando a fissura vem, o cérebro libera dopamina na expectativa da nicotina. Mas se você NÃO fuma, o pico de dopamina cai em minutos. O desconforto é real, mas é temporário.',
      'A chave é NÃO lutar contra a fissura — isso fortalece o pensamento. Em vez disso, aceite: "A fissura está aqui, e vai passar em 5 minutos." Observe-a como uma onda que sobe e desce.'
    ],
    tip: 'Quando a fissura vier, olhe o relógio. Marque 5 minutos. Diga pra si: "Eu só preciso aguentar 5 minutos. Depois disso, a vontade vai ser bem menor."',
    exercise: {
      type: 'action',
      prompt: 'A fissura está forte? Adie agora!',
      buttonText: '⏳ Adiar por 5 minutos',
      strategyId: 'adiar'
    },
    strategy: { id: 'adiar', label: 'Adiar por 5 min', emoji: '⏳' },
    quiz: {
      question: 'Quanto tempo dura a fissura em média?',
      options: [
        '30 minutos a 1 hora',
        '3 a 5 minutos — ela passa como uma onda',
        'Enquanto você não fumar, ela não passa'
      ],
      correct: 1
    }
  },
  {
    id: 'recompensas',
    title: 'Recompensas sem cigarro',
    emoji: '💰',
    category: 'manutencao',
    intro: [
      'Parar de fumar é a decisão financeira mais rentosa que a maioria das pessoas pode tomar. Um maço por dia custa R$ 1.800/ano — em 10 anos, são R$ 18.000 só em cigarros. Isso sem contar gastos com saúde.',
      'Mas a recompensa não é só dinheiro. Em 20 minutos sem fumar, sua pressão já normaliza. Em 2 semanas, sua circulação melhora. Em 1 ano, seu risco de infarto cai pela metade.',
      'Celebrar cada conquista — mesmo as pequenas — reforça o novo comportamento. O cérebro precisa de dopamina, e antes ele recebia do cigarro. Agora você precisa dar a ele de fontes saudáveis.'
    ],
    tip: 'Coloque o dinheiro que economizou em um pote transparente. Ver o dinheiro crescer é uma recompensa visual poderosa. Comemore 1 dia, 1 semana, 1 mês sem fumar.',
    exercise: {
      type: 'text',
      prompt: 'O que você vai fazer com o dinheiro economizado?',
      placeholder: 'Ex: viajar, comprar algo que quero, guardar...'
    },
    strategy: { id: 'motivo', label: 'Lembrar motivo', emoji: '💪' },
    quiz: {
      question: 'Quanto seu risco de infarto cai após 1 ano sem fumar?',
      options: [
        '10%',
        '25%',
        '50% — cai pela metade'
      ],
      correct: 2
    }
  },
  {
    id: 'mitos',
    title: 'Mitos sobre fumar',
    emoji: '❌',
    category: 'conhecimento',
    intro: [
      '"Fumar acalma" é o maior mito da história do tabagismo. A nicotina É um estimulante — ela acelera o coração e aumenta a pressão. A "calma" que você sente é só o alívio da abstinência que o próprio cigarro causou.',
      'É um ciclo vicioso: o cigarro cria a tensão (abstinência), e então "resolve" a tensão que ele mesmo criou. Sem o cigarro, você não teria ficado tenso em primeiro lugar.',
      'Outro mito: "Eu sou forte, posso parar quando quiser." A nicotina é mais viciante que cocaína e heroína segundo critérios científicos. Não é falta de força de vontade — é uma dependência química real.'
    ],
    tip: 'Da próxima vez que pensar "um cigarrinho me acalma", lembre: ele está apenas resolvendo a tensão que ele mesmo criou. Sem ele, você já estaria calmo.',
    exercise: {
      type: 'text',
      prompt: 'Qual mito você mais acreditava? O que mudou?',
      placeholder: 'Ex: achava que acalmava, mas agora sei que é o contrário...'
    },
    strategy: { id: 'respirar', label: 'Respiração guiada', emoji: '🧘' },
    quiz: {
      question: 'Por que fumar parece acalmar?',
      options: [
        'Porque a nicotina é um calmante natural',
        'Porque o cigarro resolve a abstinência que ele mesmo causou',
        'Porque a fumaça tem propriedades relaxantes'
      ],
      correct: 1
    }
  },
  {
    id: 'prevencao-recaida',
    title: 'Prevenção de recaída',
    emoji: '🛡️',
    category: 'manutencao',
    intro: [
      'Recaída NÃO é fracasso. É parte do processo. Estudos mostram que a maioria das pessoas que parou de fumar definitivamente recaiu pelo menos uma vez antes. Cada recaída ensina algo — se você aprender a lição.',
      'As situações de maior risco são: as 3 primeiras semanas, após beber álcool, momentos de forte estresse emocional, e "só um trago" (que volta ao nível anterior em dias).',
      'O segredo é ter um plano para esses momentos. Em vez de "eu não vou recair", pense: "SE eu recair, EU vou [parar imediatamente, anotar o que aconteceu, usar minha estratégia X]."'
    ],
    tip: 'Nunca diga "já que eu fumei um, vou fumar o maço todo." Um cigarro é um deslize. Voltar a fumar é a recaída. Pare no primeiro cigarro e recomece imediatamente.',
    exercise: {
      type: 'text',
      prompt: 'Qual sua situação de maior risco? Como vai lidar?',
      placeholder: 'Ex: quando bebo, vou evitar álcool nas primeiras 3 semanas'
    },
    strategy: { id: 'adiar', label: 'Adiar por 5 min', emoji: '⏳' },
    quiz: {
      question: 'Recaída significa que você fracassou?',
      options: [
        'Sim, é melhor recomeçar do zero',
        'Não — recaída é parte do processo e ensina algo',
        'Sim, mas só se durar mais de uma semana'
      ],
      correct: 1
    }
  }
];

// ===== CATEGORIAS =====
const CATEGORIES = [
  { id: 'conhecimento', label: 'Conhecimento', emoji: '🧠', color: '#3b82f6' },
  { id: 'ferramenta',   label: 'Ferramentas',  emoji: '🛠️', color: '#10b981' },
  { id: 'manutencao',   label: 'Manutenção',   emoji: '💪', color: '#f59e0b' }
];

// ===== PROGRESSO =====
// Salva em localStorage (instantâneo, funciona offline).
// Quando há usuário logado, sincroniza com Firestore ao abrir/fechar a tela.
const STORAGE_KEY = 'respira_lessons_completed';

function getCompletedLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function saveCompletedLocal(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

let completedIds = getCompletedLocal();

async function syncFromFirebase(user) {
  if (!user) return;
  try {
    const doc = await db.collection('users').doc(user.uid).get();
    if (doc.exists) {
      const fb = doc.data().lessonsCompleted || [];
      // Merge: o que está local + o que está no Firebase
      const merged = [...new Set([...completedIds, ...fb])];
      completedIds = merged;
      saveCompletedLocal(merged);
    }
  } catch (e) {
    console.warn('Erro ao sincronizar lições do Firebase:', e);
  }
}

async function saveToFirebase(user, ids) {
  if (!user) return;
  try {
    await db.collection('users').doc(user.uid).set(
      { lessonsCompleted: ids },
      { merge: true }
    );
  } catch (e) {
    console.warn('Erro ao salvar lições no Firebase:', e);
  }
}

function isCompleted(id) {
  return completedIds.includes(id);
}

async function markCompleted(id, user) {
  if (!completedIds.includes(id)) {
    completedIds.push(id);
    saveCompletedLocal(completedIds);
    await saveToFirebase(user, completedIds);
  }
}

// ===== RENDERIZAÇÃO DA LISTA =====
export async function carregarLessons(user) {
  const container = document.getElementById('lessons-list');
  if (!container) return;

  // Sincroniza progresso com Firebase
  if (user) await syncFromFirebase(user);

  const total = lessons.length;
  const done = completedIds.length;
  const pct = Math.round((done / total) * 100);

  // HTML da barra de progresso
  let html = `
    <div class="lessons-progress">
      <div class="lessons-progress-bar">
        <div class="lessons-progress-fill" style="width:${pct}%"></div>
      </div>
      <span class="lessons-progress-text">${done}/${total} lições · ${pct}%</span>
    </div>
  `;

  // Agrupa por categoria
  for (const cat of CATEGORIES) {
    const catLessons = lessons.filter(l => l.category === cat.id);
    if (catLessons.length === 0) continue;

    html += `
      <div class="lessons-category">
        <div class="lessons-category-header">
          <span class="lessons-cat-emoji">${cat.emoji}</span>
          <span class="lessons-cat-label">${cat.label}</span>
        </div>
    `;

    for (const l of catLessons) {
      const completed = isCompleted(l.id);
      const idx = lessons.indexOf(l);
      html += `
        <div class="lessons-card ${completed ? 'completed' : ''}" data-lesson-idx="${idx}">
          <div class="lessons-card-emoji">${l.emoji}</div>
          <div class="lessons-card-content">
            <strong>${l.title}</strong>
            <span class="lessons-card-status">${completed ? '✅ Concluída' : '📖 Não lida'}</span>
          </div>
          <div class="lessons-card-arrow">›</div>
        </div>
      `;
    }

    html += `</div>`; // fecha lessons-category
  }

  container.innerHTML = html;

  // Adiciona event listeners
  container.querySelectorAll('.lessons-card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.lessonIdx);
      abrirLicao(idx, user);
    });
  });
}

// ===== TELA DE DETALHE DA LIÇÃO =====
let currentLessonIdx = 0;
let quizAnswered = false;

function abrirLicao(idx, user) {
  currentLessonIdx = idx;
  quizAnswered = false;
  const l = lessons[idx];
  const completed = isCompleted(l.id);

  // Esconde lista, mostra detalhe
  document.getElementById('screen-lessons').style.display = 'none';
  const detail = document.getElementById('screen-lesson-detail');
  detail.style.display = 'block';
  detail.style.visibility = 'visible';
  detail.style.opacity = '1';
  detail.style.pointerEvents = 'auto';

  // Monta conteúdo
  let html = `
    <div class="lesson-detail-header">
      <button class="lesson-detail-back" id="lesson-detail-back-btn">← Voltar</button>
      <span class="lesson-detail-step">${idx + 1}/${lessons.length}</span>
    </div>
    <div class="lesson-detail-emoji">${l.emoji}</div>
    <h2 class="lesson-detail-title">${l.title}</h2>
  `;

  // Introdução
  html += `<div class="lesson-detail-section">`;
  for (const p of l.intro) {
    html += `<p>${p}</p>`;
  }
  html += `</div>`;

  // Dica
  html += `
    <div class="lesson-detail-tip">
      <span class="tip-icon">💡</span>
      <span class="tip-text">${l.tip}</span>
    </div>
  `;

  // Exercício
  html += `<div class="lesson-detail-exercise">`;
  if (l.exercise.type === 'text') {
    const saved = loadExerciseAnswer(l.id);
    html += `
      <h3>📝 Reflexão</h3>
      <p class="exercise-prompt">${l.exercise.prompt}</p>
      <textarea class="exercise-textarea" id="lesson-exercise-input"
        placeholder="${l.exercise.placeholder}">${saved || ''}</textarea>
    `;
  } else if (l.exercise.type === 'checklist') {
    const saved = loadChecklist(l.id);
    html += `<h3>✅ Lista de ações</h3><p class="exercise-prompt">${l.exercise.prompt}</p>`;
    for (let ci = 0; ci < l.exercise.items.length; ci++) {
      const checked = saved.includes(ci) ? 'checked' : '';
      html += `
        <label class="exercise-check-item">
          <input type="checkbox" class="lesson-checklist-item" data-ci="${ci}" ${checked}>
          <span>${l.exercise.items[ci]}</span>
        </label>
      `;
    }
  } else if (l.exercise.type === 'action') {
    html += `
      <h3>🏋️ Ação</h3>
      <p class="exercise-prompt">${l.exercise.prompt}</p>
      <button class="btn btn-primary lesson-action-btn" id="lesson-action-btn">${l.exercise.buttonText}</button>
    `;
  }
  html += `</div>`;

  // Quiz
  if (l.quiz) {
    html += `
      <div class="lesson-detail-quiz" id="lesson-quiz-area">
        <h3>❓ Teste seu conhecimento</h3>
        <p class="quiz-question">${l.quiz.question}</p>
        <div class="quiz-options" id="quiz-options">
    `;
    for (let qi = 0; qi < l.quiz.options.length; qi++) {
      html += `
        <button class="quiz-option-btn" data-qi="${qi}">${l.quiz.options[qi]}</button>
      `;
    }
    html += `
        </div>
        <div class="quiz-feedback" id="quiz-feedback"></div>
      </div>
    `;
  }

  // Estratégia relacionada
  if (l.strategy) {
    html += `
      <div class="lesson-detail-strategy">
        <span class="strategy-label">🔗 Estratégia relacionada:</span>
        <button class="btn btn-outline btn-sm lesson-strategy-btn" id="lesson-strategy-btn">
          ${l.strategy.emoji} ${l.strategy.label}
        </button>
      </div>
    `;
  }

  // Botão concluir
  html += `
    <div class="lesson-detail-footer">
      ${completed ? '<span class="lesson-already-done">✅ Você já concluiu esta lição</span>' : ''}
      <button class="btn btn-primary lesson-complete-btn" id="lesson-complete-btn">
        ${completed ? '↩ Revisar lição' : '✅ Entendi — concluir lição'}
      </button>
      ${idx < lessons.length - 1 ? '<button class="btn btn-outline lesson-next-btn" id="lesson-next-btn">Próxima lição →</button>' : ''}
    </div>
  `;

  document.getElementById('lesson-detail-content').innerHTML = html;

  // ===== EVENT LISTENERS DO DETALHE =====

  // Voltar
  document.getElementById('lesson-detail-back-btn').addEventListener('click', () => {
    fecharDetalhe(user);
  });

  // Salvar reflexão ao digitar
  const textarea = document.getElementById('lesson-exercise-input');
  if (textarea) {
    textarea.addEventListener('input', () => {
      saveExerciseAnswer(l.id, textarea.value);
    });
  }

  // Checklist
  document.querySelectorAll('.lesson-checklist-item').forEach(cb => {
    cb.addEventListener('change', () => {
      const checked = [...document.querySelectorAll('.lesson-checklist-item')]
        .filter(c => c.checked)
        .map(c => parseInt(c.dataset.ci));
      saveChecklist(l.id, checked);
    });
  });

  // Ação (abrir estratégia)
  const actionBtn = document.getElementById('lesson-action-btn');
  if (actionBtn && l.exercise.strategyId) {
    actionBtn.addEventListener('click', () => {
      abrirEstrategiaFromLesson(l.exercise.strategyId, user);
    });
  }

  // Quiz
  document.querySelectorAll('.quiz-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (quizAnswered) return;
      quizAnswered = true;
      const qi = parseInt(btn.dataset.qi);
      const correct = l.quiz.correct;
      const feedback = document.getElementById('quiz-feedback');

      // Marca todas como disabled
      document.querySelectorAll('.quiz-option-btn').forEach(b => {
        b.disabled = true;
        b.classList.add(b.dataset.qi == correct ? 'quiz-correct' : 'quiz-disabled');
      });

      if (qi === correct) {
        btn.classList.add('quiz-correct');
        btn.classList.remove('quiz-disabled');
        feedback.innerHTML = '<span class="quiz-right">✅ Correto! Você absorveu bem o conteúdo.</span>';
      } else {
        btn.classList.add('quiz-wrong');
        feedback.innerHTML = `<span class="quiz-wrong-text">❌ Não foi dessa vez. A resposta certa é: <strong>${l.quiz.options[correct]}</strong></span>`;
      }
    });
  });

  // Estratégia relacionada
  const stratBtn = document.getElementById('lesson-strategy-btn');
  if (stratBtn && l.strategy) {
    stratBtn.addEventListener('click', () => {
      abrirEstrategiaFromLesson(l.strategy.id, user);
    });
  }

  // Concluir lição
  document.getElementById('lesson-complete-btn').addEventListener('click', async () => {
    await markCompleted(l.id, user);
    fecharDetalhe(user);
    // Re-renderiza a lista para atualizar progresso
    await carregarLessons(user);
    document.getElementById('screen-lessons').style.display = 'block';
  });

  // Próxima lição
  const nextBtn = document.getElementById('lesson-next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', async () => {
      await markCompleted(l.id, user);
      abrirLicao(idx + 1, user);
    });
  }
}

function fecharDetalhe(user) {
  const detail = document.getElementById('screen-lesson-detail');
  detail.style.display = 'none';
  detail.style.visibility = 'hidden';
  detail.style.opacity = '0';
  detail.style.pointerEvents = 'none';
  document.getElementById('screen-lessons').style.display = 'block';
}

// ===== ABRIR ESTRATÉGIA A PARTIR DA LIÇÃO =====
// Usa dynamic imports para evitar circular deps
async function abrirEstrategiaFromLesson(strategyId, user) {
  try {
    const { mostrarEstrategias } = await import('./strategies.js');
    const { navigateTo } = await import('./app.js');
    navigateTo('screen-strategies');
    mostrarEstrategias(user, null);

    // Encontra e clica no card da estratégia
    setTimeout(() => {
      const cards = document.querySelectorAll('#strategies-list .card');
      for (const card of cards) {
        if (card.dataset.strategyId === strategyId) {
          card.click();
          return;
        }
      }
    }, 300);
  } catch (e) {
    console.warn('Erro ao abrir estratégia da lição:', e);
  }
}

// ===== PERSISTÊNCIA DE EXERCÍCIOS =====
function loadExerciseAnswer(lessonId) {
  try {
    return localStorage.getItem(`respira_exercise_${lessonId}`) || '';
  } catch { return ''; }
}
function saveExerciseAnswer(lessonId, value) {
  localStorage.setItem(`respira_exercise_${lessonId}`, value);
}
function loadChecklist(lessonId) {
  try {
    return JSON.parse(localStorage.getItem(`respira_checklist_${lessonId}`) || '[]');
  } catch { return []; }
}
function saveChecklist(lessonId, indices) {
  localStorage.setItem(`respira_checklist_${lessonId}`, JSON.stringify(indices));
}

// ===== LIÇÃO DO DIA (para o dashboard) =====
export function getLicaoDoDia() {
  // Pega a primeira não concluída, ou uma aleatória se todas foram concluídas
  const notDone = lessons.filter(l => !isCompleted(l.id));
  if (notDone.length > 0) return notDone[0];
  // Todas concluídas — sugere revisar uma aleatória
  const dayIdx = new Date().getDate() % lessons.length;
  return lessons[dayIdx];
}
