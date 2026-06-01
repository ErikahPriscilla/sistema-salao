const CHAVE_STORAGE = "transacoes_pessoal";

// MENU / PERFIL
function abrirMenu() {
  document.getElementById("sidebar").classList.add("aberta");
  document.getElementById("overlay").classList.add("ativo");
}
function fecharMenu() {
  document.getElementById("sidebar").classList.remove("aberta");
  document.getElementById("overlay").classList.remove("ativo");
}
document.addEventListener("keydown", e => { if (e.key === "Escape") fecharMenu(); });
function togglePerfil(event) {
  event.stopPropagation();
  document.getElementById("perfilDropdown").classList.toggle("aberto");
}
document.addEventListener("click", () => {
  document.getElementById("perfilDropdown").classList.remove("aberto");
});
function gerarIniciais(nome) {
  if (!nome) return "?";
  const p = nome.trim().split(/\s+/);
  return p.length === 1 ? p[0][0].toUpperCase()
    : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}
function carregarPerfil() {
  const nome  = sessionStorage.getItem("usuarioNome");
  const email = sessionStorage.getItem("usuarioEmail");
  if (nome) {
    document.getElementById("avatar").textContent      = gerarIniciais(nome);
    document.getElementById("perfilNome").textContent  = nome;
    document.getElementById("perfilEmail").textContent = email || "";
  } else {
    window.location.href = "../login/login.html";
  }
}
(function aplicarPermissoes() {
  const cargo = sessionStorage.getItem("usuarioCargo");
  const restritos = ["funcionarios.html", "servico.html", "financas.html"];
  if (cargo === "proprietaria") return;
  document.querySelectorAll(".sidebar-menu a").forEach(link => {
    const file = (link.getAttribute("href") || "").split("/").pop();
    if (restritos.includes(file)) link.closest("li").style.display = "none";
  });
})();

// DADOS 
let transacoes = [];
let tipoAtivo  = "todos";

// HELPERS 
function parseBR(dataStr) {
  const partes = (dataStr || "").split(" · ");
  const [dia, mes, ano] = partes[0].split("/");
  return new Date(ano, mes - 1, dia);
}
function fmt(v) {
  return "R$ " + v.toFixed(2).replace(".", ",");
}

// FILTROS
function setTipo(tipo, btn) {
  tipoAtivo = tipo;
  document.querySelectorAll(".ftbtn").forEach(b => b.classList.remove("ativo"));
  btn.classList.add("ativo");
  aplicar();
}
function limparDatas() {
  document.getElementById("dataInicio").value = "";
  document.getElementById("dataFim").value = "";
  aplicar();
}

function filtrarLista() {
  const inicio = document.getElementById("dataInicio").value;
  const fim    = document.getElementById("dataFim").value;
  return transacoes.filter(t => {
    if (tipoAtivo !== "todos" && t.tipo !== tipoAtivo) return false;
    if (inicio || fim) {
      const d = parseBR(t.data);
      const dStr = d.getFullYear() + "-"
        + String(d.getMonth() + 1).padStart(2, "0") + "-"
        + String(d.getDate()).padStart(2, "0");
      if (inicio && dStr < inicio) return false;
      if (fim    && dStr > fim)    return false;
    }
    return true;
  });
}
function aplicar() {
  renderizar(filtrarLista());
}

// RENDERIZAR
function renderizar(lista) {
  const container = document.getElementById("listaTransacoes");
  if (lista.length === 0) {
    container.innerHTML = '<p class="lista-vazia">Nenhuma transação encontrada.</p>';
    return;
  }
  container.innerHTML = "";
  lista.forEach(t => {
    const item = document.createElement("div");
    item.className = "transacao-item " + t.tipo;
    item.innerHTML = `
      <div class="transacao-icone ${t.tipo}">
        <i class="fa-solid ${t.tipo === "entrada" ? "fa-arrow-up" : "fa-arrow-down"}"></i>
      </div>
      <div class="transacao-body">
        <div class="transacao-topo">
          <span class="transacao-valor ${t.tipo}">
            ${t.tipo === "entrada" ? "+" : "−"} ${fmt(t.valor)}
          </span>
          <span class="transacao-data">${t.data}</span>
        </div>
        ${t.notas ? `<div class="transacao-notas">${t.notas}</div>` : ""}
      </div>
    `;
    container.appendChild(item);
  });
}

// Carrega os dados do sessionStorage
function carregarTransacoes() {
  try {
    const salvas = JSON.parse(sessionStorage.getItem(CHAVE_STORAGE));
    if (salvas && salvas.length > 0) {
      transacoes = salvas;
    } else {
      transacoes = [];
    }
  } catch(e) {
    transacoes = [];
  }
  console.log("Transações carregadas:", transacoes.length);
  aplicar();
}

// INIT 
window.addEventListener("load", function () {
  carregarPerfil();
  carregarTransacoes();
});

// Recarrega quando a aba volta ao foco
document.addEventListener("visibilitychange", function() {
  if (document.visibilityState === "visible") {
    carregarTransacoes();
  }
});