// FUNCIONARIO.JS
// Responsável por: renderizar tabela, pesquisa, checkboxes,
// modais de atualizar/excluir e controle de status (ativo/inativo).
// ============================================================

// MENU LATERAL — Abre o painel lateral ao clicar no ícone hambúrguer
function abrirMenu() {
  document.getElementById("sidebar").classList.add("aberta");
  document.getElementById("overlay").classList.add("ativo");
}

// MENU LATERAL — Fecha o painel lateral
function fecharMenu() {
  document.getElementById("sidebar").classList.remove("aberta");
  document.getElementById("overlay").classList.remove("ativo");
}

// Fecha menu e modais ao pressionar a tecla ESC
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    fecharMenu();
    fecharModal("modalAtualizar");
    fecharModal("modalConfirmarExclusaoFunc");
  }
});

// AVATAR — Exibe ou oculta o dropdown de perfil ao clicar no avatar
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

// PERMISSÕES — Esconde itens do menu lateral que a funcionária não pode acessar
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

// DADOS DOS FUNCIONÁRIOS — Placeholder local até integração com a API
// Futuramente esses dados virão do backend via fetch/axios
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

// RENDERIZAR TABELA — Constrói as linhas da tabela com os dados dos funcionários
// Os ativos aparecem primeiro (ordenação por status)
function renderizarTabela(lista) {
  const corpo = document.getElementById("tabelaCorpo");
  const vazia = document.getElementById("tabelaVazia");
  if (!corpo) return;

  corpo.innerHTML = "";
  // Ordenação por nome (sem status ativo/inativo nesta tela)
  const ordenados = [...lista].sort((a, b) => a.nome.localeCompare(b.nome));

  if (ordenados.length === 0) {
    vazia.style.display = "block"; // Exibe mensagem de lista vazia
    atualizarBotoes();
    return;
  }
  vazia.style.display = "none";

  ordenados.forEach(f => {
    const tr = document.createElement("tr");
    // Classe cliente-inativo removida junto com o sistema de status
    const dataFormatada = formatarData(f.dataNascimento);

    // Monta o HTML de cada linha da tabela com checkbox, bolinha de status e dados
    tr.innerHTML = `
      <td class="col-check">
        <input type="checkbox" class="check-linha" data-id="${f.id}" onchange="atualizarBotoes()" />
      </td>
      <!-- Bolinha de status removida — sem Ativar/Desativar nesta tela -->
      <td class="col-nome">${f.nome}</td>
      <td class="col-nowrap" style="white-space:nowrap;">${f.cpf}</td>
      <td class="col-nowrap" style="white-space:nowrap;">${f.telefone}</td>
      <td style="white-space:pre-line; font-size:0.8rem; line-height:1.3;">${dataFormatada}</td>
    `;
    corpo.appendChild(tr);
  });

  atualizarBotoes();
}

// PESQUISA — Filtra a tabela em tempo real conforme o usuário digita
function filtrarFuncionarios() {
  const termo = document.getElementById("campoPesquisa").value.toLowerCase();
  const filtrados = funcionarios.filter(f =>
    f.nome.toLowerCase().includes(termo) ||
    f.cpf.includes(termo) ||
    f.telefone.includes(termo)
  );
  renderizarTabela(filtrados);
}

// CHECKBOX MESTRE — Marca ou desmarca todos os checkboxes da tabela
function toggleTodos(master) {
  document.querySelectorAll(".check-linha").forEach(cb => cb.checked = master.checked);
  atualizarBotoes();
}

// Atualiza o estado dos botões Atualizar e Excluir conforme seleção
// Atualizar só fica ativo com exatamente 1 selecionado
// Excluir fica ativo com 1 ou mais selecionados
function atualizarBotoes() {
  const total    = document.querySelectorAll(".check-linha").length;
  const marcados = document.querySelectorAll(".check-linha:checked").length;
  document.getElementById("checkTodos").checked    = total > 0 && marcados === total;
  document.getElementById("btnExcluir").disabled   = marcados === 0;
  document.getElementById("btnAtualizar").disabled = marcados !== 1;
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
  f.nome           = document.getElementById("editNome").value.trim()       || f.nome;
  f.cpf            = document.getElementById("editCpf").value.trim()        || f.cpf;
  f.telefone       = document.getElementById("editTelefone").value.trim()   || f.telefone;
  f.dataNascimento = document.getElementById("editNascimento").value        || f.dataNascimento;
  fecharModal("modalAtualizar");
  renderizarTabela(funcionarios); // Atualiza a tabela com os novos dados
}

// EXCLUIR 
function confirmarExclusao() {
  const ids = Array.from(document.querySelectorAll(".check-linha:checked"))
    .map(cb => parseInt(cb.dataset.id));
  if (ids.length === 0) return;

  const qtd = ids.length;
  // Atualiza a mensagem com a quantidade selecionada
  document.getElementById("textoConfirmacaoFunc").textContent =
    `Tem certeza que deseja excluir ${qtd} funcionário(s)? Esta ação não pode ser desfeita.`;

  window._idsParaExcluirFunc = ids;
  document.getElementById("modalConfirmarExclusaoFunc").classList.add("aberto");
}

function executarExclusaoFunc() {
  const ids = window._idsParaExcluirFunc || [];

  funcionarios = funcionarios.filter(f => !ids.includes(f.id));
  document.getElementById("checkTodos").checked = false;
  fecharModal("modalConfirmarExclusaoFunc");
  renderizarTabela(funcionarios);
}

// FECHAR MODAL
function fecharModal(id) {
  document.getElementById(id).classList.remove("aberto");
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

// INICIALIZAÇÃO — Executa ao carregar a tela
carregarPerfil();
renderizarTabela(funcionarios);

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
