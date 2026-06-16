// MENU LATERAL E OVERLAY
function abrirMenu() {
  document.getElementById("sidebar").classList.add("aberta");
  document.getElementById("overlay").classList.add("ativo");
}
function fecharMenu() {
  document.getElementById("sidebar").classList.remove("aberta");
  document.getElementById("overlay").classList.remove("ativo");
}
// PERFIL DO USUÁRIO
function togglePerfil(event) {
  event.stopPropagation();
  document.getElementById("perfilDropdown").classList.toggle("aberto");
}
document.addEventListener("click", function (event) {
  const dropdown = document.getElementById("perfilDropdown");
  if (dropdown && !dropdown.contains(event.target)) {
    dropdown.classList.remove("aberto");
  }
  fecharSubmenu();
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    fecharMenu();
    fecharSubmenu();
    fecharModal();
  }
});
function gerarIniciais(nome) {
  if (!nome) return "?";
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
}
function carregarPerfil() {
  const nome  = sessionStorage.getItem("usuarioNome")  || "Carmem Lúcia";
  const email = sessionStorage.getItem("usuarioEmail") || "admin@gmail.com";
  document.getElementById("avatar").textContent      = gerarIniciais(nome);
  document.getElementById("perfilNome").textContent  = nome;
  document.getElementById("perfilEmail").textContent = email;
}
// LÓGICA DE DATAS (Sincronizada com hoje)
function datasDestaSemanaBR() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const diaSemana = hoje.getDay(); 
  const diffSeg   = diaSemana === 0 ? -6 : 1 - diaSemana;
  const seg = new Date(hoje);
  seg.setDate(hoje.getDate() + diffSeg);

  return Array.from({ length: 8 }, (_, i) => {
    const d = new Date(seg);
    d.setDate(seg.getDate() + i);
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    return `${dia}/${mes}/${d.getFullYear()}`;
  });
}
const semana = datasDestaSemanaBR();

//  CARREGA AGENDAMENTOS DO SESSIONSTORAGE (ou dados padrão)
let agendamentos = (function() {
  const salvos = sessionStorage.getItem("agendamentos");
  if (salvos && salvos !== "[]") {
    try {
      return JSON.parse(salvos);
    } catch(e) { 
      return [];
    }
  }
  // Dados iniciais padrão
  return [
    { id: 1, nome: "Gabrielle Lima",   tel: "(61) 99990-0001", data: "07/06/2026", hora: "09:00", servico: "Escova"          },
    { id: 2, nome: "Zilda Brito",      tel: "(61) 99990-0002", data: "07/06/2026", hora: "10:30", servico: "Manicure"        },
    { id: 3, nome: "Gabriel Santos",   tel: "(61) 99990-0004", data: "07/06/2026", hora: "11:00", servico: "Corte de Cabelo" },
    { id: 4, nome: "Yan Cruz",         tel: "(61) 99990-0003", data: "07/06/2026", hora: "14:00", servico: "Corte Masculino" },
    { id: 5, nome: "Guilherme Souza",  tel: "(61) 99990-0005", data: "07/06/2026", hora: "15:30", servico: "Corte e Barba"   }
  ];
})();

