// HOME.JS - Tela inicial do sistema Espaço Carmem Lúcia
// Responsável por: saudação, cards de agendamentos e lucro,
// controle de permissões por perfil e menu lateral.

// MENU LATERAL - Abre o menu deslizante ao clicar no hambúrguer
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
  const nome  = sessionStorage.getItem("usuarioNome");
  const email = sessionStorage.getItem("usuarioEmail");

  // Se a Erika estiver logada, mostra Erika. Se não houver ninguém, volta pro login.
  if (nome) {
    document.getElementById("avatar").textContent      = gerarIniciais(nome);
    document.getElementById("perfilNome").textContent  = nome;
    document.getElementById("perfilEmail").textContent = email || "";
  } else {
    window.location.href = "../login/login.html";
  }
}

// Data de hoje no formato DD/MM/AAAA 
function hojeFormatado() {
  const d   = new Date();
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${d.getFullYear()}`;
}

// Mostra data e hora UMA VEZ, abaixo da saudação
function mostrarData() {
  const hoje   = new Date();
  // Formato: "Terça-feira, 12 de Maio"
  const opcoes = { weekday: "long", day: "2-digit", month: "long" };
  const texto  = hoje.toLocaleDateString("pt-BR", opcoes);
  const hora   = hoje.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const el = document.getElementById("dataHoje");
  if (el) {
    // Capitaliza a primeira letra e adiciona a hora
    el.textContent = texto.charAt(0).toUpperCase() + texto.slice(1) + " · " + hora;
  }
}

// Saudação por horário 
function saudacao() {
  const h   = new Date().getHours();
  const msg = h < 12 ? "Bom dia!" : h < 18 ? "Boa tarde!" : "Boa noite!";
  document.querySelector(".sub").textContent = msg;
}

//  Dados - mesmos do agendamentos.js (futuramente virão do banco) 
const agendamentosDados = [
  { nome: "Gabrielle Lima", hora: "10:00", servico: "Escova",   data: "16/05/2026", funcionario: "Carmem Lúcia" },
  { nome: "Zilda Brito",    hora: "14:30", servico: "Manicure", data: "16/05/2026", funcionario: "Erika"        },
];

//  Carrega só os agendamentos do dia atual, filtrados pelo cargo 
function carregarAgendamentosHoje() {
  const lista = document.getElementById("listaHome");
  if (!lista) return;

  const hoje  = hojeFormatado();
  const cargo = sessionStorage.getItem("usuarioCargo");
  const nome  = sessionStorage.getItem("usuarioNome") || "";

  // Filtra por data primeiro
  let deHoje = agendamentosDados.filter(a => a.data === hoje);

  // Se for funcionária (não proprietária), mostra só os agendamentos dela
  if (cargo !== "proprietaria") {
    deHoje = deHoje.filter(a =>
      a.funcionario.toLowerCase().includes(nome.split(" ")[0].toLowerCase())
    );
  }

  deHoje.sort((a, b) => a.hora.localeCompare(b.hora));

  lista.innerHTML = "";

  if (deHoje.length === 0) {
    const li = document.createElement("li");
    li.className   = "card-item-vazio";
    li.textContent = "Nenhum agendamento";
    lista.appendChild(li);
    return;
  }

  deHoje.forEach(a => {
    const li = document.createElement("li");
    li.className = "card-item";
    li.innerHTML = `
      <span class="card-item-hora">${a.hora}</span>
      <span class="card-item-texto">
        <span class="card-item-nome">${a.nome}</span>
        <span class="card-item-servico">${a.servico}</span>
      </span>
    `;
    lista.appendChild(li);
  });
}

// Lucro do dia - VAZIO QUANDO FECHA, TUDO QUANDO ABRE
function carregarLucroHoje() {
  const lista = document.getElementById("listaLucro");
  if (!lista) return;

  lista.innerHTML = "";

  // Dados de lucro (proprietária vê ambos, funcionária vê só a dela)
  const cargo = sessionStorage.getItem("usuarioCargo");
  
  const lucroDados = [
    { nome: "Carmem", valor: "R$ 600,00", servicos: "4 serviços" },
    { nome: "Erika", valor: "R$ 200,00", servicos: "2 serviços" }
  ];

  const mostra = cargo === "proprietaria" ? lucroDados : [lucroDados[1]];

  mostra.forEach(l => {
    const li = document.createElement("li");
    li.className = "card-item";
    li.innerHTML = `
      <span class="card-item-hora" style="font-weight:600; color:var(--rose-gold-dark);">${l.valor}</span>
      <div class="card-item-texto">
        <span class="card-item-nome">${l.nome}</span>
        <span class="card-item-servico">${l.servicos}</span>
      </div>
    `;
    lista.appendChild(li);
  });
}

function toggleLucro() {
  // Pega os elementos da tela
  const el = document.getElementById("lucroValor");      // onde fica o R$ 800,00
  const lista = document.getElementById("listaLucro");  // onde fica Carmem e funcionario
  const icone = document.getElementById("iconOlho");    // ícone do olho
  
  // Verifica se o olho está ABERTO 
  const aberto = icone.classList.contains("fa-eye");

  if (aberto) {
    // Olho aberto - FECHA (esconde os valores)
    el.textContent = "";                 // apaga o valor total
    lista.innerHTML = "";               // apaga os detalhes 
    icone.classList.replace("fa-eye", "fa-eye-slash");  // muda ícone para olho FECHADO
  } else {
    // Olho fechado - ABRE (mostra os valores)
    el.textContent = "R$ 800,00";           // mostra o valor total 
    carregarLucroHoje();                    // chama função que mostra Carmem e funcionario
    icone.classList.replace("fa-eye-slash", "fa-eye");   // muda ícone para olho ABERTO
  }
}
// Permissões - esconde itens do menu restritos para funcionária
(function aplicarPermissoes() {
  const cargo = sessionStorage.getItem("usuarioCargo");
  // Lista de páginas que só a proprietária pode acessar pelo menu lateral
  const restritos = ["funcionarios.html", "servico.html", "financas.html"];
  if (cargo === "proprietaria") return;
  document.querySelectorAll(".sidebar-menu a").forEach(function(link) {
    const href = link.getAttribute("href") || "";
    const file = href.split("/").pop();
    if (restritos.includes(file))
      link.closest("li").style.display = "none";
  });
})();

// CONTROLE DE VISIBILIDADE 
// Somente a proprietária (cargo === "proprietaria") tem acesso
// à tela de Finanças. Para funcionários, o link é ocultado.
// O cargo vem do sessionStorage, gravado no momento do login.
(function controlarLinkFinancas() {
  const cargo = sessionStorage.getItem("usuarioCargo");
  const linkDetalhes = document.getElementById("link-ver-detalhes");

  // Se o elemento existir na tela e o usuário NÃO for proprietária, esconde
  if (linkDetalhes && cargo !== "proprietaria") {
    linkDetalhes.style.display = "none";
  }
})();

// Inicializa 
mostrarData();
saudacao();
carregarPerfil();
carregarAgendamentosHoje();

// BOTÃO WHATSAPP - ENVIA AGENDAMENTOS DO DIA PARA A CARMEM
const btnWhatsHome = document.querySelector(".btn-whats");
if (btnWhatsHome) {
  btnWhatsHome.onclick = function() {
    const hoje = hojeFormatado();
    const agendamentosHoje = agendamentosDados.filter(a => a.data === hoje);
    
    if (agendamentosHoje.length === 0) {
      alert("Nenhum agendamento para hoje.");
      return;
    }
    
    let msg = `*RESUMO DE AGENDAMENTOS - ${hoje}*\n\n`;
    agendamentosHoje.forEach(a => {
      msg += `${a.hora} - ${a.nome} - ${a.servico}\n`;
    });
    msg += `\nTotal: ${agendamentosHoje.length} agendamento(s)`;
    
    const telefoneCarmem = "5561998015647";
    window.open(`https://wa.me/${telefoneCarmem}?text=${encodeURIComponent(msg)}`, "_blank");
  };
}