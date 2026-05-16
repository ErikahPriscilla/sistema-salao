// ─Menu lateral 
// Abre o menu lateral deslizando da direita
function abrirMenu() {
  document.getElementById("sidebar").classList.add("aberta");
  document.getElementById("overlay").classList.add("ativo");
}

// Fecha o menu lateral
function fecharMenu() {
  document.getElementById("sidebar").classList.remove("aberta");
  document.getElementById("overlay").classList.remove("ativo");
}

// Fecha o menu ao pressionar ESC
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") fecharMenu();
});

//  Avatar / dropdown de perfil 
// Abre ou fecha o dropdown com nome e email do usuário logado
function togglePerfil(event) {
  event.stopPropagation();
  document.getElementById("perfilDropdown").classList.toggle("aberto");
}

// Fecha o dropdown ao clicar em qualquer lugar da tela
document.addEventListener("click", function () {
  document.getElementById("perfilDropdown").classList.remove("aberto");
});

// Gera as iniciais do nome para exibir no avatar (ex: "Carmem Lúcia" - "CL")
function gerarIniciais(nome) {
  if (!nome) return "?";
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
}

// Carrega o nome e email salvos no login e preenche o avatar e dropdown
// Se não houver sessão ativa, redireciona pro login automaticamente
function carregarPerfil() {
  const nome  = sessionStorage.getItem("usuarioNome");
  const email = sessionStorage.getItem("usuarioEmail");

  if (!nome) {
    window.location.href = "../login/login.html";
    return;
  }

  document.getElementById("avatar").textContent     = gerarIniciais(nome);
  document.getElementById("perfilNome").textContent  = nome;
  document.getElementById("perfilEmail").textContent = email || "";
}
// Trava e formata o telefone automaticamente
document.getElementById("telefone").addEventListener("input", function() {
  let v = this.value.replace(/\D/g, ""); // remove tudo que não é número
  if (v.length > 11) v = v.slice(0, 11); // máximo 11 dígitos

  // Aplica a máscara conforme digita
  if (v.length <= 10) {
    v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  } else {
    v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  }
  this.value = v;
});
//  Formulário de cadastro 
// Limpa todos os campos do formulário e apaga mensagens de erro
function limparFormulario() {
  document.getElementById("nome").value        = "";
  document.getElementById("telefone").value    = "";
  document.getElementById("observacoes").value = "";
  const msg = document.getElementById("msgCadastro");
  msg.className   = "msg";
  msg.textContent = "";
}

// Valida e envia o cadastro do cliente
// Futuramente vai salvar no banco de dados via backend Java
function cadastrarCliente() {
  const nome     = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const msg      = document.getElementById("msgCadastro");

  // Limpa mensagem anterior
  msg.className   = "msg";
  msg.textContent = "";

  // Validação - nome é obrigatório
  if (!nome) {
    msg.textContent = "O nome é obrigatório.";
    msg.classList.add("erro");
    return;
  }

  // Abre o pop-up de sucesso
  document.getElementById("popupSucesso").classList.add("aberto");
}

// Permissões 
// Esconde do menu os itens que a funcionária não pode acessar
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

// Inicializa 
carregarPerfil();