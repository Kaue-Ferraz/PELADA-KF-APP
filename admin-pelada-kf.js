// ============================================================
// PELADA KF — PAINEL DE ADMIN
// Salva este arquivo na mesma pasta do index.html
// Adiciona no index.html antes do </body>:
//   <script src="admin-pelada-kf.js"></script>
// ============================================================

const ADMIN_EMAIL = "ferrazkaue1@gmail.com"; // ← só este e-mail vê o painel

// ── CRIA O BOTÃO E O PAINEL QUANDO O USUÁRIO LOGAR ────────
function iniciarAdmin(user) {
  if (!user || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return;

  // Botão flutuante no canto da tela
  if (!document.getElementById("btn-admin-kf")) {
    const btn = document.createElement("button");
    btn.id = "btn-admin-kf";
    btn.innerHTML = "⚙️ Admin";
    btn.onclick = abrirPainelAdmin;
    document.body.appendChild(btn);
  }
}

// ── ABRE O PAINEL ─────────────────────────────────────────
async function abrirPainelAdmin() {
  const anterior = document.getElementById("painel-admin-kf");
  if (anterior) { anterior.remove(); return; }

  const painel = document.createElement("div");
  painel.id = "painel-admin-kf";
  painel.innerHTML = `
    <div class="adm-fundo" onclick="fecharPainelAdmin()"></div>
    <div class="adm-caixa">
      <div class="adm-header">
        <div class="adm-titulo">⚙️ Painel Admin</div>
        <button class="adm-fechar" onclick="fecharPainelAdmin()">✕</button>
      </div>

      <!-- ATIVAR PREMIUM -->
      <div class="adm-card">
        <div class="adm-card-titulo">⭐ Ativar Premium</div>
        <div class="adm-label">E-mail do usuário</div>
        <input id="adm-email-input" class="adm-input" type="email" placeholder="email@exemplo.com">
        <div class="adm-label" style="margin-top:10px">Duração</div>
        <div style="display:flex;gap:8px;margin-bottom:12px">
          <button class="adm-dur-btn active" data-meses="1" onclick="selecionarDuracao(this)">1 mês</button>
          <button class="adm-dur-btn" data-meses="3" onclick="selecionarDuracao(this)">3 meses</button>
          <button class="adm-dur-btn" data-meses="6" onclick="selecionarDuracao(this)">6 meses</button>
          <button class="adm-dur-btn" data-meses="12" onclick="selecionarDuracao(this)">1 ano</button>
        </div>
        <button class="adm-btn verde" onclick="ativarPremiumAdmin()">⭐ ATIVAR PREMIUM</button>
        <div id="adm-msg-ativar" class="adm-msg"></div>
      </div>

      <!-- REVOGAR PREMIUM -->
      <div class="adm-card">
        <div class="adm-card-titulo">⛔ Revogar Premium</div>
        <div class="adm-label">E-mail do usuário</div>
        <input id="adm-email-revogar" class="adm-input" type="email" placeholder="email@exemplo.com">
        <button class="adm-btn vermelho" style="margin-top:10px" onclick="revogarPremiumAdmin()">⛔ REVOGAR ACESSO</button>
        <div id="adm-msg-revogar" class="adm-msg"></div>
      </div>

      <!-- LISTA DE USUÁRIOS -->
      <div class="adm-card">
        <div class="adm-card-titulo" style="display:flex;justify-content:space-between;align-items:center">
          👥 Usuários
          <button class="adm-btn-sm" onclick="carregarUsuarios()">🔄 Atualizar</button>
        </div>
        <div id="adm-lista-usuarios">
          <div class="adm-loading">Clique em Atualizar para carregar...</div>
        </div>
      </div>

    </div>
  `;
  document.body.appendChild(painel);

  // Carrega a lista automaticamente ao abrir
  carregarUsuarios();
}

function fecharPainelAdmin() {
  const painel = document.getElementById("painel-admin-kf");
  if (painel) painel.remove();
}

// Duração selecionada
let _mesesSelecionados = 1;
function selecionarDuracao(btn) {
  document.querySelectorAll(".adm-dur-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  _mesesSelecionados = parseInt(btn.dataset.meses);
}

// ── ATIVAR PREMIUM ────────────────────────────────────────
async function ativarPremiumAdmin() {
  const email = document.getElementById("adm-email-input").value.trim().toLowerCase();
  const msgEl = document.getElementById("adm-msg-ativar");
  msgEl.textContent = "";

  if (!email) { msgEl.textContent = "❌ Digite o e-mail do usuário."; msgEl.className = "adm-msg erro"; return; }

  msgEl.textContent = "⏳ Buscando usuário..."; msgEl.className = "adm-msg info";

  try {
    const db = window._fbDb;
    const { collection, query, where, getDocs, updateDoc, Timestamp } =
      await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

    // Busca pelo e-mail na coleção usuarios
    const q = query(collection(db, "usuarios"), where("email", "==", email));
    const snap = await getDocs(q);

    if (snap.empty) {
      msgEl.textContent = "❌ Usuário não encontrado. Ele precisa ter feito login ao menos uma vez.";
      msgEl.className = "adm-msg erro";
      return;
    }

    const vencimento = new Date();
    vencimento.setMonth(vencimento.getMonth() + _mesesSelecionados);

    const docRef = snap.docs[0].ref;
    await updateDoc(docRef, {
      plano:      "premium",
      premiumAte: Timestamp.fromDate(vencimento),
      pixPago:    true
    });

    msgEl.textContent = `✅ Premium ativado! Acesso até ${vencimento.toLocaleDateString("pt-BR")}.`;
    msgEl.className = "adm-msg sucesso";
    document.getElementById("adm-email-input").value = "";
    carregarUsuarios();

  } catch (erro) {
    msgEl.textContent = "❌ Erro: " + erro.message;
    msgEl.className = "adm-msg erro";
  }
}

// ── REVOGAR PREMIUM ───────────────────────────────────────
async function revogarPremiumAdmin() {
  const email = document.getElementById("adm-email-revogar").value.trim().toLowerCase();
  const msgEl = document.getElementById("adm-msg-revogar");
  msgEl.textContent = "";

  if (!email) { msgEl.textContent = "❌ Digite o e-mail do usuário."; msgEl.className = "adm-msg erro"; return; }
  if (!confirm(`Revogar premium de ${email}?`)) return;

  msgEl.textContent = "⏳ Processando..."; msgEl.className = "adm-msg info";

  try {
    const db = window._fbDb;
    const { collection, query, where, getDocs, updateDoc } =
      await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

    const q = query(collection(db, "usuarios"), where("email", "==", email));
    const snap = await getDocs(q);

    if (snap.empty) {
      msgEl.textContent = "❌ Usuário não encontrado.";
      msgEl.className = "adm-msg erro";
      return;
    }

    await updateDoc(snap.docs[0].ref, {
      plano:      "gratuito",
      premiumAte: null,
      pixPago:    false
    });

    msgEl.textContent = "✅ Premium revogado com sucesso.";
    msgEl.className = "adm-msg sucesso";
    document.getElementById("adm-email-revogar").value = "";
    carregarUsuarios();

  } catch (erro) {
    msgEl.textContent = "❌ Erro: " + erro.message;
    msgEl.className = "adm-msg erro";
  }
}

// ── LISTAR USUÁRIOS ───────────────────────────────────────
async function carregarUsuarios() {
  const listaEl = document.getElementById("adm-lista-usuarios");
  if (!listaEl) return;
  listaEl.innerHTML = `<div class="adm-loading">⏳ Carregando...</div>`;

  try {
    const db = window._fbDb;
    const { collection, getDocs } =
      await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

    const snap = await getDocs(collection(db, "usuarios"));

    if (snap.empty) {
      listaEl.innerHTML = `<div class="adm-loading">Nenhum usuário ainda.</div>`;
      return;
    }

    const agora = new Date();
    let html = "";

    snap.forEach(docSnap => {
      const d = docSnap.data();
      const isPremium = d.plano === "premium";
      const venc = d.premiumAte ? d.premiumAte.toDate() : null;
      const expirou = venc && agora > venc;
      const vencLabel = venc
        ? (expirou ? `⚠️ Expirou ${venc.toLocaleDateString("pt-BR")}` : `até ${venc.toLocaleDateString("pt-BR")}`)
        : "";

      html += `
        <div class="adm-user-item ${isPremium && !expirou ? 'premium' : ''}">
          <div class="adm-user-info">
            <div class="adm-user-email">${d.email || docSnap.id}</div>
            <div class="adm-user-venc">${vencLabel}</div>
          </div>
          <div class="adm-user-badge ${isPremium && !expirou ? 'premium' : 'gratuito'}">
            ${isPremium && !expirou ? '⭐ Premium' : '🆓 Gratuito'}
          </div>
        </div>
      `;
    });

    listaEl.innerHTML = html;

  } catch (erro) {
    listaEl.innerHTML = `<div class="adm-loading" style="color:#f87171">❌ Erro ao carregar: ${erro.message}</div>`;
  }
}

// ── INTEGRAÇÃO COM AUTH ───────────────────────────────────
// Adicione isso no seu onAuthStateChanged existente:
//
//   if (user) {
//     iniciarAdmin(user);   // ← ADICIONAR esta linha
//     ...resto do código
//   }

// ── ESTILOS ───────────────────────────────────────────────
const _admCss = `
#btn-admin-kf {
  position: fixed;
  bottom: 80px;
  right: 16px;
  background: #f5a623;
  color: #000;
  border: none;
  border-radius: 24px;
  padding: 10px 18px;
  font-weight: 900;
  font-size: 0.85rem;
  cursor: pointer;
  z-index: 997;
  box-shadow: 0 4px 20px rgba(245,166,35,0.4);
  font-family: 'Nunito', sans-serif;
}
.adm-fundo { position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:9998; }
.adm-caixa {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #111;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 1.5rem;
  width: 92%;
  max-width: 420px;
  max-height: 88vh;
  overflow-y: auto;
  z-index: 9999;
  box-shadow: 0 24px 80px rgba(0,0,0,0.9);
}
.adm-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.2rem; }
.adm-titulo { font-family:'Bebas Neue',sans-serif; font-size:1.4rem; letter-spacing:2px; color:#f5a623; }
.adm-fechar { background:none; border:none; color:#555; font-size:1.1rem; cursor:pointer; }
.adm-card { background:#1a1a1a; border:1px solid #2a2a2a; border-radius:12px; padding:1rem; margin-bottom:1rem; }
.adm-card-titulo { font-weight:800; font-size:0.95rem; color:#fff; margin-bottom:0.8rem; }
.adm-label { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#666; margin-bottom:5px; }
.adm-input { width:100%; background:#0d0d0d; border:1px solid #333; border-radius:8px; color:#fff; font-family:'Nunito',sans-serif; font-size:0.95rem; padding:10px 12px; outline:none; box-sizing:border-box; }
.adm-input:focus { border-color:#f5a623; }
.adm-dur-btn { flex:1; padding:8px 4px; background:#0d0d0d; border:1px solid #333; border-radius:8px; color:#aaa; font-size:0.78rem; font-weight:700; cursor:pointer; font-family:'Nunito',sans-serif; }
.adm-dur-btn.active { background:#f5a623; color:#000; border-color:#f5a623; }
.adm-btn { width:100%; padding:12px; border-radius:10px; border:none; font-weight:900; font-size:0.92rem; cursor:pointer; font-family:'Nunito',sans-serif; }
.adm-btn.verde { background:#0d3b1e; color:#00cc77; border:1px solid #00cc77; }
.adm-btn.vermelho { background:#2e0a0a; color:#f87171; border:1px solid #f87171; }
.adm-btn-sm { background:#0d0d0d; border:1px solid #333; color:#aaa; border-radius:6px; padding:4px 10px; font-size:0.75rem; cursor:pointer; font-family:'Nunito',sans-serif; font-weight:700; }
.adm-msg { font-size:0.82rem; margin-top:8px; min-height:18px; font-weight:700; }
.adm-msg.sucesso { color:#00cc77; }
.adm-msg.erro { color:#f87171; }
.adm-msg.info { color:#aaa; }
.adm-loading { text-align:center; color:#555; font-size:0.85rem; padding:1rem 0; }
.adm-user-item { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; background:#0d0d0d; border-radius:8px; border:1px solid #222; margin-bottom:6px; }
.adm-user-item.premium { border-color:#f5a623; background:#1a1500; }
.adm-user-email { font-size:0.82rem; color:#fff; font-weight:600; word-break:break-all; }
.adm-user-venc { font-size:0.7rem; color:#666; margin-top:2px; }
.adm-user-badge { font-size:0.7rem; font-weight:800; padding:3px 10px; border-radius:20px; white-space:nowrap; margin-left:8px; flex-shrink:0; }
.adm-user-badge.premium { background:#f5a623; color:#000; }
.adm-user-badge.gratuito { background:#1a1a1a; color:#555; border:1px solid #333; }
`;
const _admTag = document.createElement("style");
_admTag.textContent = _admCss;
document.head.appendChild(_admTag);
