// ============================================================
// PELADA KF APP — SISTEMA FREEMIUM
// Bloqueia: página completa de Financeiro (#page-financeiro)
// Libera:   tudo o resto (jogadores, presença, sorteio, etc.)
// ============================================================
// COMO USAR:
// 1. Cole este arquivo na mesma pasta do seu index.html
// 2. Adicione no index.html antes do </body>:
//    <script src="freemium-pelada-kf.js"></script>
// 3. Siga os PASSOS abaixo
// ============================================================


// ──────────────────────────────────────────
// CONFIGURAÇÃO — ajuste aqui
// ──────────────────────────────────────────
const PREMIUM_CONFIG = {
  valor:        "R$ 9,90",                    // ← valor da mensalidade
  descricao:    "por mês",
  chavePix:     "SEU-CPF-OU-EMAIL-PIX-AQUI",  // ← sua chave Pix
  nomeRecebedor:"Kauê Ferraz"                 // ← seu nome
};


// ──────────────────────────────────────────
// PASSO 1 — FIRESTORE
// ──────────────────────────────────────────
// No Firebase Console > Firestore, cada usuário terá:
//
// Coleção: "usuarios"
// Documento: UID do usuário (do Firebase Auth)
// Campos:
//   plano:      "gratuito"  ← ou "premium"
//   premiumAte: null        ← Timestamp do vencimento
//   pixPago:    false
//
// Você ativa o premium manualmente após receber o Pix
// (veja a função ativarPremium() no final deste arquivo)


// ──────────────────────────────────────────
// PASSO 2 — VERIFICAÇÃO DE PLANO
// ──────────────────────────────────────────
async function verificarPlano(uid) {
  try {
    const docRef = db.collection("usuarios").doc(uid);
    const doc = await docRef.get();

    if (!doc.exists) {
      await docRef.set({ plano: "gratuito", premiumAte: null, pixPago: false }, { merge: true });
      return "gratuito";
    }

    const dados = doc.data();

    // Verifica expiração do premium
    if (dados.plano === "premium" && dados.premiumAte) {
      const agora = new Date();
      const vencimento = dados.premiumAte.toDate();
      if (agora > vencimento) {
        await docRef.update({ plano: "gratuito", pixPago: false });
        return "gratuito";
      }
    }

    return dados.plano || "gratuito";

  } catch (erro) {
    console.error("Erro ao verificar plano:", erro);
    return "gratuito";
  }
}


// ──────────────────────────────────────────
// PASSO 3 — APLICAR RESTRIÇÕES NA TELA
// ──────────────────────────────────────────
function aplicarRestricoes(plano) {
  const isPremium = plano === "premium";

  // Bloqueia/desbloqueia o botão de navegação do Financeiro
  // (o botão que leva para #page-financeiro no seu menu de tabs)
  const btnFinanceiro = document.querySelector('[onclick*="financeiro"], [onclick*="page-financeiro"]');
  if (btnFinanceiro) {
    if (!isPremium) {
      btnFinanceiro.setAttribute("data-original-onclick", btnFinanceiro.getAttribute("onclick"));
      btnFinanceiro.setAttribute("onclick", "abrirModalPremium()");
      btnFinanceiro.style.opacity = "0.6";
      btnFinanceiro.style.position = "relative";

      // Ícone de cadeado no botão
      if (!btnFinanceiro.querySelector(".lock-icon")) {
        const lock = document.createElement("span");
        lock.className = "lock-icon";
        lock.textContent = " 🔒";
        lock.style.fontSize = "0.7em";
        btnFinanceiro.appendChild(lock);
      }
    } else {
      const original = btnFinanceiro.getAttribute("data-original-onclick");
      if (original) btnFinanceiro.setAttribute("onclick", original);
      btnFinanceiro.style.opacity = "";
      const lock = btnFinanceiro.querySelector(".lock-icon");
      if (lock) lock.remove();
    }
  }

  // Bloqueia/desbloqueia a página #page-financeiro diretamente
  const paginaFin = document.getElementById("page-financeiro");
  if (paginaFin) {
    if (!isPremium) {
      // Se o usuário tentar navegar direto, exibe overlay
      if (!document.getElementById("overlay-financeiro")) {
        const overlay = document.createElement("div");
        overlay.id = "overlay-financeiro";
        overlay.innerHTML = `
          <div class="overlay-fin-conteudo">
            <div class="overlay-fin-icone">🔒</div>
            <div class="overlay-fin-titulo">Funcionalidade Premium</div>
            <div class="overlay-fin-desc">
              O módulo de <strong>Financeiro / Caixa</strong> está disponível<br>
              apenas para usuários do plano Premium.
            </div>
            <button class="overlay-fin-btn" onclick="abrirModalPremium()">
              ⭐ Ver planos e assinar
            </button>
            <button class="overlay-fin-btn-sec" onclick="voltarAbaAnterior()">
              ← Voltar
            </button>
          </div>
        `;
        paginaFin.style.position = "relative";
        paginaFin.appendChild(overlay);
      }
    } else {
      const overlay = document.getElementById("overlay-financeiro");
      if (overlay) overlay.remove();
    }
  }

  // Atualiza badge de plano na barra do usuário
  atualizarBadgePlano(plano);
  window._planoAtual = plano;
}

