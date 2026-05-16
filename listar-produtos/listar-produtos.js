const CHAVE_STORAGE = "transacoes_produtos" 
//  MENU / PERFIL
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

//  DADOS 
let transacoes = [];
let tipoAtivo  = "todos";

//  HELPERS 
function parseBR(dataStr) {
  const partes = (dataStr || "").split(" · ");
  const [dia, mes, ano] = partes[0].split("/");
  const [hora, min]     = (partes[1] || "00:00").split(":");
  return new Date(ano, mes - 1, dia, hora, min);
}
function fmt(v) {
  return "R$ " + v.toFixed(2).replace(".", ",");
}
function popularAnos() {
  const selectAno = document.getElementById("selectAno");
  const anoAtual = new Date().getFullYear();
  const anos = [];
  
  // Ano passado + ano atual + próximos anos
  for (let i = 0; i <= 4; i++) {
    anos.push(anoAtual + i);
  }
  
  // Remove duplicatas e ordena
  const anosUnicos = [...new Set(anos)].sort();
  
  selectAno.innerHTML = '<option value="">Ano</option>';
  anosUnicos.forEach(ano => {
    const option = document.createElement("option");
    option.value = ano;
    option.textContent = ano;
    selectAno.appendChild(option);
  });
}
// FILTROS
function setTipo(tipo, btn) {
  tipoAtivo = tipo;
  document.querySelectorAll(".ftbtn").forEach(b => b.classList.remove("ativo"));
  btn.classList.add("ativo");
  aplicar();
}

function filtrarLista() {
  const mes = document.getElementById("selectMes").value;
  const ano = document.getElementById("selectAno").value;
  return transacoes.filter(t => {
    if (tipoAtivo !== "todos" && t.tipo !== tipoAtivo) return false;
    if (mes || ano) {
      const d  = parseBR(t.data);
      const mT = String(d.getMonth() + 1).padStart(2, "0");
      const aT = String(d.getFullYear());
      if (mes && mT !== mes) return false;
      if (ano && aT !== ano) return false;
    }
    return true;
  });
}

function aplicar() {
  const lista = filtrarLista();
  renderizar(lista);
}

