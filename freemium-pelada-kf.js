// ============================================================
// PELADA KF — SISTEMA FREEMIUM
// Salva este arquivo na mesma pasta do index.html
// ============================================================

const PREMIUM_CONFIG = {
  valor:         "R$ 9,90",
  chavePix:      "10305187694",
  tipoChave:     "CPF",
  nomeRecebedor: "Kauê Ferraz",
  whatsapp:      "5522992826224",
  whatsappLabel: "(22) 99282-6224"
};

// ── APLICA O BLOQUEIO OU LIBERAÇÃO NA TELA ────────────────
function aplicarRestricoes(plano) {
  const isPremium = plano === "premium";
  const paginaFin = document.getElementById("page-financeiro");
  if (!paginaFin) return;

  if (!isPremium) {
    if (!document.getElementById("overlay-fin")) {
      const overlay = document.createElement("div");
      overlay.id = "overlay-fin";
      overlay.innerHTML = `
        <div class="overlay-fin-box">
          <div style="font-size:2.8rem">🔒</div>
          <div class="overlay-fin-titulo">Funcionalidade Premium</div>
          <div class="overlay-fin-desc">
            O módulo <strong>Financeiro / Caixa</strong><br>
            é exclusivo do plano Premium.
          </div>
          <button class="overlay-fin-btn" onclick="abrirModalPremium()">
            ⭐ Ver planos
          </button>
        </div>
      `;
      paginaFin.style.position = "relative";
      paginaFin.appendChild(overlay);
    }
  } else {
    const overlay = document.getElementById("overlay-fin");
    if (overlay) overlay.remove();
  }

  atualizarBadge(plano);
}

// ── BADGE NA BARRA DE USUÁRIO ─────────────────────────────
function atualizarBadge(plano) {
  const anterior = document.getElementById("badge-plano-kf");
  if (anterior) anterior.remove();

  const badge = document.createElement("span");
  badge.id = "badge-plano-kf";

  if (plano === "premium") {
    badge.innerHTML = `⭐ Premium`;
    badge.className = "badge-kf premium";
  } else {
    badge.innerHTML = `🆓 <u style="cursor:pointer" onclick="abrirModalPremium()">Assinar</u>`;
    badge.className = "badge-kf gratuito";
  }

  const userBar = document.querySelector(".user-info-bar");
  if (userBar) userBar.insertBefore(badge, userBar.firstChild);
}

