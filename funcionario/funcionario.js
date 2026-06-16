
// Responsável por: renderizar tabela, pesquisa, checkboxes,
// modais de atualizar e controle de status (ativo/inativo).
// MENU LATERAL - Abre o painel lateral ao clicar no ícone hambúrguer
function abrirMenu() {
  document.getElementById("sidebar").classList.add("aberta");
  document.getElementById("overlay").classList.add("ativo");
}

// MENU LATERAL - Fecha o painel lateral
function fecharMenu() {
  document.getElementById("sidebar").classList.remove("aberta");
  document.getElementById("overlay").classList.remove("ativo");
}

// Fecha menu e modais ao pressionar a tecla ESC
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    fecharMenu();
    fecharModal("modalAtualizar");
    fecharModal("modalStatus");
    fecharModal("modalFolga");
  }
});

// AVATAR - Exibe ou oculta o dropdown de perfil ao clicar no avatar
function togglePerfil(event) {
  event.stopPropagation(); // Impede que o clique feche o dropdown imediatamente
  document.getElementById("perfilDropdown").classList.toggle("aberto");
}

// Fecha o dropdown de perfil ao clicar em qualquer lugar da tela
document.addEventListener("click", function () {
  document.getElementById("perfilDropdown").classList.remove("aberto");
});

// Gera as iniciais do nome para exibir no avatar 
function gerarIniciais(nome) {
  if (!nome) return "?";
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
}

// Carrega os dados do usuário logado a partir do sessionStorage
// Se não houver usuário logado, redireciona para o login
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

// PERMISSÕES - Esconde itens do menu lateral que a funcionária não pode acessar
(function aplicarPermissoes() {
  const cargo = sessionStorage.getItem("usuarioCargo");
  // Páginas restritas: apenas a proprietária pode ver
  const restritos = ["funcionarios.html", "servico.html", "financas.html"];
  if (cargo === "proprietaria") return; // Proprietária vê tudo
  document.querySelectorAll(".sidebar-menu a").forEach(function(link) {
    const href = link.getAttribute("href") || "";
    const file = href.split("/").pop();
    if (restritos.includes(file))
      link.closest("li").style.display = "none"; // Oculta o item do menu
  });
})();

// DADOS FIXOS DOS FUNCIONÁRIOS
let funcionarios = [
  { id: 1, nome: "Erika Priscilla", cpf: "123.456.789-00", telefone: "(61) 99999-9999", dataNascimento: "1996-09-30", ativo: true },
  { id: 2, nome: "Pedro Oliveira",  cpf: "456.789.123-00", telefone: "(61) 97777-7777", dataNascimento: "1992-03-10", ativo: false }
];