// Volta para a aba anterior ao tentar abrir financeiro sem premium
function voltarAbaAnterior() {
  // Tenta clicar na primeira aba disponível (ajuste se necessário)
  const primeiraTab = document.querySelector(".tab-btn, .tab, [onclick*='showPage']");
  if (primeiraTab) primeiraTab.click();
}


// ──────────────────────────────────────────
// BADGE DE PLANO (na barra de usuário)
// ──────────────────────────────────────────
function atualizarBadgePlano(plano) {
  // Remove badge anterior
  const anterior = document.getElementById("badge-plano-kf");
  if (anterior) anterior.remove();

  const badge = document.createElement("span");
  badge.id = "badge-plano-kf";

  if (plano === "premium") {
    badge.innerHTML = `⭐ Premium`;
    badge.className = "badge-kf premium";
  } else {
    badge.innerHTML = `🆓 <span onclick="abrirModalPremium()" style="cursor:pointer;text-decoration:underline">Assinar Premium</span>`;
    badge.className = "badge-kf gratuito";
  }

  // Insere na barra de usuário que já existe no seu app
  const userBar = document.querySelector(".user-info-bar");
  if (userBar) {
    userBar.insertBefore(badge, userBar.firstChild);
  }
}


// ──────────────────────────────────────────
// MODAL DE UPGRADE PREMIUM
// ──────────────────────────────────────────
function abrirModalPremium() {
  const anterior = document.getElementById("modal-premium-kf");
  if (anterior) anterior.remove();

  const modal = document.createElement("div");
  modal.id = "modal-premium-kf";
  modal.innerHTML = `
    <div class="mpk-backdrop" onclick="fecharModalPremium()"></div>
    <div class="mpk-box">
      <button class="mpk-fechar" onclick="fecharModalPremium()">✕</button>

      <div class="mpk-header">
        <div class="mpk-icone">⭐</div>
        <h2 class="mpk-titulo">Seja Premium</h2>
        <p class="mpk-sub">Desbloqueie o módulo de Caixa completo</p>
      </div>

      <div class="mpk-comparativo">
        <div class="mpk-plano gratuito">
          <h3>🆓 Gratuito</h3>
          <ul>
            <li>✅ Cadastro de jogadores</li>
            <li>✅ Controle de presença</li>
            <li>✅ Sorteio de times</li>
            <li>❌ Financeiro / Caixa</li>
          </ul>
          <div class="mpk-preco">Grátis</div>
        </div>
        <div class="mpk-plano premium">
          <div class="mpk-tag">Recomendado</div>
          <h3>⭐ Premium</h3>
          <ul>
            <li>✅ Cadastro de jogadores</li>
            <li>✅ Controle de presença</li>
            <li>✅ Sorteio de times</li>
            <li>✅ Financeiro / Caixa</li>
          </ul>
          <div class="mpk-preco">${PREMIUM_CONFIG.valor}<span>${PREMIUM_CONFIG.descricao}</span></div>
        </div>
      </div>

      <div class="mpk-pix">
        <h3>💰 Como assinar via Pix</h3>
        <ol>
          <li>Copie a chave Pix abaixo</li>
          <li>Pague <strong>${PREMIUM_CONFIG.valor}</strong> com descrição: seu e-mail</li>
          <li>Envie o comprovante para o admin</li>
          <li>Acesso liberado em até 24h ✅</li>
        </ol>
        <div class="mpk-chave-box">
          <span id="mpk-chave-texto">${PREMIUM_CONFIG.chavePix}</span>
          <button onclick="mpkCopiarPix()" class="mpk-btn-copiar">📋 Copiar</button>
        </div>
        <p class="mpk-recebedor">Recebedor: <strong>${PREMIUM_CONFIG.nomeRecebedor}</strong></p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function fecharModalPremium() {
  const modal = document.getElementById("modal-premium-kf");
  if (modal) modal.remove();
}

function mpkCopiarPix() {
  const chave = document.getElementById("mpk-chave-texto").textContent;
  navigator.clipboard.writeText(chave).then(() => {
    const btn = document.querySelector(".mpk-btn-copiar");
    btn.textContent = "✅ Copiado!";
    setTimeout(() => btn.textContent = "📋 Copiar", 2000);
  });
}


// ──────────────────────────────────────────
// PASSO 4 — INTEGRAR AO SEU onAuthStateChanged
// ──────────────────────────────────────────
// No seu index.html, você já deve ter algo assim:
//
//   firebase.auth().onAuthStateChanged(function(user) {
//     if (user) {
//       // seu código atual...
//     }
//   });
//
// Adicione as 2 linhas marcadas com ← ADICIONAR:
//
//   firebase.auth().onAuthStateChanged(async function(user) {  ← adicione "async"
//     if (user) {
//       const plano = await verificarPlano(user.uid);  // ← ADICIONAR
//       aplicarRestricoes(plano);                      // ← ADICIONAR
//
//       // ...resto do seu código existente
//     }
//   });


// ──────────────────────────────────────────
// ATIVAR PREMIUM MANUALMENTE (após receber Pix)
// ──────────────────────────────────────────
// Abra o console do navegador (F12) logado como admin e rode:
//
//   ativarPremium("UID_DO_USUARIO")
//
// Ou vá direto no Firebase Console > Firestore > usuarios > [documento]
// e altere os campos manualmente.

async function ativarPremium(uid, meses = 1) {
  const vencimento = new Date();
  vencimento.setMonth(vencimento.getMonth() + meses);
  await db.collection("usuarios").doc(uid).update({
    plano: "premium",
    premiumAte: firebase.firestore.Timestamp.fromDate(vencimento),
    pixPago: true
  });
  console.log(`✅ Premium ativado para ${uid} até ${vencimento.toLocaleDateString("pt-BR")}`);
}

async function revogarPremium(uid) {
  await db.collection("usuarios").doc(uid).update({
    plano: "gratuito",
    premiumAte: null,
    pixPago: false
  });
  console.log(`⛔ Premium revogado para ${uid}`);
}


// ──────────────────────────────────────────
// ESTILOS — injetados automaticamente
// ──────────────────────────────────────────
const _estilos = `

/* === OVERLAY DA PÁGINA FINANCEIRO === */
#overlay-financeiro {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.82);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: 12px;
  min-height: 300px;
}

