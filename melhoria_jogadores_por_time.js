/**
 * ================================================================
 * PELADA-KF — Melhoria: Jogadores por Time Configurável
 * ================================================================
 * Adicione este arquivo na mesma pasta do index.html e inclua
 * a linha abaixo ANTES de </body> no seu index.html:
 *
 *   <script src="melhoria_jogadores_por_time.js"></script>
 *
 * OU copie e cole o conteúdo diretamente no index.html
 * antes de </body>.
 * ================================================================
 */

(function() {
  'use strict';

  // ─── 1. INJETAR O CAMPO NA ABA TIMES ────────────────────────────────────────
  // Aguarda o DOM estar pronto
  function injetarCampoUI() {
    // Procura o botão de sortear para inserir o campo acima dele
    const btnSortear = document.querySelector('#page-times .btn-green, #page-times [onclick*="sortear"]');
    
    // Tenta achar o container do botão de sorteio
    const timesPage = document.getElementById('page-times');
    if (!timesPage) {
      // Tentar de novo em breve
      setTimeout(injetarCampoUI, 500);
      return;
    }

    // Evitar duplicação
    if (document.getElementById('cfg-jogadores-time')) return;

    // Criar o bloco HTML do campo
    const bloco = document.createElement('div');
    bloco.id = 'bloco-cfg-jogadores';
    bloco.innerHTML = `
      <div class="card" style="margin-bottom:12px">
        <div class="card-title">⚙️ Configuração</div>
        <div class="section-label">JOGADORES POR TIME</div>
        <div class="cfg-row">
          <input type="number" id="cfg-jogadores-time" min="3" max="15"
                 placeholder="Ex: 6" style="max-width:130px"
                 value="${(window.finData && window.finData.jogadoresPorTime) || 6}">
          <button class="btn btn-outline btn-sm" onclick="salvarJogadoresPorTime()" style="flex:none">Salvar</button>
        </div>
        <div style="font-size:0.65rem;color:var(--text-muted);margin-bottom:4px">
          Padrão: 6 jogadores por time (mín. 3, máx. 15)
        </div>
      </div>
    `;

    // Inserir no início da página de times
    const primeiroCard = timesPage.querySelector('.card');
    if (primeiroCard) {
      timesPage.insertBefore(bloco, primeiroCard);
    } else {
      timesPage.prepend(bloco);
    }
  }

  // ─── 2. FUNÇÕES GLOBAIS ──────────────────────────────────────────────────────

  window.salvarJogadoresPorTime = function() {
    const v = parseInt(document.getElementById('cfg-jogadores-time').value);
    if (!v || v < 3 || v > 15) {
      if (window.showToast) showToast('❌ Digite um número entre 3 e 15');
      return;
    }
    if (!window.finData) window.finData = {};
    window.finData.jogadoresPorTime = v;
    if (window.saveData) {
      saveData();
    }
    if (window.showToast) showToast('✅ ' + v + ' jogadores por time salvo!');
  };

  // ─── 3. SOBRESCREVER sortearTimes() PARA USAR A CONFIGURAÇÃO ────────────────
  // Guarda a função original para referência
  const _sortearTimesOriginal = window.sortearTimes;

  window.sortearTimes = function() {
    const players = window.players || [];
    const presentes = players.filter(p => p.ativo !== false && p.presente);
    if (presentes.length < 3) {
      if (window.showToast) showToast('❌ Mínimo 3 jogadores presentes');
      return;
    }

    const TAM = (window.finData && window.finData.jogadoresPorTime) || 6;
    const numTimesCompletos = Math.floor(presentes.length / TAM);
    const temIncompleto = presentes.length % TAM !== 0;
    const numTimes = numTimesCompletos + (temIncompleto ? 1 : 0);

    if (numTimes < 2) {
      if (window.showToast) showToast('❌ Jogadores insuficientes para formar 2 times');
      return;
    }

    // Snake draft por nível
    const ordenados = [...presentes].sort((a, b) => (b.nivel || 1) - (a.nivel || 1));
    const grupos = Array.from({ length: numTimes }, () => []);
    let dir = 1, idx = 0;
    for (const p of ordenados) {
      grupos[idx].push(p);
      idx += dir;
      if (idx >= numTimes) { idx = numTimes - 1; dir = -1; }
      else if (idx < 0)    { idx = 0;            dir = 1; }
    }

    // Guardar globalmente para uso posterior
    window._gruposSorteio = grupos;
    window._incompleto = temIncompleto;

    if (window.renderTimes) {
      renderTimes(grupos, temIncompleto);
    }
  };

  // ─── 4. SINCRONIZAR CAMPO AO ABRIR A ABA ────────────────────────────────────
  // Intercepta cliques nas tabs para atualizar o valor do campo
  document.addEventListener('click', function(e) {
    const tab = e.target.closest('.tab');
    if (tab && tab.dataset && tab.dataset.page === 'times') {
      setTimeout(function() {
        const input = document.getElementById('cfg-jogadores-time');
        if (input && window.finData) {
          input.value = window.finData.jogadoresPorTime || 6;
        }
      }, 100);
    }
  });

  // ─── 5. INICIALIZAR ─────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(injetarCampoUI, 800);
    });
  } else {
    setTimeout(injetarCampoUI, 800);
  }

  // Também tenta reinjetar quando o app carregar os dados (evento personalizado)
  window.addEventListener('pelada-loaded', function() {
    setTimeout(injetarCampoUI, 200);
    const input = document.getElementById('cfg-jogadores-time');
    if (input && window.finData) {
      input.value = window.finData.jogadoresPorTime || 6;
    }
  });

  console.log('✅ Melhoria: Jogadores por Time Configurável carregada!');
})();