// ── MODAL DE ASSINATURA ───────────────────────────────────
function abrirModalPremium() {
  const anterior = document.getElementById("modal-premium-kf");
  if (anterior) anterior.remove();

  const msgWpp = encodeURIComponent("Olá Kauê! Acabei de fazer o pagamento do Pelada KF Premium. Segue o comprovante:");
  const linkWpp = `https://wa.me/${PREMIUM_CONFIG.whatsapp}?text=${msgWpp}`;

  const modal = document.createElement("div");
  modal.id = "modal-premium-kf";
  modal.innerHTML = `
    <div class="mpk-fundo" onclick="fecharModalPremium()"></div>
    <div class="mpk-caixa">
      <button class="mpk-fechar" onclick="fecharModalPremium()">✕</button>

      <div style="text-align:center;margin-bottom:1.2rem">
        <div style="font-size:2.5rem">⭐</div>
        <div class="mpk-titulo">Seja Premium</div>
        <div style="font-size:0.8rem;color:#888">Desbloqueie o módulo Financeiro / Caixa</div>
      </div>

      <div class="mpk-comparativo">
        <div class="mpk-plano">
          <div class="mpk-plano-nome">🆓 Gratuito</div>
          <ul>
            <li>✅ Jogadores</li>
            <li>✅ Presença</li>
            <li>✅ Sorteio</li>
            <li>❌ Financeiro</li>
          </ul>
          <div class="mpk-preco-txt">Grátis</div>
        </div>
        <div class="mpk-plano destaque">
          <div class="mpk-tag">Recomendado</div>
          <div class="mpk-plano-nome">⭐ Premium</div>
          <ul>
            <li>✅ Jogadores</li>
            <li>✅ Presença</li>
            <li>✅ Sorteio</li>
            <li>✅ Financeiro</li>
          </ul>
          <div class="mpk-preco-txt destaque">${PREMIUM_CONFIG.valor}<span>/mês</span></div>
        </div>
      </div>

      <div class="mpk-pix-bloco">
        <div style="font-weight:800;margin-bottom:0.7rem;font-size:0.95rem">💰 Como assinar — 3 passos:</div>
        <div class="mpk-passo">
          <div class="mpk-passo-num">1</div>
          <div>Copie a chave Pix e pague <strong style="color:#fff">${PREMIUM_CONFIG.valor}</strong></div>
        </div>
        <div class="mpk-chave-row">
          <div>
            <div style="font-size:0.65rem;color:#666;margin-bottom:2px">CHAVE ${PREMIUM_CONFIG.tipoChave}</div>
            <span id="mpk-chave">${PREMIUM_CONFIG.chavePix}</span>
          </div>
          <button onclick="mpkCopiar()" class="mpk-btn-copiar">📋 Copiar</button>
        </div>
        <div style="font-size:0.78rem;color:#555;margin-bottom:1rem">
          Recebedor: <strong style="color:#888">${PREMIUM_CONFIG.nomeRecebedor}</strong>
        </div>

        <div class="mpk-passo">
          <div class="mpk-passo-num">2</div>
          <div>Envie o comprovante pelo WhatsApp</div>
        </div>
        <a href="${linkWpp}" target="_blank" class="mpk-btn-wpp">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Enviar comprovante — ${PREMIUM_CONFIG.whatsappLabel}
        </a>

        <div class="mpk-passo" style="margin-top:0.8rem">
          <div class="mpk-passo-num">3</div>
          <div>Acesso liberado em até <strong style="color:#fff">24 horas</strong> ✅</div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function fecharModalPremium() {
  const modal = document.getElementById("modal-premium-kf");
  if (modal) modal.remove();
}

function mpkCopiar() {
  const chave = document.getElementById("mpk-chave").textContent;
  navigator.clipboard.writeText(chave).then(() => {
    const btn = document.querySelector(".mpk-btn-copiar");
    btn.textContent = "✅ Copiado!";
    setTimeout(() => btn.textContent = "📋 Copiar", 2000);
  });
}

// ── ESTILOS ───────────────────────────────────────────────
const _css = `
#overlay-fin {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  border-radius: 12px;
  min-height: 250px;
}
.overlay-fin-box { text-align:center; padding:2rem 1.5rem; max-width:280px; }
.overlay-fin-titulo { font-family:'Bebas Neue',sans-serif; font-size:1.4rem; letter-spacing:2px; color:#f5a623; margin:0.6rem 0 0.4rem; }
.overlay-fin-desc { font-size:0.82rem; color:#aaa; line-height:1.6; margin-bottom:1.2rem; }
.overlay-fin-btn { background:#f5a623; color:#000; border:none; border-radius:10px; padding:12px 24px; font-weight:900; font-size:0.95rem; cursor:pointer; font-family:'Nunito',sans-serif; width:100%; }
.badge-kf { font-size:0.68rem; font-weight:800; padding:2px 10px; border-radius:20px; margin-right:8px; font-family:'Nunito',sans-serif; }
.badge-kf.premium { background:#f5a623; color:#000; }
.badge-kf.gratuito { background:#1a1a1a; color:#aaa; border:1px solid #333; }
.mpk-fundo { position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:9998; }
.mpk-caixa { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:#111; border:1px solid #2a2a2a; border-radius:16px; padding:1.8rem 1.5rem; width:92%; max-width:400px; max-height:90vh; overflow-y:auto; z-index:9999; box-shadow:0 24px 80px rgba(0,0,0,0.8); }
.mpk-fechar { position:absolute; top:1rem; right:1rem; background:none; border:none; color:#555; font-size:1.1rem; cursor:pointer; }
.mpk-titulo { font-family:'Bebas Neue',sans-serif; font-size:1.6rem; letter-spacing:3px; color:#f5a623; margin:0.3rem 0 0.2rem; }
.mpk-comparativo { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:1.2rem; }
.mpk-plano { background:#1a1a1a; border:2px solid #2a2a2a; border-radius:12px; padding:1rem 0.8rem; position:relative; }
.mpk-plano.destaque { border-color:#f5a623; background:#1a1500; }
.mpk-plano-nome { font-size:0.9rem; font-weight:800; color:#fff; margin-bottom:0.7rem; }
.mpk-plano ul { list-style:none; padding:0; margin:0 0 0.8rem; font-size:0.78rem; color:#aaa; }
.mpk-plano ul li { margin-bottom:0.3rem; }
.mpk-preco-txt { font-family:'Bebas Neue',sans-serif; font-size:1.2rem; color:#666; }
.mpk-preco-txt.destaque { color:#f5a623; }
.mpk-preco-txt span { font-size:0.7rem; font-family:'Nunito',sans-serif; font-weight:400; color:#666; }
.mpk-tag { position:absolute; top:-11px; left:50%; transform:translateX(-50%); background:#f5a623; color:#000; font-size:0.62rem; font-weight:900; padding:2px 8px; border-radius:20px; white-space:nowrap; font-family:'Nunito',sans-serif; }
.mpk-pix-bloco { background:#0d0d0d; border:1px solid #222; border-radius:12px; padding:1.1rem; font-size:0.9rem; }
.mpk-passo { display:flex; align-items:center; gap:10px; margin-bottom:0.7rem; font-size:0.85rem; color:#aaa; }
.mpk-passo-num { background:#f5a623; color:#000; font-weight:900; font-size:0.75rem; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-family:'Nunito',sans-serif; }
.mpk-chave-row { display:flex; align-items:center; justify-content:space-between; gap:8px; background:#1a1a1a; border:1px solid #333; border-radius:8px; padding:10px 12px; margin-bottom:6px; }
#mpk-chave { font-family:monospace; font-size:1rem; color:#0f9; font-weight:700; }
.mpk-btn-copiar { background:#0d3b1e; color:#00cc77; border:none; padding:7px 14px; border-radius:6px; cursor:pointer; font-size:0.82rem; white-space:nowrap; font-family:'Nunito',sans-serif; font-weight:700; }
.mpk-btn-wpp { display:flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:13px; background:#128c3e; color:#fff; border:none; border-radius:10px; font-weight:800; font-size:0.9rem; cursor:pointer; text-decoration:none; font-family:'Nunito',sans-serif; box-sizing:border-box; margin-bottom:4px; }
.mpk-btn-wpp:active { background:#0e6b30; }
`;
const _tag = document.createElement("style");
_tag.textContent = _css;
document.head.appendChild(_tag);