.overlay-fin-conteudo {
  text-align: center;
  padding: 2rem 1.5rem;
  max-width: 300px;
}

.overlay-fin-icone {
  font-size: 3rem;
  margin-bottom: 0.8rem;
}

.overlay-fin-titulo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.4rem;
  letter-spacing: 2px;
  color: #f5a623;
  margin-bottom: 0.6rem;
}

.overlay-fin-desc {
  font-size: 0.82rem;
  color: #aaa;
  line-height: 1.6;
  margin-bottom: 1.2rem;
}

.overlay-fin-btn {
  display: block;
  width: 100%;
  padding: 12px;
  background: #f5a623;
  color: #000;
  border: none;
  border-radius: 10px;
  font-weight: 900;
  font-size: 0.95rem;
  cursor: pointer;
  margin-bottom: 8px;
  font-family: 'Nunito', sans-serif;
}

.overlay-fin-btn-sec {
  display: block;
  width: 100%;
  padding: 10px;
  background: transparent;
  color: #666;
  border: 1px solid #333;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  font-family: 'Nunito', sans-serif;
}

/* === BADGE DE PLANO === */
.badge-kf {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 2px 10px;
  border-radius: 20px;
  margin-right: 8px;
  font-family: 'Nunito', sans-serif;
}
.badge-kf.premium { background: #f5a623; color: #000; }
.badge-kf.gratuito { background: #1a1a1a; color: #aaa; border: 1px solid #333; }

/* === MODAL PREMIUM === */
.mpk-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  z-index: 9998;
}

.mpk-box {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #111;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 1.8rem 1.5rem;
  width: 92%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 9999;
  box-shadow: 0 24px 80px rgba(0,0,0,0.7);
}

.mpk-fechar {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #555;
  font-size: 1.1rem;
  cursor: pointer;
}

.mpk-header { text-align: center; margin-bottom: 1.4rem; }
.mpk-icone { font-size: 2.5rem; }
.mpk-titulo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.6rem;
  letter-spacing: 3px;
  color: #f5a623;
  margin: 0.3rem 0 0.2rem;
}
.mpk-sub { color: #666; font-size: 0.82rem; margin: 0; }

/* Comparativo de planos */
.mpk-comparativo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 1.4rem;
}

