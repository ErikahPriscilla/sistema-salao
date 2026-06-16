//  MENU 
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

// AVATAR 
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

//  FORM SUBMIT 
document.getElementById("formCadastro").addEventListener("submit", function(e) {
  e.preventDefault();
  validarECadastrar();
});

function validarECadastrar() {
  const nome = document.getElementById("nome").value.trim();
  const cpf = document.getElementById("cpf").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const data_nascimento = document.getElementById("data_nascimento").value;

  const msg = document.getElementById("msgCadastro");
  msg.classList.remove("show", "sucesso", "erro");

  if (!nome || !cpf || !telefone || !data_nascimento) {
    msg.textContent = "Preencha todos os campos!";
    msg.classList.add("show", "erro");
    return;
  }

  // Validação do CPF — exige exatamente 11 dígitos
  const cpfNums = cpf.replace(/\D/g, "");
  if (cpfNums.length !== 11) {
    msg.textContent = "CPF inválido. Digite todos os 11 dígitos. Ex: 000.000.000-00";
    msg.classList.add("show", "erro");
    return;
  }

  // Validação do telefone - exige DD + 9 + 8 dígitos (11 no total)
  const telNums = telefone.replace(/\D/g, "");
  if (telNums.length !== 11 || telNums[2] !== "9") {
    msg.textContent = "Telefone inválido. Digite DD + 9 + 8 dígitos. Ex: (61) 99999-0000";
    msg.classList.add("show", "erro");
    return;
  }

  const dados = {
    nome: nome,
    cpf: cpf,
    telefone: telefone,
    data_nascimento: data_nascimento
  };

  console.log("Enviando para backend:", dados);

  // Simulação
  setTimeout(() => {
    document.getElementById("modalSucesso").classList.add("aberto");
  }, 500);

}

function fecharModal() {
  document.getElementById("modalSucesso").classList.remove("aberto");
  document.getElementById("formCadastro").reset();
}

window.addEventListener("load", carregarPerfil);

// Máscara de telefone
document.querySelectorAll('input[id*="telefone"], input[name*="telefone"]').forEach(function(el) {
  el.addEventListener("input", function () {
    let v = this.value.replace(/\D/g, "");
    if (v.length <= 10) {
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else {
      v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
    }
    this.value = v;
  });
});

// Máscara de CPF
document.querySelectorAll('input[id*="cpf"], input[name*="cpf"]').forEach(function(el) {
  el.addEventListener("input", function () {
    let v = this.value.replace(/\D/g, "");
    v = v.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
    this.value = v;
  });
});

// PERMISSÕES — só a proprietária acessa esta tela
(function aplicarPermissoes() {
  const cargo = sessionStorage.getItem("usuarioCargo");
  if (cargo !== "proprietaria") {
    window.location.href = "../index-home/home.html";
  }
})();