// RENDERIZAÇÃO DA TABELA
function renderizarTabela() {
  const corpo = document.getElementById("tabelaCorpo");
  const vazia = document.getElementById("tabelaVazia");
  if (!corpo) return;
  
  corpo.innerHTML = "";

  const hoje = new Date();
  const hojeFormatado = `${hoje.getFullYear()}${String(hoje.getMonth() + 1).padStart(2, "0")}${String(hoje.getDate()).padStart(2, "0")}`;

  const filtrados = agendamentos.filter(a => {
    const [d, m, y] = a.data.split("/");
    const dataAgendamento = `${y}${m}${d}`;
    return dataAgendamento >= hojeFormatado;
  });

  if (filtrados.length === 0) {
    if(vazia) vazia.style.display = "block";
    atualizarBotoes();
    return;
  }
  if(vazia) vazia.style.display = "none";
  const ordenados = [...filtrados].sort((a, b) => {
    const da = a.data.split("/").reverse().join("");
    const db = b.data.split("/").reverse().join("");
    if (da !== db) return da.localeCompare(db);
    return a.hora.localeCompare(b.hora);
  });
  ordenados.forEach(a => {
    const partes = a.data.split("/");
    const dataComAnoIdentificado = `${partes[0]}/${partes[1]}<span class="barra-pc">/</span><span class="quebra-ano">${partes[2]}</span>`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="col-check">
        <input type="checkbox" class="check-linha" data-id="${a.id}" onchange="atualizarBotoes()" />
      </td>
      <td class="col-nome-alinhado">${a.nome}</td>
      <td class="col-nowrap text-center">${a.tel}</td>
      <td class="celula-data text-center">${dataComAnoIdentificado}</td>
      <td class="col-nowrap text-center">${a.hora}</td>
      <td class="col-nowrap text-center">${a.servico}</td>
      <td style="text-align:center; width:40px;">
        <a class="btn-whats-item"
           href="https://wa.me/55${a.tel.replace(/\D/g,'')}"
           target="_blank"
           title="WhatsApp de ${a.nome}"
           aria-label="WhatsApp de ${a.nome}"
           style="color:var(--text-soft); opacity:0.5; font-size:0.9rem;"
           onmouseover="this.style.opacity='1'"
           onmouseout="this.style.opacity='0.5'">
          <i class="fa-brands fa-whatsapp"></i>
        </a>
      </td>
    `;
    corpo.appendChild(tr);
  });
  atualizarBotoes();
}
// FUNÇÕES DE APOIO
function toggleTodos(master) {
  document.querySelectorAll(".check-linha").forEach(cb => cb.checked = master.checked);
  atualizarBotoes();
}
function atualizarBotoes() {
  const marcados = document.querySelectorAll(".check-linha:checked").length;
  document.getElementById("btnAtualizar").disabled = marcados !== 1;
  document.getElementById("btnExcluir").disabled   = marcados === 0;
}
function toggleSubmenu(event) {
  event.stopPropagation();
  const menu = document.getElementById("agendSubmenu");
  const chevron = document.getElementById("agendChevron");
  if (menu?.classList.contains("aberto")) {
    fecharSubmenu();
  } else {
    menu?.classList.add("aberto");
    chevron?.classList.add("girado");
    document.getElementById("overlay")?.classList.add("ativo");
  }
}
function fecharSubmenu() {
  document.getElementById("agendSubmenu")?.classList.remove("aberto");
  document.getElementById("agendChevron")?.classList.remove("girado");
  const sidebar = document.getElementById("sidebar");
  if (!sidebar.classList.contains("aberta")) {
    document.getElementById("overlay")?.classList.remove("ativo");
  }
}
// MODAL DE EDIÇÃO
function abrirModalAtualizar() {
  const id = parseInt(document.querySelector(".check-linha:checked")?.dataset.id);
  const ag = agendamentos.find(a => a.id === id);
  if (!ag) return;

  document.getElementById("editNome").value = ag.nome;
  document.getElementById("editTel").value = ag.tel;
  document.getElementById("editHora").value = ag.hora;
  document.getElementById("editServico").value = ag.servico;

  const [d, m, a] = ag.data.split("/");
  document.getElementById("editData").value = `${a}-${m}-${d}`;
  // Travar campo hora e data mínima igual ao novo agendamento
  document.getElementById("editHora").min = "07:00";
  document.getElementById("editHora").max = "18:00";
  const hoje = new Date();
  const dd = String(hoje.getDate()).padStart(2, "0");
  const mm = String(hoje.getMonth() + 1).padStart(2, "0");
  document.getElementById("editData").min = `${hoje.getFullYear()}-${mm}-${dd}`;

  document.getElementById("modalAtualizar").classList.add("aberto");
}

function fecharModal() {
  document.getElementById("modalAtualizar").classList.remove("aberto");
}

// Máscara de telefone no modal de atualizar — formato (DD) 9XXXX-XXXX
document.getElementById("editTel").addEventListener("input", function () {
  let v = this.value.replace(/\D/g, "");
  if (v.length > 11) v = v.slice(0, 11);
  if      (v.length <= 2)  this.value = v;
  else if (v.length <= 7)  this.value = `(${v.slice(0,2)}) ${v.slice(2)}`;
  else                     this.value = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
});

function salvarAtualizacao() {
  const id      = parseInt(document.querySelector(".check-linha:checked")?.dataset.id);
  const nome    = document.getElementById("editNome").value.trim();
  const tel     = document.getElementById("editTel").value.trim();
  const hora    = document.getElementById("editHora").value;
  const servico = document.getElementById("editServico").value.trim();
  const msg     = document.getElementById("msgAtualizar");

  msg.className   = "msg";
  msg.textContent = "";

  // Nome obrigatório
  if (!nome) {
    msg.textContent = "Nome é obrigatório.";
    msg.classList.add("show", "erro");
    document.getElementById("editNome").focus();
    return;
  }

  // Telefone: DDD + 9 + 8 dígitos = 11 total
  const telNumeros = tel.replace(/\D/g, "");
  if (telNumeros.length !== 11) {
    msg.textContent = "Telefone incompleto. Ex: (61) 99999-0000";
    msg.classList.add("show", "erro");
    document.getElementById("editTel").focus();
    return;
  }
  if (telNumeros[2] !== "9") {
    msg.textContent = "O número deve começar com 9 após o DDD. Ex: (61) 99999-0000";
    msg.classList.add("show", "erro");
    document.getElementById("editTel").focus();
    return;
  }

  const dataISO = document.getElementById("editData").value;

  // Data não pode ser no passado
  if (dataISO) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataSel = new Date(dataISO + "T12:00");
    if (dataSel < hoje) {
      msg.textContent = "Selecione uma data a partir de hoje.";
      msg.classList.add("show", "erro");
      return;
    }

    // Dia da semana: só terça (2) a sábado (6)
    const diaSemana = dataSel.getDay();
    if (diaSemana === 0 || diaSemana === 1) {
      msg.textContent = "O salão não funciona aos domingos e segundas. Escolha outro dia.";
      msg.classList.add("show", "erro");
      return;
    }
  }

  // Horário: 07:00 às 18:00
  if (hora) {
    const [h, m] = hora.split(":").map(Number);
    const minutos = h * 60 + m;
    if (minutos < 7 * 60 || minutos > 18 * 60) {
      msg.textContent = "O salão funciona das 07:00 às 18:00. Escolha um horário dentro desse período.";
      msg.classList.add("show", "erro");
      return;
    }
  }

  let dataBR = "";
  if (dataISO) {
    const [ano, mes, dia] = dataISO.split("-");
    dataBR = `${dia}/${mes}/${ano}`;
  }

  const idx = agendamentos.findIndex(a => a.id === id);
  if (idx !== -1) {
    agendamentos[idx] = { ...agendamentos[idx], nome, tel, data: dataBR, hora, servico };
  }
  fecharModal();
  renderizarTabela();
}
function excluirSelecionados() {
  const checkboxes = document.querySelectorAll(".check-linha:checked");
  const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
  if (ids.length === 0) return;

  const qtd = ids.length;
  document.getElementById("textoConfirmacaoExclusao").textContent =
    `Tem certeza que deseja excluir ${qtd} agendamento(s)? Esta ação não pode ser desfeita.`;

  window._idsParaExcluir = ids;
  document.getElementById("modalConfirmarExclusao").classList.add("aberto");
}

function fecharModalConfirmacao() {
  document.getElementById("modalConfirmarExclusao").classList.remove("aberto");
  window._idsParaExcluir = [];
}

function executarExclusao() {
  const ids = window._idsParaExcluir || [];
  agendamentos = agendamentos.filter(a => !ids.includes(a.id));
  fecharModalConfirmacao();
  renderizarTabela();
}

// Permissões
(function aplicarPermissoes() {
  const cargo = sessionStorage.getItem("usuarioCargo");
  const restritos = ["funcionarios.html", "servico.html", "financas.html"];
  if (cargo === "proprietaria") return;
  document.querySelectorAll(".sidebar-menu a").forEach(function(link) {
    const href = link.getAttribute("href") || "";
    const file = href.split("/").pop();
    if (restritos.includes(file))
      link.closest("li").style.display = "none";
  });
})();

// Form de atualizar
const formAtualizar = document.getElementById("formAtualizar");
if (formAtualizar) {
  formAtualizar.addEventListener("submit", function(event) {
    event.preventDefault();
    salvarAtualizacao();
  });
}

// INICIALIZAÇÃO
carregarPerfil();
renderizarTabela();

// BOTÃO WHATSAPP - ENVIA CONFIRMAÇÃO PARA A CLIENTE
const btnWhats = document.querySelector(".btn-whats");
if (btnWhats) {
  btnWhats.onclick = function() {
    const selectedRows = document.querySelectorAll(".check-linha:checked");
    if (selectedRows.length !== 1) {
      alert("Selecione UM agendamento para enviar a confirmação.");
      return;
    }
    
    const id = parseInt(selectedRows[0].dataset.id);
    const agendamento = agendamentos.find(a => a.id === id);
    
    if (!agendamento) {
      alert("Agendamento não encontrado.");
      return;
    }
    
    const msg = `*ESPAÇO CARMEM LÚCIA*\n\n` +
      `Olá *${agendamento.nome}*, seu agendamento está CONFIRMADO!\n\n` +
      `Data: ${agendamento.data}\n` +
      `Hora: ${agendamento.hora}\n` +
      `Serviço: ${agendamento.servico}\n\n` +
      `Agradecemos a preferência.`;
    
    const telefoneCliente = agendamento.tel.replace(/\D/g, '');
    window.open(`https://wa.me/55${telefoneCliente}?text=${encodeURIComponent(msg)}`, "_blank");
  };
}