.mpk-plano {
  background: #1a1a1a;
  border: 2px solid #2a2a2a;
  border-radius: 12px;
  padding: 1rem 0.8rem;
  position: relative;
}

.mpk-plano.premium { border-color: #f5a623; background: #1a1500; }
.mpk-plano h3 { margin: 0 0 0.8rem; font-size: 0.9rem; color: #fff; }
.mpk-plano ul { list-style: none; padding: 0; margin: 0 0 0.8rem; font-size: 0.78rem; color: #aaa; }
.mpk-plano ul li { margin-bottom: 0.35rem; }

.mpk-preco {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.3rem;
  color: #f5a623;
}
.mpk-preco span { font-size: 0.7rem; font-weight: 400; color: #666; font-family: 'Nunito', sans-serif; }

.mpk-tag {
  position: absolute;
  top: -11px;
  left: 50%;
  transform: translateX(-50%);
  background: #f5a623;
  color: #000;
  font-size: 0.65rem;
  font-weight: 900;
  padding: 2px 10px;
  border-radius: 20px;
  white-space: nowrap;
  font-family: 'Nunito', sans-serif;
}

/* Bloco Pix */
.mpk-pix {
  background: #0d0d0d;
  border: 1px solid #222;
  border-radius: 12px;
  padding: 1.2rem;
}
.mpk-pix h3 { margin: 0 0 0.8rem; font-size: 0.95rem; color: #fff; }
.mpk-pix ol { padding-left: 1.2rem; margin: 0 0 1rem; font-size: 0.82rem; color: #aaa; line-height: 1.7; }

.mpk-chave-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  margin-bottom: 0.5rem;
}

#mpk-chave-texto {
  flex: 1;
  font-family: monospace;
  font-size: 0.85rem;
  color: #0f9;
  word-break: break-all;
}

.mpk-btn-copiar {
  background: #0d3b1e;
  color: #00cc77;
  border: 1px solid #0d3b1e;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  white-space: nowrap;
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
}

.mpk-recebedor { font-size: 0.78rem; color: #555; margin: 0.4rem 0 0; }
`;

// Injeta estilos no <head>
const _styleTag = document.createElement("style");
_styleTag.textContent = _estilos;
document.head.appendChild(_styleTag);

// ============================================================
// FIM DO ARQUIVO
// ============================================================