// formato data 
function formatarData(dataISO) {
  if (!dataISO) return "—";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

// Ativos aparecem primeiro, inativos apagados
function renderizarTabela(lista) {
  const corpo = document.getElementById("tabelaCorpo");
  const vazia = document.getElementById("tabelaVazia");
  if (!corpo) return;

  corpo.innerHTML = "";
  // Ativos no topo, depois inativos
  const ordenados = [...lista].sort((a, b) => b.ativo - a.ativo || a.nome.localeCompare(b.nome));

  if (ordenados.length === 0) {
    vazia.style.display = "block";
    atualizarBotoes();
    return;
  }
  vazia.style.display = "none";

  ordenados.forEach(f => {
    const tr = document.createElement("tr");
    if (!f.ativo) tr.classList.add("cliente-inativo"); // linha apagada se inativo
    const dataFormatada = formatarData(f.dataNascimento);

    tr.innerHTML = `
  <td class="col-check">
    <input type="checkbox" class="check-linha" data-id="${f.id}" onchange="atualizarBotoes()" />
  </td>
  <td class="col-nome">
    <span class="status-bolinha ${f.ativo ? 'ativo' : 'inativo'}"></span>
    <span class="nome-texto">
      <span class="nome-primeiro">${f.nome.trim().split(' ')[0]}</span>
      <span class="nome-resto">${f.nome.trim().split(' ').slice(1).join(' ')}</span>
    </span>
  </td>
  <td class="col-nowrap text-center">${f.cpf}</td>
  <td class="col-nowrap text-center">${f.telefone}</td>
  <td class="text-center" style="white-space:nowrap;">${dataFormatada}</td>
`;
    corpo.appendChild(tr);
  });

  atualizarBotoes();
}

// PESQUISA - Filtra a tabela em tempo real conforme o usuário digita
function filtrarFuncionarios() {
  const termo = document.getElementById("campoPesquisa").value.toLowerCase();
  const filtrados = funcionarios.filter(f =>
    f.nome.toLowerCase().includes(termo) ||
    f.cpf.includes(termo) ||
    f.telefone.includes(termo)
  );
  renderizarTabela(filtrados);
}

// Marca ou desmarca todos os checkboxes da tabela
function toggleTodos(master) {
  document.querySelectorAll(".check-linha").forEach(cb => cb.checked = master.checked);
  atualizarBotoes();
}

// Atualiza estado dos botões - igual padrão da tela Clientes
function atualizarBotoes() {
  const total    = document.querySelectorAll(".check-linha").length;
  const marcados = document.querySelectorAll(".check-linha:checked").length;
  const checkTodos = document.getElementById("checkTodos");
  if (checkTodos) checkTodos.checked = total > 0 && marcados === total;
  const btnAtualizar     = document.getElementById("btnAtualizar");
  const btnAlterarStatus = document.getElementById("btnAlterarStatus");
  const btnLancarFolga   = document.getElementById("btnLancarFolga");
  if (btnAtualizar)     btnAtualizar.disabled     = marcados !== 1;
  if (btnAlterarStatus) btnAlterarStatus.disabled  = marcados !== 1;
  if (btnLancarFolga)   btnLancarFolga.disabled    = marcados !== 1;
}

// Modal alterar status
function abrirModalStatus() {
  const f = getFuncionarioSelecionado();
  if (!f) return;
  const novoStatus = f.ativo ? "Desativar" : "Ativar";
  const icone      = f.ativo ? "fa-ban" : "fa-circle-check";
  document.getElementById("modalStatusTitulo").textContent = `${novoStatus} funcionário`;
  document.getElementById("modalStatusTexto").textContent  =
    `Deseja ${novoStatus.toLowerCase()} ${f.nome}?`;
  document.getElementById("btnStatusLabel").textContent = novoStatus;
  document.getElementById("btnConfirmarStatus").querySelector("i").className =
    `fa-solid ${icone}`;
  document.getElementById("modalStatus").classList.add("aberto");
}

// Inverte o status ativo/inativo do funcionário selecionado
function confirmarStatus() {
  const f = getFuncionarioSelecionado();
  if (!f) return;
  f.ativo = !f.ativo;
  fecharModal("modalStatus");
  renderizarTabela(funcionarios);
  mostrarToast(f.ativo ? "✓ Funcionário ativado!" : "Funcionário desativado.", "sucesso");
}

// Modal lançar folga
function abrirModalFolga() {
  const f = getFuncionarioSelecionado();
  if (!f) return;
  document.getElementById("modalFolgaNome").textContent = `Funcionário: ${f.nome}`;
  document.getElementById("folgaData").value   = "";
  document.getElementById("folgaMotivo").value = "";
  document.getElementById("modalFolga").classList.add("aberto");
}

function confirmarFolga() {
  const f      = getFuncionarioSelecionado();
  const data   = document.getElementById("folgaData").value;
  const motivo = document.getElementById("folgaMotivo").value.trim();
  if (!data) {
    mostrarErroModal("folgaData", "Informe a data da folga.");
    return;
  }
  // Aqui o Guilherme vai integrar com o backend
  console.log("Folga lançada:", { funcionarioId: f.id, nome: f.nome, data, motivo });
  fecharModal("modalFolga");
  mostrarToast(`✓ Folga de ${f.nome.split(" ")[0]} lançada!`, "sucesso");
}

// Retorna o objeto do funcionário cujo checkbox está marcado (apenas 1)
function getFuncionarioSelecionado() {
  const cb = document.querySelector(".check-linha:checked");
  if (!cb) return null;
  return funcionarios.find(f => f.id === parseInt(cb.dataset.id));
}

// MODAL ATUALIZAR 
function abrirModalAtualizar() {
  const f = getFuncionarioSelecionado();
  if (!f) return;
  document.getElementById("editNome").value       = f.nome;
  document.getElementById("editCpf").value        = f.cpf;
  document.getElementById("editTelefone").value   = f.telefone;
  document.getElementById("editNascimento").value = f.dataNascimento;
  document.getElementById("modalAtualizar").classList.add("aberto");
}

// Salva as alterações feitas no formulário de atualização
function salvarAtualizacao() {
  const f = getFuncionarioSelecionado();
  if (!f) return;

  const nome     = document.getElementById("editNome").value.trim();
  const cpf      = document.getElementById("editCpf").value.trim();
  const telefone = document.getElementById("editTelefone").value.trim();
  const nascimento = document.getElementById("editNascimento").value;

  //  Validação: nome obrigatório
  if (!nome) {
    mostrarErroModal("editNome", "Nome é obrigatório."); return;
  }

  //  Validação: CPF — 11 dígitos
  const cpfNumeros = cpf.replace(/\D/g, "");
  if (cpfNumeros.length !== 11) {
    mostrarErroModal("editCpf", "CPF inválido. Digite os 11 dígitos. Ex: 123.456.789-00"); return;
  }

  // Validação: telefone — DDD + 9 + 8 dígitos (11 no total)
  const telNumeros = telefone.replace(/\D/g, "");
  if (telNumeros.length !== 11) {
    mostrarErroModal("editTelefone", "Telefone incompleto. Digite DDD + 9 dígitos. Ex: (61) 99999-0000"); return;
  }
  if (telNumeros[2] !== "9") {
    mostrarErroModal("editTelefone", "O número deve começar com 9 após o DDD. Ex: (61) 99999-0000"); return;
  }

  f.nome           = nome;
  f.cpf            = cpf;
  f.telefone       = telefone;
  f.dataNascimento = nascimento || f.dataNascimento;

  fecharModal("modalAtualizar");
  renderizarTabela(funcionarios);
  mostrarToast("✓ Funcionário atualizado com sucesso!", "sucesso");
}
function mostrarErroModal(inputId, mensagem) {
  // Remove erro anterior se existir
  const anterior = document.getElementById("erroModal_" + inputId);
  if (anterior) anterior.remove();

  const input = document.getElementById(inputId);
  if (!input) return;

  const div = document.createElement("div");
  div.id = "erroModal_" + inputId;
  div.style.cssText = "color:#c0392b; font-size:0.78rem; margin-top:4px; font-family:'Jost',sans-serif;";
  div.textContent = mensagem;
  input.parentNode.appendChild(div);
  input.style.borderColor = "#c0392b";
  input.focus();

  // Remove o erro ao digitar novamente
  input.addEventListener("input", function limpar() {
    div.remove();
    input.style.borderColor = "";
    input.removeEventListener("input", limpar);
  }, { once: true });
}

// FECHAR MODAL
function fecharModal(id) {
  document.getElementById(id).classList.remove("aberto");
}

// TOAST — exibe notificação flutuante no rodapé
function mostrarToast(mensagem, tipo) {
  const toast = document.getElementById("toastFunc");
  if (!toast) return;
  toast.textContent = mensagem;
  toast.style.borderLeft = tipo === "erro" ? "4px solid #dc3545" : "4px solid #7bbf8a";
  toast.style.color = tipo === "erro" ? "#a34747" : "#2f7a47";
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 3000);
}

// Fecha modal ao clicar no fundo escuro (overlay)
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("modal-overlay")) fecharModal(e.target.id);
});

// Intercepta o submit do formulário de atualização para chamar a função correta
const formAtualizar = document.getElementById("formAtualizar");
if (formAtualizar) {
  formAtualizar.addEventListener("submit", function(e) {
    e.preventDefault(); // Impede recarregar a página
    salvarAtualizacao();
  });
}
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
// INICIALIZAÇÃO — Executa ao carregar a tela
carregarPerfil();
renderizarTabela(funcionarios);
