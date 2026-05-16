// Menu lateral
function abrirMenu() {
  document.getElementById("sidebar").classList.add("aberta");
  document.getElementById("overlay").classList.add("ativo");
}

function fecharMenu() {
  document.getElementById("sidebar").classList.remove("aberta");
  document.getElementById("overlay").classList.remove("ativo");
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") fecharMenu();
});

// Avatar / dropdown de perfil
function togglePerfil(event) {
  event.stopPropagation();
  document.getElementById("perfilDropdown").classList.toggle("aberto");
}

document.addEventListener("click", function () {
  document.getElementById("perfilDropdown").classList.remove("aberto");
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
  document.getElementById("avatar").textContent     = gerarIniciais(nome);
  document.getElementById("perfilNome").textContent  = nome;
  document.getElementById("perfilEmail").textContent = email;
}

//  Limpar formulário 
function limparFormulario() {
  document.getElementById("nome").value         = "";
  document.getElementById("telefone").value     = "";
  document.getElementById("observacoes").value  = "";
  const msg = document.getElementById("msgCadastro");
  msg.className   = "msg";
  msg.textContent = "";
}

function cadastrarCliente() {
  const nome     = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const msg      = document.getElementById("msgCadastro");

  msg.className   = "msg";
  msg.textContent = "";

  // LIMPEZA (Tira a máscara para contar os números)
  const numerosApenas = telefone.replace(/\D/g, "");

  // 2. A TRAVA (Se não tiver 10 ou 11 dígitos, o código PARA aqui)
  if (numerosApenas.length < 10 || numerosApenas.length > 11) {
    msg.textContent = "Digite um telefone válido (10 ou 11 dígitos).";
    msg.classList.add("erro");
    return; // <--- ISSO AQUI É O QUE TRAVA E NÃO DEIXA ABRIR O POP-UP
  }

  if (!nome) {
    msg.textContent = "O nome é obrigatório.";
    msg.classList.add("erro");
    return;
  }

  // SUCESSO - se o telefone estiver correto
  document.getElementById("popupSucesso").classList.add("aberto");
}
// Permissões - esconde itens do menu restritos para funcionária
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

// event.preventDefault() trava refresh
const formCadastro = document.getElementById("formCadastro");
if (formCadastro) {
  formCadastro.addEventListener("submit", function(event) {
    event.preventDefault(); // Trava o refresh da página
    cadastrarCliente(); // 
  });
}
// Inicializa 
carregarPerfil();