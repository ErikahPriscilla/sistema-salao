
// Erro inline vermelho abaixo do campo — não trava o mobile como alert()
function mostrarErroModal(inputId, mensagem) {
  const anterior = document.getElementById("erroModal_" + inputId);
  if (anterior) anterior.remove();
  const input = document.getElementById(inputId);
  if (!input) return;
  const div = document.createElement("div");
  div.id = "erroModal_" + inputId;
  div.style.cssText = "color:#c0392b;font-size:0.78rem;margin-top:4px;font-family:'Jost',sans-serif;";
  div.textContent = mensagem;
  input.parentNode.appendChild(div);
  input.style.borderColor = "#c0392b";
  input.focus();
  input.addEventListener("input", function limpar() {
    div.remove();
    input.style.borderColor = "";
    input.removeEventListener("input", limpar);
  }, { once: true });
}
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
  if (e.key === "Escape") {
    fecharMenu();
    fecharModal("modalAtualizar");
    fecharModal("modalStatus");
  }
});

function formatarTelefone(input) {
  let v = input.value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  
  let resultado = '';
  if (v.length <= 2) {
    resultado = v;
  } else if (v.length <= 7) {
    resultado = `(${v.slice(0,2)}) ${v.slice(2)}`;
  } else if (v.length <= 11) {
    if (v.length === 11) {
      resultado = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7,11)}`;
    } else {
      resultado = `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6,10)}`;
    }
  }
  input.value = resultado;
}

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

// Envia link de agendamento via WhatsApp para o cliente
function enviarLinkAgendamento(id) {
  const cliente = clientes.find(c => c.id === id);
  if (!cliente) return;
  
  // Extrai apenas os números do telefone
  const telefone = cliente.numero.replace(/\D/g, '');
  if (telefone.length < 10 || telefone.length > 11) {
    alert("Telefone do cliente inválido. Cadastre um número com 10 ou 11 dígitos.");
    return;
  }
  
  const link = `${window.location.origin}/agendamento-cliente/agendamento-cliente.html?cliente=${cliente.id}`;
  const msg = `Olá *${cliente.nome}*, acesse o link para agendar seu horário:\n\n${link}`;
  
  window.open(`https://wa.me/55${telefone}?text=${encodeURIComponent(msg)}`, "_blank");
}

// Dados dos clientes
let clientes = [
  { id: 1, nome: "Gabrielle Lima", numero: "(61) 99999-0001", obs: "Gosta de café com açúcar", ativo: true  },
  { id: 2, nome: "Zilda Brito ferreira", numero: "(61) 99999-0002", obs: "", ativo: true  },
  { id: 3, nome: "Yan Cruz Santos",  numero: "(61) 99999-0003", obs: "Gosta de água com gás", ativo: false }
];

// Renderiza tabela
function renderizarTabela(lista) {
  const corpo = document.getElementById("tabelaCorpo");
  const vazia = document.getElementById("tabelaVazia");
  if (!corpo) return;

  corpo.innerHTML = "";

  const ordenados = [...lista].sort((a, b) => b.ativo - a.ativo);

  if (ordenados.length === 0) {
    if (vazia) vazia.style.display = "block";
    atualizarBotoes();
    return;
  }
  if (vazia) vazia.style.display = "none";

  ordenados.forEach(c => {
    const tr = document.createElement("tr");
    if (!c.ativo) tr.classList.add("cliente-inativo");

    tr.innerHTML = `
      <td class="col-check">
        <input type="checkbox" class="check-linha" data-id="${c.id}" onchange="atualizarBotoes()" />
       </td>
      <td class="col-nome">
        <span class="status-bolinha ${c.ativo ? 'ativo' : 'inativo'}"></span>
        <span class="nome-texto">
          <span class="nome-primeiro">${c.nome.trim().split(' ')[0]}</span>
          <span class="nome-resto">${c.nome.trim().split(' ').slice(1).join(' ')}</span>
        </span>
      </td>
      <td class="col-nowrap text-center">${c.numero}</td>
      <td class="col-obs text-center">${c.obs || "—"}</td>
      <td class="col-nowrap" style="text-align:center; width:40px;">
        <button class="btn-share" onclick="enviarLinkAgendamento(${c.id})" 
                style="background:transparent; border:none; color:var(--text-soft); cursor:pointer; opacity:0.5;"
                onmouseover="this.style.opacity='1'"
                onmouseout="this.style.opacity='0.5'">
          <i class="fa-solid fa-share-alt"></i>
        </button>
      </td>
    `;
    corpo.appendChild(tr);
  });

  atualizarBotoes();
}

// Pesquisa
function filtrarClientes() {
  const termo = document.getElementById("campoPesquisa").value.toLowerCase();
  const filtrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(termo) ||
    c.numero.includes(termo) ||
    (c.obs && c.obs.toLowerCase().includes(termo))
  );
  renderizarTabela(filtrados);
}

