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
// Por enquanto salva no sessionStorage.
document.getElementById("formAgendamento").addEventListener("submit", function (e) {
  e.preventDefault();

  // Converte data de ISO (2026-05-19) para BR (19/05/2026)
  const dataISO = document.getElementById("data_agendamento").value;
  const [ano, mes, dia] = dataISO.split("-");
  const dataBR = `${dia}/${mes}/${ano}`;

  const dados = {
    id: Date.now(),
    nome: document.getElementById("nome_cliente").value.trim(),
    tel: document.getElementById("telefone_cliente").value.trim(),
    data: dataBR,
    hora: document.getElementById("hora_agendamento").value,
    servico: document.getElementById("servico").value.trim(),
    colaborador: document.getElementById("colaborador").value.trim()
  };

  // Validação de data (não pode ser passado)
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataSel = new Date(dataISO); // usa o ISO original só pra comparar
  if (dataSel < hoje) {
    const msgDiv = document.getElementById("msgAgendamento");
    msgDiv.textContent = "⚠️ Selecione uma data a partir de hoje.";
    msgDiv.classList.add("show", "erro");
    return;
  }

  // Salva no sessionStorage
  const lista = JSON.parse(sessionStorage.getItem("agendamentos") || "[]");
  lista.push(dados);
  sessionStorage.setItem("agendamentos", JSON.stringify(lista));

  // Limpa mensagem e abre modal de sucesso
  const msgDiv = document.getElementById("msgAgendamento");
  msgDiv.classList.remove("show", "erro");
  msgDiv.textContent = "";
  abrirModal();
});
// INICIALIZAÇÃO — Executa ao carregar a página
carregarPerfil();
