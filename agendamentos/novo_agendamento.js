// NOVO_AGENDAMENTO.JS - responsável por: menu lateral, avatar/perfil
//  máscara de telefone, submit do formulário e modal de sucesso

// MENU LATERAL — Abre o painel deslizante ao clicar no hambúrguer
function abrirMenu() {
  document.getElementById("sidebar").classList.add("aberta");
  document.getElementById("overlay").classList.add("ativo");
}

// MENU LATERAL — Fecha o painel deslizante
function fecharMenu() {
  document.getElementById("sidebar").classList.remove("aberta");
  document.getElementById("overlay").classList.remove("ativo");
}

// Fecha o menu ao pressionar ESC
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") { fecharMenu(); fecharModal(); }
});

// AVATAR — Exibe ou oculta o dropdown de perfil
function togglePerfil(event) {
  event.stopPropagation();
  document.getElementById("perfilDropdown").classList.toggle("aberto");
}

// Fecha dropdown ao clicar fora dele
document.addEventListener("click", function () {
  document.getElementById("perfilDropdown").classList.remove("aberto");
});

// Gera as iniciais do nome para o avatar 
function gerarIniciais(nome) {
  if (!nome) return "?";
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
}

// PERFIL - Carrega dados do usuário logado via sessionStorage
// Se não houver sessão ativa, redireciona para o login
function carregarPerfil() {
  const nome  = sessionStorage.getItem("usuarioNome");
  const email = sessionStorage.getItem("usuarioEmail");
  if (nome) {
    document.getElementById("avatar").textContent      = gerarIniciais(nome);
    document.getElementById("perfilNome").textContent  = nome;
    document.getElementById("perfilEmail").textContent = email || "";
  } else {
    window.location.href = "../login/login.html"; // Redireciona se não estiver logado
  }
}

// PERMISSÕES — Esconde itens do menu restrito
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

// MÁSCARA DE TELEFONE 
document.getElementById("telefone_cliente").addEventListener("input", function () {
  let v = this.value.replace(/\D/g, ""); // Remove não numéricos
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length <= 10) {
    v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  } else {
    v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  }
  this.value = v;
});

// MODAL DE SUCESSO — Exibe e fecha o modal 
function abrirModal() {
  document.getElementById("modalSucesso").classList.add("aberto");
}

function fecharModal() {
  document.getElementById("modalSucesso").classList.remove("aberto");
}

// SUBMIT DO FORMULÁRIO - Processa o agendamento
document.getElementById("formAgendamento").addEventListener("submit", function (e) {
  e.preventDefault();

  const msgDiv = document.getElementById("msgAgendamento");
  msgDiv.className = "msg";
  msgDiv.textContent = "";

  const dataISO    = document.getElementById("data_agendamento").value;
  const hora       = document.getElementById("hora_agendamento").value;
  const telRaw     = document.getElementById("telefone_cliente").value.trim();
  const telNumeros = telRaw.replace(/\D/g, "");

  // Validar telefone: DD + 9 + 8 dígitos
  if (telNumeros.length !== 11 || telNumeros[2] !== "9") {
    msgDiv.textContent = "Telefone inválido. Digite DDD + 9 + 8 dígitos. Ex: (61) 99999-0000";
    msgDiv.classList.add("show", "erro");
    document.getElementById("telefone_cliente").focus();
    return;
  }

  // Validar dia da semana — terça (2) a sábado (6)
  if (dataISO) {
    const diaSemana = new Date(dataISO + "T12:00").getDay();
    if (diaSemana === 0 || diaSemana === 1) {
      msgDiv.textContent = "O salão não funciona aos domingos e segundas. Escolha outro dia.";
      msgDiv.classList.add("show", "erro");
      return;
    }
  }

  // Validar horário 07:00 às 18:00
  if (hora) {
    const [h, m] = hora.split(":").map(Number);
    const minutos = h * 60 + m;
    if (minutos < 7 * 60 || minutos > 18 * 60) {
      msgDiv.textContent = "O salão funciona das 07:00 às 18:00. Escolha um horário dentro desse período.";
      msgDiv.classList.add("show", "erro");
      return;
    }
  }

  // Validar data não pode ser passado
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataSel = new Date(dataISO);
  if (dataSel < hoje) {
    msgDiv.textContent = "⚠️ Selecione uma data a partir de hoje.";
    msgDiv.classList.add("show", "erro");
    return;
  }

  // Converte data de ISO (2026-05-19) para BR (19/05/2026)
  const [ano, mes, dia] = dataISO.split("-");
  const dataBR = `${dia}/${mes}/${ano}`;

  const dados = {
    id: Date.now(),
    nome: document.getElementById("nome_cliente").value.trim(),
    tel: telRaw,
    data: dataBR,
    hora: hora,
    servico: document.getElementById("servico").value.trim(),
    colaborador: document.getElementById("colaborador").value.trim()
  };

  // Salva no sessionStorage
  const lista = JSON.parse(sessionStorage.getItem("agendamentos") || "[]");
  lista.push(dados);
  sessionStorage.setItem("agendamentos", JSON.stringify(lista));

  msgDiv.classList.remove("show", "erro");
  msgDiv.textContent = "";
  abrirModal();
});
// INICIALIZAÇÃO — Executa ao carregar a página
carregarPerfil();

// CONFIGURAR CAMPO DATA — mínimo hoje, bloquear domingo e segunda
(function configurarCampos() {
  const campoData = document.getElementById("data_agendamento");
  const campoHora = document.getElementById("hora_agendamento");

  // Data mínima = hoje
  const hoje = new Date();
  const dd = String(hoje.getDate()).padStart(2, "0");
  const mm = String(hoje.getMonth() + 1).padStart(2, "0");
  campoData.min = `${hoje.getFullYear()}-${mm}-${dd}`;

  // Travar horário entre 07:00 e 18:00
  campoHora.min = "07:00";
  campoHora.max = "18:00";

  // Bloquear domingo (0) e segunda (1)
  campoData.addEventListener("change", function () {
    if (!this.value) return;
    const diaSemana = new Date(this.value + "T12:00").getDay();
    const msgDiv = document.getElementById("msgAgendamento");
    if (diaSemana === 0 || diaSemana === 1) {
      msgDiv.textContent = "O salão não funciona aos domingos e segundas. Escolha outro dia.";
      msgDiv.classList.add("show", "erro");
      this.value = "";
    } else {
      msgDiv.className = "msg";
      msgDiv.textContent = "";
    }
  });
})();

// MÁSCARA DE TELEFONE
document.getElementById("telefone_cliente").addEventListener("input", function () {
  let v = this.value.replace(/\D/g, "");
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length <= 2)      this.value = v;
  else if (v.length <= 7) this.value = `(${v.slice(0,2)}) ${v.slice(2)}`;
  else                    this.value = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
});
