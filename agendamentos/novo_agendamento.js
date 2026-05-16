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
// Quando Guilherme integrar o backend, substituir por fetch POST.
document.getElementById("formAgendamento").addEventListener("submit", function (e) {
  e.preventDefault(); // Impede recarregar a página

  console.log("1 - Formulário enviado");
  // Coleta os dados do formulário
  const dados = {
    nome:         document.getElementById("nome_cliente").value.trim(),
    telefone:     document.getElementById("telefone_cliente").value.trim(),
    data:         document.getElementById("data_agendamento").value,
    hora:         document.getElementById("hora_agendamento").value,
    servico:      document.getElementById("servico").value.trim(),
    colaborador: document.getElementById("colaborador").value.trim(),
    id:           Date.now() // ID temporário baseado em timestamp
  };

  // Valida data mínima - não permite datas no passado
  const hoje = new Date();
  const dataSel = new Date(dados.data + "T00:00:00");
  if (dataSel < new Date(hoje.toDateString())) {
    document.getElementById("msgAgendamento").textContent = "⚠️ Selecione uma data a partir de hoje.";
    return;
  }

  // Salva no sessionStorage (será substituído por API)
  const lista = JSON.parse(sessionStorage.getItem("agendamentos") || "[]");
  lista.push(dados);
  sessionStorage.setItem("agendamentos", JSON.stringify(lista));

  // Exibe o modal de sucesso
  document.getElementById("msgAgendamento").textContent = "";
  abrirModal();
});

// INICIALIZAÇÃO — Executa ao carregar a página
carregarPerfil();