function mudouMes() {
  const mes = document.getElementById("selectMes").value;
  const selectAno = document.getElementById("selectAno");
  
  if (mes) {
    selectAno.style.display = "block";
    selectAno.value = "";  // reseta o ano
  } else {
    selectAno.style.display = "none";
    selectAno.value = "";
  }
  aplicar();
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
    // Pega só a data DD/MM/AAAA — descarta a hora após " · "
    const somenteData = (t.data || "").split(" · ")[0];

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
          <span class="transacao-badge ${t.tipo}">
            ${t.tipo === "entrada" ? "Entrada" : "Saída"}
          </span>
        </div>
        <div class="transacao-data">${somenteData}</div>
        ${t.notas ? `<div class="transacao-notas">${t.notas}</div>` : ""}
      </div>
    `;
    container.appendChild(item);
  });
}

//  EXPORTAR EXTRATO PDF
// Abre nova aba com extrato formatado (estilo fatura).
function exportarPDF() {
  const mes = document.getElementById("selectMes").value;
  const ano = document.getElementById("selectAno").value;
  const nomesMes = ["","Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  let periodo = "Todos os períodos";
  if (mes && ano) periodo = nomesMes[parseInt(mes)] + " de " + ano;
  else if (mes)   periodo = nomesMes[parseInt(mes)];
  else if (ano)   periodo = "Ano " + ano;

  const lista = filtrarLista();
  let entradas = 0, saidas = 0;
  lista.forEach(t => {
    if (t.tipo === "entrada") entradas += t.valor;
    else                      saidas   += t.valor;
  });
  const saldo = entradas - saidas;

  const linhas = lista.map(t => {
    const somenteData = (t.data || "").split(" · ")[0];
    return `
    <tr>
      <td style="padding:10px 8px; white-space:nowrap;">${somenteData}</td>
      <td style="padding:10px 8px;" class="${t.tipo}">${t.tipo === "entrada" ? "Entrada" : "Saída"}</td>
      <td style="padding:10px 8px;">${t.notas || "—"}</td>
      <td style="padding:10px 8px; text-align:right; white-space:nowrap;" class="val ${t.tipo}">${t.tipo === "entrada" ? "+" : "−"} ${fmt(t.valor)}</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"/>
<title>Extrato de Serviços · ${periodo}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Helvetica Neue',Arial,sans-serif;color:#3a2e2b;padding:40px}
  .cab{text-align:center;margin-bottom:32px;border-bottom:2px solid #c9956c;padding-bottom:20px}
  .cab h1{font-size:22px;font-weight:300;letter-spacing:2px;color:#c9956c}
  .cab h2{font-size:14px;font-weight:400;margin-top:4px;color:#7a6060}
  .cab p{font-size:12px;color:#9e8080;margin-top:6px}
  table{width:100%;border-collapse:collapse;margin-top:24px;font-size:13px}
  thead tr{background:#f5e8e4}
  th{padding:10px 8px;text-align:left;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#7a6060}
  td{padding:10px 8px;border-bottom:1px solid #f0e4e0;vertical-align:middle}
  tr:last-child td{border-bottom:none}
  .entrada{color:#165c30;font-weight:600}
  .saida{color:#7a1c1c;font-weight:600}
  .val{font-size:14px;font-weight:700;text-align:right;white-space:nowrap}
  .resumo{margin-top:28px;display:flex;justify-content:center;gap:48px;flex-wrap:wrap}
  .resumo div{text-align:center}
  .resumo .lbl{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#9e8080}
  .resumo .val2{font-size:20px;font-weight:700;margin-top:4px;white-space:nowrap}
  .sp{color:#165c30}.sn{color:#7a1c1c}
  .rodape{margin-top:40px;text-align:center;font-size:11px;color:#bbb;border-top:1px solid #f0e0dc;padding-top:16px}
</style></head><body>
<div class="cab">
  <h1>Espaço Carmem Lúcia</h1>
  <h2>Extrato de Serviços</h2>
  <p>Período: ${periodo} &nbsp;·&nbsp; Gerado em: ${new Date().toLocaleDateString("pt-BR")}</p>
</div>
<table style="width:100%; border-collapse:collapse;">
  <thead>
    <tr style="background:#f5e8e4;">
      <th style="padding:10px 8px; text-align:left; width:25%">Data</th>
      <th style="padding:10px 8px; text-align:left; width:20%">Tipo</th>
      <th style="padding:10px 8px; text-align:left; width:35%">Observações</th>
      <th style="padding:10px 8px; text-align:right; width:20%">Valor</th>
    </tr>
  </thead>
  <tbody>${linhas || '<tr><td colspan="4" style="text-align:center;padding:24px;">Nenhuma transação no período.</td></tr>'}</tbody>
</table>
<div class="resumo">
  <div><p class="lbl">Entradas</p><p class="val2 entrada">+ ${fmt(entradas)}</p></div>
  <div><p class="lbl">Saídas</p><p class="val2 saida">− ${fmt(saidas)}</p></div>
  <div><p class="lbl">Saldo</p><p class="val2 ${saldo >= 0 ? "sp" : "sn"}">${saldo >= 0 ? "+" : "−"} ${fmt(Math.abs(saldo))}</p></div>
</div>
<div class="rodape">Espaço Carmem Lúcia · Sistema de Gestão</div>
</body></html>`;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}
//  INIT ─
window.addEventListener("load", function () {
  carregarPerfil();
  try { transacoes = JSON.parse(sessionStorage.getItem(CHAVE_STORAGE)) || []; }
  catch(e) { transacoes = []; }
  popularAnos();
  aplicar();
});