// Checkbox
function toggleTodos(master) {
  document.querySelectorAll(".check-linha").forEach(cb => cb.checked = master.checked);
  atualizarBotoes();
}

// Atualiza estado dos botões
function atualizarBotoes() {
  const total    = document.querySelectorAll(".check-linha").length;
  const marcados = document.querySelectorAll(".check-linha:checked").length;
  const checkTodos = document.getElementById("checkTodos");
  if (checkTodos) checkTodos.checked = total > 0 && marcados === total;

  const btnAtualizar    = document.getElementById("btnAtualizar");
  const btnAlterarStatus = document.getElementById("btnAlterarStatus");

  if (btnAtualizar)    btnAtualizar.disabled    = marcados !== 1;
  if (btnAlterarStatus) btnAlterarStatus.disabled = marcados !== 1;
}

// Pega o cliente selecionado
function getClienteSelecionado() {
  const cb = document.querySelector(".check-linha:checked");
  if (!cb) return null;
  return clientes.find(c => c.id === parseInt(cb.dataset.id));
}

// Modal atualizar
function abrirModalAtualizar() {
  const c = getClienteSelecionado();
  if (!c) return;
  document.getElementById("editNome").value   = c.nome;
  document.getElementById("editNumero").value = c.numero;
  document.getElementById("editObs").value    = c.obs || "";
  document.getElementById("modalAtualizar").classList.add("aberto");
}

function salvarAtualizacao() {
  const c = getClienteSelecionado();
  if (!c) return;
  
  let numeroRaw = document.getElementById("editNumero").value.trim();
  let numeros = numeroRaw.replace(/\D/g, '');
  
  if (numeros.length !== 11) {
    mostrarErroModal("editNumero", "Telefone inválido. Ex: (61) 99999-0000");
    return;
  }

  // Exige 9 após o DDD
  if (numeros[2] !== "9") {
    mostrarErroModal("editNumero", "Número deve começar com 9 após o DDD. Ex: (61) 99999-0000");
    return;
  }
  
  // Formata (XX) XXXXX-XXXX
  const numeroFormatado = `(${numeros.substring(0,2)}) ${numeros.substring(2,7)}-${numeros.substring(7,11)}`;
  
  c.nome   = document.getElementById("editNome").value.trim()   || c.nome;
  c.numero = numeroFormatado;
  c.obs    = document.getElementById("editObs").value.trim();
  
  fecharModal("modalAtualizar");
  renderizarTabela(clientes);
}

// Modal alterar status
function abrirModalStatus() {
  const c = getClienteSelecionado();
  if (!c) return;
  const novoStatus = c.ativo ? "Desativar" : "Ativar";
  const icone      = c.ativo ? "fa-ban" : "fa-circle-check";
  document.getElementById("modalStatusTitulo").textContent = `${novoStatus} cliente`;
  document.getElementById("modalStatusTexto").textContent  =
    `Deseja ${novoStatus.toLowerCase()} ${c.nome}?`;
  document.getElementById("btnStatusLabel").textContent = novoStatus;
  document.getElementById("btnConfirmarStatus").querySelector("i").className =
    `fa-solid ${icone}`;
  document.getElementById("modalStatus").classList.add("aberto");
}

function confirmarStatus() {
  const c = getClienteSelecionado();
  if (!c) return;
  c.ativo = !c.ativo;
  fecharModal("modalStatus");
  renderizarTabela(clientes);
  mostrarToast(c.ativo ? "✓ Cliente ativado!" : "Cliente desativado.", "sucesso");
}

// Fechar modal
function fecharModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("aberto");
}

// Fecha modal ao clicar fora
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("modal-overlay")) {
    fecharModal(e.target.id);
  }
});

// Botão WhatsApp (futuro)
const btnWhats = document.querySelector(".btn-whats");
if (btnWhats) {
  btnWhats.addEventListener("click", function () {
    alert("Funcionalidade em desenvolvimento:\nEnvio automático de mensagens pelo WhatsApp.");
  });
}

// Permissões - esconde itens do menu
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

// TOAST
function mostrarToast(mensagem, tipo) {
  const toast = document.getElementById("toastCl");
  if (!toast) return;
  toast.textContent = mensagem;
  toast.style.borderLeft = tipo === "erro" ? "4px solid #dc3545" : "4px solid #7bbf8a";
  toast.style.color = tipo === "erro" ? "#a34747" : "#2f7a47";
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 3000);
}

// Permissões de botões
(function controlarBotoesCliente() {
  // Alterar Status disponível para todos os cargos
})();

// Inicializa
carregarPerfil();
renderizarTabela(clientes);
